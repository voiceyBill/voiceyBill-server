import mongoose from "mongoose";
import UserModel from "../models/user.model";
import ReportSettingModel, {
  ReportFrequencyEnum,
} from "../models/report-setting.model";
import { calculateNextReportDate } from "../utils/helper";
import { signJwtToken, signRefreshToken } from "../utils/jwt";
import { verifyGoogleIdToken } from "../config/google-oauth.config";
import {
  BadRequestException,
  UnauthorizedException,
} from "../utils/app-error";
import { GoogleAuthSchemaType } from "../validators/google-auth.validator";

const createDefaultReportSetting = async (
  userId: mongoose.Types.ObjectId,
  session?: mongoose.ClientSession,
) => {
  const reportQuery = ReportSettingModel.findOne({ userId });
  if (session) {
    reportQuery.session(session);
  }

  const existingReportSetting = await reportQuery;

  if (existingReportSetting) {
    return existingReportSetting;
  }

  const reportSetting = new ReportSettingModel({
    userId,
    frequency: ReportFrequencyEnum.MONTHLY,
    isEnabled: true,
    nextReportDate: calculateNextReportDate(),
    lastSentDate: null,
  });

  if (session) {
    await reportSetting.save({ session });
  } else {
    await reportSetting.save();
  }

  return reportSetting;
};

export const googleAuthService = async (body: GoogleAuthSchemaType) => {
  const session = await mongoose.startSession();

  try {
    return await session.withTransaction(async () => {
      // Verify Google ID token
      let googlePayload;
      try {
        googlePayload = await verifyGoogleIdToken(body.idToken);
      } catch (error) {
        throw new BadRequestException(
          "Invalid or expired Google token. Please try again.",
        );
      }

      if (!googlePayload.email) {
        throw new BadRequestException(
          "Could not retrieve email from Google account.",
        );
      }

      // Check if user exists by Google ID first
      let user = await UserModel.findOne({
        providerId: googlePayload.googleId,
      }).session(session);

      if (user) {
        // User already has Google OAuth linked
        const { token, expiresAt } = signJwtToken({ userId: user.id });
        const refreshToken = signRefreshToken({ userId: user.id });

        const reportSetting = await ReportSettingModel.findOne(
          { userId: user.id },
          { _id: 1, frequency: 1, isEnabled: 1 },
        )
          .session(session)
          .lean();

        return {
          user: user.omitPassword(),
          accessToken: token,
          refreshToken,
          expiresAt,
          reportSetting,
        };
      }

      // Check if user exists by email
      user = await UserModel.findOne({ email: googlePayload.email }).session(
        session,
      );

      if (user) {
        // User exists but with email/password auth - link Google account
        user.set({
          provider: "google",
          providerId: googlePayload.googleId,
          profilePicture: googlePayload.picture || user.profilePicture,
          isVerified: true, // Auto-verify since Google verifies email
        });

        await user.save({ session });

        const { token, expiresAt } = signJwtToken({ userId: user.id });
        const refreshToken = signRefreshToken({ userId: user.id });

        const reportSetting = await ReportSettingModel.findOne(
          { userId: user.id },
          { _id: 1, frequency: 1, isEnabled: 1 },
        )
          .session(session)
          .lean();

        return {
          user: user.omitPassword(),
          accessToken: token,
          refreshToken,
          expiresAt,
          reportSetting,
        };
      }

      // Create new user
      const newUser = new UserModel({
        name: googlePayload.name,
        email: googlePayload.email,
        profilePicture: googlePayload.picture,
        provider: "google",
        providerId: googlePayload.googleId,
        password: null,
        isVerified: googlePayload.emailVerified, // Google verifies email
        baseCurrency: "USD",
      });

      await newUser.save({ session });

      // Create default report setting
      await createDefaultReportSetting(newUser._id as mongoose.Types.ObjectId, session);

      const { token, expiresAt } = signJwtToken({ userId: newUser.id });
      const refreshToken = signRefreshToken({ userId: newUser.id });

      const reportSetting = await ReportSettingModel.findOne(
        { userId: newUser.id },
        { _id: 1, frequency: 1, isEnabled: 1 },
      )
        .session(session)
        .lean();

      return {
        user: newUser.omitPassword(),
        accessToken: token,
        refreshToken,
        expiresAt,
        reportSetting,
      };
    });
  } finally {
    await session.endSession();
  }
};
