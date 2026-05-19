-- Allow products.status = 'pending' for items intentionally listed without
-- a Facebook Marketplace URL yet. The site shows these as "Listing coming
-- soon" without any clickable Marketplace link.

ALTER TABLE products
  DROP CONSTRAINT products_status_check;

ALTER TABLE products
  ADD CONSTRAINT products_status_check
  CHECK (status = ANY (ARRAY['available'::text, 'reserved'::text, 'sold'::text, 'pending'::text]));
