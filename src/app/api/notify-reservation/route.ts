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
    bcc: [process.env.NOTIFICATION_EMAIL!],
    subject: isFirst
      ? "You're first in line — South Sanctuary Moving Sale"
      : "You're on the list — South Sanctuary Moving Sale",
    html: isFirst ? `
      <p>Hi ${firstName},</p>

      <p>Thanks for reaching out about our moving sale. Good news — you're first in line for ${productName}${quantityNote}${priceDisplay ? ` — ${priceDisplay}` : ""}${depositDisplay ? ` (deposit: ${depositDisplay})` : ""}.</p>

      ${depositDisplay ? `<p>To hold it, please send your deposit via Venmo to @mciulis within 48 hours. The deposit goes toward your total at pickup. Once you send it, reply to this email with a few times that work for pickup and we'll confirm one — pickup needs to happen within 72 hours of your deposit unless otherwise arranged. If we don't receive the deposit within 48 hours, we'll offer the item to the next person.</p>` : `<p>We'll be in touch in the next few days with details on next steps, including pickup timing and how to reserve your spot.</p>`}

      <p>If there are other items you're interested in and want to see in person, we're hosting a moving sale open house on Sunday, May 24 from 1-4pm.</p>

      <p>Mike &amp; Ali<br>southsanctuarypdx.com/moving-sale</p>
    ` : `
      <p>Hi ${firstName},</p>

      <p>Thanks for reaching out about our moving sale. We've got you on the list for ${productName}${quantityNote} — you're currently #${position} in line.</p>

      <p>We're working through the list now — if anyone ahead of you isn't able to move forward, we'll be in touch right away with next steps.</p>

      <p>We're also hosting a moving sale open house on Sunday, May 24 from 1-4pm — feel free to stop by to see this item or anything else that catches your eye. Items that haven't been claimed by then will be available.</p>

      <p>Mike &amp; Ali<br>southsanctuarypdx.com/moving-sale</p>
    `,
  });

  return NextResponse.json({ ok: true });
}
