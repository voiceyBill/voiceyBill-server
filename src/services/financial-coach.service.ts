import { AnalyzeFinanceSchemaType } from "../validators/financial-coach.validator";
import { AppError } from "../utils/app-error";
import { toFinancialCoachResponseDTO } from "../dto/financial-coach.dto";
import { GeminiFinancialCoachService } from "./gemini-financial-coach.service";
import { AnalyzeFinanceResponse } from "../@types/financial-coach.type";

export class FinancialCoachService {
  constructor(private gemini: GeminiFinancialCoachService) {}

  async analyzeFinance(
    data: AnalyzeFinanceSchemaType,
  ): Promise<AnalyzeFinanceResponse> {
    const totalExpenses = this.sumExpenses(data.expenses);

    const availableSavings = data.income - totalExpenses;

    const requiredSavings = data.goal.targetAmount / data.goal.durationMonths;

    const monthlyGap = availableSavings - requiredSavings;

    const estimatedMonthsToGoal =
      availableSavings > 0
        ? data.goal.targetAmount / availableSavings
        : undefined;

    let goalStatus: AnalyzeFinanceResponse["goalStatus"];

    if (availableSavings >= requiredSavings) {
      goalStatus = "ACHIEVABLE";
    } else if (availableSavings >= requiredSavings * 0.7) {
      goalStatus = "ACHIEVABLE_WITH_REDUCTION";
    } else {
      goalStatus = "NOT_ACHIEVABLE";
    }

    let optimization = null;
    let aiRecommendation = null;
    let status: "success" | "partial_success" = "success";

    try {
      const ai = await this.gemini.analyzeExpenseOptimization({
        income: data.income,
        expenses: data.expenses,
        goal: data.goal,
        availableSavings,
        requiredSavings,
      });

      optimization = ai?.optimization ?? null;
      aiRecommendation = ai?.aiRecommendation ?? null;
    } catch (e) {
      status = "partial_success";
    }

    return toFinancialCoachResponseDTO({
      status,
      goalStatus,
      totalIncome: data.income,
      totalExpenses,
      availableSavings,
      requiredSavings,
      monthlyDifference: monthlyGap,
      goal: data.goal,
      estimatedMonthsToGoal,
      optimization,
      aiRecommendation,
    });
  }

  private sumExpenses(expenses: AnalyzeFinanceSchemaType["expenses"]): number {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }
}

export const createFinancialCoachService = (
  gemini: GeminiFinancialCoachService,
) => new FinancialCoachService(gemini);
