import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middlerware";
import {
  changePasswordService,
  findByIdUserService,
  updateUserService,
  deleteUserService,
  sendDeleteAccountOtpService,
} from "../services/user.service";
import { HTTPSTATUS } from "../config/http.config";
import {
  changePasswordSchema,
  deleteAccountSchema,
  updateUserSchema,
} from "../validators/user.validator";

export const getCurrentUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const user = await findByIdUserService(userId);
    return res.status(HTTPSTATUS.OK).json({
      message: "User fetched successfully",
      user,
    });
  }
);

export const updateUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = updateUserSchema.parse(req.body);
    const userId = req.user?._id;
    const profilePic = req.file;

    const user = await updateUserService(userId, body, profilePic);

    return res.status(HTTPSTATUS.OK).json({
      message: "User profile updated successfully",
      data: user,
    });
  }
);

export const changePasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = changePasswordSchema.parse(req.body);
    const userId = req.user?._id;

    const result = await changePasswordService(userId, body);

    return res.status(HTTPSTATUS.OK).json(result);
  }
);

export const sendDeleteAccountOtpController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    await sendDeleteAccountOtpService(userId);

    return res.status(HTTPSTATUS.OK).json({ message: "OTP sent to your registered email" });
  }
);

export const deleteUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const body = deleteAccountSchema.parse(payload);
    const userId = req.user?._id;
    await deleteUserService(userId, body);

    return res.status(HTTPSTATUS.OK).json({ message: "User account deleted successfully" });
  }
);
