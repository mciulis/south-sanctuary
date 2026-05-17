import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("reservations")
    .select("*, products(name, brand, room, sale_price)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []).map((r: any) => ({
    ...r,
    product_name: r.products?.name ?? "Unknown",
    product_brand: r.products?.brand ?? null,
    product_room: r.products?.room ?? null,
    product_sale_price: r.products?.sale_price ?? null,
  }));

  return NextResponse.json(rows);
}
