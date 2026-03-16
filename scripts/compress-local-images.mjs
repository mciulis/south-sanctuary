/**
 * compress-local-images.mjs
 *
 * Compresses all JPG/JPEG images in public/images/home/ in place.
 * Originals are backed up to scripts/home-images-backup-local/ first.
 *
 * Run: node scripts/compress-local-images.mjs
 */

import sharp from "sharp";
import fs from "fs";
import path from "path";

const SOURCE_DIR = path.join(process.cwd(), "public", "images", "home");
const BACKUP_DIR = path.join(process.cwd(), "scripts", "home-images-backup-local");

fs.mkdirSync(BACKUP_DIR, { recursive: true });

const files = fs.readdirSync(SOURCE_DIR).filter((f) =>
  /\.(jpe?g)$/i.test(f)
);

console.log(`Found ${files.length} images in public/images/home/\n`);

for (const file of files) {
  const srcPath = path.join(SOURCE_DIR, file);
  const backupPath = path.join(BACKUP_DIR, file);

  const originalBuffer = fs.readFileSync(srcPath);
  const originalKB = Math.round(originalBuffer.length / 1024);

  // Back up original
  fs.writeFileSync(backupPath, originalBuffer);

  // Compress
  const compressed = await sharp(originalBuffer)
    .resize({ width: 2400, withoutEnlargement: true })
    .jpeg({ quality: 85, progressive: true })
    .toBuffer();

  const compressedKB = Math.round(compressed.length / 1024);
  const saving = Math.round((1 - compressed.length / originalBuffer.length) * 100);

  // Write back in place
  fs.writeFileSync(srcPath, compressed);

  console.log(`${file}: ${originalKB}KB → ${compressedKB}KB (${saving}% smaller)`);
}

console.log("\nAll done. Commit and push to deploy the compressed images.");
