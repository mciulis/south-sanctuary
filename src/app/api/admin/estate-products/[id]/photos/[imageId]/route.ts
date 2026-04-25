import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

function parsePositiveInt(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const { id: rawId, imageId: rawImageId } = await params;
  const productId = parsePositiveInt(rawId);
  const imageId = parsePositiveInt(rawImageId);

  if (!productId || !imageId) {
    return NextResponse.json({ error: "Invalid photo request." }, { status: 400 });
  }

  const [{ data: image, error: imageError }, { data: product, error: productError }] = await Promise.all([
    supabaseAdmin
      .from("product_images")
      .select("id, filename")
      .eq("id", imageId)
      .eq("product_id", productId)
      .single(),
    supabaseAdmin
      .from("products")
      .select("main_photo_filename")
      .eq("id", productId)
      .single(),
  ]);

  if (imageError) {
    return NextResponse.json({ error: imageError.message }, { status: 500 });
  }

  if (productError) {
    return NextResponse.json({ error: productError.message }, { status: 500 });
  }

  const { error: storageError } = await supabaseAdmin.storage.from("products").remove([image.filename]);
  if (storageError) {
    return NextResponse.json({ error: storageError.message }, { status: 500 });
  }

  const { error: deleteError } = await supabaseAdmin.from("product_images").delete().eq("id", imageId);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  const { data: remaining, error: remainingError } = await supabaseAdmin
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order");

  if (remainingError) {
    return NextResponse.json({ error: remainingError.message }, { status: 500 });
  }

  const reordered = (remaining ?? []).map((item, index) => ({ ...item, sort_order: index }));

  await Promise.all(
    reordered.map((item) =>
      supabaseAdmin.from("product_images").update({ sort_order: item.sort_order }).eq("id", item.id)
    )
  );

  const mainPhotoFilename =
    product.main_photo_filename === image.filename
      ? reordered[0]?.filename ?? null
      : product.main_photo_filename;

  const { error: updateError } = await supabaseAdmin
    .from("products")
    .update({ main_photo_filename: mainPhotoFilename })
    .eq("id", productId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ images: reordered, main_photo_filename: mainPhotoFilename });
}
