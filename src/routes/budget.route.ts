import { Router } from "express";
import * as budgetController from "../controllers/budget.controller";

const budgetRoutes = Router();

// Set or update budget for a month
budgetRoutes.put("/", budgetController.setOrUpdateBudget);

// Get budget summary for a specific month
budgetRoutes.get("/summary", budgetController.getBudgetSummary);

// Delete budget for a specific month
budgetRoutes.delete("/", budgetController.deleteBudget);

// Get all budgets for the user
budgetRoutes.get("/list", budgetController.getUserBudgets);

// Get current month budget
budgetRoutes.get("/current", budgetController.getCurrentMonthBudget);

export default budgetRoutes;
