import { Env } from "../config/env.config";
import { resend } from "../config/resend.config";

type Params = {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
  from?: string;
};

const mailer_sender = `VoiceyBill <${Env.RESEND_MAILER_SENDER}>`;

export const sendEmail = async ({
  to,
  from = mailer_sender,
  subject,
  text,
  html,
}: Params) => {
  const { data, error } = await resend.emails.send({
    from,
    to: Array.isArray(to) ? to : [to],
    text,
    subject,
    html,
  });

  if (error) {
    console.error("Resend error:", error);
    throw new Error(error.message);
  }

  console.log("Email sent successfully, id:", data?.id);
  return data;
};
