-- ============================================================
-- Dahila Crochet — Resumen diario (schema-daily-summary.sql)
-- Run in the Supabase SQL Editor. Idempotent: safe to re-run.
-- ============================================================
-- Provee una función que devuelve SOLO agregados (conteos, top de productos por
-- carrito) — nunca PII. Por eso puede otorgarse a `anon`, y el cron
-- (/api/cron/daily-summary) la llama sin necesitar la service_role key.
--
-- Si NO corrés esta migración, el endpoint del resumen degrada a estadísticas de
-- carritos (que sí son legibles por anon) y omite los conteos de encargos.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_daily_summary()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'encargos_total',       (SELECT count(*) FROM custom_orders),
    'encargos_today',       (SELECT count(*) FROM custom_orders WHERE created_at >= current_date),
    'encargos_new',         (SELECT count(*) FROM custom_orders WHERE status = 'new'),
    'encargos_in_progress', (SELECT count(*) FROM custom_orders WHERE status = 'in_progress'),
    'encargos_done',        (SELECT count(*) FROM custom_orders WHERE status = 'done'),
    'encargos_cancelled',   (SELECT count(*) FROM custom_orders WHERE status = 'cancelled'),
    'carts_distinct',       (SELECT count(DISTINCT cart_id) FROM cart_items),
    'cart_items',           (SELECT coalesce(sum(qty), 0) FROM cart_items),
    'cart_value_uyu',       (SELECT coalesce(sum(ci.qty * coalesce(p.base_price_uyu, 0)), 0)
                               FROM cart_items ci JOIN products p ON p.id = ci.product_id),
    'top_products',         (SELECT coalesce(json_agg(t), '[]'::json) FROM (
                               SELECT p.name, sum(ci.qty)::int AS qty
                               FROM cart_items ci JOIN products p ON p.id = ci.product_id
                               GROUP BY p.name ORDER BY qty DESC LIMIT 5
                             ) t)
  );
$$;

-- Solo agregados → seguro exponerlo a los roles públicos para que el cron lo use.
REVOKE ALL ON FUNCTION public.get_daily_summary() FROM public;
GRANT EXECUTE ON FUNCTION public.get_daily_summary() TO anon, authenticated;
