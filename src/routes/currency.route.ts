import { Router } from "express";
import {
  getExchangeRateController,
  getSupportedCurrenciesController,
} from "../controllers/currency.controller";

const currencyRoutes = Router();

currencyRoutes.get("/supported", getSupportedCurrenciesController);
currencyRoutes.get("/rate", getExchangeRateController);

export default currencyRoutes;
