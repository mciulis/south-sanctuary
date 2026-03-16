/**
 * compress-gallery.mjs
 *
 * 1. Lists all images in the `gallery` bucket
 * 2. Copies each original to `gallery-backup` (safety net)
 * 3. Downloads, compresses with sharp (max 2400px, quality 85)
 * 4. Re-uploads to `gallery`, replacing the original
 *
 * Run: node scripts/compress-gallery.mjs
 */

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import fs from "fs";
import path from "path";

const BACKUP_DIR = path.join(process.cwd(), "scripts", "gallery-backup-local");
fs.mkdirSync(BACKUP_DIR, { recursive: true });

const SUPABASE_URL = "https://hvvlvafmjmykqzlzzwnx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2dmx2YWZtam15a3F6bHp6d254Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNDEzOTUsImV4cCI6MjA4ODkxNzM5NX0.GGhb3XvsmWc62CdbVreUpOP9z6fFIZ6WL3rC3Ex-yC4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function listAllFiles(bucket) {
  // List top-level folders
  const { data: folders } = await supabase.storage.from(bucket).list("", { limit: 200 });
  const allFiles = [];
  for (const folder of folders ?? []) {
    // List files inside each folder
    const { data: files } = await supabase.storage.from(bucket).list(folder.name, { limit: 200 });
    for (const file of files ?? []) {
      if (file.name && !file.name.startsWith(".")) {
        allFiles.push(`${folder.name}/${file.name}`);
      }
    }
  }
  return allFiles;
}

async function run() {
  // 1. List all files in gallery bucket
  const imageFiles = await listAllFiles("gallery");
  console.log(`Found ${imageFiles.length} images in gallery bucket\n`);

  for (const name of imageFiles) {
    console.log(`Processing: ${name}`);

    // 2. Download original
    const { data: blob, error: downloadError } = await supabase.storage
      .from("gallery")
      .download(name);

    if (downloadError || !blob) {
      console.error(`  ✗ Download failed: ${downloadError?.message}`);
      continue;
    }

    const originalBuffer = Buffer.from(await blob.arrayBuffer());
    const originalKB = Math.round(originalBuffer.length / 1024);
    console.log(`  Original: ${originalKB}KB`);

    // 3. Back up original locally
    const safeName = name.replace(/\//g, "__");
    fs.writeFileSync(path.join(BACKUP_DIR, safeName), originalBuffer);
    console.log(`  ✓ Backed up locally`);

    // 4. Compress with sharp
    const compressed = await sharp(originalBuffer)
      .resize({ width: 2400, withoutEnlargement: true })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();

    const compressedKB = Math.round(compressed.length / 1024);
    const saving = Math.round((1 - compressed.length / originalBuffer.length) * 100);
    console.log(`  Compressed: ${compressedKB}KB (${saving}% smaller)`);

    // 5. Re-upload compressed version to gallery
    const { error: uploadError } = await supabase.storage
      .from("gallery")
      .upload(name, compressed, { upsert: true, contentType: "image/jpeg" });

    if (uploadError) {
      console.error(`  ✗ Upload failed: ${uploadError.message}`);
    } else {
      console.log(`  ✓ Done\n`);
    }
  }

  console.log("All done. Verify the gallery looks good, then delete the gallery-backup bucket.");
}

run().catch(console.error);
