export const getPasswordResetEmailTemplate = (params: {
  username: string;
  otp: string;
  expiresInMinutes: number;
}) => {
  const { username, otp, expiresInMinutes } = params;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset your VoiceyBill password</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;background:#f4f6f8;">
      <tr>
        <td>
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background:#171717;padding:28px 32px;">
                <div style="font-size:20px;font-weight:700;color:#ffffff;">Voicey<span style="color:#9fff59;">Bill</span></div>
                <div style="margin-top:8px;font-size:14px;color:rgba(255,255,255,0.72);">Password reset</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 16px;font-size:16px;color:#222;">Hi ${username},</p>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#444;">
                  Use the one-time code below to reset your VoiceyBill password. The code expires in ${expiresInMinutes} minutes.
                </p>
                <div style="display:inline-block;padding:16px 24px;background:#f4f4f4;border:1px solid #e5e5e5;border-radius:12px;font-size:32px;font-weight:700;letter-spacing:8px;color:#171717;">
                  ${otp}
                </div>
                <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#666;">
                  If you did not request a password reset, you can safely ignore this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};
