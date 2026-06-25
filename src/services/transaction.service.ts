import TransactionModel, {
  TransactionTypeEnum,
} from "../models/transaction.model";
import { BadRequestException, NotFoundException } from "../utils/app-error";
import BudgetModel from "../models/budget.model";
import { ErrorCodeEnum } from "../enums/error-code.enum";
import { calculateNextOccurrence } from "../utils/helper";
import {
  CreateTransactionType,
  UpdateTransactionType,
} from "../validators/transaction.validator";
import { openai, openAIModel } from "../config/openai.config";
import { receiptPrompt } from "../utils/prompt";
import { evaluateAndNotifyBudgetImbalance } from "./budget-alert.service";

import { resolveUserCurrencyConversion } from "./currency-conversion.service";
import UserModel from "../models/user.model";
import { resolveCurrencyConversion } from "./currency-conversion.service";
/**
 * Sanitize and validate pagination inputs to prevent abuse and crashes
 * @param pageSize - requested page size (can be string, number, or invalid)
 * @param pageNumber - requested page number (can be string, number, or invalid)
 * @returns { pageSize: number; pageNumber: number } - safe, validated values
 */
const sanitizeAndValidatePagination = (
  pageSize: unknown,
  pageNumber: unknown,
): { pageSize: number; pageNumber: number } => {
  const MAX_PAGE_SIZE = 50000;
  const MAX_PAGE_NUMBER = 1000;

  // convert values
  const parsedPageSize = Number(pageSize);
  const parsedPageNumber = Number(pageNumber);

  // validate pageSize
  if (!Number.isFinite(parsedPageSize) || !Number.isInteger(parsedPageSize)) {
    throw new BadRequestException("pageSize must be a valid integer");
  }

  if (parsedPageSize <= 0) {
    throw new BadRequestException("pageSize must be greater than 0");
  }

  if (parsedPageSize > MAX_PAGE_SIZE) {
    throw new BadRequestException(`pageSize cannot exceed ${MAX_PAGE_SIZE}`);
  }

  // validate pageNumber
  if (
    !Number.isFinite(parsedPageNumber) ||
    !Number.isInteger(parsedPageNumber)
  ) {
    throw new BadRequestException("pageNumber must be a valid integer");
  }

  if (parsedPageNumber <= 0) {
    throw new BadRequestException("pageNumber must be greater than 0");
  }

  if (parsedPageNumber > MAX_PAGE_NUMBER) {
    throw new BadRequestException(
      `pageNumber cannot exceed ${MAX_PAGE_NUMBER}`,
    );
  }

  return {
    pageSize: parsedPageSize,
    pageNumber: parsedPageNumber,
  };
};

export const createTransactionService = async (
  body: CreateTransactionType,
  userId: string,
) => {
  let nextRecurringDate: Date | undefined;
  const currentDate = new Date();

  if (body.isRecurring && body.recurringInterval) {
    const calulatedDate = calculateNextOccurrence(
      body.date,
      body.recurringInterval,
    );

    nextRecurringDate =
      calulatedDate < currentDate
        ? calculateNextOccurrence(currentDate, body.recurringInterval)
        : calulatedDate;
  }

  const currencyFields = await resolveUserCurrencyConversion(
    userId,
    Number(body.amount),
    body.currency,
  );

  if (body.type === TransactionTypeEnum.EXPENSE) {
    const transactionDate = new Date(body.date);
    const month = transactionDate.getMonth() + 1;
    const year = transactionDate.getFullYear();

    const budget = await BudgetModel.findOne({
      userId,
      month,
      year,
    });

    if (budget) {
      // Calculate current total spent for this month/year
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      const transactions = await TransactionModel.find({
        userId,
        type: TransactionTypeEnum.EXPENSE,
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      }).select("amount category"); // PERF: only the fields the budget sum needs

      const totalSpent = transactions.reduce((sum, t) => sum + (typeof t.amount === 'number' ? t.amount : parseFloat(String(t.amount || 0))), 0);

      if (totalSpent + currencyFields.amount > budget.totalBudget) {
        const remaining = budget.totalBudget - totalSpent;
        const remainingStr = remaining < 0 ? `-$${Math.abs(remaining).toFixed(2)}` : `$${remaining.toFixed(2)}`;
        throw new BadRequestException(
          `Transaction exceeds monthly budget of $${budget.totalBudget}. Remaining: ${remainingStr}`,
          ErrorCodeEnum.BUDGET_INVALID_AMOUNT
        );
      }

      // Check category limit
      if (body.category) {
        const normalizedCategory = body.category.trim().toLowerCase().replace(/\s+/g, "_");
        const categoryLimit = budget.categoryLimits.find(
          (c) => c.category.trim().toLowerCase().replace(/\s+/g, "_") === normalizedCategory
        );
        if (categoryLimit) {
          const categorySpent = transactions
            .filter((t) => t.category.trim().toLowerCase().replace(/\s+/g, "_") === normalizedCategory)
            .reduce((sum, t) => sum + (typeof t.amount === 'number' ? t.amount : parseFloat(String(t.amount || 0))), 0);

          if (categorySpent + currencyFields.amount > categoryLimit.limit) {
            const remaining = categoryLimit.limit - categorySpent;
            const remainingStr = remaining < 0 ? `-$${Math.abs(remaining).toFixed(2)}` : `$${remaining.toFixed(2)}`;
            throw new BadRequestException(
              `Transaction exceeds category limit for ${body.category}. Remaining: ${remainingStr}`,
              ErrorCodeEnum.BUDGET_INVALID_AMOUNT
            );
          }
        }
      }
    }
  }

  const transaction = await TransactionModel.create({
    ...body,
    userId,
    category: body.category,
    amount: currencyFields.amount,
    originalAmount: currencyFields.originalAmount,
    originalCurrency: currencyFields.originalCurrency,
    baseCurrencyAtTime: currencyFields.baseCurrencyAtTime,
    exchangeRate: currencyFields.exchangeRate,
    rateSource: currencyFields.rateSource,
    exchangeRateFetchedAt: currencyFields.exchangeRateFetchedAt,
    isRecurring: body.isRecurring || false,
    recurringInterval: body.recurringInterval || null,
    nextRecurringDate,
    lastProcessed: null,
  });

  await evaluateAndNotifyBudgetImbalance(userId, "transaction.create");

  return transaction;
};

