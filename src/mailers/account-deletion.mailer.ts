import { Env } from "../config/env.config";
import { OTP_EXPIRATION_MINUTES } from "../utils/otp";
import { sendEmail } from "./mailer";
import { getAccountDeletionEmailTemplate } from "./templates/account-deletion.template";

type AccountDeletionEmailParams = {
  email: string;
  username: string;
  otp: string;
};

export const sendAccountDeletionOtpEmail = async (
  params: AccountDeletionEmailParams
) => {
  const { email, username, otp } = params;

  const html = getAccountDeletionEmailTemplate({
    username,
    otp,
    expiresInMinutes: OTP_EXPIRATION_MINUTES,
  });

  const text = `Hi ${username},\n\nUse the code below to confirm deletion of your VoiceyBill account: ${otp}. It expires in ${OTP_EXPIRATION_MINUTES} minutes.\n\nIf you did not request this, you can ignore this email.`;

  return sendEmail({
    to: email,
    from: `VoiceyBill <${Env.RESEND_MAILER_SENDER_VERIFY}>`,
    subject: "Confirm your VoiceyBill account deletion",
    text,
    html,
  });
};
