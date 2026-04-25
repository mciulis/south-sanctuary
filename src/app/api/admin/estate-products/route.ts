import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const payload = {
    name: typeof body.name === "string" ? body.name.trim() : "",
    full_name: typeof body.full_name === "string" && body.full_name.trim()
      ? body.full_name.trim()
      : typeof body.name === "string"
        ? body.name.trim()
        : "",
    brand: typeof body.brand === "string" && body.brand.trim() ? body.brand.trim() : null,
    units: typeof body.units === "number" ? body.units : 1,
    units_available: typeof body.units_available === "number" ? body.units_available : 1,
    retail_price: typeof body.retail_price === "number" ? body.retail_price : null,
    sale_price: typeof body.sale_price === "number" ? body.sale_price : null,
    condition: typeof body.condition === "string" ? body.condition : "new",
    available_by: typeof body.available_by === "string" && body.available_by ? body.available_by : null,
    status: typeof body.status === "string" ? body.status : "available",
  };

  if (!payload.name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("products")
    .insert(payload)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
