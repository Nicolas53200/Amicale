import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_ADDRESS = process.env.EMAIL_FROM || "Amicale <noreply@resend.dev>";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping email to", to);
    return { success: false, reason: "no_api_key" as const };
  }

  try {
    await resend.emails.send({ from: FROM_ADDRESS, to, subject, html });
    return { success: true };
  } catch (err) {
    console.error("[email] Failed to send to", to, err);
    return { success: false, reason: "send_failed" as const };
  }
}
