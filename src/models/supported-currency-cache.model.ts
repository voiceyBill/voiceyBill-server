import mongoose, { Schema } from "mongoose";

export interface SupportedCurrencyCacheDocument extends Document {
  code: string;
  name: string;
  updatedAt: Date;
}

const supportedCurrencyCacheSchema = new Schema<SupportedCurrencyCacheDocument>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);
const SupportedCurrencyCacheModel = mongoose.model<SupportedCurrencyCacheDocument>(
  "SupportedCurrencyCache",
  supportedCurrencyCacheSchema,
);

export default SupportedCurrencyCacheModel;
