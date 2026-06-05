import {
  AnalyzeFinanceResponse,
  ExpenseOptimization,
  FinancialGoal,
} from "../@types/financial-coach.type";

const round = (v: number) => Math.round(v * 100) / 100;

type FinancialCoachDTOInput = {
  status: "success" | "partial_success";
  goalStatus: AnalyzeFinanceResponse["goalStatus"];

  totalIncome: number;
  totalExpenses: number;
  availableSavings: number;
  requiredSavings: number;
  monthlyDifference: number;

  goal: FinancialGoal;

  estimatedMonthsToGoal?: number;

  optimization?: ExpenseOptimization | null;
  aiRecommendation?: string | null;

  additionalSavingsPotential?: number;
  optimizedSavings?: number;
};

export function toFinancialCoachResponseDTO(
  data: FinancialCoachDTOInput,
): AnalyzeFinanceResponse {
  return {
    status: data.status,
    goalStatus: data.goalStatus,

    totalIncome: round(data.totalIncome),
    totalExpenses: round(data.totalExpenses),
    availableSavings: round(data.availableSavings),
    requiredSavings: round(data.requiredSavings),
    monthlyDifference: round(data.monthlyDifference),

    goal: data.goal,

    estimatedMonthsToGoal: data.estimatedMonthsToGoal,

    optimization: data.optimization ?? null,
    aiRecommendation: data.aiRecommendation ?? null,

    additionalSavingsPotential: data.additionalSavingsPotential ?? 0,
    optimizedSavings: data.optimizedSavings ?? 0,
  };
}
