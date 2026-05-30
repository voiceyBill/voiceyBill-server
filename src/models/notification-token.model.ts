import mongoose, { Document, Schema } from "mongoose";

export enum NotificationPlatformEnum {
  ANDROID = "ANDROID",
  IOS = "IOS",
}

export interface NotificationTokenDocument extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  platform: keyof typeof NotificationPlatformEnum;
  deviceId?: string | null;
  lastSeenAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationTokenSchema = new Schema<NotificationTokenDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    platform: {
      type: String,
      enum: Object.values(NotificationPlatformEnum),
      default: NotificationPlatformEnum.ANDROID,
    },
    deviceId: {
      type: String,
      default: null,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

notificationTokenSchema.index({ userId: 1, platform: 1 });

const NotificationTokenModel = mongoose.model<NotificationTokenDocument>(
  "NotificationToken",
  notificationTokenSchema,
);

export default NotificationTokenModel;
