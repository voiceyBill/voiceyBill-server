import { ReportType } from "../@types/report.type";

export const toReportEmailDTO = (
  report: any,
  period: string
): ReportType => {
  return {
    period,
    totalIncome: report.income,
    totalExpenses: report.expenses,
    availableBalance: report.balance,
    savingsRate: report.savingsRate,

    topSpendingCategories: report.topCategories?.map((cat: any) => ({
      name: cat.name,
      percent: cat.percent,
      amount: cat.amount,
    })) ?? [],

    insights: report.insights ?? [],
  };
};

