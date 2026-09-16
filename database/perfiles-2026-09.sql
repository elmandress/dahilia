-- ============================================================
-- Dahila Crochet · Perfiles oficiales (perfiles-2026-09.sql)
-- Supabase → SQL Editor → pegar TODO → Run. Se puede correr de nuevo sin
-- romper nada (pisa el valor anterior).
-- ============================================================
-- Qué hace: carga los links de las cuentas oficiales en Configuración →
-- Contacto. El sitio los declara en el JSON-LD (`sameAs`), que es como Google
-- y las IAs entienden que esas cuentas y dahila.uy son la misma marca. Al
-- 15/09/2026 solo estaban cargados Instagram y WhatsApp, y Google todavía
-- sugiere "Quizás quisiste decir: Dahlia Crochet" al buscar la marca.
--
-- Lo mismo se puede hacer sin SQL, desde el panel: /admin/configuracion →
-- Contacto. Este archivo existe para dejarlo hecho de una.
-- ============================================================

insert into site_settings (key, value) values
  ('tiktok_url',          'https://www.tiktok.com/@dahila.crochet'),
  ('pinterest_url',       'https://www.pinterest.com/dahilacrochetuy/'),
  ('google_business_url', 'https://share.google/N5lNiSKUAV0A2zjhz')
on conflict (key) do update
  set value = excluded.value, updated_at = now();


-- ── Falta uno, y no lo puedo completar yo ───────────────────────────────
-- `google_review_url`: el link para DEJAR una reseña. Se saca del Perfil de
-- Negocio de Google → "Pedir reseñas" (queda con la forma
-- https://g.page/r/.../review). Es el que usa dahila.uy/resena, el link corto
-- para mandar por WhatsApp después de entregar un pedido.
-- Cuando lo tengas, sacale los "--" a estas 3 líneas y corré de nuevo:
--
-- insert into site_settings (key, value) values ('google_review_url', 'PEGA_ACA_EL_LINK')
-- on conflict (key) do update set value = excluded.value, updated_at = now();
--
-- Recordatorio: nunca a cambio de un descuento ni de un regalo. Google lo
-- prohíbe y borra las reseñas que detecta así (política verificada 15/09/2026).
--
-- Nota sobre `google_business_url`: el link de share.google funciona para la
-- gente, pero si tenés el de Google Maps (el botón Compartir dentro de Maps,
-- queda como https://maps.app.goo.gl/...), es mejor: el sitio también lo usa
-- para declarar el mapa del negocio. Se cambia en Configuración → Contacto.

-- Para ver cómo quedó:
-- select key, value from site_settings
-- where key in ('tiktok_url', 'google_business_url', 'google_review_url', 'contact_instagram_url');
