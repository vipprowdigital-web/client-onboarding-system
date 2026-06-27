import { Resend } from "resend";

export async function sendEmail(to, subject, text) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    // to,
    to: "vipprowdigital@gmail.com",
    subject,
    text,
  });
}