export const getAllTransactionService = async (
  userId: string,
  filters: {
    keyword?: string;
    type?: keyof typeof TransactionTypeEnum;
    recurringStatus?: "RECURRING" | "NON_RECURRING";
    startDate?: string;
    endDate?: string;
  },
  pagination: {
    pageSize: unknown;
    pageNumber: unknown;
  },
) => {
  const { keyword, type, recurringStatus, startDate, endDate } = filters;

  const filterConditions: Record<string, any> = {
    userId,
  };

  if (keyword) {
    filterConditions.$or = [
      { title: { $regex: keyword, $options: "i" } },
      { category: { $regex: keyword, $options: "i" } },
    ];
  }

  if (type) {
    filterConditions.type = type;
  }

  if (recurringStatus) {
    if (recurringStatus === "RECURRING") {
      filterConditions.isRecurring = true;
    } else if (recurringStatus === "NON_RECURRING") {
      filterConditions.isRecurring = false;
    }
  }

  if (startDate || endDate) {
    const start = startDate ? new Date(startDate) : null;
    let end: Date | null = null;
    if (endDate) {
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    }

    const dateConditions: Record<string, any>[] = [];
    const createdAtConditions: Record<string, any>[] = [];

    if (start) {
      dateConditions.push({ date: { $gte: start } });
      createdAtConditions.push({ createdAt: { $gte: start } });
    }
    if (end) {
      dateConditions.push({ date: { $lte: end } });
      createdAtConditions.push({ createdAt: { $lte: end } });
    }

    const rangeCondition = {
      $or: [
        { $and: dateConditions },
        { $and: createdAtConditions }
      ]
    };

    if (filterConditions.$or) {
      filterConditions.$and = [
        { $or: filterConditions.$or },
        rangeCondition
      ];
      delete filterConditions.$or;
    } else {
      filterConditions.$or = rangeCondition.$or;
    }
  }

  // Sanitize pagination inputs to prevent abuse and invalid queries
  const { pageSize, pageNumber } = sanitizeAndValidatePagination(
    pagination.pageSize,
    pagination.pageNumber,
  );

  // SAFE skip (now guaranteed valid)
  const skip = (pageNumber - 1) * pageSize;

  const [transactions, totalCount] = await Promise.all([
    TransactionModel.find(filterConditions)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 }),
    TransactionModel.countDocuments(filterConditions),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    transactions,
    pagination: {
      pageSize,
      pageNumber,
      totalCount,
      totalPages,
      skip,
    },
  };
};

export const getTransactionByIdService = async (
  userId: string,
  transactionId: string,
) => {
  const transaction = await TransactionModel.findOne({
    _id: transactionId,
    userId,
  });

  if (!transaction) {
    throw new NotFoundException("Transaction not found");
  }

  return transaction;
};

export const duplicateTransactionService = async (
  userId: string,
  transactionId: string,
) => {
  const transaction = await TransactionModel.findOne({
    _id: transactionId,
    userId,
  });

  if (!transaction) {
    throw new NotFoundException("Transaction not found");
  }

  const duplicated = await TransactionModel.create({
    ...transaction.toObject(),
    _id: undefined,
    title: `Duplicate - ${transaction.title}`,
    description: transaction.description
      ? `${transaction.description} (Duplicate)`
      : "Duplicated transaction",
    isRecurring: false,
    recurringInterval: undefined,
    nextRecurringDate: undefined,
    createdAt: undefined,
    updatedAt: undefined,
  });

  return duplicated;
};

