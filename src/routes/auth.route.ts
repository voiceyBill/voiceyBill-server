import { Router } from "express";
import {
  forgotPasswordController,
  loginController,
  resendOtpController,
  registerController,
  resetPasswordController,
  verifyOtpController,
} from "../controllers/auth.controller";
import { otpLimiter, authLimiter } from "../middlewares/rateLimit.middleware";

const authRoutes = Router();

authRoutes.post("/register", authLimiter, registerController);
authRoutes.post("/login", authLimiter, loginController);
authRoutes.post("/verify-otp", otpLimiter, verifyOtpController);
authRoutes.post("/resend-otp", otpLimiter, resendOtpController);
authRoutes.post("/forgot-password", otpLimiter, forgotPasswordController);
authRoutes.post("/reset-password", otpLimiter, resetPasswordController);

export default authRoutes;
