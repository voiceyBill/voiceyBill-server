import NotificationTokenModel from "../models/notification-token.model";
import { firebaseMessaging } from "../config/firebase-admin.config";

const INVALID_TOKEN_ERRORS = new Set([
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
]);

export const sendBudgetImbalanceNotification = async (params: {
  tokens: string[];
  totalIncome: number;
  totalExpenses: number;
}) => {
  const { tokens, totalIncome, totalExpenses } = params;

  if (tokens.length === 0) {
    return { sent: 0, failed: 0, invalidTokens: [] as string[] };
  }

  const response = await firebaseMessaging.sendEachForMulticast({
    tokens,
    notification: {
      title: "Budget imbalance alert",
      body: "Your expenses are higher than your income.",
    },
    data: {
      type: "BUDGET_IMBALANCE",
      totalIncome: String(totalIncome),
      totalExpenses: String(totalExpenses),
    },
    android: {
      priority: "high",
    },
  });

  const invalidTokens: string[] = [];

  response.responses.forEach((result, index) => {
    if (!result.success) {
      const code = result.error?.code || "";
      if (INVALID_TOKEN_ERRORS.has(code)) {
        invalidTokens.push(tokens[index]);
      }
    }
  });

  if (invalidTokens.length > 0) {
    await NotificationTokenModel.deleteMany({
      token: { $in: invalidTokens },
    });
  }

  return {
    sent: response.successCount,
    failed: response.failureCount,
    invalidTokens,
  };
};
