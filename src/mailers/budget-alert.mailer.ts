import { Env } from "../config/env.config";
import { sendEmail } from "./mailer";
import { getBudgetAlertEmailTemplate } from "./templates/budget-alert.template";
import { BudgetAlert } from "../dto/budget.dto";

type BudgetAlertEmailParams = {
  email: string;
  username: string;
  alerts: BudgetAlert[];
  month: number;
  year: number;
  totalBudget: number;
  spent: number;
};

export const sendBudgetAlertEmail = async (
  params: BudgetAlertEmailParams
) => {
  const { email, username, alerts, month, year, totalBudget, spent } = params;

  // Only send email if there are exceeded alerts
  const hasExceeded = alerts.some(
    (alert) =>
      alert.message.toLowerCase().includes("exceeded") ||
      (alert.message.toLowerCase().includes("used") &&
        alert.message.includes("80%")) ||
      alert.message.includes("100%")
  );

  if (!hasExceeded) {
    return null;
  }

  const monthName = new Date(year, month - 1).toLocaleString("default", {
    month: "long",
  });

  const html = getBudgetAlertEmailTemplate({
    username,
    alerts,
    month,
    year,
    totalBudget,
    spent,
  });

  const text = `Hi ${username},\n\nBudget Alert for ${monthName} ${year}.\n\nTotal Budget: $${totalBudget.toFixed(2)}\nAmount Spent: $${spent.toFixed(2)}\nOverage: $${Math.max(0, spent - totalBudget).toFixed(2)}\n\nAlerts:\n${alerts.map((a) => `- ${a.message}`).join("\n")}\n\nPlease review your spending.`;

  return sendEmail({
    to: email,
    from: `VoiceyBill <${Env.RESEND_MAILER_SENDER_VERIFY}>`,
    subject: `Budget Alert - ${monthName} ${year}`,
    text,
    html,
  });
};
