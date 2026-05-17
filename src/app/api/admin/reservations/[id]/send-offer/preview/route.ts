import { NextRequest, NextResponse } from "next/server";
import { renderOfferEmailHtml } from "@/lib/emails";
import { loadOfferTarget } from "../shared";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const target = await loadOfferTarget(id);

  if (!target) {
    return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
  }

  const html = renderOfferEmailHtml({
    buyerName: target.reservation.buyer_name,
    productName: target.product.name,
    unitsRequested: target.reservation.units_requested ?? 1,
    salePrice: target.product.sale_price,
    reason: "promoted",
  });

  return NextResponse.json({
    reservationId: target.reservation.id,
    recipientName: target.reservation.buyer_name,
    recipientEmail: target.reservation.buyer_email,
    productName: target.product.name,
    alreadyOffered: !!target.reservation.offered_at,
    status: target.reservation.status,
    subject: "You're up — South Sanctuary Moving Sale",
    html,
  });
}
