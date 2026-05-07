// One-time script: download, resize, and re-upload all existing product photos.
// Resizes to max 1600px on longest side, JPEG at 85% quality.
// Run: node scripts/resize-existing-photos.mjs
// Dry run (no uploads): node scripts/resize-existing-photos.mjs --dry-run

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const SUPABASE_URL = "https://hvvlvafmjmykqzlzzwnx.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = "products";
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 85;
const DRY_RUN = process.argv.includes("--dry-run");

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY env var.");
  console.error("Run: SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/resize-existing-photos.mjs");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function getAllFilenames() {
  // Get all filenames from product_images table
  const { data: images, error: imgError } = await supabase
    .from("product_images")
    .select("filename");
  if (imgError) throw new Error(`product_images query failed: ${imgError.message}`);

  // Also get main_photo_filename from products (may reference files not in product_images for older products)
  const { data: products, error: prodError } = await supabase
    .from("products")
    .select("main_photo_filename")
    .not("main_photo_filename", "is", null);
  if (prodError) throw new Error(`products query failed: ${prodError.message}`);

  const all = new Set([
    ...(images ?? []).map((r) => r.filename),
    ...(products ?? []).map((r) => r.main_photo_filename).filter(Boolean),
  ]);

  return [...all];
}

async function processFile(filename) {
  // Download
  const { data, error } = await supabase.storage.from(BUCKET).download(filename);
  if (error) {
    console.warn(`  SKIP  ${filename} — download failed: ${error.message}`);
    return { status: "skipped" };
  }

  const originalBuffer = Buffer.from(await data.arrayBuffer());
  const originalSize = originalBuffer.length;

  // Inspect metadata before resizing
  const meta = await sharp(originalBuffer).metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  const alreadySmall = w <= MAX_DIMENSION && h <= MAX_DIMENSION && meta.format === "jpeg";

  if (alreadySmall) {
    console.log(`  OK    ${filename} (${w}×${h}, already JPEG ≤${MAX_DIMENSION}px — skipping)`);
    return { status: "skipped" };
  }

  // Resize
  const resizedBuffer = await sharp(originalBuffer)
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY })
    .toBuffer();

  const newSize = resizedBuffer.length;
  const saving = Math.round((1 - newSize / originalSize) * 100);

  // Determine the new path — always .jpg extension
  const newFilename = filename.replace(/\.[^.]+$/, ".jpg");
  const renamed = newFilename !== filename;

  if (DRY_RUN) {
    console.log(`  DRY   ${filename} (${w}×${h}, ${kb(originalSize)}KB → ${kb(newSize)}KB, -${saving}%)${renamed ? ` → ${newFilename}` : ""}`);
    return { status: "dry-run" };
  }

  // Upload resized version (upsert to overwrite)
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(newFilename, resizedBuffer, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (uploadError) {
    console.warn(`  FAIL  ${filename} — upload failed: ${uploadError.message}`);
    return { status: "failed" };
  }

  // If the filename changed (extension), update DB references
  if (renamed) {
    await supabase.from("product_images").update({ filename: newFilename }).eq("filename", filename);
    await supabase.from("products").update({ main_photo_filename: newFilename }).eq("main_photo_filename", filename);

    // Delete old file
    await supabase.storage.from(BUCKET).remove([filename]);
  }

  console.log(`  DONE  ${filename} (${w}×${h}, ${kb(originalSize)}KB → ${kb(newSize)}KB, -${saving}%)${renamed ? ` → ${newFilename}` : ""}`);
  return { status: "done" };
}

function kb(bytes) {
  return Math.round(bytes / 1024);
}

async function main() {
  console.log(`\nResize existing product photos${DRY_RUN ? " [DRY RUN]" : ""}`);
  console.log(`Target: max ${MAX_DIMENSION}px, JPEG ${JPEG_QUALITY}%\n`);

  const filenames = await getAllFilenames();
  console.log(`Found ${filenames.length} files to check.\n`);

  const counts = { done: 0, skipped: 0, failed: 0, "dry-run": 0 };

  for (const filename of filenames) {
    const result = await processFile(filename);
    counts[result.status] = (counts[result.status] ?? 0) + 1;
  }

  console.log(`\nDone.`);
  console.log(`  Resized:  ${counts.done ?? 0}`);
  console.log(`  Skipped:  ${counts.skipped ?? 0} (already small/JPEG)`);
  if (DRY_RUN) console.log(`  Dry-run:  ${counts["dry-run"] ?? 0}`);
  console.log(`  Failed:   ${counts.failed ?? 0}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
