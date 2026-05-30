import { Request, Response } from "express";
import { HTTPSTATUS } from "../config/http.config";
import { asyncHandler } from "../middlewares/asyncHandler.middlerware";
import { exchangeRateService } from "../services/exchange-rate.service";
import { CURRENCY_METADATA, isValidCurrencyCode } from "../utils/currency.constants";

export const getSupportedCurrenciesController = asyncHandler(
  async (_req: Request, res: Response) => {
    const currencies = await exchangeRateService.getSupportedCurrencies();

    const enriched = Object.entries(currencies).map(([code, name]) => ({
      code,
      name,
      symbol: CURRENCY_METADATA[code]?.symbol || code,
    }));

    return res.status(HTTPSTATUS.OK).json({
      message: "Supported currencies fetched successfully",
      currencies: enriched,
    });
  },
);

export const getExchangeRateController = asyncHandler(
  async (req: Request, res: Response) => {
    const from = ((req.query.from as string) || "USD").toUpperCase();
    const to = ((req.query.to as string) || "EUR").toUpperCase();
    if (!isValidCurrencyCode(from) || !isValidCurrencyCode(to)) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: "Invalid currency code. Please provide a supported ISO 4217 currency code.",
      });
    }
    const result = await exchangeRateService.getRate(from, to);

    return res.status(HTTPSTATUS.OK).json({
      message: "Exchange rate fetched successfully",
      data: {
        from,
        to,
        rate: result.rate,
        source: result.source,
        rateDate: result.rateDate,
      },
    });
  },
);
