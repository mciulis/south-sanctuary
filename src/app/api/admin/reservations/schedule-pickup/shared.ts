import { supabaseAdmin } from "@/lib/supabase-admin";
import { buildGCalUrl } from "@/lib/calendar";
import { renderPickupConfirmationHtml, type PickupItem } from "@/lib/emails";

export const PICKUP_DURATION_MINUTES = 30;
export const PICKUP_EMAIL_SUBJECT = "Pickup confirmed — South Sanctuary Moving Sale";

export interface SchedulePickupInput {
  reservationIds: string[];
  pickupAt: string;
  pickupLocation?: string;
}

export interface BuiltPickupEmail {
  reservationIds: string[];
  buyerName: string;
  buyerEmail: string;
  pickupAt: Date;
  pickupLocation: string;
  pickupLocationOverride?: string;
  items: PickupItem[];
  subject: string;
  html: string;
  gcalUrl: string;
}

export type BuildResult =
  | { ok: true; payload: BuiltPickupEmail }
  | { ok: false; status: number; error: string };

export async function buildScheduledPickup(input: SchedulePickupInput): Promise<BuildResult> {
  const { reservationIds, pickupAt: pickupAtIso, pickupLocation: pickupLocationOverride } = input;

  if (!reservationIds || reservationIds.length === 0 || !pickupAtIso) {
    return { ok: false, status: 400, error: "reservationIds and pickupAt required" };
  }

  const pickupAt = new Date(pickupAtIso);
  if (Number.isNaN(pickupAt.getTime())) {
    return { ok: false, status: 400, error: "Invalid pickupAt" };
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

  const { data: rows, error: fetchErr } = await supabaseAdmin
    .from("reservations")
    .select("id, product_id, buyer_name, buyer_email, units_requested, deposit_amount, products(name, sale_price)")
    .in("id", reservationIds);

  if (fetchErr || !rows || rows.length === 0) {
    return { ok: false, status: 404, error: fetchErr?.message ?? "No reservations found" };
  }

  const emails = new Set(rows.map((r) => r.buyer_email));
  if (emails.size > 1) {
    return { ok: false, status: 400, error: "All reservations must belong to the same buyer" };
  }

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

  return {
    ok: true,
    payload: {
      reservationIds,
      buyerName,
      buyerEmail,
      pickupAt,
      pickupLocation,
      pickupLocationOverride,
      items,
      subject: PICKUP_EMAIL_SUBJECT,
      html,
      gcalUrl,
    },
  };
}
