-- ============================================================
-- Dahila Crochet — Cupones (schema-cupones.sql)
-- Ejecutar DESPUÉS de schema.sql, en el Supabase SQL Editor.
-- Idempotente: seguro de re-ejecutar.
-- ============================================================
-- Cupones con código manual: porcentaje, monto fijo o envío gratis, con
-- vencimiento, tope de usos (total y por cliente), compra mínima y alcance
-- por productos o categorías. Administrables desde /admin/cupones.
--
-- Seguridad: la tabla NO es legible por anon (los códigos son secretos).
-- El público valida y canjea únicamente a través de dos funciones
-- SECURITY DEFINER que exponen solo lo necesario. "Canje" = el cliente
-- finalizó el pedido por WhatsApp con el cupón puesto (no hay checkout
-- online, así que es la señal de compra más cercana que existe).
--
-- El total de usos NO se guarda en una columna: se deriva contando
-- coupon_redemptions (una sola fuente de verdad, nunca se desincroniza).
-- ============================================================

CREATE TABLE IF NOT EXISTS coupons (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code                  text NOT NULL,
  label                 text,                       -- descripción interna ("Lanzamiento drop Verano")
  kind                  text NOT NULL DEFAULT 'percent'
                        CHECK (kind IN ('percent', 'fixed', 'free_shipping')),
  value                 integer,                    -- % (1-90) o monto UYU; NULL para envío gratis
  min_subtotal_uyu      integer,                    -- compra mínima (NULL = sin mínimo)
  starts_at             timestamptz,                -- NULL = ya vigente
  ends_at               timestamptz,                -- NULL = sin vencimiento
  max_uses              integer,                    -- tope total de canjes (NULL = ilimitado)
  max_uses_per_customer integer DEFAULT 1,          -- por cliente (carrito) (NULL = ilimitado)
  product_ids           uuid[] NOT NULL DEFAULT '{}',  -- alcance: productos específicos
  category_ids          uuid[] NOT NULL DEFAULT '{}',  -- alcance: categorías específicas
  active                boolean NOT NULL DEFAULT true,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now(),
  CONSTRAINT coupons_value_check CHECK (
    (kind = 'percent' AND value BETWEEN 1 AND 90) OR
    (kind = 'fixed' AND value > 0) OR
    (kind = 'free_shipping' AND value IS NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_coupons_code ON coupons (upper(code));

CREATE OR REPLACE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Un canje por fila. cart_id = cookie anónima del carrito (la mejor
-- aproximación a "cliente" disponible sin cuentas de usuario).
CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id  uuid NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  cart_id    text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon ON coupon_redemptions(coupon_id, cart_id);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- Solo el admin ve/gestiona cupones y canjes. El público pasa por las RPCs.
DROP POLICY IF EXISTS "Admin manage coupons" ON coupons;
CREATE POLICY "Admin manage coupons" ON coupons
  FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Admin manage coupon redemptions" ON coupon_redemptions;
CREATE POLICY "Admin manage coupon redemptions" ON coupon_redemptions
  FOR ALL TO authenticated USING (true);

-- ─── Validación pública ──────────────────────────────────────
-- Devuelve la regla del cupón (para que el carrito calcule el descuento con
-- los precios reales) + si es canjeable y por qué no. Fila vacía = no existe.
CREATE OR REPLACE FUNCTION public.get_coupon_public(p_code text, p_cart text)
RETURNS TABLE (
  code text,
  label text,
  kind text,
  value integer,
  min_subtotal_uyu integer,
  product_ids uuid[],
  category_ids uuid[],
  valid boolean,
  reason text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.code,
    c.label,
    c.kind,
    c.value,
    c.min_subtotal_uyu,
    c.product_ids,
    c.category_ids,
    (c.active
      AND (c.starts_at IS NULL OR c.starts_at <= now())
      AND (c.ends_at IS NULL OR c.ends_at >= now())
      AND (c.max_uses IS NULL OR
           (SELECT count(*) FROM coupon_redemptions r WHERE r.coupon_id = c.id) < c.max_uses)
      AND (c.max_uses_per_customer IS NULL OR p_cart IS NULL OR
           (SELECT count(*) FROM coupon_redemptions r WHERE r.coupon_id = c.id AND r.cart_id = p_cart) < c.max_uses_per_customer)
    ) AS valid,
    CASE
      WHEN NOT c.active THEN 'inactive'
      WHEN c.starts_at IS NOT NULL AND c.starts_at > now() THEN 'not_started'
      WHEN c.ends_at IS NOT NULL AND c.ends_at < now() THEN 'expired'
      WHEN c.max_uses IS NOT NULL AND
           (SELECT count(*) FROM coupon_redemptions r WHERE r.coupon_id = c.id) >= c.max_uses THEN 'maxed'
      WHEN c.max_uses_per_customer IS NOT NULL AND p_cart IS NOT NULL AND
           (SELECT count(*) FROM coupon_redemptions r WHERE r.coupon_id = c.id AND r.cart_id = p_cart) >= c.max_uses_per_customer THEN 'customer_maxed'
      ELSE 'ok'
    END AS reason
  FROM coupons c
  WHERE upper(c.code) = upper(trim(p_code))
  LIMIT 1;
$$;

-- ─── Canje ───────────────────────────────────────────────────
-- Re-chequea los topes y registra el canje. Devuelve true si quedó registrado.
CREATE OR REPLACE FUNCTION public.redeem_coupon(p_code text, p_cart text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coupon coupons%ROWTYPE;
BEGIN
  IF p_cart IS NULL OR length(trim(p_cart)) = 0 THEN
    RETURN false;
  END IF;

  SELECT * INTO v_coupon
  FROM coupons c
  WHERE upper(c.code) = upper(trim(p_code))
    AND c.active
    AND (c.starts_at IS NULL OR c.starts_at <= now())
    AND (c.ends_at IS NULL OR c.ends_at >= now())
  -- Serializa canjes concurrentes del mismo cupón para que el tope sea exacto.
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF v_coupon.max_uses IS NOT NULL AND
     (SELECT count(*) FROM coupon_redemptions r WHERE r.coupon_id = v_coupon.id) >= v_coupon.max_uses THEN
    RETURN false;
  END IF;

  IF v_coupon.max_uses_per_customer IS NOT NULL AND
     (SELECT count(*) FROM coupon_redemptions r WHERE r.coupon_id = v_coupon.id AND r.cart_id = p_cart) >= v_coupon.max_uses_per_customer THEN
    RETURN false;
  END IF;

  INSERT INTO coupon_redemptions (coupon_id, cart_id) VALUES (v_coupon.id, p_cart);
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.get_coupon_public(text, text) FROM public;
REVOKE ALL ON FUNCTION public.redeem_coupon(text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_coupon_public(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_coupon(text, text) TO anon, authenticated;
