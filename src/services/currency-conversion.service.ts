import UserModel from "../models/user.model";
import {
  exchangeRateService,
  ExchangeRateResult,
} from "./exchange-rate.service";

export type CurrencyConversionFields = {
  amount: number;
  originalAmount: number | null;
  originalCurrency: string | null;
  baseCurrencyAtTime: string;
  exchangeRate: number | null;
  rateSource: "live" | "cached" | null;
  exchangeRateFetchedAt: Date | null;
};

export async function resolveUserCurrencyConversion(
  userId: string,
  inputAmount: number,
  inputCurrency?: string,
) {
  const user = await UserModel.findById(userId).select("baseCurrency").lean();
  return resolveCurrencyConversion(
    user?.baseCurrency || "USD",
    inputAmount,
    inputCurrency,
  );
}

export async function resolveCurrencyConversion(
  baseCurrency: string,
  inputAmount: number,
  inputCurrency?: string,
): Promise<CurrencyConversionFields> {
  const baseCurrencyUpper = baseCurrency.toUpperCase();
  const txCurrency = inputCurrency
    ? inputCurrency.toUpperCase()
    : baseCurrencyUpper;

  if (txCurrency === baseCurrencyUpper) {
    return {
      amount: inputAmount,
      originalAmount: null,
      originalCurrency: null,
      baseCurrencyAtTime: baseCurrencyUpper,
      exchangeRate: null,
      rateSource: null,
      exchangeRateFetchedAt: null,
    };
  }

  const rateResult: ExchangeRateResult = await exchangeRateService.getRate(
    txCurrency,
    baseCurrencyUpper,
  );

  return {
    amount: inputAmount * rateResult.rate,
    originalAmount: inputAmount,
    originalCurrency: txCurrency,
    baseCurrencyAtTime: baseCurrencyUpper,
    exchangeRate: rateResult.rate,
    rateSource: rateResult.source,
    exchangeRateFetchedAt: new Date(),
  };
}
