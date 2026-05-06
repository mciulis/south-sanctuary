import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { productId, productName, unitsRequested, buyerName, buyerEmail, buyerPhone, message } =
    await req.json();

  // Compute waitlist position
  let position = 1;
  if (productId) {
    const { data: latest } = await supabaseAdmin
      .from("reservations")
      .select("created_at")
      .eq("product_id", productId)
      .eq("buyer_email", buyerEmail)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latest) {
      const { count } = await supabaseAdmin
        .from("reservations")
        .select("*", { count: "exact", head: true })
        .eq("product_id", productId)
        .in("status", ["pending", "confirmed"])
        .lte("created_at", latest.created_at);

      position = count ?? 1;
    }
  }

  const firstName = buyerName.trim().split(" ")[0];
  const positionText = position === 1
    ? "you're #1 on the waitlist"
    : `you're #${position} on the waitlist`;

  const quantityNote = unitsRequested > 1 ? ` (${unitsRequested} units)` : "";

  // Notify Michael
  await resend.emails.send({
    from: "mike@southsanctuarypdx.com",
    to: process.env.NOTIFICATION_EMAIL!,
    subject: `New item request — ${productName}`,
    html: `
      <p><strong>Item:</strong> ${productName}${quantityNote}</p>
      <p><strong>Name:</strong> ${buyerName}</p>
      <p><strong>Email:</strong> ${buyerEmail}</p>
      <p><strong>Phone:</strong> ${buyerPhone || "—"}</p>
      <p><strong>Message:</strong> ${message || "—"}</p>
      <p><strong>Waitlist position:</strong> #${position}</p>
    `,
  });

  // Confirmation to buyer
  await resend.emails.send({
    from: "mike@southsanctuarypdx.com",
    replyTo: [process.env.NOTIFICATION_EMAIL!],
    to: buyerEmail,
    subject: "Your request — South Sanctuary Estate Sale",
    html: `
      <p>Hi ${firstName},</p>

      <p>Thanks so much for expressing interest — we're really glad these pieces are finding good homes.</p>

      <p>Here's where you stand on the item you requested:</p>

      <ul>
        <li>${productName}${quantityNote} — ${positionText}</li>
      </ul>

      <p>This is an automated response, but please feel free to reply with any questions — we're happy to help.</p>

      <p>We're estimating items will be available for pickup beginning Friday, May 15. As that date approaches, we'll reach out to confirm timing.</p>

      <p>Looking forward to connecting soon.</p>

      <p>Mike &amp; Ali</p>
    `,
  });

  return NextResponse.json({ ok: true });
}
