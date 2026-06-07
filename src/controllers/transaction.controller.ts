import XLSX from "xlsx-js-style";
import TransactionModel from "../models/transaction.model";
import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middlerware";
import { HTTPSTATUS } from "../config/http.config";
import {
  bulkDeleteTransactionSchema,
  bulkTransactionSchema,
  createTransactionSchema,
  transactionIdSchema,
  updateTransactionSchema,
} from "../validators/transaction.validator";
import {
  bulkDeleteTransactionService,
  bulkTransactionService,
  createTransactionService,
  deleteTransactionService,
  duplicateTransactionService,
  getAllTransactionService,
  getTransactionByIdService,
  scanReceiptService,
  updateTransactionService,
} from "../services/transaction.service";
import { TransactionTypeEnum } from "../models/transaction.model";

export const createTransactionController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = createTransactionSchema.parse(req.body);
    const userId = req.user?._id;

    const transaction = await createTransactionService(body, userId);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Transaction created successfully",
      transaction,
    });
  },
);

export const getAllTransactionController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const filters = {
      keyword: req.query.keyword as string | undefined,
      type: req.query.type as keyof typeof TransactionTypeEnum | undefined,
      recurringStatus: req.query.recurringStatus as
        | "RECURRING"
        | "NON_RECURRING"
        | undefined,
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined,
    };
    const pagination = {
      pageSize: req.query.pageSize,
      pageNumber: req.query.pageNumber,
    };

    const result = await getAllTransactionService(userId, filters, pagination);

    return res.status(HTTPSTATUS.OK).json({
      message: "Transaction fetched successfully",
      ...result,
    });
  },
);

export const getTransactionByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const transactionId = transactionIdSchema.parse(req.params.id);

    const transaction = await getTransactionByIdService(userId, transactionId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Transaction fetched successfully",
      transaction,
    });
  },
);

export const duplicateTransactionController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const transactionId = transactionIdSchema.parse(req.params.id);

    const transaction = await duplicateTransactionService(
      userId,
      transactionId,
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Transaction duplicated successfully",
      data: transaction,
    });
  },
);

export const updateTransactionController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const transactionId = transactionIdSchema.parse(req.params.id);
    const body = updateTransactionSchema.parse(req.body);

    await updateTransactionService(userId, transactionId, body);

    return res.status(HTTPSTATUS.OK).json({
      message: "Transaction updated successfully",
    });
  },
);

export const deleteTransactionController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const transactionId = transactionIdSchema.parse(req.params.id);

    await deleteTransactionService(userId, transactionId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Transaction deleted successfully",
    });
  },
);

export const bulkDeleteTransactionController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { transactionIds } = bulkDeleteTransactionSchema.parse(req.body);

    const result = await bulkDeleteTransactionService(userId, transactionIds);

    return res.status(HTTPSTATUS.OK).json({
      message: "Transaction deleted successfully",
      ...result,
    });
  },
);

export const bulkTransactionController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { transactions } = bulkTransactionSchema.parse(req.body);

    const result = await bulkTransactionService(userId, transactions);

    return res.status(HTTPSTATUS.OK).json({
      message: "Bulk transaction inserted successfully",
      ...result,
    });
  },
);

export const scanReceiptController = asyncHandler(
  async (req: Request, res: Response) => {
    const file = req?.file;

    const result = await scanReceiptService(file);

    return res.status(HTTPSTATUS.OK).json({
      message: "Reciept scanned successfully",
      data: result,
    });
  },
);

export const exportTransactionController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const { dateFrom, dateTo, type, keyword, recurringStatus } = req.query;

    const filter: any = { userId };

    const typedType = type as string | undefined;
    const typedRecurring = recurringStatus as string | undefined;
    const typedKeyword = keyword as string | undefined;
    const typedDateFrom = dateFrom as string | undefined;
    const typedDateTo = dateTo as string | undefined;

    // SEARCH FILTER
    if (typedKeyword) {
      filter.$or = [
        { title: { $regex: typedKeyword, $options: "i" } },
        { category: { $regex: typedKeyword, $options: "i" } },
      ];
    }

    // TYPE FILTER
    if (typedType === "INCOME" || typedType === "EXPENSE") {
      filter.type = typedType;
    }

    // RECURRING FILTER
    if (typedRecurring === "RECURRING") {
      filter.isRecurring = true;
    } else if (typedRecurring === "NON_RECURRING") {
      filter.isRecurring = false;
    }
    // DATE FILTER
    if (typedDateFrom || typedDateTo) {
      filter.date = {};

      if (typedDateFrom) {
        const from = new Date(typedDateFrom);
        from.setUTCHours(0, 0, 0, 0);
        filter.date.$gte = from;
      }

      if (typedDateTo) {
        const to = new Date(typedDateTo);
        to.setUTCHours(23, 59, 59, 999);
        filter.date.$lte = to;
      }
    }

    const transactions = await TransactionModel.find(filter)
      .sort({ date: -1 })
      .lean();
    const rows = transactions.map((t) => ({
      Date: new Date(t.date).toLocaleDateString(),
      Title: t.title,
      Amount: t.amount,
      Category: t.category,
      Type: t.type === "EXPENSE" ? "Expense" : "Income",
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    // ✅ Professional headers with styling
const headers = ["Date", "Title", "Amount", "Category", "Type"];
const headerRow = headers.map((h) => ({
  v: h,
  t: "s",
  s: {
    font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
    fill: { fgColor: { rgb: "22C55E" } }, // green color
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } },
    },
  },
}));

// ✅ Data rows with alternating colors
const dataRows = transactions.map((t, index) => {
  const isEven = index % 2 === 0;
  const bgColor = isEven ? "F0FDF4" : "FFFFFF"; // light green / white
  const cellStyle = {
    fill: { fgColor: { rgb: bgColor } },
    alignment: { horizontal: "left", vertical: "center" },
     border: {
      top: { style: "thin", color: { rgb: "D1D5DB" } },
      bottom: { style: "thin", color: { rgb: "D1D5DB" } },
      left: { style: "thin", color: { rgb: "D1D5DB" } },
      right: { style: "thin", color: { rgb: "D1D5DB" } },
    },
  };

  return [
    { v: new Date(t.date).toLocaleDateString(), t: "s", s: cellStyle },
    { v: t.title, t: "s", s: cellStyle },
    { v: t.amount, t: "n", s: { ...cellStyle, alignment: { horizontal: "right" } } },
    { v: t.category, t: "s", s: cellStyle },
    {
      v: t.type === "EXPENSE" ? "Expense" : "Income",
      t: "s",
      s: {
        ...cellStyle,
        font: {
          bold: true,
          color: { rgb: t.type === "EXPENSE" ? "EF4444" : "22C55E" },
        },
      },
    },
  ];
});
// ✅ Combine header + data
const allRows = [headerRow, ...dataRows];
allRows.forEach((row, rowIndex) => {
  row.forEach((cell, colIndex) => {
    const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
    worksheet[cellRef] = cell;
  });
});

// ✅ Set column widths
worksheet["!cols"] = [
  { wch: 14 }, // Date
  { wch: 22 }, // Title
  { wch: 14 }, // Amount
  { wch: 18 }, // Category
  { wch: 10 }, // Type
];

// ✅ Set row height for header
worksheet["!rows"] = [{ hpt: 24 }]; // header row height

// ✅ Set worksheet range
worksheet["!ref"] = XLSX.utils.encode_range({
  s: { r: 0, c: 0 },
  e: { r: allRows.length - 1, c: headers.length - 1 },
});

    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=transactions.xlsx",
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.send(buffer);
  },
);
