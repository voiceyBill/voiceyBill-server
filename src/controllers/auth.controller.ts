import { Request, Response } from "express";
import { HTTPSTATUS } from "../config/http.config";
import { asyncHandler } from "../middlewares/asyncHandler.middlerware";
import {
  forgotPasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  resendOtpSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from "../validators/auth.validator";
import {
  forgotPasswordService,
  loginService,
  refreshTokenService,
  registerService,
  resendOtpService,
  resetPasswordService,
  verifyOtpService,
} from "../services/auth.service";

export const registerController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = registerSchema.parse(req.body);

    const result = await registerService(body);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Verification code sent to your email",
      data: result,
    });
  }
);

export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = loginSchema.parse({
      ...req.body,
    });
    const { user, accessToken, refreshToken, expiresAt, reportSetting } =
      await loginService(body);

    return res.status(HTTPSTATUS.OK).json({
      message: "User logged in successfully",
      user,
      accessToken,
      refreshToken,
      expiresAt,
      reportSetting,
    });
  }
);

export const refreshTokenController = asyncHandler(
  async (req: Request, res: Response) => {
    const { refreshToken } = refreshTokenSchema.parse(req.body);
    const result = await refreshTokenService(refreshToken);

    return res.status(HTTPSTATUS.OK).json({
      message: "Token refreshed",
      ...result,
    });
  }
);

export const logoutController = asyncHandler(
  async (_req: Request, res: Response) => {
    // Stateless JWT: nothing to invalidate server-side. Client clears its own
    // credentials. Returning 204 keeps the contract simple and lets the mobile
    // client treat logout as fire-and-forget.
    return res.status(HTTPSTATUS.NO_CONTENT).send();
  }
);

export const verifyOtpController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = verifyOtpSchema.parse(req.body);
    const result = await verifyOtpService(body);

    return res.status(HTTPSTATUS.OK).json({
      message: "Email verified successfully",
      data: result,
    });
  }
);

export const resendOtpController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = resendOtpSchema.parse(req.body);
    const result = await resendOtpService(body);

    return res.status(HTTPSTATUS.OK).json({
      message: result.message,
    });
  }
);

export const forgotPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = forgotPasswordSchema.parse(req.body);
    const result = await forgotPasswordService(body);

    return res.status(HTTPSTATUS.OK).json({
      message: result.message,
    });
  }
);

export const resetPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = resetPasswordSchema.parse(req.body);
    const result = await resetPasswordService(body);

    return res.status(HTTPSTATUS.OK).json({
      message: result.message,
    });
  }
);
