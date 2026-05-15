import { Request, Response } from "express";
import { HTTPSTATUS } from "../config/http.config";
import { asyncHandler } from "../middlewares/asyncHandler.middlerware";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendOtpSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from "../validators/auth.validator";
import {
  forgotPasswordService,
  loginService,
  registerService,
  resendOtpService,
  resetPasswordService,
  verifyOtpService,
} from "../services/auth.service";

const resendCooldowns = new Map<string, number>();

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
    const { user, accessToken, expiresAt, reportSetting } =
      await loginService(body);

    return res.status(HTTPSTATUS.OK).json({
      message: "User logged in successfully",
      user,
      accessToken,
      expiresAt,
      reportSetting,
    });
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
    const { email } = body;

    const now = Date.now();
    const lastSent = resendCooldowns.get(email);
    if (lastSent && now - lastSent < 60000) {
      return res.status(429).json({
        message: "Too many requests. Please wait before requesting another code.",
      });
    }
    resendCooldowns.set(email, now);

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