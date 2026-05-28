import { z } from "zod";

export const budgetIdSchema = z.string().trim().min(1);

export const budgetCategoryLimitSchema = z.object({
  category: z.string().min(1, "Category is required"),
  limit: z.number().positive("Category limit must be positive").min(1),
});

export const createBudgetSchema = z
  .object({
    totalBudget: z.number().positive("Total budget must be positive").min(1),
    categoryLimits: z
      .array(budgetCategoryLimitSchema)
      .min(1, "At least one category limit is required"),
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(2000),
  })
  .refine(
    (values) => {
      const categorySum = values.categoryLimits.reduce(
        (sum, c) => sum + c.limit,
        0
      );
      return categorySum <= values.totalBudget;
    },
    {
      message: "Sum of category limits cannot exceed total budget",
      path: ["categoryLimits"],
    }
  );

export const updateBudgetSchema = z.object({
  totalBudget: z
    .number()
    .positive("Total budget must be positive")
    .min(1)
    .optional(),
  categoryLimits: z
    .array(budgetCategoryLimitSchema)
    .min(1, "At least one category limit is required")
    .optional(),
});

export const getBudgetSummarySchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000),
});

export const deleteBudgetSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000),
});

export type CreateBudgetType = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetType = z.infer<typeof updateBudgetSchema>;
export type GetBudgetSummaryType = z.infer<typeof getBudgetSummarySchema>;
export type DeleteBudgetType = z.infer<typeof deleteBudgetSchema>;
