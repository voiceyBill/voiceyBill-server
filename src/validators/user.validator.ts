import { z } from "zod";
import { isValidCurrencyCode } from "../utils/currency.constants";
import { passwordSchema } from "./auth.validator";

export const updateUserSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  baseCurrency: z
    .string()
    .trim()
    .length(3, "Currency code must be exactly 3 characters")
    .toUpperCase()
    .refine(isValidCurrencyCode, "Unsupported currency code")
    .optional(),
});

export type UpdateUserType = z.infer<typeof updateUserSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
});

export const deleteAccountSchema = z.object({
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "OTP must be a 6-digit code"),
});

export type ChangePasswordType = z.infer<typeof changePasswordSchema>;
export type DeleteAccountType = z.infer<typeof deleteAccountSchema>;
