import axios from "axios";
import ExchangeRateCacheModel from "../models/exchange-rate-cache.model";
import SupportedCurrencyCacheModel from "../models/supported-currency-cache.model";
import { FALLBACK_SUPPORTED_CURRENCIES, CURRENCY_METADATA } from "../utils/currency.constants";
import { InternalServerException } from "../utils/app-error";
const PROVIDER_BASE_URL = process.env.EXCHANGE_RATE_PROVIDER_URL;
const REQUEST_TIMEOUT_MS = Number(process.env.EXCHANGE_RATE_TIMEOUT_MS);

export interface ExchangeRateResult {
  rate: number;
  source: "live" | "cached";
  rateDate?: string;
}

export class ExchangeRateService {
  private readonly MAX_CACHE_AGE_MS = Number(process.env.MAX_CACHE_AGE_MS); // 6 hours, hardcoded is fine

  private isFresh(doc: any): boolean {
    return doc && Date.now() - new Date(doc.fetchedAt).getTime() < this.MAX_CACHE_AGE_MS;
  }
  async getRate(from: string, to: string): Promise<ExchangeRateResult> {
    const fromUpper = from.toUpperCase();
    const toUpper = to.toUpperCase();

    if (fromUpper === toUpper) return { rate: 1, source: "cached" };

    // 1. Cross-rate from DB using USD as base
    const [rateFrom, rateTo] = await Promise.all([
      fromUpper === "USD"
        ? { rate: 1, fetchedAt: new Date(), rateDate: new Date().toISOString().split("T")[0] }
        : ExchangeRateCacheModel.findOne({ fromCurrency: "USD", toCurrency: fromUpper }),
      toUpper === "USD"
        ? { rate: 1, fetchedAt: new Date(), rateDate: new Date().toISOString().split("T")[0] }
        : ExchangeRateCacheModel.findOne({ fromCurrency: "USD", toCurrency: toUpper }),
    ]);

    if (rateFrom && rateTo && this.isFresh(rateFrom) && this.isFresh(rateTo)) {
      return {
        rate: (rateTo as any).rate / (rateFrom as any).rate,
        source: "cached",
        rateDate: (rateTo as any).rateDate,
      };
    }

    // 2. Cache stale or empty — hit live API
    try {
      const response = await axios.get(`${PROVIDER_BASE_URL}/rates`, {
        params: { base: fromUpper, quotes: toUpper },
        timeout: REQUEST_TIMEOUT_MS,
      });

      const rateObj = response.data?.find(
        (r: { quote: string }) => r.quote === toUpper
      );
      const rate: number | undefined = rateObj?.rate;
      const rateDate: string | undefined = rateObj?.date;

      if (rate && typeof rate === "number") {
        // Store direct pair for future use
        ExchangeRateCacheModel.findOneAndUpdate(
          { fromCurrency: fromUpper, toCurrency: toUpper },
          {
            fromCurrency: fromUpper,
            toCurrency: toUpper,
            rate,
            rateDate,
            fetchedAt: new Date(),
          },
          { upsert: true }
        ).catch(console.warn);

        return { rate, source: "live", rateDate };
      }
    } catch (error: any) {
      console.warn("Live rate fetch failed:", error.message);
    }

    // 3. Last resort — stale cache is better than nothing
    if (rateFrom && rateTo) {
      return {
        rate: (rateTo as any).rate / (rateFrom as any).rate,
        source: "cached",
        rateDate: (rateTo as any).rateDate,
      };
    }

    throw new InternalServerException(
      "Exchange rate unavailable. No live or cached rate found."
    );
  }

 async getSupportedCurrencies(): Promise<Record<string, string>> {
    try {
      // 1. Attempt to fetch from MongoDB cache
      const cached = await SupportedCurrencyCacheModel.find({});
      if (cached.length > 0) {
        return cached.reduce<Record<string, string>>((acc, curr) => {
          acc[curr.code] = curr.name;
          return acc;
        }, {});
      }

      // 2. Cache empty — fetch live and populate DB
      console.log("Supported currencies cache empty. Fetching live list...");
      const response = await axios.get(`${PROVIDER_BASE_URL}/currencies`, {
        timeout: REQUEST_TIMEOUT_MS,
      });

      const currenciesList: Array<{ iso_code: string; name: string }> = response.data || [];

      if (currenciesList.length > 0) {
        await SupportedCurrencyCacheModel.deleteMany({});
        await SupportedCurrencyCacheModel.insertMany(
          currenciesList.map((c) => ({
            code: c.iso_code,
            name: c.name,
            updatedAt: new Date(),
          }))
        );

        return Object.fromEntries(
          currenciesList.map((c) => [c.iso_code, c.name])
        );
      }
    } catch (error: any) {
      console.warn(
        "Failed to load currencies from DB cache or live API, using fallback:",
        error.message
      );
    }

    // 3. Last resort — hardcoded fallback
    return FALLBACK_SUPPORTED_CURRENCIES.reduce<Record<string, string>>(
      (acc, code) => {
        acc[code] = CURRENCY_METADATA[code]?.name || code;
        return acc;
      },
      {}
    );
  }
}

export const exchangeRateService = new ExchangeRateService();
