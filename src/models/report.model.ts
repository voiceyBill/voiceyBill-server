import mongoose from "mongoose";

export enum ReportStatusEnum {
  SENT = "SENT",
  PENDING = "PENDING",
  FAILED = "FAILED",
  NO_ACTIVITY = "NO_ACTIVITY",
}

export interface ReportDocument extends Document {
  userId: mongoose.Types.ObjectId;
  period: string;
  sentDate: Date;
  startDate: Date;
  endDate: Date;
  status: keyof typeof ReportStatusEnum;
  baseCurrency: string;
  currencySummary: { currency: string; transactionCount: number }[];
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new mongoose.Schema<ReportDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    period: {
      type: String,
      required: true,
    },
    sentDate: {
      type: Date,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ReportStatusEnum),
      default: ReportStatusEnum.PENDING,
    },
    baseCurrency: {
      type: String,
      default: "USD",
    },
    currencySummary: {
      currency: { type: String },
      transactionCount: { type: Number }
    },
    
  },
  {
    timestamps: true,
  }
);

const ReportModel = mongoose.model<ReportDocument>("Report", reportSchema);
export default ReportModel;
