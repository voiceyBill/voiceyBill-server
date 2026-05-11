import { OTP_EXPIRATION_MINUTES } from "../utils/otp";
import { Env } from "../config/env.config";
import { sendEmail } from "./mailer";
import { getVerificationEmailTemplate } from "./templates/verification.template";

type VerificationEmailParams = {
  email: string;
  username: string;
  otp: string;
};

export const sendVerificationOtpEmail = async (
  params: VerificationEmailParams
) => {
  const { email, username, otp } = params;

  const html = getVerificationEmailTemplate({
    username,
    otp,
    expiresInMinutes: OTP_EXPIRATION_MINUTES,
  });

  const text = `Hi ${username},\n\nYour VoiceyBill verification code is ${otp}. It expires in ${OTP_EXPIRATION_MINUTES} minutes.\n\nIf you did not create this account, you can ignore this email.`;

  return sendEmail({
    to: email,
    from: `VoiceyBill <${Env.RESEND_MAILER_SENDER_VERIFY}>`,
    subject: "Verify your VoiceyBill account",
    text,
    html,
  });
};