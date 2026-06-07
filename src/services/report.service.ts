import mongoose from "mongoose";
import ReportSettingModel, { ReportFrequencyEnum } from "../models/report-setting.model";
import ReportModel, { ReportStatusEnum } from "../models/report.model";
import TransactionModel, {
  TransactionTypeEnum,
} from "../models/transaction.model";
import UserModel from "../models/user.model";
import { NotFoundException } from "../utils/app-error";
import { calculateNextReportDate } from "../utils/helper";
import { reportInsightPrompt } from "../utils/prompt";
import { UpdateReportSettingType } from "../validators/report.validator";
import { convertToDollarUnit } from "../utils/format-currency";
import { format } from "date-fns";
import { openai, openAIModel } from "../config/openai.config";
import { sendReportEmail } from "../mailers/report.mailer";
import { toReportEmailDTO } from "../dto/report.dto";

export const getAllReportsService = async (
  userId: string,
  pagination: {
    pageSize: number;
    pageNumber: number;
  },
) => {
  const query: Record<string, any> = { userId };

  const { pageSize, pageNumber } = pagination;
  const skip = (pageNumber - 1) * pageSize;

  const [reports, totalCount] = await Promise.all([
    ReportModel.find(query).skip(skip).limit(pageSize).sort({ createdAt: -1 }),
    ReportModel.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    reports,
    pagination: {
      pageSize,
      pageNumber,
      totalCount,
      totalPages,
      skip,
    },
  };
};

export const updateReportSettingService = async (
  userId: string,
  body: UpdateReportSettingType,
) => {
  const { isEnabled } = body;
  let nextReportDate: Date | null = null;

  const existingReportSetting = await ReportSettingModel.findOne({
    userId,
  });
  if (!existingReportSetting)
    throw new NotFoundException("Report setting not found");

  //   const frequency =
  //     existingReportSetting.frequency || ReportFrequencyEnum.MONTHLY;

  if (isEnabled) {
    const currentNextReportDate = existingReportSetting.nextReportDate;
    const now = new Date();
    if (!currentNextReportDate || currentNextReportDate <= now) {
      nextReportDate = calculateNextReportDate(
        existingReportSetting.lastSentDate,
      );
    } else {
      nextReportDate = currentNextReportDate;
    }
  }

  existingReportSetting.set({
    ...body,
    nextReportDate,
  });

  await existingReportSetting.save();
};

export const generateReportService = async (
  userId: string,
  fromDate: Date,
  toDate: Date,
  baseCurrency: string = "USD",
  session?: mongoose.ClientSession
) => {
  const results = await TransactionModel.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: fromDate, $lte: toDate },
      },
    },
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              totalIncome: {
                $sum: {
                  $cond: [
                    { $eq: ["$type", TransactionTypeEnum.INCOME] },
                    { $abs: "$amount" },
                    0,
                  ],
                },
              },

              totalExpenses: {
                $sum: {
                  $cond: [
                    { $eq: ["$type", TransactionTypeEnum.EXPENSE] },
                    { $abs: "$amount" },
                    0,
                  ],
                },
              },
            },
          },
        ],

        categories: [
          {
            $match: { type: TransactionTypeEnum.EXPENSE },
          },
          {
            $group: {
              _id: "$category",
              total: { $sum: { $abs: "$amount" } },
            },
          },
          {
            $sort: { total: -1 },
          },
          {
            $limit: 5,
          },
        ],

        currencySummary: [
          {
            $match: {
              originalCurrency: { $ne: null },
            },
          },
          {
            $group: {
              _id: "$originalCurrency",
              count: { $sum: 1 },
            },
          },
          {
            $sort: { count: -1 },
          },
        ],
      },
    },
    {
      $project: {
        totalIncome: {
          $arrayElemAt: ["$summary.totalIncome", 0],
        },
        totalExpenses: {
          $arrayElemAt: ["$summary.totalExpenses", 0],
        },
        categories: 1,
        currencySummary: 1,
      },
    },
  ]).session(session || null);

  if (
    !results?.length ||
    (results[0]?.totalIncome === 0 && results[0]?.totalExpenses === 0)
  )
    return null;

  const {
    totalIncome = 0,
    totalExpenses = 0,
    categories = [],
    currencySummary = [],
  } = results[0] || {};

  const byCategory = categories.reduce(
    (acc: any, { _id, total }: any) => {
      acc[_id] = {
        amount: convertToDollarUnit(total),
        percentage:
          totalExpenses > 0 ? Math.round((total / totalExpenses) * 100) : 0,
      };
      return acc;
    },
    {} as Record<string, { amount: number; percentage: number }>,
  );

  const availableBalance = totalIncome - totalExpenses;
  const savingsRate = calculateSavingRate(totalIncome, totalExpenses);

  const periodLabel = `${format(fromDate, "MMMM d")} - ${format(toDate, "d, yyyy")}`;

  const insights = await generateInsightsAI({
    totalIncome,
    totalExpenses,
    availableBalance,
    savingsRate,
    categories: byCategory,
    periodLabel: periodLabel,
    baseCurrency,
  });

  const formattedCurrencySummary = currencySummary
    .filter((cs: any) => cs._id !== null)
    .map((cs: any) => ({
      currency: cs._id,
      transactionCount: cs.count,
    }));

  await ReportModel.findOneAndUpdate(
    { userId, startDate: fromDate, endDate: toDate },
    {
      userId,
      period: periodLabel,
      sentDate: new Date(),
      startDate: fromDate,
      endDate: toDate,
      status: ReportStatusEnum.SENT,
      baseCurrency,
      currencySummary: formattedCurrencySummary
    },
    { upsert: true, new: true, setDefaultsOnInsert: true, session },
  );

  return {
    period: periodLabel,
    startDate: fromDate,
    endDate: toDate,
    baseCurrency,
    summary: {
      income: convertToDollarUnit(totalIncome),
      expenses: convertToDollarUnit(totalExpenses),
      balance: convertToDollarUnit(availableBalance),
      savingsRate: Number(savingsRate.toFixed(1)),
      topCategories: Object.entries(byCategory)?.map(([name, cat]: any) => ({
        name,
        amount: cat.amount,
        percent: cat.percentage,
      })),
    },
    insights,
    currencySummary:
      formattedCurrencySummary.length > 0 ? formattedCurrencySummary : undefined,
  };
};

