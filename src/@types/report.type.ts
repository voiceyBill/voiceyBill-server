export type ReportType = {
  period: string;
  baseCurrency?: string;
  totalIncome: number;
  totalExpenses: number;
  availableBalance: number;
  savingsRate: number;
  topSpendingCategories: Array<{ name: string; percent: number, amount: number }>;
  insights: string[];
  currencySummary?: Array<{ currency: string; transactionCount: number }>;
};
