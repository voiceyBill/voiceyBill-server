export const VALID_EXPENSE_CATEGORIES = [
  "groceries",
  "dining",
  "transportation",
  "utilities",
  "entertainment",
  "shopping",
  "healthcare",
  "travel",
  "housing",
  "education",
  "investments",
  "other",
] as const;

export type ExpenseCategory = (typeof VALID_EXPENSE_CATEGORIES)[number];

export type GoalStatus =
  | "ACHIEVABLE"
  | "ACHIEVABLE_WITH_REDUCTION"
  | "NOT_ACHIEVABLE";

export type AnalysisStatus = "success" | "partial_success" | "error";

export interface ExpenseItem {
  category: ExpenseCategory;
  amount: number;
  description?: string;
}

export interface FinancialGoal {
  name: string;
  targetAmount: number;
  durationMonths: number;
}

export interface AnalyzeFinanceRequest {
  income: number;
  expenses: ExpenseItem[];
  goal: FinancialGoal;
  currency?: string;
}

export interface ClassifiedExpense {
  category: string;
  amount: number;
  rationale: string;
}

export interface ExpenseReductionSuggestion {
  category: string;
  currentAmount: number;
  suggestedAmount: number;
  reductionAmount: number;
  reason: string;
}

export interface ExpenseOptimization {
  essential: ClassifiedExpense[];
  nonEssential: ClassifiedExpense[];

  recommendations: ExpenseReductionSuggestion[];

  optimizationPotential: {
    conservative: number;
    moderate: number;
    aggressive: number;
  };
}

export interface AnalyzeFinanceResponse {
  status: AnalysisStatus;

  goalStatus: GoalStatus;

  totalIncome: number;
  totalExpenses: number;

  availableSavings: number;
  requiredSavings: number;

  monthlyDifference: number;

  estimatedMonthsToGoal?: number;

  additionalSavingsPotential: number;

  optimizedSavings: number;

  goal: FinancialGoal;

  optimization: ExpenseOptimization | null;

  aiRecommendation: string | null;
}
