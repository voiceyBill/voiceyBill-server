import { getEnv } from "../utils/get-env";

const envConfig = () => ({
  NODE_ENV: getEnv("NODE_ENV", "development"),

  PORT: getEnv("PORT", "8000"),
  BASE_PATH: getEnv("BASE_PATH", "/api"),
  MONGO_URI: getEnv("MONGO_URI"),
  MONGO_DB_NAME: getEnv("MONGO_DB_NAME", "voiceybill"),

  JWT_SECRET: getEnv("JWT_SECRET", "secert_jwt"),
  JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "15m") as string,

  JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET", "secert_jwt_refresh"),
  JWT_REFRESH_EXPIRES_IN: getEnv("JWT_REFRESH_EXPIRES_IN", "7d") as string,

  OPENAI_API_KEY: getEnv("OPENAI_API_KEY"),
  UPLIFT_AI_API_KEY: getEnv("UPLIFT_AI_API_KEY"),
  GEMINI_API_KEY: getEnv("GEMINI_API_KEY"),

  CLOUDINARY_CLOUD_NAME: getEnv("CLOUDINARY_CLOUD_NAME"),
  CLOUDINARY_API_KEY: getEnv("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: getEnv("CLOUDINARY_API_SECRET"),

  RESEND_API_KEY: getEnv("RESEND_API_KEY"),
  RESEND_MAILER_SENDER_REPORTS: getEnv(
    "RESEND_MAILER_SENDER_REPORTS",
    "reports@voiceybill.com",
  ),
  RESEND_MAILER_SENDER_VERIFY: getEnv(
    "RESEND_MAILER_SENDER_VERIFY",
    "verify@voiceybill.com",
  ),

  FRONTEND_ORIGIN: getEnv("FRONTEND_ORIGIN", "http://localhost:5173"),

  BUDGET_IMBALANCE_COOLDOWN_MINUTES: getEnv(
    "BUDGET_IMBALANCE_COOLDOWN_MINUTES",
    "60",
  ),
  // Google OAuth
  GOOGLE_CLIENT_ID: getEnv("GOOGLE_CLIENT_ID"),
  GOOGLE_ANDROID_CLIENT_ID: getEnv("GOOGLE_ANDROID_CLIENT_ID", ""),
  GOOGLE_IOS_CLIENT_ID: getEnv("GOOGLE_IOS_CLIENT_ID", ""),
});

export const Env = envConfig();
