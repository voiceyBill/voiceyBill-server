import { Resend } from "resend";
import { Env } from "./env.config";

if (!Env.RESEND_API_KEY) {
  console.warn(
    "[Warning] RESEND_API_KEY is not configured. " +
      "Email sending will fail in production and use development fallback if NODE_ENV=development."
  );
}

export const resend = new Resend(Env.RESEND_API_KEY);
