import { getBaseEmailTemplate } from "./base.template";

export const getAccountDeletionEmailTemplate = (params: {
  username: string;
  otp: string;
  expiresInMinutes: number;
}) => {
  const { username, otp, expiresInMinutes } = params;

  const contentRowsHtml = `
    <p style="margin:0 0 16px;font-size:16px;color:#222;">
      Hi ${username},
    </p>

    <p style="margin:0 0 24px;font-size:15px;color:#444;line-height:1.6;">
      Use the code below to confirm deletion of your VoiceyBill account. It expires in ${expiresInMinutes} minutes.
    </p>

    <div style="
      display:inline-block;
      padding:16px 24px;
      background:#171717;
      border:1px solid rgba(255,79,79,0.4);
      border-radius:12px;
      font-size:32px;
      font-weight:700;
      letter-spacing:8px;
      color:#ff6f6f;
    ">
      ${otp}
    </div>

    <p style="margin:24px 0 0;font-size:13px;color:#666;">
      If you did not request this, you can ignore this email.
    </p>
  `;

  return getBaseEmailTemplate({
    title: "Confirm VoiceyBill account deletion",
    headerTitle: "Account Deletion",
    headerSubtitle: "Confirm your deletion request",
    headerLabel: "Danger Zone",
    contentRowsHtml,
  });
};
