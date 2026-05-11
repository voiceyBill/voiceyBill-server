import crypto from "crypto";
import { compareValue, hashValue } from "./bcrypt";

export const OTP_EXPIRATION_MINUTES = 10;

export const generateOtp = () => crypto.randomInt(100000, 1000000).toString();

export const getOtpExpiresAt = () =>
  new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

export const hashOtp = async (otp: string) => hashValue(otp);

export const compareOtp = async (otp: string, hashedOtp: string) =>
  compareValue(otp, hashedOtp);