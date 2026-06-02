import axios from "axios";
import ExchangeRateCacheModel from "../models/exchange-rate-cache.model";
import { FALLBACK_SUPPORTED_CURRENCIES } from "../utils/currency.constants";
import { InternalServerException } from "../utils/app-error";
const PROVIDER_BASE_URL = process.env.EXCHANGE_RATE_PROVIDER_URL;
const REQUEST_TIMEOUT_MS = Number(process.env.EXCHANGE_RATE_TIMEOUT_MS);

export interface ExchangeRateResult {
  rate: number;
  source: "live" | "cached";
  rateDate?: string;
}

export class ExchangeRateService {
  async getRate(from: string, to: string): Promise<ExchangeRateResult> {
    const fromUpper = from.toUpperCase();
    const toUpper = to.toUpperCase();

    if (fromUpper === toUpper) {
      return { rate: 1, source: "live" };
    }

    try {
      const response = await axios.get(`${PROVIDER_BASE_URL}/latest`, {
        params: { from: fromUpper, to: toUpper },
        timeout: REQUEST_TIMEOUT_MS,
      });

      const rate = response.data?.rates?.[toUpper];

      if (rate && typeof rate === "number") {
        ExchangeRateCacheModel.create({
          fromCurrency: fromUpper,
          toCurrency: toUpper,
          rate,
          rateDate: response.data.date || new Date().toISOString().split("T")[0],
          fetchedAt: new Date(),
        }).catch((error) =>
          console.warn("Failed to cache exchange rate:", error.message),
        );

        return {
          rate,
          source: "live",
          rateDate: response.data.date,
        };
      }
    } catch (error: any) {
      console.warn(
        `Live exchange rate fetch failed`,
        error.message,
      );
    }

    const cached = await ExchangeRateCacheModel.findOne({
      fromCurrency: fromUpper,
      toCurrency: toUpper,
    }).sort({ fetchedAt: -1 });

    if (cached) {
      return {
        rate: cached.rate,
        source: "cached",
        rateDate: cached.rateDate,
      };
    }

    const inverseCached = await ExchangeRateCacheModel.findOne({
      fromCurrency: toUpper,
      toCurrency: fromUpper,
    }).sort({ fetchedAt: -1 });

    if (inverseCached && inverseCached.rate > 0) {
      return {
        rate: 1 / inverseCached.rate,
        source: "cached",
        rateDate: inverseCached.rateDate,
      };
    }

    throw new InternalServerException(
      `Exchange rate unavailable. No live or cached rate found.`,
    );
  }

  async getSupportedCurrencies(): Promise<Record<string, string>> {
    try {
      const response = await axios.get(`${PROVIDER_BASE_URL}/currencies`, {
        timeout: 5000,
      });
      return response.data;
    } catch (error: any) {
      console.warn(
        "Failed to fetch currencies from provider, using fallback:",
        error.message,
      );

      return FALLBACK_SUPPORTED_CURRENCIES.reduce<Record<string, string>>(
        (currencies, code) => {
          currencies[code] = code;
          return currencies;
        },
        {},
      );
    }
  }
}

export const exchangeRateService = new ExchangeRateService();
