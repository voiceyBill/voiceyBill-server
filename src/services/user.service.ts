import UserModel from "../models/user.model";
import NotificationTokenModel from "../models/notification-token.model";
import { NotFoundException, UnauthorizedException } from "../utils/app-error";
import {
  ChangePasswordType,
  RegisterPushTokenType,
  UnregisterPushTokenType,
  UpdateUserType,
} from "../validators/user.validator";
import { ErrorCodeEnum } from "../enums/error-code.enum";

export const findByIdUserService = async (userId: string) => {
  const user = await UserModel.findById(userId);
  return user?.omitPassword();
};

export const updateUserService = async (
  userId: string,
  body: UpdateUserType,
  profilePic?: Express.Multer.File,
) => {
  const user = await UserModel.findById(userId);
  if (!user) throw new NotFoundException("User not found");

  if (profilePic) {
    user.profilePicture = profilePic.path;
  }

  user.set({
    name: body.name,
  });

  await user.save();

  return user.omitPassword();
};

export const changePasswordService = async (
  userId: string,
  body: ChangePasswordType,
) => {
  const user = await UserModel.findById(userId).select("+password");
  if (!user) throw new NotFoundException("User not found");

  const isCurrentPasswordValid = await user.comparePassword(
    body.currentPassword,
  );
  if (!isCurrentPasswordValid) {
    throw new UnauthorizedException(
      "Current password is incorrect",
      ErrorCodeEnum.ACCESS_UNAUTHORIZED,
    );
  }

  user.set({ password: body.newPassword });
  await user.save();

  return { message: "Password changed successfully" };
};

export const registerPushTokenService = async (
  userId: string,
  body: RegisterPushTokenType,
) => {
  const { token, platform, deviceId } = body;

  const user = await UserModel.findById(userId);
  if (!user) throw new NotFoundException("User not found");

  const saved = await NotificationTokenModel.findOneAndUpdate(
    { token },
    {
      userId,
      token,
      platform,
      deviceId: deviceId || null,
      lastSeenAt: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return saved;
};

export const unregisterPushTokenService = async (
  userId: string,
  body: UnregisterPushTokenType,
) => {
  const { token } = body;

  await NotificationTokenModel.deleteOne({
    userId,
    token,
  });

  return { success: true };
};
