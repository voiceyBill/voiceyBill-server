import cron from "node-cron";
import { processRecurringTransactions } from "./jobs/transaction.job";
import { processReportJob } from "./jobs/report.job";

const scheduleJob = (name: string, time: string, job: Function) => {
  

  return cron.schedule(
    time,
    async () => {
      try {
        await job();
        
      } catch (error) {
        
      }
    },
    {
      timezone: "UTC",
    }
  );
};

export const startJobs = () => {
  return [
    scheduleJob("Transactions", "5 0 * * *", processRecurringTransactions),

    // run 2:30am every first of the month
    scheduleJob("Reports", "30 2 1 * *", processReportJob),
  ];
};