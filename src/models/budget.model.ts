import mongoose, { Schema, Document } from "mongoose";
import { convertToCents, convertToDollarUnit } from "../utils/format-currency";

export interface BudgetCategoryLimit {
  category: string;
  limit: number;
}

export interface BudgetDocument extends Document {
  userId: mongoose.Types.ObjectId;
  month: number;
  year: number;
  totalBudget: number;
  categoryLimits: BudgetCategoryLimit[];
  createdAt: Date;
  updatedAt: Date;
}

const budgetCategoryLimitSchema = new Schema<BudgetCategoryLimit>(
  {
    category: {
      type: String,
      required: true,
    },
    limit: {
      type: Number,
      required: true,
      set: (value: number) => convertToCents(value),
      get: (value: number) => convertToDollarUnit(value),
    },
  },
  { _id: false }
);

const budgetSchema = new Schema<BudgetDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    totalBudget: {
      type: Number,
      required: true,
      set: (value: number) => convertToCents(value),
      get: (value: number) => convertToDollarUnit(value),
    },
    categoryLimits: [budgetCategoryLimitSchema],
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

// Compound index for unique budget per user per month-year
budgetSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

const BudgetModel = mongoose.model<BudgetDocument>("Budget", budgetSchema);

export default BudgetModel;
