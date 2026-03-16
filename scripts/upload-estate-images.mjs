/**
 * upload-estate-images.mjs
 *
 * Reads resized estate sale images, matches them to products by full_name,
 * clears existing product_images rows + storage, uploads new images,
 * and updates main_photo_filename on each product.
 *
 * Run: node scripts/upload-estate-images.mjs
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { readFile } from "fs/promises";

const SUPABASE_URL = "https://hvvlvafmjmykqzlzzwnx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2dmx2YWZtam15a3F6bHp6d254Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNDEzOTUsImV4cCI6MjA4ODkxNzM5NX0.GGhb3XvsmWc62CdbVreUpOP9z6fFIZ6WL3rC3Ex-yC4";
const IMAGES_DIR = "/Users/mike_ciulis/My Drive/1. Facebook Marketplace/2026.02 - 230 S Canby - Estate Sale/03_Images_Resized";
const BUCKET = "products";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── 1. Group image files by product prefix ───────────────────────────────────

const allFiles = fs.readdirSync(IMAGES_DIR).filter(f => f.endsWith(".jpeg") || f.endsWith(".jpg"));

const imageGroups = new Map(); // prefix → sorted filenames
for (const file of allFiles) {
  const match = file.match(/^(.+)__(\d+) Large\.jpeg$/);
  if (!match) { console.warn("Skipping unexpected filename:", file); continue; }
  const prefix = match[1];
  const index = parseInt(match[2], 10);
  if (!imageGroups.has(prefix)) imageGroups.set(prefix, []);
  imageGroups.get(prefix).push({ file, index });
}
// Sort each group by index
for (const [, files] of imageGroups) {
  files.sort((a, b) => a.index - b.index);
}

console.log(`\nFound ${imageGroups.size} product groups across ${allFiles.length} images.\n`);

// ─── 2. Fetch all products ────────────────────────────────────────────────────

const { data: products, error: prodErr } = await supabase.from("products").select("id, full_name");
if (prodErr) { console.error("Failed to fetch products:", prodErr.message); process.exit(1); }

const productMap = new Map(products.map(p => [p.full_name, p.id]));

// ─── 3. Report unmatched ──────────────────────────────────────────────────────

const unmatched = [];
for (const prefix of imageGroups.keys()) {
  if (!productMap.has(prefix)) unmatched.push(prefix);
}
if (unmatched.length) {
  console.warn("⚠️  Image groups with NO matching product (will be skipped):");
  unmatched.forEach(u => console.warn("   -", u));
  console.log();
}

const noImages = products.filter(p => !imageGroups.has(p.full_name));
if (noImages.length) {
  console.log("ℹ️  Products with NO images in folder (unchanged):");
  noImages.forEach(p => console.log("   -", p.full_name));
  console.log();
}

// ─── 4. Process each matched product ─────────────────────────────────────────

const matched = [...imageGroups.entries()].filter(([prefix]) => productMap.has(prefix));
console.log(`Processing ${matched.length} matched products...\n`);

let successCount = 0;
let errorCount = 0;

for (const [prefix, files] of matched) {
  const productId = productMap.get(prefix);
  process.stdout.write(`[${productId}] ${prefix} (${files.length} images) ... `);

  try {
    // a. Delete existing product_images rows from DB
    await supabase.from("product_images").delete().eq("product_id", productId);

    // b. List + delete existing files from storage
    const { data: existingFiles } = await supabase.storage.from(BUCKET).list(`${productId}`);
    if (existingFiles && existingFiles.length > 0) {
      const paths = existingFiles.map(f => `${productId}/${f.name}`);
      await supabase.storage.from(BUCKET).remove(paths);
    }

    // c. Upload new images
    const imageRows = [];
    for (const { file, index } of files) {
      const filePath = path.join(IMAGES_DIR, file);
      const buffer = await readFile(filePath);
      const storagePath = `${productId}/${index}.jpeg`;

      const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

      if (uploadErr) {
        console.error(`\n  ❌ Upload failed for ${file}:`, uploadErr.message);
        continue;
      }

      imageRows.push({ product_id: productId, filename: storagePath, sort_order: index });
    }

    // d. Insert product_images rows
    if (imageRows.length > 0) {
      const { error: insertErr } = await supabase.from("product_images").insert(imageRows);
      if (insertErr) throw new Error("Insert product_images: " + insertErr.message);
    }

    // e. Update main_photo_filename to first image
    const firstPath = `${productId}/0.jpeg`;
    await supabase.from("products").update({ main_photo_filename: firstPath }).eq("id", productId);

    console.log(`✓ ${imageRows.length} uploaded`);
    successCount++;
  } catch (err) {
    console.log(`❌ ERROR: ${err.message}`);
    errorCount++;
  }
}

console.log(`\n✅ Done. ${successCount} products updated, ${errorCount} errors.\n`);
