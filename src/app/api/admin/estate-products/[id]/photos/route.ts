import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

function parseProductId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function fetchOrderedImages(productId: number) {
  const { data, error } = await supabaseAdmin
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params;
  const productId = parseProductId(rawId);
  if (!productId) {
    return NextResponse.json({ error: "Invalid product id." }, { status: 400 });
  }

  const formData = await request.formData();
  const files = formData.getAll("files").filter((value): value is File => value instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: "No files uploaded." }, { status: 400 });
  }

  const [{ data: product, error: productError }, existingImages] = await Promise.all([
    supabaseAdmin
      .from("products")
      .select("id, main_photo_filename")
      .eq("id", productId)
      .single(),
    fetchOrderedImages(productId),
  ]);

  if (productError) {
    return NextResponse.json({ error: productError.message }, { status: 500 });
  }

  const inserted: { product_id: number; filename: string; sort_order: number }[] = [];
  const timestamp = Date.now();

  for (const [index, file] of files.entries()) {
    const ext = file.name.split(".").pop() ?? "jpg";
    const filename = `${productId}/${timestamp}-${index}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from("products")
      .upload(filename, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    inserted.push({
      product_id: productId,
      filename,
      sort_order: existingImages.length + inserted.length,
    });
  }

  if (inserted.length > 0) {
    const { error: insertError } = await supabaseAdmin.from("product_images").insert(inserted);
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  const images = await fetchOrderedImages(productId);
  let mainPhotoFilename = product.main_photo_filename as string | null;

  if (!mainPhotoFilename && images[0]?.filename) {
    mainPhotoFilename = images[0].filename;
    const { error: updateError } = await supabaseAdmin
      .from("products")
      .update({ main_photo_filename: mainPhotoFilename })
      .eq("id", productId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ images, main_photo_filename: mainPhotoFilename });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params;
  const productId = parseProductId(rawId);
  if (!productId) {
    return NextResponse.json({ error: "Invalid product id." }, { status: 400 });
  }

  const body = await request.json();
  const action = body?.action;
  const images = await fetchOrderedImages(productId);

  if (action === "reorder") {
    const imageIds: number[] = Array.isArray(body.imageIds) ? body.imageIds.map(Number) : [];
    if (imageIds.length !== images.length) {
      return NextResponse.json({ error: "Image reorder payload is invalid." }, { status: 400 });
    }

    const imageById = new Map(images.map((image) => [image.id, image]));
    const reordered = imageIds.map((imageId, index) => {
      const image = imageById.get(imageId);
      if (!image) throw new Error("Image reorder payload is invalid.");
      return { ...image, sort_order: index };
    });

    await Promise.all(
      reordered.map((image) =>
        supabaseAdmin.from("product_images").update({ sort_order: image.sort_order }).eq("id", image.id)
      )
    );

    const mainPhotoFilename = reordered[0]?.filename ?? null;
    const { error: updateError } = await supabaseAdmin
      .from("products")
      .update({ main_photo_filename: mainPhotoFilename })
      .eq("id", productId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ images: reordered, main_photo_filename: mainPhotoFilename });
  }

  if (action === "setHero") {
    const filename = typeof body.filename === "string" ? body.filename : "";
    const heroIndex = images.findIndex((image) => image.filename === filename);

    if (heroIndex === -1) {
      return NextResponse.json({ error: "Photo not found." }, { status: 404 });
    }

    const reordered = [
      images[heroIndex],
      ...images.slice(0, heroIndex),
      ...images.slice(heroIndex + 1),
    ].map((image, index) => ({ ...image, sort_order: index }));

    await Promise.all(
      reordered.map((image) =>
        supabaseAdmin.from("product_images").update({ sort_order: image.sort_order }).eq("id", image.id)
      )
    );

    const { error: updateError } = await supabaseAdmin
      .from("products")
      .update({ main_photo_filename: filename })
      .eq("id", productId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ images: reordered, main_photo_filename: filename });
  }

  return NextResponse.json({ error: "Unsupported photo action." }, { status: 400 });
}
