import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const SUPABASE_URL = "https://hvvlvafmjmykqzlzzwnx.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2dmx2YWZtam15a3F6bHp6d254Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNDEzOTUsImV4cCI6MjA4ODkxNzM5NX0.GGhb3XvsmWc62CdbVreUpOP9z6fFIZ6WL3rC3Ex-yC4";
const PHOTO_DIR =
  "/Users/mike_ciulis/Library/CloudStorage/GoogleDrive-mbciulis@gmail.com/My Drive/1. Facebook Marketplace/2026.02 - 230 S Canby - Estate Sale";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const products = JSON.parse(
  fs.readFileSync(
    "/Users/mike_ciulis/code/south-sanctuary/scripts/products.json",
    "utf8"
  )
);

// product_images rows to insert after upload
const imageRows = [];
// product_id -> main storage path mapping
const mainPhotos = {};

let uploaded = 0;
let failed = 0;

for (const product of products) {
  if (!product.photos.length) continue;

  for (let i = 0; i < product.photos.length; i++) {
    const filename = product.photos[i];
    // Safe storage key: {product_id}/{1-based-index}.jpeg
    const storagePath = `${product.id}/${i + 1}.jpeg`;
    const filePath = path.join(PHOTO_DIR, filename);

    if (!fs.existsSync(filePath)) {
      console.log(`  MISSING: ${filename}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(filePath);
    const { error } = await supabase.storage
      .from("products")
      .upload(storagePath, fileBuffer, { contentType: "image/jpeg", upsert: true });

    if (error) {
      console.error(`  FAIL ${storagePath}: ${error.message}`);
      failed++;
    } else {
      console.log(`  ✓ ${storagePath}`);
      uploaded++;
      imageRows.push({ product_id: product.id, filename: storagePath, sort_order: i });
      if (i === 0) mainPhotos[product.id] = storagePath;
    }
  }
}

console.log(`\nUploaded: ${uploaded}, Failed: ${failed}`);
console.log(`Inserting ${imageRows.length} product_images rows...`);

// Insert product_images in chunks of 50
for (let i = 0; i < imageRows.length; i += 50) {
  const chunk = imageRows.slice(i, i + 50);
  const { error } = await supabase.from("product_images").insert(chunk);
  if (error) console.error("product_images insert error:", error.message);
  else console.log(`  inserted rows ${i + 1}–${i + chunk.length}`);
}

// Update main_photo_filename on products table
console.log(`\nUpdating main_photo_filename for ${Object.keys(mainPhotos).length} products...`);
for (const [productId, storagePath] of Object.entries(mainPhotos)) {
  const { error } = await supabase
    .from("products")
    .update({ main_photo_filename: storagePath })
    .eq("id", parseInt(productId));
  if (error) console.error(`  FAIL update product ${productId}:`, error.message);
  else process.stdout.write(".");
}
console.log("\nDone.");
