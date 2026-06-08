-- ============================================================
-- Dahila Crochet — Encargo tracking code (schema-encargo-tracking.sql)
-- Run AFTER schema.sql, in the Supabase SQL Editor.
-- Idempotent: safe to re-run.
-- ============================================================
-- Goal: give each custom order a short, shareable tracking code so the customer
-- can check its status at /encargo/estado without an account.
--
-- Security: custom_orders stays admin-only for SELECT (it holds PII). Public
-- status lookup goes through a SECURITY DEFINER function that returns ONLY the
-- safe fields (status, first name, dates) for an exact code match. The anon role
-- never gets table-level read access to the PII columns.
-- ============================================================

ALTER TABLE custom_orders
  ADD COLUMN IF NOT EXISTS tracking_code text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_custom_orders_tracking
  ON custom_orders(tracking_code)
  WHERE tracking_code IS NOT NULL;

-- Safe, public status lookup. Runs as the function owner (definer) so it can
-- read the row, but only returns non-sensitive columns. Empty result = not found.
CREATE OR REPLACE FUNCTION public.get_order_status(p_code text)
RETURNS TABLE (status text, customer_name text, created_at timestamptz, updated_at timestamptz)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.status,
         -- Only the first name, to confirm to the customer they hit the right code.
         split_part(o.customer_name, ' ', 1) AS customer_name,
         o.created_at,
         o.updated_at
  FROM custom_orders o
  WHERE o.tracking_code = upper(trim(p_code))
  LIMIT 1;
$$;

-- Allow the public roles to execute the lookup (and nothing else).
REVOKE ALL ON FUNCTION public.get_order_status(text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_order_status(text) TO anon, authenticated;
