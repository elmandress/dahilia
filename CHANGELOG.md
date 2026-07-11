# Changelog — Dahila Crochet

## 2026-07-11 — Auditoría integral + rondas de mejora (mobile, CRO, OG, admin, medición, marketing)

Sesión de auditoría desde cero (código completo + base de producción + sitio
en vivo + build local) seguida de tres rondas de implementación. Todo
verificado con `lint` (0 warnings), `build` y smoke tests. Las decisiones de
fondo quedaron documentadas en `DECISIONES.md`.

---

### 🔒 Seguridad (auditoría — acción pendiente en dashboard)

- **Verificado en producción** que el hallazgo crítico de la auditoría del
  07/07 sigue abierto: signup de Supabase Auth habilitado + policies
  `TO authenticated USING (true)` en todas las tablas, incluidas las nuevas
  con PII (`subscribers`, `weaver_applications`, `coupons`). `is_admin()` y
  la tabla `admins` existen pero ninguna policy los usa todavía.
- Confirmado en vivo: `cart_items` (20 filas) y `favorites` legibles/escribibles
  con la anon key pública.
- **Acción requerida (no es código):** desactivar email signups + correr
  PASOS 2–3 de `database/schema-security-hardening.sql` ampliando el array a
  las tablas nuevas. Documentado en `DECISIONES.md`.
- Auditoría de headers en vivo: CSP, HSTS, X-Frame-Options, Referrer-Policy,
  Permissions-Policy correctos; CSP se auto-extiende a Umami/Clarity. Sin cambios.

### 🏗 Arquitectura (análisis con números — migración aprobada, no ejecutada)

- Descubierto que **todas las rutas públicas compilan como dinámicas**
  (`ƒ` en el build): `createClient()` → `cookies()` anula los
  `export const revalidate`. Medido: TTFB 450–980 ms, ~8–10 queries a
  Supabase por vista de PDP, 1 function invocation de Netlify por pageview,
  y la resiliencia "servir stale si la base cae" no operaba (sin caché, un
  error de DB = 500).
- Decisión documentada: migrar lecturas públicas a un cliente Supabase sin
  cookies + `revalidatePath` desde el admin (ronda dedicada, ~1 día). Los
  `revalidate` existentes quedan: reviven solos con la migración.

### 📱 Mobile UX

- **/tienda: fila de categorías rediseñada como carrusel full-bleed** con
  scroll-snap, scrollbar oculta y fade en el borde derecho — patrón
  Zara/COS/App Store. El chip cortado ahora cae en el borde físico de la
  pantalla (señal de "hay más"), nunca a mitad del contenido. El chip activo
  se auto-desplaza a la vista al aterrizar desde el mega-menú.
- `overflow-x: clip` global en `body`: ningún desborde accidental puede
  volver a convertirse en scroll horizontal de página (con `clip` y no
  `hidden` para no romper `position: sticky`).
- PDP en teléfonos: título 38px → 30px (≤480px) y gap de la columna de
  compra 20px → 16px (precio, talle y CTA juntos en el primer viewport).
- Logo del header: eliminado el hint contradictorio
  `fetchPriority="high"` + `loading="lazy"` que competía con el LCP real.
- `Chip` ahora expone `aria-pressed` y `white-space: nowrap`.

### 🛒 CRO / Conversión

- **Carrito con resumen sticky** (patrón COS/Mejuri): dos columnas en
  ≥900px — piezas a la izquierda, resumen en tarjeta sticky a la derecha
  (cupón → totales con divisor → nota de regalo → CTA a ancho completo →
  lista de espera → pasos). El total y el botón quedan siempre a la vista.
- **Barra fija inferior en mobile** para el carrito (total + "Coordinar"),
  mismo patrón que la barra sticky del PDP: una sola interacción aprendida.
- **PDP:** descripción movida ANTES del cross-sell (primero se termina de
  vender esta pieza); "Completá el look" con agregado de un toque para
  piezas de talle único (`+ Agregar · $X`, igual que "Sumale un detalle" del
  carrito) y subtítulo "viaja en el mismo envío".
- Navegación estacional: "Colecciones" (header y footer) aparece solo con
  colección publicada o teaser de drop — misma regla que ya tenía "Ofertas".
- Pendientes explícitos del embudo documentados en `DECISIONES.md` (reviews,
  pedido real, captura de contacto, recuperación, barra de envío gratis,
  garantía, datos de Umami).

### 🔍 SEO

- **Descripción de categoría renderizada bajo el H1** de `/tienda/[cat]`
  (patrón COS/Zara): copy indexable editable desde `/admin/categorias`;
  capada a 2 líneas en mobile. (El campo ya alimentaba el `<meta>`; ahora
  también se ve.)
- Verificado en vivo: sitemap con imágenes vía `/_next/image`, robots con AI
  bots, llms.txt, canonicals, JSON-LD de Product completo (shipping,
  returns, priceValidUntil). Confirmado que el mega-menú cubre el 100% de
  las categorías reales.
