-- Lock down the buyer_notes table from anon-key access. The table is
-- admin-only — every read/write in the codebase goes through the service
-- role via supabaseAdmin, which bypasses RLS. Enabling RLS with no
-- policies blocks the anon key entirely while keeping admin routes intact.

ALTER TABLE public.buyer_notes ENABLE ROW LEVEL SECURITY;
