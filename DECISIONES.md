# Decisiones de producto e ingeniería — Dahila Crochet

Registro de POR QUÉ las cosas quedaron como quedaron (rondas de auditoría y
mejora de julio 2026). Complementa al código: si dentro de seis meses algo
parece raro, primero buscar acá. El conocimiento de NEGOCIO (precios,
tejedoras, drops) vive en `/admin/estrategia` (`data.ts`) — acá va lo técnico
y de producto.

---

## Embudo de conversión — QUÉ FALTA (no considerar terminado)

El embudo NO se da por terminado hasta tener, en este orden aproximado:

1. **Reviews por producto** con `aggregateRating` en el JSON-LD (los 8
   testimonios existentes son la semilla; estrellas en Google + prueba social
   en el PDP, donde se decide la compra).
2. **Pedido real**: registrar la intención de compra como fila (snapshot del
   carrito) ANTES del salto a WhatsApp. Sin esto no hay conversión medible,
   ni ticket promedio, ni recompra, ni nada de lo que sigue.
3. **Captura previa de contacto** (email/WhatsApp opcional pre-checkout) —
   habilita la recuperación.
4. **Recuperación de carrito/pedido** (email a las 24–48 h; diseño en el
   Anexo C de `AUDITORIA-2026-07.md`).
5. **Barra de progreso de envío gratis** en carrito/drawer (hoy es una línea
   de texto; la barra visual es el patrón que mueve ticket).
6. **Garantía explícita** ("te acompaño hasta que te quede perfecta") como
   bloque de confianza junto al CTA — hoy está implícita en el copy.
7. **Datos reales de Umami** (mínimo 3–4 semanas de embudo completo) antes de
   la próxima ronda de CRO: optimizar sin datos es adivinar.

## Seguridad — estado y regla

- **PENDIENTE CRÍTICO (dashboard, no código):** desactivar "Enable email
  signups" en Supabase Auth y correr los PASOS 2–3 de
  `database/schema-security-hardening.sql` (con las tablas nuevas
  `subscribers`, `weaver_applications`, `coupons`, `coupon_redemptions`
  agregadas al array). Verificado abierto el 11/07/2026.
- **Regla permanente:** toda policy nueva se escribe con `public.is_admin()`,
  nunca `TO authenticated USING (true)`.
- `cart_items`/`favorites` quedan world-readable hasta migrar las route
  handlers a service_role (PASO 4 del mismo archivo).

## Arquitectura — ISR apagado a sabiendas (por ahora)

Todas las rutas públicas son dinámicas: `createClient()` llama `cookies()` y
eso anula los `export const revalidate`. Consecuencias medidas: TTFB
450–980 ms, ~8–10 queries a Supabase por vista de PDP, 1 function invocation
de Netlify por pageview, y sin caché no hay "servir stale si la base cae".
**Decisión:** migrar a un cliente Supabase SIN cookies para lecturas públicas
(+ `revalidatePath` desde los saves del admin) — aprobado en análisis,
**pendiente de ejecutar como ronda dedicada** (~1 día). Los `revalidate`
existentes se dejaron a propósito: reviven solos con la migración.

## Checkout por WhatsApp (no es deuda)

Decisión de producto, no limitación: el pago se coordina en conversación
(transferencia/Mercado Pago) porque el producto es a medida y la charla ES
parte de la venta. La evolución prevista no es un checkout online sino un
link de pago de Mercado Pago DENTRO de la conversación.

## Navegación estacional

"Ofertas" y "Colecciones" aparecen en header/footer SOLO cuando hay contenido
real detrás (descuentos vigentes / colección publicada o teaser de drop).
Un ítem permanente hacia una página "pronto…" entrena a ignorar la nav.
Implementado en `layout.tsx` (`showOfertas`, `showColecciones`).

## Open Graph

- Los PDP definen `twitter:*` explícito porque la convención de archivo
  `twitter-image.tsx` de `/tienda` cascadea a los segmentos hijos y pisaba la
  tarjeta del producto en X/Discord/Slack.
- Las tarjetas sociales se sirven como **JPEG vía sharp** (`/og` y
  `/tienda/[slug]/og`): Satori solo emite PNG (~915 KB) y WhatsApp descarta
  imágenes OG pesadas.
- La tarjeta de la home usa la foto real del hero del CMS: un share con
  prenda vende más que un isotipo.

## /ig — link-in-bio propio

Reemplaza a un Linktree: mismo dominio (cero fuga), branding intacto y el
embudo completo queda medible en Umami. `noindex` (es utilidad de navegación,
no landing SEO). Link canónico para la bio:
`https://dahila.uy/ig?utm_source=instagram&utm_medium=bio`.

## Convención UTM (no cambiar sin migrar los reportes)

- Bio de Instagram → `?utm_source=instagram&utm_medium=bio`
- Stories/link sticker → `?utm_source=instagram&utm_medium=story`
- Difusión de WhatsApp → `?utm_source=whatsapp&utm_medium=broadcast`
- Email (Resend/Brevo) → `?utm_source=email&utm_medium=<flujo>`

## Medición

Umami (embudo por eventos) + Clarity (grabaciones/heatmaps), activos en
producción. **No instalar GA4/PostHog/Mixpanel/Hotjar**: duplican esto con
más fricción (banner de cookies, peso) a esta escala. Eventos canónicos:
`product_view → add_to_cart → order_sent` (venta por carrito),
`encargo_sent` (venta a medida), más `whatsapp_click`, `search_select`,
`look_click`, `look_add`, `cart_addon_add`, `vip_subscribe`. `order_sent` es
el proxy de venta hasta que exista el pedido real.

## Panel admin

El lienzo y los grises usan SOLO la paleta de marca (bone `#FCFAF6` + escala
ink). No reintroducir grises genéricos (`#888`, `#ddd`, `#f5f5f5`…): fueron
normalizados a propósito en julio 2026. Formularios largos llevan índice de
anclas (patrón de Configuración y el editor de producto).

## Imágenes estáticas

`public/` guarda solo lo referenciado (código o `site_settings`), comprimido
a ≤1600px JPEG q82–85 — mismo estándar que el pipeline de uploads
(`prepareImageForUpload`). Antes de borrar una foto de `public/photos/`,
verificar también los valores de `site_settings` (el CMS puede apuntar ahí).
Los originales pesados viven fuera del repo (`assets/`, `uploads/` —
gitignorados).
