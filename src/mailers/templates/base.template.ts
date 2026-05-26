export const getBaseEmailTemplate = (params: {
  title: string;
  headerTitle: string;
  headerSubtitle?: string;
  headerLabel?: string;
  contentRowsHtml: string;
}) => {
  const { title, headerTitle, headerSubtitle, headerLabel, contentRowsHtml } =
    params;

  const currentYear = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>

<body style="margin:0;padding:0;background:#f3f4f7;font-family:Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;background:#f3f4f7;">
    <tr>
      <td>
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;">

          <!-- HEADER -->
          <tr>
            <td style="background:#171717;padding:28px 32px;border-radius:12px 12px 0 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size:20px;font-weight:700;color:#fff;">
                      Voicey<span style="color:#9fff59;">Bill</span>
                    </span>
                  </td>

                  ${
                    headerLabel
                      ? `
                  <td style="text-align:right;">
                    <span style="display:inline-block;background:rgba(159,255,89,0.15);color:#9fff59;font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;border:1px solid rgba(159,255,89,0.3);">
                      ${headerLabel}
                    </span>
                  </td>`
                      : ""
                  }
                </tr>
              </table>

              <p style="margin:20px 0 0;font-size:22px;font-weight:700;color:#fff;">
                ${headerTitle}
              </p>

              ${
                headerSubtitle
                  ? `
              <p style="margin:6px 0 0;font-size:14px;color:rgba(255,255,255,0.6);">
                ${headerSubtitle}
              </p>`
                  : ""
              }
            </td>
          </tr>

          <!-- CONTENT -->
          <tr>
            <td style="background:#fff;padding:32px;">
              ${contentRowsHtml}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#171717;padding:18px 32px;border-radius:0 0 12px 12px;">
              <table width="100%">
                <tr>
                  <td>
                    <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.4);">
                      You're receiving this because you have an account at VoiceyBill.
                    </p>
                  </td>
                  <td style="text-align:right;">
                    <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.3);">
                      © ${currentYear} VoiceyBill
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
};
