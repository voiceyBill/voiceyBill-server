import mongoose, { Document, Schema } from "mongoose";
import { compareValue, hashValue } from "../utils/bcrypt";

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  profilePicture: string | null;
  isVerified: boolean;
  emailVerificationOtpHash?: string | null;
  emailVerificationOtpExpiresAt?: Date | null;
  passwordResetOtpHash?: string | null;
  passwordResetOtpExpiresAt?: Date | null;
  lastOtpResentAt?: Date | null;
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
    password: {
      type: String,
      select: true,
      required: true,
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
  },
  {
    timestamps: true,
  }
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
  return compareValue(password, this.password);
};

const UserModel = mongoose.model<UserDocument>("User", userSchema);
export default UserModel;
