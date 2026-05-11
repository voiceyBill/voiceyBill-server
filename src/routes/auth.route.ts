import { Router } from "express";
import {
  forgotPasswordController,
  loginController,
  resendOtpController,
  registerController,
  resetPasswordController,
  verifyOtpController,
} from "../controllers/auth.controller";

const authRoutes = Router();

authRoutes.post("/register", registerController);
authRoutes.post("/login", loginController);
authRoutes.post("/verify-otp", verifyOtpController);
authRoutes.post("/resend-otp", resendOtpController);
authRoutes.post("/forgot-password", forgotPasswordController);
authRoutes.post("/reset-password", resetPasswordController);

export default authRoutes;
