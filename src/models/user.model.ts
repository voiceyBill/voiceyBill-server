import mongoose, { Document, Schema } from "mongoose";
import { compareValue, hashValue } from "../utils/bcrypt";

export enum BudgetImbalanceStatusEnum {
  BALANCED = "BALANCED",
  IMBALANCED = "IMBALANCED",
}
export type AuthProvider = "local" | "google";

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string | null;
  profilePicture: string | null;
  baseCurrency: string;
  isVerified: boolean;
  provider: AuthProvider;
  providerId?: string | null;
  emailVerificationOtpHash?: string | null;
  emailVerificationOtpExpiresAt?: Date | null;
  passwordResetOtpHash?: string | null;
  passwordResetOtpExpiresAt?: Date | null;
  lastOtpResentAt?: Date | null;
  budgetImbalanceStatus: keyof typeof BudgetImbalanceStatusEnum;
  budgetImbalanceNotifiedAt?: Date | null;
  budgetImbalanceNotificationsEnabled: boolean;
  customCategories?: { value: string; label: string }[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (password: string) => Promise<boolean>;
  omitPassword: () => Omit<UserDocument, "password">;
}

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    baseCurrency: {
      type: String,
      default: "USD",
      uppercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: true,
      required: false,
      default: null,
    },
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    providerId: {
      type: String,
      default: null,
      sparse: true,
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationOtpHash: {
      type: String,
      select: false,
      default: null,
    },
    emailVerificationOtpExpiresAt: {
      type: Date,
      select: false,
      default: null,
    },
    passwordResetOtpHash: {
      type: String,
      select: false,
      default: null,
    },
    passwordResetOtpExpiresAt: {
      type: Date,
      select: false,
      default: null,
    },
    lastOtpResentAt: {
      type: Date,
      select: false,
      default: null,
    },

    budgetImbalanceStatus: {
      type: String,
      enum: Object.values(BudgetImbalanceStatusEnum),
      default: BudgetImbalanceStatusEnum.BALANCED,
    },
    budgetImbalanceNotifiedAt: {
      type: Date,
      default: null,
    },
    budgetImbalanceNotificationsEnabled: {
      type: Boolean,
      default: true,
    },
    customCategories: {
      type: [
        {
          value: { type: String, required: true, trim: true },
          label: { type: String, required: true, trim: true },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    if (this.password) {
      this.password = await hashValue(this.password);
    }
  }
  next();
});

userSchema.methods.omitPassword = function (): Omit<UserDocument, "password"> {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.emailVerificationOtpHash;
  delete userObject.emailVerificationOtpExpiresAt;
  delete userObject.passwordResetOtpHash;
  delete userObject.passwordResetOtpExpiresAt;
  return userObject;
};

userSchema.methods.comparePassword = async function (password: string) {
  if (!this.password) {
    return false;
  }
  return compareValue(password, this.password);
};

const UserModel = mongoose.model<UserDocument>("User", userSchema);
export default UserModel;
