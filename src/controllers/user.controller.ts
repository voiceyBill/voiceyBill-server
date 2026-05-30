import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middlerware";
import {
  changePasswordService,
  findByIdUserService,
  registerPushTokenService,
  unregisterPushTokenService,
  updateUserService,
} from "../services/user.service";
import { HTTPSTATUS } from "../config/http.config";
import {
  changePasswordSchema,
  registerPushTokenSchema,
  unregisterPushTokenSchema,
  updateUserSchema,
} from "../validators/user.validator";
import { evaluateAndNotifyBudgetImbalance } from "../services/budget-alert.service";

export const getCurrentUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const user = await findByIdUserService(userId);
    return res.status(HTTPSTATUS.OK).json({
      message: "User fetched successfully",
      user,
    });
  },
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
  },
);

export const changePasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = changePasswordSchema.parse(req.body);
    const userId = req.user?._id;

    const result = await changePasswordService(userId, body);

    return res.status(HTTPSTATUS.OK).json(result);
  },
);

export const registerPushTokenController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const body = registerPushTokenSchema.parse(req.body);

    const token = await registerPushTokenService(userId, body);

    await evaluateAndNotifyBudgetImbalance(userId, "token.register");

    return res.status(HTTPSTATUS.OK).json({
      message: "Push token registered successfully",
      data: token,
    });
  },
);

export const unregisterPushTokenController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const body = unregisterPushTokenSchema.parse(req.body);

    await unregisterPushTokenService(userId, body);

    return res.status(HTTPSTATUS.OK).json({
      message: "Push token unregistered successfully",
    });
  },
);
