import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { productName, buyerName, buyerEmail, buyerPhone, message } =
    await req.json();

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: process.env.NOTIFICATION_EMAIL!,
    subject: `New reservation request — ${productName}`,
    html: `
      <p><strong>Item:</strong> ${productName}</p>
      <p><strong>Name:</strong> ${buyerName}</p>
      <p><strong>Email:</strong> ${buyerEmail}</p>
      <p><strong>Phone:</strong> ${buyerPhone || "—"}</p>
      <p><strong>Message:</strong> ${message || "—"}</p>
    `,
  });

  return NextResponse.json({ ok: true });
}
