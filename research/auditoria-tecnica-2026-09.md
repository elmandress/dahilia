# Auditoría técnica — rendimiento, SEO técnico y seguridad (2026-09-03/04)

Segunda ronda de la misma sesión que produjo `research/auditoria-mercado-producto-2026-09.md` (precios + UX + estadísticas). Esta ronda cubre terreno distinto: rendimiento, SEO técnico, seguridad de RLS/API y calidad de código. Método: 2 subagentes en paralelo, cada uno leyendo código real, SQL versionado en `database/*.sql`, y verificando contra `https://dahila.uy` con `curl` — nada de números de Lighthouse inventados, nada de RLS "probablemente cerrado" sin leer el SQL.

**Todo lo marcado "aplicado" abajo ya está en el working tree** (código y una migración SQL editada), pasado por `npm run lint` + `npm run build` limpios y un smoke test de rutas reales — sin commitear ni pushear.

---

## 0. Lo más urgente: los 8 artículos del blog dan 404 en producción, ahora mismo

Verificado con `curl` contra `https://dahila.uy` (no local): `/blog` sirve bien, con los 8 links correctos — pero cada uno de esos 8 links devuelve el 404 real del sitio, con cabecera `X-Nextjs-Prerender: 1` (o sea, generado y cacheado en build, no un error de runtime). `src/app/blog/[slug]/page.tsx` declara `dynamicParams = false` + `generateStaticParams()` correctamente, y usa la misma `getAllArticles()` que el hub (que sí funciona) — el código está bien. El síntoma apunta a que el build que Netlify tiene publicado ahora mismo no generó (o no publicó) los params de esta ruta anidada, aunque sí publicó el hub.

**No se puede arreglar desde acá**: no hay CLI de Netlify instalado ni variables `NETLIFY_*` en este entorno, y no se puede pushear para forzar un rebuild (instrucción explícita de esta sesión). **Acción para Mati/Anush**: entrar al panel de deploys de Netlify, confirmar que el deploy activo corresponde a `ecbb07d`/`b20f8e5`, y si el build se ve sano, forzar **"Clear cache and deploy site"** — la causa más probable es un artefacto de build cacheado que quedó desincronizado tras agregar la ruta de blog. Impacto mientras tanto: Search Console va a marcar las 8 URLs del sitemap como 404, y cualquier clic real desde redes a una nota rebota.

---

## 1. Rendimiento — hallazgos y fixes aplicados

### 1.1 Aplicado — `priority` en las primeras 4 tarjetas de `/tienda` y `/tienda/[categoría]`

La foto de la primera tarjeta del grid es el LCP real de la segunda página más visitada del sitio (35 sesiones), y no tenía ningún tratamiento de prioridad (`ProductCard.tsx` no aceptaba ese prop). El resto del sitio ya usaba el patrón correcto (`ProductGallery`, home, `colecciones/[slug]`) — solo faltaba extenderlo acá.

Se agregó un prop `priority?: boolean` a `ProductCard` (mapea a `fetchPriority="high" loading="eager"`, mismo patrón ya usado en el resto del código) y se pasa `true` a los primeros 4 productos de `TiendaClient.tsx` — en ambas grillas ("En stock" y la principal), con la lógica correcta para que la principal solo reciba prioridad cuando "En stock" no se muestra arriba (si no, se duplicaría el LCP real). Verificado en el HTML servido: exactamente 4 `<img>` de producto con `fetchPriority="high" loading="eager"`, ni uno más ni uno menos.

### 1.2 Aplicado — `not-found.tsx` ya no pega a Supabase en cada 404

Cada 404 real disparaba su propia consulta a `products`+`discounts` sin caché — la única página del sitio que no usaba `getCatalog()` (caché de 1h + fallback a snapshot), justo la página cuyo trabajo es recuperar rápido a alguien de un mal momento. Reemplazado por `getCatalog()`: mismo resultado visual, sin round-trip nuevo.

### 1.3 Aplicado — `sitemap.ts`, `merchant-feed.xml`, `llms.txt` ahora caen al snapshot si Supabase está caído

El resto del sitio ya sobrevive una caída de Supabase sirviendo `catalog-snapshot.json` (documentado, probado en la caída de cuota de julio) — pero estos 3 archivos, ante un error, devolvían: el sitemap sin un solo producto/categoría, el feed de Merchant Center vacío, y el bloque `## Catálogo` de `llms.txt` vacío. Los 3 ahora usan `getSnapshotData()` (ya existente, ya usado en `tienda/[slug]/page.tsx`) en su `catch`. `merchant-feed.xml/route.ts` se reestructuró para separar "traer datos (con fallback)" de "renderizar el XML", en vez de duplicar toda la lógica de armado de `<item>` dentro del catch.

### 1.4 Verificado correcto, sin cambios (no repetir el chequeo)

