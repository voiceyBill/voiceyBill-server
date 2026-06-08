import fetch from "node-fetch";
import NotificationTokenModel from "../models/notification-token.model";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

type ExpoPushResponseItem = {
  status: "ok" | "error";
  message?: string;
  details?: {
    error?: string;
  };
};

export const sendBudgetImbalanceNotification = async (params: {
  tokens: string[];
  totalIncome: number;
  totalExpenses: number;
}) => {
  const { tokens, totalIncome, totalExpenses } = params;

  if (!tokens.length) {
    return { sent: 0, failed: 0, invalidTokens: [] as string[] };
  }

  // Expo expects array of messages directly
  const messages = tokens.map((token) => ({
    to: token,
    sound: "default",
    title: "Budget imbalance alert",
    body: "Your expenses are higher than your income.",
    data: {
      type: "BUDGET_IMBALANCE",
      totalIncome: String(totalIncome),
      totalExpenses: String(totalExpenses),
    },
  }));

  const response = await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(messages),
  });

  const result = (await response.json()) as {
    data?: ExpoPushResponseItem[];
  };

  const data = result.data ?? [];

  // Map invalid tokens safely using index
  const invalidTokens: string[] = data
    .map((item, index) => {
      const isDeviceNotRegistered =
        item.status === "error" &&
        item.details?.error === "DeviceNotRegistered";

      return isDeviceNotRegistered ? tokens[index] : null;
    })
    .filter(Boolean) as string[];

  // Remove invalid tokens from DB
  if (invalidTokens.length > 0) {
    await NotificationTokenModel.deleteMany({
      token: { $in: invalidTokens },
    });
  }

  const sent = data.filter((item) => item.status === "ok").length;
  const failed = data.filter((item) => item.status === "error").length;

  return {
    sent,
    failed,
    invalidTokens,
  };
};
