import { Env } from "../config/env.config";
import { resend } from "../config/resend.config";

type Params = {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
  from: string;
};

type SendEmailResult = {
  id: string;
  isFallback?: boolean;
  error?: string;
};

export const sendEmail = async ({
  to,
  from,
  subject,
  text,
  html,
}: Params): Promise<SendEmailResult> => {
  try {
    if (!Env.RESEND_API_KEY) {
      throw new Error("No RESEND API key configured");
    }

    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      text,
      subject,
      html,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { id: data?.id || "unknown", isFallback: false };
  } catch (err: any) {
    const message = err?.message || "Email send failed";
    const domainNotVerified = /domain is not verified/i.test(message);

    if (Env.NODE_ENV === "development") {
      return {
        id: "dev-fallback",
        isFallback: true,
        error: message,
      };
    }

    if (domainNotVerified) {
      throw new Error(
        "Email sender domain is not verified on Resend. Please verify the sender domain or use a verified email address."
      );
    }

    throw err;
  }
};