import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const ALLOWED_FIELDS = new Set([
  "name",
  "full_name",
  "brand",
  "description",
  "sale_price",
  "retail_price",
  "discount_percent",
  "condition",
  "room",
  "length_in",
  "width_in",
  "height_in",
  "dimensions_display",
  "units",
  "units_available",
  "retail_url",
  "main_photo_filename",
  "status",
  "available_by",
]);

function parseProductId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params;
  const id = parseProductId(rawId);
  if (!id) {
    return NextResponse.json({ error: "Invalid product id." }, { status: 400 });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(body ?? {})) {
    if (ALLOWED_FIELDS.has(key)) {
      updates[key] = value;
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params;
  const id = parseProductId(rawId);
  if (!id) {
    return NextResponse.json({ error: "Invalid product id." }, { status: 400 });
  }

  const { data: images, error: imageError } = await supabaseAdmin
    .from("product_images")
    .select("id, filename")
    .eq("product_id", id);

  if (imageError) {
    return NextResponse.json({ error: imageError.message }, { status: 500 });
  }

  const filenames = (images ?? []).map((image) => image.filename).filter(Boolean);
  if (filenames.length > 0) {
    const { error: storageError } = await supabaseAdmin.storage.from("products").remove(filenames);
    if (storageError) {
      return NextResponse.json({ error: storageError.message }, { status: 500 });
    }

    const { error: deleteImagesError } = await supabaseAdmin
      .from("product_images")
      .delete()
      .eq("product_id", id);
    if (deleteImagesError) {
      return NextResponse.json({ error: deleteImagesError.message }, { status: 500 });
    }
  }

  const { error } = await supabaseAdmin.from("products").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
