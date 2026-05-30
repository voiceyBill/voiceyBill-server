import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
});

export type UpdateUserType = z.infer<typeof updateUserSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export type ChangePasswordType = z.infer<typeof changePasswordSchema>;

export const registerPushTokenSchema = z.object({
  token: z.string().trim().min(1),
  platform: z.enum(["ANDROID", "IOS"]).default("ANDROID"),
  deviceId: z.string().trim().min(1).optional(),
});

export const unregisterPushTokenSchema = z.object({
  token: z.string().trim().min(1),
});

export type RegisterPushTokenType = z.infer<typeof registerPushTokenSchema>;
export type UnregisterPushTokenType = z.infer<typeof unregisterPushTokenSchema>;
