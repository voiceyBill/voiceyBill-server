import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middlerware";
import { HTTPSTATUS } from "../config/http.config";
import {
  createBudgetSchema,
  getBudgetSummarySchema,
  deleteBudgetSchema,
} from "../validators/budget.validator";
import * as budgetService from "../services/budget.service";
import { toBudgetResponseDTO } from "../dto/budget.dto";

/**
 * Set or update budget (PUT /budget)
 */
export const setOrUpdateBudget = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id.toString();
    const data = createBudgetSchema.parse(req.body);

    const budget = await budgetService.createOrUpdateBudget(userId, data);
    const responseData = toBudgetResponseDTO(budget);

    res.status(HTTPSTATUS.OK).json({
      message: "Budget set successfully",
      data: responseData,
    });
  }
);

/**
 * Get budget summary (GET /budget/summary?month=X&year=Y)
 */
export const getBudgetSummary = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id.toString();
    const params = getBudgetSummarySchema.parse(req.query);

    const summary = await budgetService.getBudgetSummary(userId, params);

    res.status(HTTPSTATUS.OK).json({
      message: "Budget summary retrieved successfully",
      data: summary,
    });
  }
);

/**
 * Delete budget (DELETE /budget?month=X&year=Y)
 */
export const deleteBudget = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id.toString();
    const params = deleteBudgetSchema.parse(req.query);

    const result = await budgetService.deleteBudget(userId, params);

    res.status(HTTPSTATUS.OK).json({
      message: "Budget deleted successfully",
      data: result,
    });
  }
);

/**
 * Get all budgets for user (GET /budget/list)
 */
export const getUserBudgets = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id.toString();

    const budgets = await budgetService.getUserBudgets(userId);
    const responseData = budgets.map((budget) => toBudgetResponseDTO(budget));

    res.status(HTTPSTATUS.OK).json({
      message: "Budgets retrieved successfully",
      data: responseData,
    });
  }
);

/**
 * Get current month budget (GET /budget/current)
 */
export const getCurrentMonthBudget = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id.toString();

    const budget = await budgetService.getCurrentMonthBudget(userId);
    const responseData = budget ? toBudgetResponseDTO(budget) : null;

    res.status(HTTPSTATUS.OK).json({
      message: "Current month budget retrieved successfully",
      data: responseData,
    });
  }
);
