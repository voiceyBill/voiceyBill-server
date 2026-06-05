import { Request, Response } from "express";
import { ZodError } from "zod";

import { asyncHandler } from "../middlewares/asyncHandler.middlerware";
import { HTTPSTATUS } from "../config/http.config";
import { analyzeFinanceSchema } from "../validators/financial-coach.validator";
import { createFinancialCoachService } from "../services/financial-coach.service";
import { GeminiFinancialCoachService } from "../services/gemini-financial-coach.service";
import { Env } from "../config/env.config";
import { BadRequestException } from "../utils/app-error";
import { ErrorCodeEnum } from "../enums/error-code.enum";

const geminiService = new GeminiFinancialCoachService(Env.GEMINI_API_KEY);

const financialCoachService = createFinancialCoachService(geminiService);

export const analyzeFinance = asyncHandler(
  async (req: Request, res: Response) => {
    let data;

    try {
      data = analyzeFinanceSchema.parse(req.body);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException(
          error.errors[0]?.message ?? "Invalid financial data",
          ErrorCodeEnum.VALIDATION_ERROR,
        );
      }

      throw error;
    }

    const result = await financialCoachService.analyzeFinance(data);

    return res.status(HTTPSTATUS.OK).json({
      message:
        result.status === "success"
          ? "Financial analysis completed successfully"
          : "Financial analysis completed with partial results",
      data: result,
    });
  },
);