export const updateTransactionService = async (
  userId: string,
  transactionId: string,
  body: UpdateTransactionType,
) => {
  const existingTransaction = await TransactionModel.findOne({
    _id: transactionId,
    userId,
  });

  if (!existingTransaction) {
    throw new NotFoundException("Transaction not found");
  }

  const now = new Date();
  const isRecurring = body.isRecurring ?? existingTransaction.isRecurring;

  const date =
    body.date !== undefined ? new Date(body.date) : existingTransaction.date;

  let recurringInterval:
    | "DAILY"
    | "WEEKLY"
    | "MONTHLY"
    | "YEARLY"
    | null
    | undefined =
    body.recurringInterval ?? existingTransaction.recurringInterval;

  let nextRecurringDate: Date | undefined | null = null;

  if (isRecurring === false) {
    recurringInterval = null;
    nextRecurringDate = null;
  } else if (isRecurring && recurringInterval) {
    const calulatedDate = calculateNextOccurrence(date, recurringInterval);

    nextRecurringDate =
      calulatedDate < now
        ? calculateNextOccurrence(now, recurringInterval)
        : calulatedDate;
  }

  let currencyUpdate: Record<string, any> = {};
  if (body.amount !== undefined || body.currency !== undefined) {
    const inputAmount =
      body.amount !== undefined
        ? Number(body.amount)
        : (existingTransaction.originalAmount ?? existingTransaction.amount);
    const inputCurrency =
      body.currency ||
      existingTransaction.originalCurrency ||
      existingTransaction.baseCurrencyAtTime ||
      undefined;
    const currencyFields = await resolveUserCurrencyConversion(
      userId,
      inputAmount,
      inputCurrency,
    );

    currencyUpdate = {
      amount: currencyFields.amount,
      originalAmount: currencyFields.originalAmount,
      originalCurrency: currencyFields.originalCurrency,
      baseCurrencyAtTime: currencyFields.baseCurrencyAtTime,
      exchangeRate: currencyFields.exchangeRate,
      rateSource: currencyFields.rateSource,
      exchangeRateFetchedAt: currencyFields.exchangeRateFetchedAt,
    };
  }

  const targetType = body.type || existingTransaction.type;
  if (targetType === TransactionTypeEnum.EXPENSE) {
    const transactionDate = new Date(date);
    const month = transactionDate.getMonth() + 1;
    const year = transactionDate.getFullYear();

    const budget = await BudgetModel.findOne({
      userId,
      month,
      year,
    });

    if (budget) {
      const targetAmount = currencyUpdate.amount !== undefined ? currencyUpdate.amount : existingTransaction.amount;

      // Calculate current total spent for this month/year, excluding this transaction
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      const transactions = await TransactionModel.find({
        userId,
        _id: { $ne: transactionId },
        type: TransactionTypeEnum.EXPENSE,
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      }).select("amount category"); // PERF: only the fields the budget sum needs

      const totalSpent = transactions.reduce((sum, t) => sum + (typeof t.amount === 'number' ? t.amount : parseFloat(String(t.amount || 0))), 0);

      if (totalSpent + targetAmount > budget.totalBudget) {
        const remaining = budget.totalBudget - totalSpent;
        const remainingStr = remaining < 0 ? `-$${Math.abs(remaining).toFixed(2)}` : `$${remaining.toFixed(2)}`;
        throw new BadRequestException(
          `Transaction exceeds monthly budget of $${budget.totalBudget}. Remaining: ${remainingStr}`,
          ErrorCodeEnum.BUDGET_INVALID_AMOUNT
        );
      }

      // Check category limit
      const category = body.category || existingTransaction.category;
      if (category) {
        const normalizedCategory = category.trim().toLowerCase().replace(/\s+/g, "_");
        const categoryLimit = budget.categoryLimits.find(
          (c) => c.category.trim().toLowerCase().replace(/\s+/g, "_") === normalizedCategory
        );
        if (categoryLimit) {
          const categorySpent = transactions
            .filter((t) => t.category.trim().toLowerCase().replace(/\s+/g, "_") === normalizedCategory)
            .reduce((sum, t) => sum + (typeof t.amount === 'number' ? t.amount : parseFloat(String(t.amount || 0))), 0);

          if (categorySpent + targetAmount > categoryLimit.limit) {
            const remaining = categoryLimit.limit - categorySpent;
            const remainingStr = remaining < 0 ? `-$${Math.abs(remaining).toFixed(2)}` : `$${remaining.toFixed(2)}`;
            throw new BadRequestException(
              `Transaction exceeds category limit for ${category}. Remaining: ${remainingStr}`,
              ErrorCodeEnum.BUDGET_INVALID_AMOUNT
            );
          }
        }
      }
    }
  }

  existingTransaction.set({
    ...(body.title && { title: body.title }),
    ...(body.description && { description: body.description }),
    ...(body.category && { category: body.category }),
    ...(body.type && { type: body.type }),
    ...(body.paymentMethod && { paymentMethod: body.paymentMethod }),
    ...currencyUpdate,
    date,
    isRecurring,
    recurringInterval,
    nextRecurringDate,
  });

  await existingTransaction.save();

  await evaluateAndNotifyBudgetImbalance(userId, "transaction.update");

  return;
};

