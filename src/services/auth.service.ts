import mongoose from "mongoose";
import UserModel from "../models/user.model";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from "../utils/app-error";
import {
  ForgotPasswordSchemaType,
  LoginSchemaType,
  RegisterSchemaType,
  ResendOtpSchemaType,
  ResetPasswordSchemaType,
  VerifyOtpSchemaType,
} from "../validators/auth.validator";
import ReportSettingModel, {
  ReportFrequencyEnum,
} from "../models/report-setting.model";
import { calulateNextReportDate } from "../utils/helper";
import { signJwtToken } from "../utils/jwt";
import { ErrorCodeEnum } from "../enums/error-code.enum";
import { Env } from "../config/env.config";
import {
  compareOtp,
  generateOtp,
  getOtpExpiresAt,
  hashOtp,
} from "../utils/otp";
import { sendVerificationOtpEmail } from "../mailers/verification.mailer";
import { sendPasswordResetEmail } from "../mailers/password-reset.mailer";

const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds

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
    nextReportDate: calulateNextReportDate(),
    lastSentDate: null,
  });

  if (session) {
    await reportSetting.save({ session });
  } else {
    await reportSetting.save();
  }

  return reportSetting;
};

const issueVerificationOtp = async (
  user: mongoose.Document & {
    email: string;
    name: string;
    set: (value: Record<string, unknown>) => void;
    save: (options?: { session?: mongoose.ClientSession }) => Promise<unknown>;
  },
  session?: mongoose.ClientSession,
) => {
  const otp = generateOtp();

  user.set({
    emailVerificationOtpHash: await hashOtp(otp),
    emailVerificationOtpExpiresAt: getOtpExpiresAt(),
  });

  if (session) {
    await user.save({ session });
  } else {
    await user.save();
  }

  return otp;
};

const isTransactionUnsupportedError = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const err = error as { code?: number; message?: string };

  return (
    err.code === 20 ||
    (typeof err.message === "string" &&
      /Transaction numbers are only allowed/.test(err.message))
  );
};

export const registerService = async (body: RegisterSchemaType) => {
  const session = await mongoose.startSession();

  let verificationEmailPayload:
    | {
        email: string;
        username: string;
        otp: string;
      }
    | undefined;

  let response:
    | {
        user: ReturnType<(typeof UserModel.prototype)["omitPassword"]>;
        verificationRequired: boolean;
        emailSent?: boolean;
        emailSendError?: string;
        debugOtp?: string;
      }
    | undefined;

  const performRegisterFlow = async (
    useSession?: mongoose.ClientSession,
  ) => {
    const query = UserModel.findOne({ email: body.email });

    if (useSession) {
      query.session(useSession);
    }

    const existingUser = await query;

    if (existingUser?.isVerified) {
      throw new ConflictException(
        "An account with this email already exists. Please sign in instead.",
        ErrorCodeEnum.AUTH_EMAIL_ALREADY_EXISTS,
      );
    }

    const user =
      existingUser || new UserModel({ ...body, isVerified: false });

    if (!existingUser) {
      if (useSession) {
        await user.save({ session: useSession });
      } else {
        await user.save();
      }
    } else {
      user.set({
        name: body.name,
        password: body.password,
        isVerified: false,
      });

      if (useSession) {
        await user.save({ session: useSession });
      } else {
        await user.save();
      }
    }

    const otp = await issueVerificationOtp(user, useSession);

    verificationEmailPayload = {
      email: user.email,
      username: user.name,
      otp,
    };

    response = {
      user: user.omitPassword(),
      verificationRequired: true,
    };
  };

  try {
    let emailSent = false;
    let emailSendError: string | undefined;
    let debugOtp: string | undefined;

    const sendVerificationEmailFlow = async () => {
      if (!verificationEmailPayload) {
        return;
      }

      const emailResult = await sendVerificationOtpEmail(
        verificationEmailPayload,
      );

      emailSent = !emailResult.isFallback;

      if (!emailSent) {
        emailSendError = emailResult.error;

        if (Env.NODE_ENV === "development") {
          debugOtp = verificationEmailPayload.otp;
        } else {
          throw new Error(emailSendError || "Verification email failed");
        }
      }
    };

    try {
      await session.withTransaction(async () => {
        await performRegisterFlow(session);
        await sendVerificationEmailFlow();
      });
    } catch (error) {
      if (isTransactionUnsupportedError(error)) {
        await performRegisterFlow();
        await sendVerificationEmailFlow();
      } else {
        throw error;
      }
    }

    if (response) {
      response.emailSent = emailSent;

      if (emailSendError) {
        response.emailSendError = emailSendError;
      }

      if (debugOtp) {
        response.debugOtp = debugOtp;
      }
    }

    return response;
  } finally {
    await session.endSession();
  }
};

export const loginService = async (body: LoginSchemaType) => {
  const { email, password } = body;

  const user = await UserModel.findOne({ email });

  if (!user) {
    throw new NotFoundException("Email/password not found");
  }

  if (user.isVerified === false) {
    throw new UnauthorizedException(
      "Account is not verified. Please verify your email first.",
      ErrorCodeEnum.AUTH_EMAIL_NOT_VERIFIED,
    );
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new UnauthorizedException("Invalid email/password");
  }

  const { token, expiresAt } = signJwtToken({ userId: user.id });

  const reportSetting = await ReportSettingModel.findOne(
    { userId: user.id },
    { _id: 1, frequency: 1, isEnabled: 1 },
  ).lean();

  return {
    user: user.omitPassword(),
    accessToken: token,
    expiresAt,
    reportSetting,
  };
};

