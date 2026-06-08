import cron from "node-cron";
import { processRecurringTransactions } from "./jobs/transaction.job";
import { processReportJob } from "./jobs/report.job";
import { updateSupportedCurrenciesCache, updateExchangeRatesCache } from "./jobs/currency.job";

const scheduleJob = (name: string, time: string, job: Function) => {
  console.log(`Scheduling ${name} at ${time}`);

  return cron.schedule(
    time,
    async () => {
      try {
        await job();
        console.log(`${name} completed`);
      } catch (error) {
        console.log(`${name} failed`, error);
      }
    },
    {
      scheduled: true,
      timezone: "UTC",
    }
  );
};

export const startJobs = () => {
  return [
    scheduleJob("Transactions", "5 0 * * *", processRecurringTransactions),

    //run 2:30am every first of the month
    scheduleJob("Reports", "30 2 1 * *", processReportJob),

    // Currencies list — once a day is enough, they barely change
    scheduleJob("Currency Cache Update", "0 0 * * *", updateSupportedCurrenciesCache),

    // Exchange rates — every 6 hours
    scheduleJob("Exchange Rates Cache Update", "0 */6 * * *", updateExchangeRatesCache)
  ];
};
