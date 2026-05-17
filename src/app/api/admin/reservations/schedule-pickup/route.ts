import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { buildGCalUrl } from "@/lib/calendar";
import { renderPickupConfirmationHtml, type PickupItem } from "@/lib/emails";

const PICKUP_DURATION_MINUTES = 30;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const reservationIds: string[] = body.reservationIds ?? [];
  const pickupAtIso: string | undefined = body.pickupAt;
  const pickupLocationOverride: string | undefined = body.pickupLocation;

  if (reservationIds.length === 0 || !pickupAtIso) {
    return NextResponse.json({ error: "reservationIds and pickupAt required" }, { status: 400 });
  }

  const pickupAt = new Date(pickupAtIso);
  if (Number.isNaN(pickupAt.getTime())) {
    return NextResponse.json({ error: "Invalid pickupAt" }, { status: 400 });
  }

  // Resolve pickup location (per-pickup override, else site setting)
  let pickupLocation = pickupLocationOverride?.trim() || "";
  if (!pickupLocation) {
    const { data: setting } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "pickup_address")
      .maybeSingle();
    pickupLocation = setting?.value ?? "";
  }

  // Fetch reservations + their products
  const { data: rows, error: fetchErr } = await supabaseAdmin
    .from("reservations")
    .select("id, product_id, buyer_name, buyer_email, units_requested, deposit_amount, products(name, sale_price)")
    .in("id", reservationIds);

  if (fetchErr || !rows || rows.length === 0) {
    return NextResponse.json({ error: fetchErr?.message ?? "No reservations found" }, { status: 404 });
  }

  // Validate all belong to the same buyer (by email)
  const emails = new Set(rows.map((r) => r.buyer_email));
  if (emails.size > 1) {
    return NextResponse.json(
      { error: "All reservations must belong to the same buyer" },
      { status: 400 }
    );
  }

  // Update reservations
  const updatePatch: Record<string, unknown> = {
    pickup_state: "scheduled",
    pickup_at: pickupAt.toISOString(),
  };
  if (pickupLocationOverride !== undefined) {
    updatePatch.pickup_location = pickupLocationOverride || null;
  }

  const { error: updateErr } = await supabaseAdmin
    .from("reservations")
    .update(updatePatch)
    .in("id", reservationIds);

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  // Build email
  const buyerName = rows[0].buyer_name;
  const buyerEmail = rows[0].buyer_email;
  const items: PickupItem[] = rows.map((r) => {
    const productJoin = (r as unknown as { products: { name: string; sale_price: number | null } | null }).products;
    return {
      productName: productJoin?.name ?? "Item",
      salePrice: productJoin?.sale_price ?? null,
      depositAmount: r.deposit_amount ?? null,
      unitsRequested: r.units_requested ?? 1,
    };
  });

  const pickupEnd = new Date(pickupAt.getTime() + PICKUP_DURATION_MINUTES * 60_000);
  const itemTitles = items.map((i) => i.productName).join(", ");
  const gcalUrl = buildGCalUrl({
    title: `Pickup: ${itemTitles} — ${buyerName}`,
    start: pickupAt,
    end: pickupEnd,
    details: `Pickup from South Sanctuary moving sale.\n\nItems:\n${items
      .map((i) => `- ${i.productName}${i.unitsRequested > 1 ? ` ×${i.unitsRequested}` : ""}`)
      .join("\n")}`,
    location: pickupLocation,
  });

  const html = renderPickupConfirmationHtml({
    buyerName,
    items,
    pickupAt,
    pickupLocation: pickupLocation || "(address to be confirmed)",
    gcalUrl,
  });

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "mike@southsanctuarypdx.com",
    replyTo: [process.env.NOTIFICATION_EMAIL!],
    to: buyerEmail,
    bcc: [process.env.NOTIFICATION_EMAIL!],
    subject: "Pickup confirmed — South Sanctuary Moving Sale",
    html,
  });

  return NextResponse.json({ ok: true, gcalUrl, itemCount: items.length });
}
