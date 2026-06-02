import mongoose, { Schema } from "mongoose";

export interface ExchangeRateCacheDocument extends Document {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  rateDate?: string;
  fetchedAt: Date;
}

const exchangeRateCacheSchema = new Schema<ExchangeRateCacheDocument>(
  {
    fromCurrency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    toCurrency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    rate: {
      type: Number,
      required: true,
    },
    rateDate: {
      type: String,
    },
    fetchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

exchangeRateCacheSchema.index({ fromCurrency: 1, toCurrency: 1, fetchedAt: -1 });

const ExchangeRateCacheModel = mongoose.model<ExchangeRateCacheDocument>(
  "ExchangeRateCache",
  exchangeRateCacheSchema,
);

export default ExchangeRateCacheModel;
