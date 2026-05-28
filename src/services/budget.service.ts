import BudgetModel, { BudgetDocument } from "../models/budget.model";
import UserModel from "../models/user.model";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../utils/app-error";
import { ErrorCodeEnum } from "../enums/error-code.enum";
import {
  CreateBudgetType,
  UpdateBudgetType,
  GetBudgetSummaryType,
  DeleteBudgetType,
} from "../validators/budget.validator";
import { toBudgetSummaryDTO, BudgetSummaryDTO } from "../dto/budget.dto";
import { sendBudgetAlertEmail } from "../mailers/budget-alert.mailer";

// Valid categories that users can set budgets for
const VALID_CATEGORIES = [
  "groceries",
  "dining",
  "transportation",
  "utilities",
  "entertainment",
  "shopping",
  "healthcare",
  "travel",
  "housing",
  "income",
  "investments",
  "other",
];

/**
 * Validate that the month/year is not too far in the future
 */
function validateMonthYear(month: number, year: number): void {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Allow up to 6 months in the future
  const maxFutureMonths = 6;
  const maxFutureDate = new Date(now);
  maxFutureDate.setMonth(maxFutureDate.getMonth() + maxFutureMonths);
  const maxYear = maxFutureDate.getFullYear();
  const maxMonth = maxFutureDate.getMonth() + 1;

  if (year > maxYear || (year === maxYear && month > maxMonth)) {
    throw new BadRequestException(
      "Cannot create budgets more than 6 months in the future",
      ErrorCodeEnum.VALIDATION_ERROR
    );
  }
}

/**
 * Validate that all categories are in the allowed list
 */
function validateCategories(categoryLimits: Array<{ category: string; limit: number }>): void {
  for (const limit of categoryLimits) {
    if (!VALID_CATEGORIES.includes(limit.category)) {
      throw new BadRequestException(
        `Invalid category: ${limit.category}. Valid categories are: ${VALID_CATEGORIES.join(", ")}`,
        ErrorCodeEnum.VALIDATION_ERROR
      );
    }
  }
}

/**
 * Validate that sum of category limits doesn't exceed total budget
 */
function validateCategorySum(totalBudget: number, categoryLimits: Array<{ category: string; limit: number }>): void {
  const categorySum = categoryLimits.reduce((sum, c) => sum + c.limit, 0);
  if (categorySum > totalBudget) {
    throw new BadRequestException(
      `Sum of category limits ($${categorySum.toFixed(2)}) cannot exceed total budget ($${totalBudget.toFixed(2)})`,
      ErrorCodeEnum.BUDGET_INVALID_AMOUNT
    );
  }
}

/**
 * Set or create a budget for a specific month/year
 */
export async function createOrUpdateBudget(
  userId: string,
  data: CreateBudgetType
): Promise<BudgetDocument> {
  const { month, year, totalBudget, categoryLimits } = data;

  // Validate month/year
  validateMonthYear(month, year);

  // Validate categories
  validateCategories(categoryLimits);

  // Validate category sum doesn't exceed total
  validateCategorySum(totalBudget, categoryLimits);

  // Check if budget already exists for this month/year
  const existingBudget = await BudgetModel.findOne({
    userId,
    month,
    year,
  });

  if (existingBudget) {
    // Update existing budget
    existingBudget.totalBudget = totalBudget;
    existingBudget.categoryLimits = categoryLimits;
    return existingBudget.save();
  }

  // Create new budget
  const newBudget = await BudgetModel.create({
    userId,
    month,
    year,
    totalBudget,
    categoryLimits,
  });

  return newBudget;
}

/**
 * Get budget summary with spending breakdown for a specific month/year
 */
export async function getBudgetSummary(
  userId: string,
  params: GetBudgetSummaryType
): Promise<BudgetSummaryDTO> {
  const { month, year } = params;

  // Validate month and year are reasonable
  const now = new Date();
  const isCurrentOrPastMonth =
    year < now.getFullYear() ||
    (year === now.getFullYear() && month <= now.getMonth() + 1);

  if (!isCurrentOrPastMonth && year - now.getFullYear() > 1) {
    throw new BadRequestException(
      "Cannot view budgets more than 1 year in the future",
      ErrorCodeEnum.VALIDATION_ERROR
    );
  }

  const budget = await BudgetModel.findOne({
    userId,
    month,
    year,
  });

  // Get the summary (returns empty summary if no budget exists)
  const summary = await toBudgetSummaryDTO(budget, month, year, userId);

  // Send email alert if there are exceeded budgets
  if (summary.hasBudget && summary.alerts.length > 0) {
    try {
      const user = await UserModel.findById(userId);
      if (user && user.email) {
        await sendBudgetAlertEmail({
          email: user.email,
          username: user.name,
          alerts: summary.alerts,
          month,
          year,
          totalBudget: summary.totalBudget,
          spent: summary.spent,
        });
      }
    } catch (error) {
      // Log error but don't fail the request if email fails
      console.error("Failed to send budget alert email:", error);
    }
  }

  return summary;
}

/**
 * Delete a budget for a specific month/year
 */
export async function deleteBudget(
  userId: string,
  params: DeleteBudgetType
): Promise<{ success: boolean }> {
  const { month, year } = params;

  const budget = await BudgetModel.findOneAndDelete({
    userId,
    month,
    year,
  });

  if (!budget) {
    throw new NotFoundException(
      "Budget not found",
      ErrorCodeEnum.RESOURCE_NOT_FOUND
    );
  }

  return { success: true };
}

/**
 * Get all budgets for a user (for history/overview)
 */
export async function getUserBudgets(userId: string): Promise<BudgetDocument[]> {
  const budgets = await BudgetModel.find({ userId }).sort({
    year: -1,
    month: -1,
  });

  return budgets;
}

/**
 * Get budget for current month
 */
export async function getCurrentMonthBudget(
  userId: string
): Promise<BudgetDocument | null> {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  return BudgetModel.findOne({ userId, month, year });
}