Convención de `quality` (82/90/95/100) respetada en el 100% de los 16 usos · `sizes` de `ProductCard` coincide exacto con el breakpoint real del CSS (720px) · `next.config.ts` (`deviceSizes`/`imageSizes`/`formats`) coherente con lo que se renderiza · cero componentes `'use client'` innecesarios (los 61 revisados tienen una razón real) · cero librerías pesadas sin tree-shaking · fuentes 100% vía `next/font`, sin duplicados · scripts de analítica con `next/script afterInteractive`, sin nada render-blocking · CLS controlado (hero con altura fija, cards/galería con `aspectRatio` reservado) · `netlify.toml`: el plugin de Netlify ya inyecta cache-control de 1 año en assets estáticos, no hace falta agregar nada.

### 1.5 Queda para una sesión futura (no urgente)

Unificar `/ofertas`, `/colecciones`, `/colecciones/[slug]`, `/ig` y `/carrito` a `getCatalog()` — 5 archivos con su propia consulta redundante, prolijidad y egress, no un riesgo de "desaparecer contenido" como el punto 1.3. Evaluar si vale un header explícito para `/_next/image*` en `netlify.toml` (ganancia marginal, evita una request de revalidación en visitas repetidas a la misma foto).

**Para medir de verdad** (no se puede desde este entorno, sin navegador headless): correr PageSpeed Insights contra `https://dahila.uy/` y `https://dahila.uy/tienda` — con el fix de 1.1 el LCP de `/tienda` debería bajar de forma medible.

---

## 2. Seguridad — hallazgos y fixes aplicados

### 🔴 CRÍTICO — corregido en el archivo SQL (sigue sin correr en producción)

`database/schema-security-hardening.sql` PASO 3 (que cambia las policies de "cualquier autenticado" a `is_admin()`) sigue **comentado, sin aplicar** — la memoria del proyecto ya marcaba esto como abierto desde julio. Esta ronda encontró algo más: **aunque se corra tal cual estaba, dejaba 4 tablas con PII afuera** (`coupons`, `coupon_redemptions`, `subscribers`, `weaver_applications` — agregadas un día después de escribirse el archivo de hardening y nunca incorporadas al array).

Se corrigió el array del PASO 3 para incluir las 4 tablas — pero **no fue tan simple como agregarlas**: al revisar los nombres reales de policy en `schema-cupones.sql` y `schema-tejedoras.sql`, 2 de las 4 (`coupon_redemptions`, `weaver_applications`) tienen su policy abierta original nombrada con un **espacio** ("Admin manage coupon redemptions", "Admin manage weaver applications"), no con guion bajo como el resto. El loop genérico arma el nombre a partir del nombre de tabla (con guion bajo) — si se las hubiera agregado sin más al array, el `DROP POLICY IF EXISTS` nunca habría encontrado la policy vieja, y correr el PASO 3 habría dejado **dos policies permisivas conviviendo** (la vieja abierta + la nueva con `is_admin()`) — como Postgres combina policies permisivas con OR, la tabla habría seguido abierta a cualquier autenticado pese a "correr el fix". Se agregaron 2 bloques `DROP`/`CREATE` explícitos con los nombres reales para esas 2 tablas, fuera del loop.

**El archivo sigue sin ejecutarse en producción** — es una corrección al plan, no un cambio de policies real todavía. Para que cierre el agujero de verdad, falta que Anush:
1. Confirme (PASO 2 del mismo archivo) que su `user_id` está en la tabla `admins`, para no bloquearse a sí misma.
2. Corra el PASO 3 corregido en el SQL Editor de Supabase.
3. Confirme en el dashboard de Supabase Auth si el signup público sigue abierto — determina si este hallazgo es explotable hoy (cualquiera se registra y ya es "admin" de estas tablas) o un riesgo latente (solo afecta a cuentas ya existentes).

### 🟠 ALTO — aplicado: rate-limit en los 3 endpoints públicos que no lo tenían

`POST /api/cart`, `POST /api/favorites` y `POST /api/orders` eran los únicos formularios/endpoints públicos del sitio sin `checkRateLimit`/`getClientIp` (todos los demás — encargo, tejedoras, cupón, ahora también `lib/subscribe.ts` — ya lo tenían). Sin cookie, cada POST a `/api/cart`/`/api/favorites` genera un `cart_id`/`fav_id` nuevo → una fila nueva sin tope; dado el historial del proyecto con la cuota de Supabase agotada, es un vector barato para repetir ese incidente. Se agregó rate-limit (40/min a cart y favorites, 10/min a orders — igual de generoso que el resto de formularios del sitio para no afectar uso real) y un tope `.slice(0, 30)` a `body.items` en `/api/orders` (no tenía ninguno).

