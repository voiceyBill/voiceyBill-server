import { Router } from "express";
import {
  changePasswordController,
  getCurrentUserController,
  registerPushTokenController,
  unregisterPushTokenController,
  updateUserController,
  deleteUserController,
  sendDeleteAccountOtpController,
} from "../controllers/user.controller";
import { upload } from "../config/cloudinary.config";

const userRoutes = Router();

userRoutes.get("/current-user", getCurrentUserController);
userRoutes.put(
  "/update",
  upload.single("profilePicture"),
  updateUserController,
);
userRoutes.put("/change-password", changePasswordController);
userRoutes.post("/account/otp", sendDeleteAccountOtpController);
userRoutes.delete("/account", deleteUserController);

userRoutes.post("/push-token", registerPushTokenController);
userRoutes.delete("/push-token", unregisterPushTokenController);

export default userRoutes;
