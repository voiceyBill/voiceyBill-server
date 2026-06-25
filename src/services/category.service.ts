import CategoryModel from "../models/category.model";
import TransactionModel from "../models/transaction.model";
import { ConflictException, NotFoundException } from "../utils/app-error";
import {
  CreateCategoryType,
  UpdateCategoryType,
} from "../validators/category.validator";

// Junk values that should never be treated as a real category.
const RESERVED_CATEGORY_NAMES = ["undefined", "null", "uncategorized"];

const isValidCategoryName = (name?: string | null): boolean => {
  const normalized = (name ?? "").trim().toLowerCase();
  return normalized.length > 0 && !RESERVED_CATEGORY_NAMES.includes(normalized);
};

const DEFAULT_CATEGORIES = [
  { name: "Groceries", color: "#22C55E" },
  { name: "Dining & Restaurants", color: "#F97316" },
  { name: "Transportation", color: "#3B82F6" },
  { name: "Utilities", color: "#8B5CF6" },
  { name: "Entertainment", color: "#EC4899" },
  { name: "Shopping", color: "#F59E0B" },
  { name: "Healthcare", color: "#EF4444" },
  { name: "Travel", color: "#06B6D4" },
  { name: "Housing & Rent", color: "#6366F1" },
  { name: "Income", color: "#10B981" },
  { name: "Investments", color: "#0EA5E9" },
  { name: "Other", color: "#6B7280" },
];

export const getCategoriesService = async (userId: string) => {
  const existingCount = await CategoryModel.countDocuments({ userId });

  if (existingCount === 0) {
    await CategoryModel.insertMany(
      DEFAULT_CATEGORIES.map((cat) => ({
        userId,
        name: cat.name,
        color: cat.color,
        isDefault: true,
      }))
    );
  }

  const categories = await CategoryModel.find({ userId }).sort({
    isDefault: -1,
    name: 1,
  });

  // Self-heal: purge any junk categories that leaked in from older clients
  // (e.g. a category literally named "undefined") so they never show again.
  const junkIds = categories
    .filter((cat) => !isValidCategoryName(cat.name))
    .map((cat) => cat._id);

  if (junkIds.length) {
    await CategoryModel.deleteMany({ _id: { $in: junkIds } });
  }

  return categories.filter((cat) => isValidCategoryName(cat.name));
};

export const createCategoryService = async (
  userId: string,
  body: CreateCategoryType
) => {
  const existing = await CategoryModel.findOne({
    userId,
    name: { $regex: new RegExp(`^${body.name}$`, "i") },
  });

  if (existing) {
    throw new ConflictException(
      `Category "${body.name}" already exists`
    );
  }

  return CategoryModel.create({ userId, ...body, isDefault: false });
};

export const updateCategoryService = async (
  userId: string,
  categoryId: string,
  body: UpdateCategoryType
) => {
  const category = await CategoryModel.findOne({ _id: categoryId, userId });
  if (!category) throw new NotFoundException("Category not found");

  if (body.name && body.name !== category.name) {
    const duplicate = await CategoryModel.findOne({
      userId,
      _id: { $ne: categoryId },
      name: { $regex: new RegExp(`^${body.name}$`, "i") },
    });
    if (duplicate) throw new ConflictException(`Category "${body.name}" already exists`);

    await TransactionModel.updateMany(
      { userId, category: { $regex: new RegExp(`^${category.name}$`, "i") } },
      { $set: { category: body.name } }
    );
  }

  Object.assign(category, body);
  await category.save();
  return category;
};

export const deleteCategoryService = async (
  userId: string,
  categoryId: string
) => {
  const category = await CategoryModel.findOne({ _id: categoryId, userId });
  if (!category) throw new NotFoundException("Category not found");

  await TransactionModel.updateMany(
    { userId, category: { $regex: new RegExp(`^${category.name}$`, "i") } },
    { $set: { category: "Uncategorized" } }
  );

  await category.deleteOne();
  return { message: "Category deleted successfully" };
};