### 🟡 MEDIO — documentado, no tocado: `redeem_coupon()` no valida que el carrito sea real

Ya identificado por el propio código (`api/coupon/route.ts`); el rate-limit existente (20/min) mitiga pero no elimina el riesgo de agotar a propósito el `max_uses` de un cupón. Arreglarlo de raíz (atar el canje a un pedido real de `orders`) es un cambio de esquema — decisión de Anush, no un parche chico.

### 🟢 BAJO — aplicado: `CRON_SECRET` con comparación de tiempo constante

`/api/cron/daily-summary` aceptaba el secreto por `?secret=` (puede quedar en logs de acceso) y comparaba con `===` (no constant-time). El único caller real (`.github/workflows/daily-summary.yml`) ya usa el header `Authorization: Bearer`, así que sacar el query string no rompe nada — confirmado antes de tocarlo. Ahora compara con `crypto.timingSafeEqual`.

### Verificado ya bien resuelto (no repetir el chequeo)

Admin protegido correctamente por `src/proxy.ts` en **todas** las rutas `/admin/*` (convención Next 16) · CSP coherente con lo que el sitio realmente carga, sin hosts de más ni de menos · cero claves hardcodeadas en `src/` · `/api/cart`/`/api/favorites` ya usan el cliente de servicio con filtro manual por cookie, correctamente · `/api/seo/reindex` ya exige sesión · las 3 funciones `SECURITY DEFINER` (`get_daily_summary`, `get_order_status`, `get_coupon_public`) solo exponen agregados o campos ya públicos · emails transaccionales con `escapeHtml()` consistente, sin riesgo de inyección.

---

## 3. Calidad de código — hallazgos y fixes aplicados

1. **Aplicado** — `ProductDetailsClient.tsx` recalculaba el precio final a mano (`Math.round((listPrice * (100 - discountPercent)) / 100)`) en vez de usar `getFinalPrice()`, ya centralizada y usada en el resto del archivo. Daba el mismo resultado hoy, pero quedaba frágil ante un cambio futuro de regla de redondeo. Reemplazado.
2. **Aplicado** — Duplicación letra por letra entre `QuickViewModal.tsx` y `ProductDetailsClient.tsx`: la selección de talle (arrancar en el primer talle disponible, no el primero de la lista) y la URL de WhatsApp de "avisame cuando vuelva". Extraído a `src/lib/product-selection.ts` (`useSizeSelection(product)` + `getRestockWhatsAppUrl(product, whatsappUrl)`), consumido por ambos archivos.
3. **Aplicado** — `lib/subscribe.ts` reinventaba su propio rate-limiter en vez de usar `lib/rate-limit.ts` (mismo algoritmo, código repetido). Ahora usa `checkRateLimit`/`getClientIp` como el resto del sitio.
4. **Verificado limpio, sin cambios**: cero `any` en `src/`, cero `console.log` de debugging, cero código muerto confirmado (se cruzaron imports incluidos los `next/dynamic` por string), manejo de errores consistente en Server Actions/API routes (los únicos `catch {}` vacíos son 2 casos benignos e intencionales, ya documentados en el propio código).

---

## 4. Qué queda pendiente, y de quién es la decisión

**De Anush/Mati (no se tocó sin su ok):**
- Confirmar el estado del deploy de blog en Netlify y forzar un rebuild limpio (§0) — **el más urgente**.
- Correr el PASO 0-3 de `schema-security-hardening.sql` (ya corregido) y confirmar el estado del signup de Supabase Auth (§2).
- Decidir si vale la pena rediseñar `redeem_coupon()` para atarlo a un pedido real (§2).
- Unificar las 5 rutas restantes a `getCatalog()` cuando haya una sesión dedicada (§1.5).

**Ya aplicado en el working tree**, verificado con `npm run lint`, `npm run build` y un smoke test de rutas reales (incluyendo `/api/cart`, `/tienda`, `/sitemap.xml`, `/merchant-feed.xml`, `/llms.txt`, un 404 real):
- `priority` en las primeras 4 tarjetas de `/tienda`/`/tienda/[categoría]`.
- `not-found.tsx` usando `getCatalog()`.
- Fallback a snapshot en `sitemap.ts`, `merchant-feed.xml`, `llms.txt`.
- Rate-limit en `POST /api/cart`, `POST /api/favorites`, `POST /api/orders` + tope de ítems en orders.
- `CRON_SECRET` con comparación constante, sin aceptar query string.
- Corrección del array de tablas (+ el bug de nombres con espacio) en el PASO 3 de `schema-security-hardening.sql`.
- `lib/subscribe.ts` usando el rate-limiter compartido.
- `getFinalPrice()` centralizado en `ProductDetailsClient.tsx`.
- Hook `useSizeSelection` + helper `getRestockWhatsAppUrl` compartidos entre PDP y QuickView.
