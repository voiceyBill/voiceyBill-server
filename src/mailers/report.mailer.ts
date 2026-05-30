import { formatCurrency } from "../utils/format-currency";
import { getReportEmailTemplate } from "./templates/report.template";
import { sendEmail } from "./mailer";
import { ReportType } from "../@types/report.type";
import { Env } from "../config/env.config";

type ReportEmailParams = {
  email: string;
  username: string;
  report: ReportType;
  frequency: string;
};

export const sendReportEmail = async (params: ReportEmailParams) => {
  const { email, username, report, frequency } = params;
  const baseCurrency = report.baseCurrency || "USD";
  const html = getReportEmailTemplate(
    {
      username,
      ...report,
    },
    frequency
  );

  const text = `Your ${frequency} Financial Report (${report.period})
    Income: ${formatCurrency(report.totalIncome, baseCurrency)}
    Expenses: ${formatCurrency(report.totalExpenses, baseCurrency)}
    Balance: ${formatCurrency(report.availableBalance, baseCurrency)}
    Savings Rate: ${report.savingsRate.toFixed(2)}%
    ${report.currencySummary?.length
      ? `Foreign Currency Transactions: ${report.currencySummary
          .map((item) => `${item.currency}: ${item.transactionCount}`)
          .join(", ")}`
      : ""}

    ${report.insights.join("\n")}
`;

  console.log(text, "text mail");

  return sendEmail({
    to: email,
    from: `VoiceyBill <${Env.RESEND_MAILER_SENDER_REPORTS}>`,
    subject: `${frequency} Financial Report - ${report.period}`,
    text,
    html,
  });
};
