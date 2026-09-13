-- ============================================================
-- Textos de Configuración — auditoría total del 12/09/2026
-- ============================================================
-- Qué hace: corrige una errata en un texto de la home y deja PREPARADAS
-- (comentadas) dos mejoras de texto que decide Anush.
--
-- Idempotente: cada UPDATE solo toca la fila si todavía tiene el texto viejo
-- EXACTO. Si ya se cambió desde el admin (Configuración), no pasa nada.
--
-- Dónde se corre: SQL Editor de Supabase, en el proyecto de la TIENDA (no el
-- proyecto que ve el MCP). Orden: da igual, no depende de ningún otro SQL.
--
-- Después de correrlo: el sitio lo muestra en menos de 1 hora (caché del
-- catálogo), o al instante si se guarda cualquier cosa en Configuración.

-- 1) Título del paso 3 del proceso en la home: "Envio " (sin tilde y con un
--    espacio de más al final).
update site_settings
set value = 'Envío', updated_at = now()
where key = 'process_3_title' and value = 'Envio ';


-- 2) OPCIONAL — decide Anush. El paso 2 del proceso dice "Lana natural", pero
--    la mayoría de las piezas son de algodón y hay acrílico, lurex, chenille y
--    trapillo (verificado en la base el 12/09/2026). La tira de beneficios de
--    la home ya se corrigió en el código; este texto es de Configuración.
--    Versión sugerida, cierta para todo el catálogo (sacar los "--" para correrla):
--
-- update site_settings
-- set value = 'Algodón, lana y más, tejidos sin prisa. El plazo lo charlamos según el modelo.', updated_at = now()
-- where key = 'process_2_body' and value = 'Lana natural, sin prisa. El plazo lo charlamos según el modelo.';


-- 3) OPCIONAL — decide Anush. La pregunta frecuente "¿Cuánto tarda un
--    encargo?" hoy no responde cuánto tarda. Versión sugerida, que remite al
--    plazo real de cada ficha (no inventa números):
--
-- update site_settings
-- set value = 'Depende del modelo y de cuántos pedidos haya antes del tuyo: cada ficha muestra el plazo de ese momento. Te aviso cuando empiezo y cuando está listo, para que estés tranquila.', updated_at = now()
-- where key = 'faq_1_a' and value = 'Depende del modelo. Te aviso cuando empiezo y cuando está listo para que estés tranquila.';