- Checklist sin código (pendiente, alto ROI): Search Console, Bing
  Webmaster, Google Merchant Center (UY soporta free listings; el JSON-LD ya
  es merchant-ready), Google Business Profile, Pinterest Business + claim.

### 🖼 Open Graph / tarjetas sociales

- **Bug real corregido:** los PDP y las categorías heredaban `twitter:title`
  genérico del layout y la `twitter:image` de la sección `/tienda` (la
  convención de archivo cascadea a segmentos hijos). En X/Discord/Slack un
  producto compartido mostraba la tarjeta genérica. Ahora ambas ramas de
  `generateMetadata` definen `twitter:*` explícito apuntando a la tarjeta
  del producto.
- **Nueva tarjeta OG de la home** (`src/app/og/route.tsx`): foto real del
  hero del CMS + marca + promesa, JPEG ~97 KB vía el mismo pipeline
  Satori→sharp de los productos. La heredan todas las páginas sin OG propio
  (antes: el logo). La URL de la bio de Instagram ahora comparte una prenda.
- Auditoría de longitudes: titles 59–62 chars, descriptions front-loaded,
  pesos 89–97 KB — dentro de los límites de WhatsApp/Meta.

### 📊 Analytics / Medición

- Embudo completado con los eventos que faltaban: `encargo_sent` (la venta
  "a medida" era invisible), `vip_subscribe` (footer), `search_select`
  (buscador del header), `look_add` (cross-sell del PDP).
- Sistema documentado en `DECISIONES.md`: Umami (embudo) + Clarity
  (sesiones/heatmaps), ya activos en producción; decisión explícita de NO
  instalar GA4/PostHog/Mixpanel/Hotjar a esta escala.
- Convención UTM fijada (bio/story/broadcast/email) — no cambiar sin migrar
  reportes.

### 📣 Marketing / Instagram

- **Nueva página `/ig`** — link-in-bio en el propio dominio (reemplaza
  Linktree): drop activo primero (solo si existe de verdad), "Lo nuevo" (4
  últimas piezas, la conexión reel→producto en un toque), enlaces grandes a
  tienda/encargo/tejedoras/WhatsApp. `noindex`, una columna, pensada para el
  navegador in-app de Instagram. Link para la bio:
  `https://dahila.uy/ig?utm_source=instagram&utm_medium=bio`.

### 🧑‍💼 Admin

- **Normalización visual completa a la paleta de marca:** eliminados ~100
  usos de grises genéricos (`#333/#444/#555/#666/#888/#999/#ccc/#ddd/#eee/
  #f5f5f5/#fafafa/#f8f8f8`) en `admin.css` + las 15 pantallas → escala ink
  (`#1F1A1B/#4A4143/#8C8285/#C9C2C4`), bordes `rgba(31,26,27,…)` y lienzo
  bone `#FCFAF6`. El panel deja de ser "gris web" y pasa a ser el mismo
  producto que la tienda. Sin cambios de layout: solo color.
- Editor de producto: **índice de anclas** (Información · Fotos · Talles ·
  Colores · Especificaciones), mismo patrón que Configuración — clave en el
  teléfono donde el formulario es una columna larga.
- Copy: títulos y botones normalizados a sentence case ("Fotos y videos",
  "Colores disponibles", "+ Agregar talle").

### ⚡ Performance / Higiene

- **`public/` de 21 MB → 2.3 MB:** borradas 7 fotos sin ninguna referencia
  (código, SQL y `site_settings` verificados) + `isotype-black.png` (814 KB,
  huérfano) + `.thumbnail` (WebP suelto trackeado en git).
- Imágenes usadas recomprimidas al estándar del pipeline de uploads:
  `detalle-tejido.jpg` 2.4 MB → 335 KB (mismo path — la referencia el CMS),
  `top-lace-parque` 819 KB PNG → 278 KB JPEG y `atelier-tejiendo` 463 KB →
  199 KB (referencias de código actualizadas).
- `favicon.svg` 296 KB → 28 KB (era un PNG de 512px embebido; regenerado a
  128px, más que suficiente para una pestaña).
- CSS muerto eliminado (`.prose`/`.prose-link`, nunca usados). Cero
  `console.log`, cero TODOs pendientes en `src/`.
- `.env.local` corregido: `EMAIL_FROM` apuntaba a un dominio de otro
  proyecto (`send.farodigital.uy`) — ahora coincide con el dominio
  verificado (el valor de producción vive en Netlify).

### 📚 Documentación

- **`DECISIONES.md` nuevo:** registro de decisiones (embudo pendiente,
  seguridad, ISR, checkout por WhatsApp, nav estacional, OG, /ig, UTM,
  medición, admin, imágenes) para que en seis meses se entienda por qué cada
  cosa quedó así.
- **`CHANGELOG.md` nuevo** (este archivo).
