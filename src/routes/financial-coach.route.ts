import { Router } from "express";
import { passportAuthenticateJwt } from "../config/passport.config";
import * as financialCoachController from "../controllers/financial-coach.controller";

const financialCoachRoutes = Router();

// POST /api/financial-coach/analyze
financialCoachRoutes.post(
  "/analyze",
  passportAuthenticateJwt,
  financialCoachController.analyzeFinance,
);

export default financialCoachRoutes;
