import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  // Fetch current row to detect transitions and to compute product-level rollups later
  const { data: existing, error: fetchErr } = await supabaseAdmin
    .from("reservations")
    .select("id, product_id, payment_state, pickup_state, units_requested")
    .eq("id", id)
    .single();

  if (fetchErr || !existing) {
    return NextResponse.json({ error: fetchErr?.message ?? "Reservation not found" }, { status: 404 });
  }

  const now = new Date().toISOString();
  const patch: Record<string, unknown> = { ...body };

  // Stamp timestamps on state transitions (only when transitioning INTO the state)
  if (
    body.payment_state === "deposit_paid" &&
    existing.payment_state !== "deposit_paid"
  ) {
    patch.deposit_received_at = patch.deposit_received_at ?? now;
  }
  if (
    body.payment_state === "paid_in_full" &&
    existing.payment_state !== "paid_in_full"
  ) {
    patch.paid_in_full_at = patch.paid_in_full_at ?? now;
  }
  if (
    body.pickup_state === "picked_up" &&
    existing.pickup_state !== "picked_up"
  ) {
    patch.picked_up_at = patch.picked_up_at ?? now;
  }

  const { error: updateErr } = await supabaseAdmin
    .from("reservations")
    .update(patch)
    .eq("id", id);

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  // When a reservation reaches paid_in_full, recompute the product status
  if (
    body.payment_state === "paid_in_full" &&
    existing.payment_state !== "paid_in_full"
  ) {
    await recomputeProductStatus(existing.product_id);
  }

  return NextResponse.json({ ok: true });
}

async function recomputeProductStatus(productId: number) {
  const [{ data: product }, { data: paidRows }] = await Promise.all([
    supabaseAdmin.from("products").select("units").eq("id", productId).single(),
    supabaseAdmin
      .from("reservations")
      .select("units_requested")
      .eq("product_id", productId)
      .eq("payment_state", "paid_in_full"),
  ]);

  if (!product) return;

  const totalPaid = (paidRows ?? []).reduce(
    (sum, r) => sum + (r.units_requested ?? 1),
    0
  );

  if (totalPaid >= product.units) {
    await supabaseAdmin
      .from("products")
      .update({ status: "sold" })
      .eq("id", productId);
  }
}
