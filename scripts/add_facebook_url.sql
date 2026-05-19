-- Add facebook_url column to products for per-item Facebook Marketplace links.
-- Nullable: when null, the product card falls back to the seller profile link.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS facebook_url text;
