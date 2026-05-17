import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { renderOfferEmailHtml } from "@/lib/emails";
import { loadOfferTarget } from "./shared";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const target = await loadOfferTarget(id);

  if (!target) {
    return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
  }

  if (target.reservation.status !== "pending") {
    return NextResponse.json(
      { error: `Cannot offer to a ${target.reservation.status} reservation` },
      { status: 409 }
    );
  }

  // "first_in_line" is reserved for the auto-confirmation that fires from /api/notify-reservation
  // at submission time. Any time the admin manually sends an offer, it's a promotion scenario.
  const html = renderOfferEmailHtml({
    buyerName: target.reservation.buyer_name,
    productName: target.product.name,
    unitsRequested: target.reservation.units_requested ?? 1,
    salePrice: target.product.sale_price,
    reason: "promoted",
  });

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "mike@southsanctuarypdx.com",
    replyTo: [process.env.NOTIFICATION_EMAIL!],
    to: target.reservation.buyer_email,
    bcc: [process.env.NOTIFICATION_EMAIL!],
    subject: "You're up — South Sanctuary Moving Sale",
    html,
  });

  await supabaseAdmin
    .from("reservations")
    .update({ offered_at: new Date().toISOString() })
    .eq("id", id);

  return NextResponse.json({
    ok: true,
    reservationId: id,
    buyerEmail: target.reservation.buyer_email,
  });
}
