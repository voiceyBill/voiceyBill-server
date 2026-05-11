import { Env } from "../config/env.config";
import { OTP_EXPIRATION_MINUTES } from "../utils/otp";
import { sendEmail } from "./mailer";
import { getPasswordResetEmailTemplate } from "./templates/password-reset.template";

type PasswordResetEmailParams = {
  email: string;
  username: string;
  otp: string;
};

export const sendPasswordResetEmail = async (
  params: PasswordResetEmailParams
) => {
  const { email, username, otp } = params;

  const html = getPasswordResetEmailTemplate({
    username,
    otp,
    expiresInMinutes: OTP_EXPIRATION_MINUTES,
  });

  const text = `Hi ${username},\n\nYour VoiceyBill password reset code is ${otp}. It expires in ${OTP_EXPIRATION_MINUTES} minutes.\n\nIf you did not request this reset, you can ignore this email.`;

  return sendEmail({
    to: email,
    from: `VoiceyBill <${Env.RESEND_MAILER_SENDER_VERIFY}>`,
    subject: "Reset your VoiceyBill password",
    text,
    html,
  });
};
