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
    .map(
      (cat: any) => `
    <tr>
      <td style="padding:10px 0;font-size:14px;color:#555;border-bottom:1px solid #eee;text-transform:capitalize;">
        ${cat.name}
      </td>
      <td style="padding:10px 0;font-size:14px;color:#171717;text-align:right;border-bottom:1px solid #eee;">
        ${formatCurrency(cat.amount)}
      </td>
      <td style="padding:10px 0;font-size:14px;color:#888;text-align:right;border-bottom:1px solid #eee;">
        ${cat.percent}%
      </td>
    </tr>
  `,
    )
    .join("");

  const insightItems = insights
    .map(
      (i: string) => `
    <tr>
      <td style="padding:6px 0;color:#444;font-size:14px;">
        <span style="display:inline-block;width:6px;height:6px;background:#9fff59;border-radius:50%;margin-right:8px;"></span>
        ${i}
      </td>
    </tr>
  `,
    )
    .join("");

  const contentRowsHtml = `
    <p style="margin:0 0 20px;font-size:15px;color:#333;">
      Hi <strong>${username}</strong>, here is your financial summary for <strong>${period}</strong>.
    </p>

    <h4 style="margin:20px 0 10px;">Top Spending Categories</h4>
    <table width="100%">${categoryRows}</table>

    <h4 style="margin:24px 0 10px;">AI Insights</h4>
    <table width="100%">${insightItems}</table>
  `;

  return getBaseEmailTemplate({
    title: reportTitle,
    headerTitle: reportTitle,
    headerSubtitle: period,
    headerLabel: `${capitalizeFirstLetter(frequency)} Report`,
    contentRowsHtml,
  });
};
