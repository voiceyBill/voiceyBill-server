import mongoose from "mongoose";
import TransactionModel, {
  TransactionTypeEnum,
} from "../models/transaction.model";
import UserModel, { BudgetImbalanceStatusEnum } from "../models/user.model";
import NotificationTokenModel from "../models/notification-token.model";
import { sendBudgetImbalanceNotification } from "./notification.service";
import { Env } from "../config/env.config";

const COOLDOWN_MS =
  Number(Env.BUDGET_IMBALANCE_COOLDOWN_MINUTES || 0) * 60 * 1000;

const getTotals = async (userId: string) => {
  const [summary] = await TransactionModel.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: {
            $cond: [
              { $eq: ["$type", TransactionTypeEnum.INCOME] },
              { $abs: "$amount" },
              0,
            ],
          },
        },
        totalExpenses: {
          $sum: {
            $cond: [
              { $eq: ["$type", TransactionTypeEnum.EXPENSE] },
              { $abs: "$amount" },
              0,
            ],
          },
        },
      },
    },
  ]);

  return {
    totalIncome: summary?.totalIncome || 0,
    totalExpenses: summary?.totalExpenses || 0,
  };
};

export const evaluateAndNotifyBudgetImbalance = async (
  userId: string,
  source: string,
) => {
  const user = await UserModel.findById(userId).select(
    "budgetImbalanceStatus budgetImbalanceNotifiedAt budgetImbalanceNotificationsEnabled",
  );
  if (!user) return;

  const totals = await getTotals(userId);
  const isImbalanced = totals.totalExpenses > totals.totalIncome;

  if (!isImbalanced) {
    if (user.budgetImbalanceStatus !== BudgetImbalanceStatusEnum.BALANCED) {
      user.set({
        budgetImbalanceStatus: BudgetImbalanceStatusEnum.BALANCED,
      });
      await user.save();
    }
    return;
  }

  if (user.budgetImbalanceNotificationsEnabled === false) {
    if (user.budgetImbalanceStatus !== BudgetImbalanceStatusEnum.IMBALANCED) {
      user.set({
        budgetImbalanceStatus: BudgetImbalanceStatusEnum.IMBALANCED,
      });
      await user.save();
    }
    return;
  }

  const now = new Date();
  const hasCooldown =
    COOLDOWN_MS > 0 &&
    user.budgetImbalanceNotifiedAt &&
    now.getTime() - user.budgetImbalanceNotifiedAt.getTime() < COOLDOWN_MS;

  if (
    user.budgetImbalanceStatus === BudgetImbalanceStatusEnum.IMBALANCED &&
    user.budgetImbalanceNotifiedAt &&
    hasCooldown
  ) {
    return;
  }

  const tokens = await NotificationTokenModel.find({ userId })
    .select("token")
    .lean();

  const tokenList = tokens.map((t) => t.token).filter(Boolean);

  if (tokenList.length === 0) {
    user.set({
      budgetImbalanceStatus: BudgetImbalanceStatusEnum.IMBALANCED,
    });
    await user.save();
    return;
  }

  try {
    const result = await sendBudgetImbalanceNotification({
      tokens: tokenList,
      totalIncome: totals.totalIncome,
      totalExpenses: totals.totalExpenses,
    });

    user.set({
      budgetImbalanceStatus: BudgetImbalanceStatusEnum.IMBALANCED,
      budgetImbalanceNotifiedAt:
        result.sent > 0 ? now : user.budgetImbalanceNotifiedAt,
    });

    await user.save();
  } catch (error) {
    console.error("Budget notification failed", { userId, source, error });
  }
};
