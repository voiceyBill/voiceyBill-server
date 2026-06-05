import { z } from "zod";
import { VALID_EXPENSE_CATEGORIES } from "../@types/financial-coach.type";
export const analyzeFinanceSchema = z.object({
  income: z.number().positive(),

  expenses: z
    .array(
      z.object({
        category: z.enum(VALID_EXPENSE_CATEGORIES),
        amount: z.number().positive(),
        description: z.string().trim().max(200).optional(),
      }),
    )
    .min(1, "At least one expense is required"),

  goal: z.object({
    name: z.string().trim().min(1).max(100),
    targetAmount: z.number().positive(),
    durationMonths: z.number().int().min(1).max(120),
  }),

  currency: z.string().optional(),
});

export type AnalyzeFinanceSchemaType = z.infer<typeof analyzeFinanceSchema>;