async function generateInsightsAI({
  totalIncome,
  totalExpenses,
  availableBalance,
  savingsRate,
  categories,
  periodLabel,
  baseCurrency,
}: {
  totalIncome: number;
  totalExpenses: number;
  availableBalance: number;
  savingsRate: number;
  categories: Record<string, { amount: number; percentage: number }>;
  periodLabel: string;
  baseCurrency: string;
}) {
  try {
    const prompt = reportInsightPrompt({
      totalIncome: convertToDollarUnit(totalIncome),
      totalExpenses: convertToDollarUnit(totalExpenses),
      availableBalance: convertToDollarUnit(availableBalance),
      savingsRate: Number(savingsRate.toFixed(1)),
      categories,
      periodLabel,
      baseCurrency,
    });

    const result = await openai.chat.completions.create({
      model: openAIModel,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 300,
    });

    const content = result.choices[0]?.message?.content;
    if (!content) return [];

    const cleanedText = content.replace(/```(?:json)?\n?/g, "").trim();
    const data = JSON.parse(cleanedText);
    return data;
  } catch (error) {
    return [];
  }
}

function calculateSavingRate(totalIncome: number, totalExpenses: number) {
  if (totalIncome <= 0) return 0;
  const savingRate = ((totalIncome - totalExpenses) / totalIncome) * 100;
  return parseFloat(savingRate.toFixed(2));
}

export const resendReportService = async (userId: string, reportId: string) => {
  const savedReport = await ReportModel.findOne({ _id: reportId, userId });
  if (!savedReport) throw new NotFoundException("Report not found");

  const user = await UserModel.findById(userId).lean();
  if (!user) throw new NotFoundException("User not found");

  const generatedReport = await generateReportService(
    userId, 
    savedReport.startDate,
    savedReport.endDate,
    user.baseCurrency || "USD",
  );


  if (!generatedReport) {
    throw new NotFoundException("No report data available for this period");
  }
 
  return sendReportEmail({
    email: user.email,
    username: user.name,
    report: toReportEmailDTO(
      generatedReport.summary,
      generatedReport.period,
      generatedReport.baseCurrency,
      generatedReport.currencySummary,
    ),
    frequency:ReportFrequencyEnum.MONTHLY,
  });
};

