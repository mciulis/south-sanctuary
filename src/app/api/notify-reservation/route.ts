import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { productName, unitsRequested, buyerName, buyerEmail, buyerPhone, message } =
    await req.json();

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: process.env.NOTIFICATION_EMAIL!,
    subject: `New item request — ${productName}`,
    html: `
      <p><strong>Item:</strong> ${productName}</p>
      ${unitsRequested > 1 ? `<p><strong>Quantity:</strong> ${unitsRequested}</p>` : ""}
      <p><strong>Name:</strong> ${buyerName}</p>
      <p><strong>Email:</strong> ${buyerEmail}</p>
      <p><strong>Phone:</strong> ${buyerPhone || "—"}</p>
      <p><strong>Message:</strong> ${message || "—"}</p>
    `,
  });

  return NextResponse.json({ ok: true });
}
