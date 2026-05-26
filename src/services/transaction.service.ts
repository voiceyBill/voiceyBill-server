import TransactionModel, {
  TransactionTypeEnum,
} from "../models/transaction.model";
import { BadRequestException, NotFoundException } from "../utils/app-error";
import { calculateNextOccurrence } from "../utils/helper";
import {
  CreateTransactionType,
  UpdateTransactionType,
} from "../validators/transaction.validator";
import { openai, openAIModel } from "../config/openai.config";
import { receiptPrompt } from "../utils/prompt";

/**
 * Sanitize and validate pagination inputs to prevent abuse and crashes
 * @param pageSize - requested page size (can be string, number, or invalid)
 * @param pageNumber - requested page number (can be string, number, or invalid)
 * @returns { pageSize: number; pageNumber: number } - safe, validated values
 */
const sanitizeAndValidatePagination = (
  pageSize: unknown,
  pageNumber: unknown
): { pageSize: number; pageNumber: number } => {
  const MAX_PAGE_SIZE = 100;
  const MAX_PAGE_NUMBER = 1000;

  // convert values
  const parsedPageSize = Number(pageSize);
  const parsedPageNumber = Number(pageNumber);

  // validate pageSize
  if (
    !Number.isFinite(parsedPageSize) ||
    !Number.isInteger(parsedPageSize)
  ) {
    throw new BadRequestException(
      "pageSize must be a valid integer"
    );
  }

  if (parsedPageSize <= 0) {
    throw new BadRequestException(
      "pageSize must be greater than 0"
    );
  }

  if (parsedPageSize > MAX_PAGE_SIZE) {
    throw new BadRequestException(
      `pageSize cannot exceed ${MAX_PAGE_SIZE}`
    );
  }

  // validate pageNumber
  if (
    !Number.isFinite(parsedPageNumber) ||
    !Number.isInteger(parsedPageNumber)
  ) {
    throw new BadRequestException(
      "pageNumber must be a valid integer"
    );
  }

  if (parsedPageNumber <= 0) {
    throw new BadRequestException(
      "pageNumber must be greater than 0"
    );
  }

  if (parsedPageNumber > MAX_PAGE_NUMBER) {
    throw new BadRequestException(
      `pageNumber cannot exceed ${MAX_PAGE_NUMBER}`
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

  const transaction = await TransactionModel.create({
    ...body,
    userId,
    category: body.category,
    amount: Number(body.amount),
    isRecurring: body.isRecurring || false,
    recurringInterval: body.recurringInterval || null,
    nextRecurringDate,
    lastProcessed: null,
  });

  return transaction;
};

export const getAllTransactionService = async (
  userId: string,
  filters: {
    keyword?: string;
    type?: keyof typeof TransactionTypeEnum;
    recurringStatus?: "RECURRING" | "NON_RECURRING";
  },
  pagination: {
    pageSize: unknown;
    pageNumber: unknown;
  },
) => {
  const { keyword, type, recurringStatus } = filters;

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

  // Sanitize pagination inputs to prevent abuse and invalid queries
  const { pageSize, pageNumber } = sanitizeAndValidatePagination(
    pagination.pageSize,
    pagination.pageNumber
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

  existingTransaction.set({
    ...(body.title && { title: body.title }),
    ...(body.description && { description: body.description }),
    ...(body.category && { category: body.category }),
    ...(body.type && { type: body.type }),
    ...(body.paymentMethod && { paymentMethod: body.paymentMethod }),
    ...(body.amount !== undefined && { amount: Number(body.amount) }),
    date,
    isRecurring,
    recurringInterval,
    nextRecurringDate,
  });

  await existingTransaction.save();

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
    const bulkOps = transactions.map((tx) => ({
      insertOne: {
        document: {
          ...tx,
          userId,
          isRecurring: false,
          nextRecurringDate: null,
          recurringInterval: null,
          lastProcesses: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    }));

    const result = await TransactionModel.bulkWrite(bulkOps, {
      ordered: true,
    });

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
      return { error: "Could not read receipt content" };
    }

    const data = JSON.parse(content);

    if (!data.amount || !data.date) {
      return { error: "Receipt missing required information" };
    }

    return {
      title: data.title || "Receipt",
      amount: data.amount,
      date: data.date,
      description: data.description,
      category: data.category,
      paymentMethod: data.paymentMethod,
      type: data.type,
      receiptUrl: file.path,
    };
  } catch (error) {
    return { error: "Receipt scanning service unavailable" };
  }
};