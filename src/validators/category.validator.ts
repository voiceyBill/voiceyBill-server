import { z } from "zod";

// Names that must never be persisted as a real category — these are junk
// values that previously leaked into the picker (e.g. "undefined").
const RESERVED_CATEGORY_NAMES = ["undefined", "null", "uncategorized"];

const isReservedName = (name: string) =>
  RESERVED_CATEGORY_NAMES.includes(name.trim().toLowerCase());

const categoryName = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(50, "Name too long")
  .refine((name) => !isReservedName(name), {
    message: "That category name is reserved. Please choose another.",
  });

export const createCategorySchema = z.object({
  name: categoryName,
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color")
    .default("#6B7280"),
});

export const updateCategorySchema = z.object({
  name: categoryName.optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color")
    .optional(),
});

export type CreateCategoryType = z.infer<typeof createCategorySchema>;
export type UpdateCategoryType = z.infer<typeof updateCategorySchema>;