export const deleteTransactionService = async (
  userId: string,
  transactionId: string,
) => {
  const deleted = await TransactionModel.findOneAndDelete({
    _id: transactionId,
    userId,
  });

  if (!deleted) {
    throw new NotFoundException("Transaction not found");
  }

  await evaluateAndNotifyBudgetImbalance(userId, "transaction.delete");

  return;
};

export const bulkDeleteTransactionService = async (
  userId: string,
  transactionIds: string[],
) => {
  const result = await TransactionModel.deleteMany({
    _id: { $in: transactionIds },
    userId,
  });

  if (result.deletedCount === 0) {
    throw new NotFoundException("No transations found");
  }

  await evaluateAndNotifyBudgetImbalance(userId, "transaction.bulk-delete");

  return {
    sucess: true,
    deletedCount: result.deletedCount,
  };
};

export const bulkTransactionService = async (
  userId: string,
  transactions: CreateTransactionType[],
) => {
  try {
    const user = await UserModel.findById(userId).select("baseCurrency").lean();
    const baseCurrency = user?.baseCurrency || "USD";

    const bulkOps = await Promise.all(
      transactions.map(async (tx) => {
        const currencyFields = await resolveCurrencyConversion(
          baseCurrency,
          Number(tx.amount),
          tx.currency,
        );

        return {
          insertOne: {
            document: {
              ...tx,
              userId,
              date: new Date(tx.date),
              amount: currencyFields.amount,
              originalAmount: currencyFields.originalAmount,
              originalCurrency: currencyFields.originalCurrency,
              baseCurrencyAtTime: currencyFields.baseCurrencyAtTime,
              exchangeRate: currencyFields.exchangeRate,
              rateSource: currencyFields.rateSource,
              exchangeRateFetchedAt: currencyFields.exchangeRateFetchedAt,
              isRecurring: false,
              nextRecurringDate: null,
              recurringInterval: null,
              lastProcesses: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        };
      }),
    );

    const result = await TransactionModel.bulkWrite(bulkOps, {
      ordered: true,
    });

    await evaluateAndNotifyBudgetImbalance(userId, "transaction.bulk-insert");

    return {
      insertedCount: result.insertedCount,
      success: true,
    };
  } catch (error) {
    throw error;
  }
};

export const scanReceiptService = async (
  file: Express.Multer.File | undefined,
) => {
  if (!file) {
    throw new BadRequestException("No file uploaded");
  }

  try {
    if (!file.path) {
      throw new BadRequestException("Failed to upload file");
    }
    const result = await openai.chat.completions.create({
      model: openAIModel,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: receiptPrompt },
            { type: "image_url", image_url: { url: file.path } },
          ],
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0,
      max_tokens: 500,
    });

    const content = result.choices[0]?.message?.content;
    if (!content) {
      throw new BadRequestException("Could not read receipt content");
    }

    const data = JSON.parse(content);

    if (!data.amount || !data.date) {
      throw new BadRequestException("Receipt missing required information");
    }

    const currency =
      typeof data.currency === "string" &&
        data.currency.trim().toUpperCase() !== "DEFAULT" &&
        data.currency.trim().length === 3
        ? data.currency.trim().toUpperCase()
        : undefined;

    let category =
      typeof data.category === "string"
        ? data.category.toLowerCase().trim()
        : "other";

    const allowedCategories = [
      "groceries",
      "dining & restaurants",
      "transportation",
      "utilities",
      "entertainment",
      "shopping",
      "healthcare",
      "travel",
      "housing & rent",
      "income",
      "investments",
      "other",
    ];

    if (!allowedCategories.includes(category)) {
      category = "other";
    }

    return {
      title: data.title || "Receipt",
      amount: data.amount,
      date: data.date,
      description: data.description,
      category,
      paymentMethod: data.paymentMethod,
      type: data.type,
      currency,
      receiptUrl: file.path,
    };
  } catch (error) {
    if (error instanceof BadRequestException) {
      throw error;
    }
    console.error("Receipt Scan Error:", error);
    throw new BadRequestException("Receipt scanning service unavailable");
  }
};