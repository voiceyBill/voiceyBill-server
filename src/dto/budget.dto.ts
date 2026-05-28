import { BudgetDocument } from "../models/budget.model";
import TransactionModel, { TransactionTypeEnum } from "../models/transaction.model";
import { convertToDollarUnit } from "../utils/format-currency";

export interface BudgetCategorySummaryDTO {
  name: string;
  limit: number;
  spent: number;
  remaining: number;
  usagePercentage: number;
  exceeded: boolean;
}

export interface BudgetAlert {
  message: string;
  type: "category" | "overall";
  category?: string;
}

export interface BudgetSummaryDTO {
  hasBudget: boolean;
  month: number;
  year: number;
  totalBudget: number;
  spent: number;
  remaining: number;
  usagePercentage: number;
  exceeded: boolean;
  categories: BudgetCategorySummaryDTO[];
  alerts: BudgetAlert[];
}

export async function toBudgetSummaryDTO(
  budget: BudgetDocument | null,
  month: number,
  year: number,
  userId: string
): Promise<BudgetSummaryDTO> {
  // If no budget exists for this month, return empty summary
  if (!budget) {
    return {
      hasBudget: false,
      month,
      year,
      totalBudget: 0,
      spent: 0,
      remaining: 0,
      usagePercentage: 0,
      exceeded: false,
      categories: [],
      alerts: [],
    };
  }

  // Get all transactions for the given month/year for this user
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const transactions = await TransactionModel.find({
    userId,
    type: TransactionTypeEnum.EXPENSE,
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  });

  // Calculate spending by category
  const categorySpending: Record<string, number> = {};
  transactions.forEach((transaction) => {
    if (!categorySpending[transaction.category]) {
      categorySpending[transaction.category] = 0;
    }
    // The amount is already converted to dollar unit by the getter
    const amount = typeof transaction.amount === 'number'
      ? transaction.amount
      : parseFloat(String(transaction.amount || 0));
    categorySpending[transaction.category] += amount;
  });

  // Calculate total spent and category summaries
  let totalSpent = 0;
  const alerts: BudgetAlert[] = [];
  const categories: BudgetCategorySummaryDTO[] = budget.categoryLimits.map(
    (categoryLimit) => {
      const spent = categorySpending[categoryLimit.category] || 0;
      const remaining = categoryLimit.limit - spent;
      const usagePercentage =
        categoryLimit.limit > 0 ? (spent / categoryLimit.limit) * 100 : 0;
      const exceeded = spent > categoryLimit.limit;

      totalSpent += spent;

      // Generate alerts for exceeded categories
      if (exceeded) {
        alerts.push({
          message: `${categoryLimit.category} budget exceeded by $${(Math.round(spent - categoryLimit.limit))}`,
          type: "category",
          category: categoryLimit.category,
        });
      } else if (usagePercentage >= 80) {
        alerts.push({
          message: `${categoryLimit.category} budget is ${Math.round(usagePercentage)}% used`,
          type: "category",
          category: categoryLimit.category,
        });
      }

      return {
        name: categoryLimit.category,
        limit: categoryLimit.limit,
        spent,
        remaining,
        usagePercentage: Number(Math.min(usagePercentage, 100)),
        exceeded,
      };
    }
  );

  const remaining = budget.totalBudget - totalSpent;
  const usagePercentage =
    budget.totalBudget > 0 ? (totalSpent / budget.totalBudget) * 100 : 0;
  const exceeded = totalSpent > budget.totalBudget;

  // Add overall budget alert if exceeded
  if (exceeded) {
    alerts.unshift({
      message: `Overall budget exceeded by $${(totalSpent - budget.totalBudget).toFixed(2)}`,
      type: "overall",
    });
  } else if (usagePercentage >= 80) {
    alerts.unshift({
      message: `Overall budget is ${Math.round(usagePercentage)}% used`,
      type: "overall",
    });
  }

  return {
    hasBudget: true,
    month,
    year,
    totalBudget: budget.totalBudget,
    spent: totalSpent,
    remaining,
    usagePercentage: Number(Math.min(usagePercentage, 100)),
    exceeded,
    categories,
    alerts,
  };
}

export function toBudgetResponseDTO(budget: BudgetDocument) {
  return {
    id: budget._id,
    month: budget.month,
    year: budget.year,
    totalBudget: budget.totalBudget,
    categoryLimits: budget.categoryLimits,
    createdAt: budget.createdAt,
    updatedAt: budget.updatedAt,
  };
}
