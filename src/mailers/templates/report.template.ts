import { ReportType } from "../../@types/report.type";
import { formatCurrency } from "../../utils/format-currency";
import { capitalizeFirstLetter } from "../../utils/helper";
import { getBaseEmailTemplate } from "./base.template";

export const getReportEmailTemplate = (
  reportData: ReportType & { username: string },
  frequency: string,
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

  const categoryRows = topSpendingCategories
    ?.map(
      (cat: any) => `
      <tr>
        <td style="padding:10px 0;font-size:14px;color:#555;border-bottom:1px solid #f0f0f0;text-transform:capitalize;">
          ${cat.name}
        </td>
        <td style="padding:10px 0;font-size:14px;color:#171717;text-align:right;border-bottom:1px solid #f0f0f0;">
          ${formatCurrency(cat.amount)}
        </td>
        <td style="padding:10px 0;font-size:14px;color:#888;text-align:right;border-bottom:1px solid #f0f0f0;">
          ${cat.percent}%
        </td>
      </tr>
    `,
    )
    .join("");

  const insightItems = insights
    ?.map(
      (insight: string) => `
      <tr>
        <td style="padding:8px 0;">
          <table cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td width="20" style="vertical-align:top;padding-top:2px;">
                <span
                  style="
                    display:inline-block;
                    width:6px;
                    height:6px;
                    background-color:#9fff59;
                    border-radius:50%;
                    margin-top:5px;
                  "
                />
              </td>

              <td
                style="
                  font-size:14px;
                  color:#444;
                  line-height:1.6;
                "
              >
                ${insight}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `,
    )
    .join("");

  const reportContent = `
  
    <!-- Greeting -->
    <p style="margin:0 0 24px;font-size:15px;color:#333;line-height:1.6;">
      Hi <strong>${username}</strong>, here's your financial summary for
      <strong>${period}</strong>.
    </p>

    <!-- Stats Grid -->
    <table cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td
          width="48%"
          style="
            background:#f6fef0;
            border:1px solid #d4f5a8;
            border-radius:10px;
            padding:16px 18px;
            vertical-align:top;
          ">
          <p
            style="
              margin:0 0 4px;
              font-size:11px;
              font-weight:600;
              color:#4a8a2a;
              text-transform:uppercase;
              letter-spacing:.8px;
            ">
            Total Income
          </p>

          <p
            style="
              margin:0;
              font-size:22px;
              font-weight:700;
              color:#2d6a1a;
            ">
            ${formatCurrency(totalIncome)}
          </p>
        </td>

        <td width="4%"></td>
        <td
          width="48%"
          style="
            background:#fff5f5;
            border:1px solid #fecaca;
            border-radius:10px;
            padding:16px 18px;
            vertical-align:top;
          ">
          <p
            style="
              margin:0 0 4px;
              font-size:11px;
              font-weight:600;
              color:#c0392b;
              text-transform:uppercase;
              letter-spacing:.8px;
            ">
            Total Expenses
          </p>
          <p
            style="
              margin:0;
              font-size:22px;
              font-weight:700;
              color:#c0392b;
            ">
            ${formatCurrency(totalExpenses)}
          </p>
        </td>
      </tr>

      <tr>
        <td colspan="3" style="padding:8px 0;"></td>
      </tr>
      <tr>
        <td
          width="48%"
          style="
            background:#f8f8f8;
            border:1px solid #e8e8e8;
            border-radius:10px;
            padding:16px 18px;
            vertical-align:top;
          ">
          <p
            style="
              margin:0 0 4px;
              font-size:11px;
              font-weight:600;
              color:#555;
              text-transform:uppercase;
              letter-spacing:.8px;
            ">
            Available Balance
          </p>

          <p
            style="
              margin:0;
              font-size:22px;
              font-weight:700;
              color:#171717;
            " >
            ${formatCurrency(availableBalance)}
          </p>
        </td>

        <td width="4%"></td>
        <td
          width="48%"
          style="
            background:#171717;
            border-radius:10px;
            padding:16px 18px;
            vertical-align:top;
          ">
          <p
            style="
              margin:0 0 4px;
              font-size:11px;
              font-weight:600;
              color:rgba(159,255,89,0.7);
              text-transform:uppercase;
              letter-spacing:.8px;
            "
          >
            Savings Rate
          </p>

          <p
            style="
              margin:0;
              font-size:22px;
              font-weight:700;
              color:#9fff59;
            "
          >
            ${savingsRate.toFixed(1)}%
          </p>
        </td>
      </tr>
    </table>

    ${
      categoryRows
        ? `
      <!-- Top Spending -->
      <div style="margin-top:32px;">
        <p
          style="
            margin:0 0 14px;
            font-size:14px;
            font-weight:700;
            color:#171717;
            text-transform:uppercase;
            letter-spacing:.6px;
          "
        >
          Top Spending Categories
        </p>

        <table cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <th
              style="
                text-align:left;
                font-size:11px;
                color:#999;
                font-weight:600;
                text-transform:uppercase;
                padding-bottom:8px;
              "
            >
              Category
            </th>

            <th
              style="
                text-align:right;
                font-size:11px;
                color:#999;
                font-weight:600;
                text-transform:uppercase;
                padding-bottom:8px;
              "
            >
              Amount
            </th>

            <th
              style="
                text-align:right;
                font-size:11px;
                color:#999;
                font-weight:600;
                text-transform:uppercase;
                padding-bottom:8px;
              "
            >
              Share
            </th>
          </tr>

          ${categoryRows}
        </table>
      </div>
    `: ""}

    ${
      insightItems
        ? `
      <!-- AI Insights -->
      <div
        style="
          margin-top:32px;
          background:#171717;
          border-radius:10px;
          padding:20px 22px;
        ">
        <p
          style="
            margin:0 0 14px;
            font-size:13px;
            font-weight:700;
            color:#9fff59;
            text-transform:uppercase;
            letter-spacing:.6px;
          "
        >
          AI Insights
        </p>

        <table cellpadding="0" cellspacing="0" width="100%">
          ${insightItems}
        </table>
      </div>
    ` : ""}
  `;

  return getBaseEmailTemplate({
    title: reportTitle,
    headerTitle: reportTitle,
    headerSubtitle: period,
    headerLabel: `${capitalizeFirstLetter(frequency)} Report`,
    contentRowsHtml: reportContent,
  });
};
