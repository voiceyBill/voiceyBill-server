import { Env } from "../config/env.config";
import { sendEmail } from "./mailer";
import { getBudgetIncreaseEmailTemplate } from "./templates/budget-increase.template";

type BudgetIncreaseEmailParams = {
  email: string;
  username: string;
  month: number;
  year: number;
  previousBudget: number;
  newBudget: number;
  increases: Array<{
    type: "overall" | "category";
    category?: string;
    previousAmount: number;
    newAmount: number;
  }>;
};

export const sendBudgetIncreaseEmail = async (
  params: BudgetIncreaseEmailParams
) => {
  const {
    email,
    username,
    month,
    year,
    previousBudget,
    newBudget,
    increases,
  } = params;

  if (!increases || increases.length === 0) {
    return null;
  }

  const monthName = new Date(year, month - 1).toLocaleString("default", {
    month: "long",
  });

  const html = getBudgetIncreaseEmailTemplate({
    username,
    month,
    year,
    previousBudget,
    newBudget,
    increases,
  });

  const text = `Hi ${username},\n\nYour budget has been increased for ${monthName} ${year}.\n\nBudget Summary:\nPrevious Budget: $${previousBudget.toFixed(2)}\nNew Budget: $${newBudget.toFixed(2)}\nIncrease: $${(newBudget - previousBudget).toFixed(2)}\n\nCategory Changes:\n${increases
    .map((i) => {
      if (i.type === "overall") {
        return `- Overall budget increased from $${i.previousAmount.toFixed(2)} to $${i.newAmount.toFixed(2)}`;
      }
      return `- ${i.category} budget increased from $${i.previousAmount.toFixed(2)} to $${i.newAmount.toFixed(2)}`;
    })
    .join("\n")}\n\nLog in to VoiceyBill to view your updated budget.`;

  return sendEmail({
    to: email,
    from: `VoiceyBill <${Env.RESEND_MAILER_SENDER_VERIFY}>`,
    subject: `Budget Update - ${monthName} ${year}`,
    text,
    html,
  });
};