export const verifyOtpService = async (body: VerifyOtpSchemaType) => {
  const { email, otp } = body;

  const user = await UserModel.findOne({ email });

  if (!user) {
    throw new NotFoundException("Account not found");
  }

  if (user.isVerified) {
    return {
      user: user.omitPassword(),
      verified: true,
    };
  }

  const verificationUser = await UserModel.findOne({ email }).select(
    "+emailVerificationOtpHash +emailVerificationOtpExpiresAt",
  );

  if (!verificationUser?.emailVerificationOtpHash) {
    throw new BadRequestException(
      "Verification code not found. Please request a new code.",
      ErrorCodeEnum.AUTH_OTP_INVALID,
    );
  }

  if (
    !verificationUser.emailVerificationOtpExpiresAt ||
    verificationUser.emailVerificationOtpExpiresAt.getTime() < Date.now()
  ) {
    verificationUser.set({
      emailVerificationOtpHash: null,
      emailVerificationOtpExpiresAt: null,
    });

    await verificationUser.save();

    throw new UnauthorizedException(
      "Verification code has expired. Please request a new code.",
      ErrorCodeEnum.AUTH_OTP_EXPIRED,
    );
  }

  const isOtpValid = await compareOtp(
    otp,
    verificationUser.emailVerificationOtpHash,
  );

  if (!isOtpValid) {
    throw new UnauthorizedException(
      "Invalid verification code",
      ErrorCodeEnum.AUTH_OTP_INVALID,
    );
  }

  verificationUser.set({
    isVerified: true,
    emailVerificationOtpHash: null,
    emailVerificationOtpExpiresAt: null,
  });

  await verificationUser.save();

  await createDefaultReportSetting(
    verificationUser._id as mongoose.Types.ObjectId,
  );

  const { token, expiresAt } = signJwtToken({
    userId: verificationUser.id,
  });

  const reportSetting = await ReportSettingModel.findOne(
    {
      userId: verificationUser.id,
    },
    { _id: 1, frequency: 1, isEnabled: 1 },
  ).lean();

  return {
    user: verificationUser.omitPassword(),
    accessToken: token,
    expiresAt,
    reportSetting,
    verified: true,
  };
};

export const resendOtpService = async (body: ResendOtpSchemaType) => {
  const { email } = body;

  const user = await UserModel.findOne({ email });

  if (!user) {
    throw new NotFoundException("Account not found");
  }

  if (user.isVerified) {
    throw new ConflictException("Account is already verified");
  }

  const verificationUser = await UserModel.findOne({ email }).select(
    "+emailVerificationOtpHash +emailVerificationOtpExpiresAt +lastOtpResentAt",
  );

  if (!verificationUser) {
    throw new NotFoundException("Account not found");
  }

  if (verificationUser.lastOtpResentAt) {
    const elapsed =
      Date.now() - verificationUser.lastOtpResentAt.getTime();

    if (elapsed < OTP_RESEND_COOLDOWN_MS) {
      const retryAfterSeconds = Math.ceil(
        (OTP_RESEND_COOLDOWN_MS - elapsed) / 1000,
      );

      throw new BadRequestException(
        `Please wait ${retryAfterSeconds} second(s) before requesting a new code.`,
        ErrorCodeEnum.AUTH_TOO_MANY_ATTEMPTS,
      );
    }
  }

  const otp = generateOtp();

  verificationUser.set({
    emailVerificationOtpHash: await hashOtp(otp),
    emailVerificationOtpExpiresAt: getOtpExpiresAt(),
    lastOtpResentAt: new Date(),
  });

  await verificationUser.save();

  await sendVerificationOtpEmail({
    email: verificationUser.email,
    username: verificationUser.name,
    otp,
  });

  return {
    message: "Verification code resent successfully",
  };
};

export const forgotPasswordService = async (
  body: ForgotPasswordSchemaType,
) => {
  const { email } = body;

  const user = await UserModel.findOne({ email });

  if (!user) {
    return {
      message: "If the email exists, a reset code has been sent",
    };
  }

  const otp = generateOtp();

  user.set({
    passwordResetOtpHash: await hashOtp(otp),
    passwordResetOtpExpiresAt: getOtpExpiresAt(),
  });

  await user.save();

  await sendPasswordResetEmail({
    email: user.email,
    username: user.name,
    otp,
  });

  return {
    message: "If the email exists, a reset code has been sent",
  };
};

export const resetPasswordService = async (
  body: ResetPasswordSchemaType,
) => {
  const { email, otp, password } = body;

  const user = await UserModel.findOne({ email }).select(
    "+passwordResetOtpHash +passwordResetOtpExpiresAt",
  );

  if (!user) {
    throw new NotFoundException("Account not found");
  }

  if (!user.passwordResetOtpHash) {
    throw new BadRequestException(
      "Reset code not found. Please request a new code.",
      ErrorCodeEnum.AUTH_OTP_INVALID,
    );
  }

  if (
    !user.passwordResetOtpExpiresAt ||
    user.passwordResetOtpExpiresAt.getTime() < Date.now()
  ) {
    user.set({
      passwordResetOtpHash: null,
      passwordResetOtpExpiresAt: null,
    });

    await user.save();

    throw new UnauthorizedException(
      "Reset code has expired. Please request a new code.",
      ErrorCodeEnum.AUTH_OTP_EXPIRED,
    );
  }

  const isOtpValid = await compareOtp(
    otp,
    user.passwordResetOtpHash,
  );

  if (!isOtpValid) {
    throw new UnauthorizedException(
      "Invalid reset code",
      ErrorCodeEnum.AUTH_OTP_INVALID,
    );
  }

  user.set({
    password,
    passwordResetOtpHash: null,
    passwordResetOtpExpiresAt: null,
  });

  await user.save();

  return {
    message: "Password reset successfully",
  };
};