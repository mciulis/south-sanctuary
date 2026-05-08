import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { productId, productName, salePrice, unitsRequested, buyerName, buyerEmail, buyerPhone, message } =
    await req.json();

  // Read waitlist position from the newly inserted reservation
  let position = 1;
  if (productId) {
    const { data: reservation } = await supabaseAdmin
      .from("reservations")
      .select("waitlist_position")
      .eq("product_id", productId)
      .eq("buyer_email", buyerEmail)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    position = reservation?.waitlist_position ?? 1;
  }

  const firstName = buyerName.trim().split(" ")[0];
  const quantityNote = unitsRequested > 1 ? ` (${unitsRequested} units)` : "";
  const isFirst = position === 1;

  // Deposit = 25% of sale price, rounded to nearest $10, minimum $10
  const deposit = salePrice
    ? Math.max(10, Math.round(salePrice * 0.25 / 10) * 10)
    : null;
  const priceDisplay = salePrice ? `$${salePrice.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : null;
  const depositDisplay = deposit ? `$${deposit}` : null;

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
    subject: isFirst
      ? "Good News — South Sanctuary Estate Sale"
      : "We've Got You on the List — South Sanctuary Estate Sale",
    html: isFirst ? `
      <p>Hi ${firstName},</p>

      <p>Thanks for reaching out about our estate sale. Good news, you're first in line for the following item:</p>

      <ul>
        <li>${productName}${quantityNote}${priceDisplay ? ` — ${priceDisplay}` : ""}${depositDisplay ? ` (deposit: ${depositDisplay})` : ""}</li>
      </ul>

      ${depositDisplay ? `<p>To reserve this, please send a deposit of ${depositDisplay} via Venmo to @mciulis. The deposit goes toward your total at pickup. Once you send it, reply to this email with a few dates between May 15 and 22 that work for pickup and we'll confirm one. If we don't receive the deposit within 72 hours, we'll offer the item to the next person. If pickup doesn't happen by May 22, the deposit will be forfeited.</p>` : `<p>We'll be in touch in the next few days with details on next steps, including pickup timing and how to reserve your spot.</p>`}

      <p>Mike &amp; Ali<br>southsanctuarypdx.com/estate-sale</p>
    ` : `
      <p>Hi ${firstName},</p>

      <p>Thanks for reaching out about our estate sale. We've got you on the list for ${productName}${quantityNote} — you're currently #${position}.</p>

      <p>Our pickup window is May 15 to 22. If anyone ahead of you isn't able to move forward, we'll be in touch right away with next steps.</p>

      <p>Mike &amp; Ali<br>southsanctuarypdx.com/estate-sale</p>
    `,
  });

  return NextResponse.json({ ok: true });
}
