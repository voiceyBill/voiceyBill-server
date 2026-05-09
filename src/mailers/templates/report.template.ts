import { ReportType } from "../../@types/report.type";
import { formatCurrency } from "../../utils/format-currency";
import { capitalizeFirstLetter } from "../../utils/helper";

export const getReportEmailTemplate = (
  reportData: ReportType & { username: string },
  frequency: string
) => {
  const {
    username,
    period,
    totalIncome,
    totalExpenses,
    availableBalance,
    savingsRate,
    topSpendingCategories,
    insights,
  } = reportData;

  const reportTitle = `${capitalizeFirstLetter(frequency)} Financial Report`;
  const currentYear = new Date().getFullYear();

  const categoryRows = topSpendingCategories
    .map(
      (cat: any) => `
      <tr>
        <td style="padding: 10px 0; font-size: 14px; color: #555; border-bottom: 1px solid #f0f0f0; text-transform: capitalize;">
          ${cat.name}
        </td>
        <td style="padding: 10px 0; font-size: 14px; color: #171717; text-align: right; border-bottom: 1px solid #f0f0f0;">
          ${formatCurrency(cat.amount)}
        </td>
        <td style="padding: 10px 0; font-size: 14px; color: #888; text-align: right; border-bottom: 1px solid #f0f0f0;">
          ${cat.percent}%
        </td>
      </tr>`
    )
    .join("");

  const insightItems = insights
    .map(
      (insight: string) => `
      <tr>
        <td style="padding: 8px 0;">
          <table cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td width="20" style="vertical-align: top; padding-top: 2px;">
                <span style="display: inline-block; width: 6px; height: 6px; background-color: #9fff59; border-radius: 50%; margin-top: 5px;"></span>
              </td>
              <td style="font-size: 14px; color: #444; line-height: 1.6;">${insight}</td>
            </tr>
          </table>
        </td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${reportTitle}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f3f4f7; font-family: Arial, sans-serif;">

    <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #f3f4f7; padding: 32px 16px;">
      <tr>
        <td>
          <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto;">

            <!-- Header -->
            <tr>
              <td style="background-color: #171717; border-radius: 12px 12px 0 0; padding: 28px 32px;">
                <table cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td>
                      <span style="font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.3px;">
                        Voicey<span style="color: #9fff59;">Bill</span>
                      </span>
                    </td>
                    <td style="text-align: right;">
                      <span style="display: inline-block; background-color: rgba(159,255,89,0.15); color: #9fff59; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px; border: 1px solid rgba(159,255,89,0.3);">
                        ${capitalizeFirstLetter(frequency)} Report
                      </span>
                    </td>
                  </tr>
                </table>
                <p style="margin: 20px 0 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.4px;">
                  ${reportTitle}
                </p>
                <p style="margin: 6px 0 0; font-size: 14px; color: rgba(255,255,255,0.5);">
                  ${period}
                </p>
              </td>
            </tr>

            <!-- Greeting -->
            <tr>
              <td style="background-color: #ffffff; padding: 28px 32px 0;">
                <p style="margin: 0; font-size: 15px; color: #333;">
                  Hi <strong>${username}</strong>, here's your financial summary for <strong>${period}</strong>.
                </p>
              </td>
            </tr>

            <!-- Stats Grid -->
            <tr>
              <td style="background-color: #ffffff; padding: 20px 32px;">
                <table cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <!-- Income -->
                    <td width="48%" style="background-color: #f6fef0; border: 1px solid #d4f5a8; border-radius: 10px; padding: 16px 18px; vertical-align: top;">
                      <p style="margin: 0 0 4px; font-size: 11px; font-weight: 600; color: #4a8a2a; text-transform: uppercase; letter-spacing: 0.8px;">Total Income</p>
                      <p style="margin: 0; font-size: 22px; font-weight: 700; color: #2d6a1a;">${formatCurrency(totalIncome)}</p>
                    </td>
                    <td width="4%"></td>
                    <!-- Expenses -->
                    <td width="48%" style="background-color: #fff5f5; border: 1px solid #fecaca; border-radius: 10px; padding: 16px 18px; vertical-align: top;">
                      <p style="margin: 0 0 4px; font-size: 11px; font-weight: 600; color: #c0392b; text-transform: uppercase; letter-spacing: 0.8px;">Total Expenses</p>
                      <p style="margin: 0; font-size: 22px; font-weight: 700; color: #c0392b;">${formatCurrency(totalExpenses)}</p>
                    </td>
                  </tr>
                  <tr><td colspan="3" style="padding: 8px 0;"></td></tr>
                  <tr>
                    <!-- Balance -->
                    <td width="48%" style="background-color: #f8f8f8; border: 1px solid #e8e8e8; border-radius: 10px; padding: 16px 18px; vertical-align: top;">
                      <p style="margin: 0 0 4px; font-size: 11px; font-weight: 600; color: #555; text-transform: uppercase; letter-spacing: 0.8px;">Available Balance</p>
                      <p style="margin: 0; font-size: 22px; font-weight: 700; color: #171717;">${formatCurrency(availableBalance)}</p>
                    </td>
                    <td width="4%"></td>
                    <!-- Savings Rate -->
                    <td width="48%" style="background-color: #171717; border-radius: 10px; padding: 16px 18px; vertical-align: top;">
                      <p style="margin: 0 0 4px; font-size: 11px; font-weight: 600; color: rgba(159,255,89,0.7); text-transform: uppercase; letter-spacing: 0.8px;">Savings Rate</p>
                      <p style="margin: 0; font-size: 22px; font-weight: 700; color: #9fff59;">${savingsRate.toFixed(1)}%</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            ${categoryRows ? `
            <!-- Top Spending -->
            <tr>
              <td style="background-color: #ffffff; padding: 0 32px 24px;">
                <p style="margin: 0 0 14px; font-size: 14px; font-weight: 700; color: #171717; text-transform: uppercase; letter-spacing: 0.6px;">Top Spending Categories</p>
                <table cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <th style="text-align: left; font-size: 11px; color: #999; font-weight: 600; text-transform: uppercase; padding-bottom: 8px;">Category</th>
                    <th style="text-align: right; font-size: 11px; color: #999; font-weight: 600; text-transform: uppercase; padding-bottom: 8px;">Amount</th>
                    <th style="text-align: right; font-size: 11px; color: #999; font-weight: 600; text-transform: uppercase; padding-bottom: 8px;">Share</th>
                  </tr>
                  ${categoryRows}
                </table>
              </td>
            </tr>` : ""}

            ${insightItems ? `
            <!-- Insights -->
            <tr>
              <td style="background-color: #ffffff; padding: 0 32px 28px;">
                <div style="background-color: #171717; border-radius: 10px; padding: 20px 22px;">
                  <p style="margin: 0 0 14px; font-size: 13px; font-weight: 700; color: #9fff59; text-transform: uppercase; letter-spacing: 0.6px;">AI Insights</p>
                  <table cellpadding="0" cellspacing="0" width="100%">
                    ${insightItems}
                  </table>
                </div>
              </td>
            </tr>` : ""}

            <!-- Footer -->
            <tr>
              <td style="background-color: #171717; border-radius: 0 0 12px 12px; padding: 20px 32px;">
                <table cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td>
                      <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.4);">
                        This report was generated automatically by VoiceyBill.
                      </p>
                    </td>
                    <td style="text-align: right;">
                      <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.3);">
                        &copy; ${currentYear} VoiceyBill
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
