import axios from "axios";
import SupportedCurrencyCacheModel from "../../models/supported-currency-cache.model";
import ExchangeRateCacheModel from "../../models/exchange-rate-cache.model";
import { connctDatabase } from "../../config/database.config";
export const updateSupportedCurrenciesCache = async () => {
  try {
    const providerUrl = process.env.EXCHANGE_RATE_PROVIDER_URL;
    const timeout = Number(process.env.EXCHANGE_RATE_TIMEOUT_MS);

    console.log(`Starting background currencies cache update from: ${providerUrl}/currencies`);
    const response = await axios.get(`${providerUrl}/currencies`, { timeout });
    const currencies: Array<{ iso_code: string; name: string }> = response.data;

    if (currencies && currencies.length > 0) {
      // Clear and bulk insert fresh currency definitions
      await SupportedCurrencyCacheModel.deleteMany({});
      const docs = currencies.map((c) => ({
        code: c.iso_code,
        name: c.name,
        updatedAt: new Date(),
      }));
      await SupportedCurrencyCacheModel.insertMany(docs);
      console.log(`⏰ Successfully cached ${docs.length} supported currencies`);
      return { success: true, count: docs.length };
    }
    
    console.warn("Currencies response from provider was empty or invalid");
    return { success: false, error: "Empty currencies list" };
  } catch (error: any) {
    console.warn("Failed to update currency cache in cron job, preserving current cache:", error.message);
    return { success: false, error: error.message };
  }
};

export const updateExchangeRatesCache = async () => {
  const PROVIDER_BASE_URL=process.env.EXCHANGE_RATE_PROVIDER_URL
  const TIMEOUT=Number(process.env.EXCHANGE_RATE_TIMEOUT_MS)
  try {
    await connctDatabase();

    console.log(`Starting exchange rates cache update...`);
    const response = await axios.get(`${PROVIDER_BASE_URL}/rates`, {
      params: { base: "USD" },
      timeout: TIMEOUT,
    });

    const rates: Array<{ quote: string; rate: number; date: string }> = response.data;

    if (!rates?.length) {
      console.warn("Exchange rates response was empty");
      return { success: false, error: "Empty rates list" };
    }

    const bulkOps = rates.map((r) => ({
      updateOne: {
        filter: { fromCurrency: "USD", toCurrency: r.quote },
        update: {
          $set: {
            fromCurrency: "USD",
            toCurrency: r.quote,
            rate: r.rate,
            rateDate: r.date,
            fetchedAt: new Date(),
          },
        },
        upsert: true,
      },
    }));

    await ExchangeRateCacheModel.bulkWrite(bulkOps);
    console.log(`✅ Cached ${rates.length} exchange rates`);
    return { success: true, count: rates.length };
  } catch (error: any) {
    console.warn("Failed to update exchange rates cache:", error.message);
    return { success: false, error: error.message };
  }
};
