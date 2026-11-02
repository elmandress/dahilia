-- Meta: con qué clic de anuncio se hizo cada pedido (02/11/2026).
--
-- La venta cierra por WhatsApp, así que el píxel de Meta nunca ve una compra.
-- Al registrar el pedido, /api/orders guarda las cookies de Meta (_fbp, _fbc)
-- y el navegador; cuando Anush lo marca "vendido" en /admin/pedidos, la compra
-- se le avisa a Meta atada a ese clic (src/app/api/admin/meta-compra).
--
-- Sin esta migración el sitio sigue andando igual: /api/orders reintenta sin
-- estas columnas y la compra simplemente no se puede atribuir.
--
-- Idempotente: se puede correr más de una vez. Correr en el SQL Editor de
-- Supabase (el proyecto de la tienda, no el que ve el MCP).

ALTER TABLE orders ADD COLUMN IF NOT EXISTS meta_fbp text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS meta_fbc text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS client_ip text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS client_user_agent text;

-- La IP y el navegador solo sirven para que Meta reconozca a la persona
-- durante los 7 días en que acepta el evento: después se borran solos con
-- esta función, que corre el reloj diario si existe pg_cron. Si no está
-- habilitado, no pasa nada (el bloque lo saltea).
CREATE OR REPLACE FUNCTION limpiar_datos_meta_pedidos() RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE orders
     SET client_ip = NULL, client_user_agent = NULL
   WHERE created_at < now() - interval '8 days'
     AND (client_ip IS NOT NULL OR client_user_agent IS NOT NULL);
$$;
REVOKE ALL ON FUNCTION limpiar_datos_meta_pedidos() FROM PUBLIC, anon, authenticated;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname = 'limpiar-datos-meta-pedidos';
    PERFORM cron.schedule('limpiar-datos-meta-pedidos', '15 4 * * *', 'SELECT limpiar_datos_meta_pedidos()');
  END IF;
END $$;

-- Verificación: las 4 columnas tienen que aparecer.
-- SELECT column_name FROM information_schema.columns
--  WHERE table_name = 'orders' AND column_name IN ('meta_fbp','meta_fbc','client_ip','client_user_agent');
