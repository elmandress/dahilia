# Auditoría SEO técnico + rendimiento — 2026-09-12

Área: SEO técnico por tipo de página + rendimiento (TTFB, JS, imágenes, caché/ISR). Auditor de solo lectura, working tree (commits sin pushear del 12/09: perfiles de marca en JSON-LD + alt automático de fotos). Producción (`https://dahila.uy`) corre `a0e3b91`.

Método: código (`archivo:línea`) + `curl` contra HTML en vivo de producción + docs oficiales de Google. Cero volúmenes de búsqueda inventados. No se repite lo ya confirmado en `research/auditoria-tecnica-2026-09.md` y `research/_seo-ranking-2026-09.md` salvo para verificar que sigue así.

**Informe completo** (continuación de una sesión anterior cortada por límite de uso — retomado y terminado el 13/09/2026).

---

## 0. Calibración del Lighthouse

`environment.benchmarkIndex` = **785.5** en las 5 corridas (misma máquina). Lighthouse mobile usa **throttling simulado** (`throttlingMethod: "simulate"`, `cpuSlowdownMultiplier: 4`, RTT 150 ms, 1.6 Mbps down) — el 4x de CPU es fijo por config (emula un gama-media), no depende del benchmarkIndex de la máquina que corrió la auditoría; el benchmarkIndex solo se usa para *ajustar* la simulación, y 785 es una máquina de gama media (ref: Lighthouse considera <750 "lenta" para desktop; en un runner mobile no hay tabla oficial, pero no es un outlier que infle el TBT de forma anómala). **Conclusión: el TBT de 1,8-4,0 s no es un artefacto de máquina lenta — es representativo de un modem 4G real con un teléfono de gama media.** No hace falta relativizarlo a la baja.

---

## Hallazgos

### R-01 — Todas las páginas — Clarity está roto por la CSP: 2 errores de consola en cada carga

**Qué pasa:** los "2 errores de consola" que Lighthouse marca en las 5 páginas (buenas prácticas 73/100) son siempre los mismos dos, y ambos son Microsoft Clarity bloqueado por el propio `Content-Security-Policy` del sitio:
1. `img-src` bloquea `https://c.clarity.ms/c.gif` (el beacon de Clarity).
2. `script-src` bloquea `https://scripts.clarity.ms/0.8.69/clarity.js` (el script real de tracking que carga el loader).

**Causa (archivo:línea):** `next.config.ts:26-35`. `ClarityScript.tsx:18` inyecta un loader que hace `t.src="https://www.clarity.ms/tag/"+ID` — ese primer script SÍ está permitido (`script-src` incluye `https://www.clarity.ms`, línea 29/38). Pero ese loader carga internamente el script real desde el subdominio `scripts.clarity.ms`, que la CSP **no** incluye (solo agregó el host exacto `www.clarity.ms`, no `*.clarity.ms`, a `script-src`). Y `img-src` (línea 40) nunca se tocó cuando se agregó Clarity: sigue siendo `'self' blob: data: https://*.supabase.co` sin ningún host de Clarity, así que el beacon de imagen que usa Clarity como fallback también se bloquea.

**Evidencia:**
- `errors-in-console` de los 5 JSON de Lighthouse: mismos 2 mensajes en home/tienda/ficha/carrito/encargo (`source: security`, CSP violation).
- CSP real en producción (`curl -sD - https://dahila.uy/ | grep -i content-security-policy`, 12/09): `script-src 'self' 'unsafe-inline' https://www.clarity.ms https://www.googletagmanager.com; ... img-src 'self' blob: data: https://*.supabase.co; ...` — confirma que ni `scripts.clarity.ms` ni ningún host de Clarity está en `img-src`.

**Impacto:** alto para la calidad del dato, no para el usuario (no rompe nada visible). Esto **contradice la memoria `medicion-umami-clarity` ("Umami + Clarity CONFIRMADOS activos", verificado 13/07)**: puede que en julio la CSP fuera más laxa o Clarity usara otro subdominio; hoy, en producción, **Clarity no está grabando sesiones** — el script de tracking nunca llega a ejecutarse. Cualquier decisión tomada mirando grabaciones de Clarity "recientes" debería re-verificarse.

**Esfuerzo:** bajísimo — 2 líneas en `next.config.ts`.

**Clasificación: (A) aplicar ya.** Fix concreto:
```
// línea 29, script-src:
clarityEnabled ? 'https://*.clarity.ms' : '',   // en vez de 'https://www.clarity.ms'
// línea 40, img-src — agregar el host de Clarity cuando está habilitado:
img-src 'self' blob: data: https://*.supabase.co${clarityEnabled ? ' https://*.clarity.ms' : ''};
```
**Trade-off:** ninguno real — `*.clarity.ms` es el propio dominio de Microsoft, ya confiado para `connect-src` (línea 33) por el mismo motivo. Único cuidado: correr `npm run build` y confirmar que el header generado no rompe el resto de la CSP (formato de `cspHeader.replace(...)`).

---

### R-02 — `/carrito` (estado vacío) — CLS 0,455: el fetch del carrito se difiere a propósito y el salto es enorme

**Qué pasa:** Lighthouse mide CLS 0,455 en `/carrito` (vs. 0,000-0,031 en el resto). El `layout-shifts` audit del JSON aísla un único elemento responsable de casi todo el puntaje (0,413 + 0,043 en dos shifts): `body > main#contenido > div > div`, la sección **"Algunas piezas que te pueden gustar"** del estado de carrito vacío (`snippet: <div style="margin-top: 64px;">`, altura 2263 px).

**Causa, con la cadena completa:**
1. `src/components/CartProvider.tsx:98` — `isLoading` arranca en `true` para **todas** las páginas (el carrito vive en el layout raíz).
2. `src/components/CartProvider.tsx:134-155` — el primer fetch a `/api/cart` se **difiere a propósito** con `requestIdleCallback` (timeout 2000 ms) o `setTimeout(400ms)` de fallback — comentario explícito: "so the first paint of the home page doesn't compete with a request the visitor probably won't use yet". Tiene sentido en home/tienda/ficha (el carrito es un badge del header), pero en `/carrito` el propio fetch diferido es el que decide **el contenido principal de la página**.
3. `src/app/carrito/CarritoClient.tsx:277-295` — mientras `isLoading`, se muestra un skeleton chico (~250 px: 2 líneas + 2 tarjetas fantasma).
4. `src/app/carrito/CarritoClient.tsx:297-364` — al resolver (carrito vacío, que es el caso de cualquier visita sin cookie `dahila_cart_id`, incluida la auditoría de Lighthouse en un contexto limpio), se reemplaza TODO por el estado vacío + grilla de 4 productos sugeridos (`featuredProducts`, ya cargados server-side en `src/app/carrito/page.tsx:17-27`, sin necesidad de ningún fetch de cliente).

El salto es real para visitantes reales, no solo para el lab: cualquiera que entre a `/carrito` sin haber agregado nada antes (primer clic al ícono del carrito, o un link directo) pasa por el mismo skeleton chico → salto grande.

**Evidencia:** `audits['layout-shifts'].details.items` de `carrito.json` (extraído con `node -e`, ver arriba); línea de código citada arriba.

**Impacto:** medio-alto (CLS es señal de Core Web Vitals y de UX real; además es la página donde ocurre justo antes de la conversión).

**Clasificación: (A) aplicar ya, con alcance acotado.** El dato que causa el salto (`featuredProducts`) YA está disponible en el primer render server-side, sin depender de `isLoading`. Fix de bajo esfuerzo: sacar el bloque "Algunas piezas que te pueden gustar" de adentro del `if (items.length === 0)` y renderizarlo **siempre**, en un contenedor de altura estable, inmediatamente debajo del área que sí cambia (skeleton → título "Está vacío" / "Tu carrito"). Así el salto se reduce a la diferencia entre un skeleton chico y un título+CTA (decenas de píxeles, no ~2000).

**Trade-off (R-02):** no elimina el CLS al 100% (sigue habiendo un salto chico entre skeleton y título real), y si el carrito NO está vacío, hay que decidir si la grilla de sugeridos se sigue mostrando arriba de los ítems reales o se oculta — hoy solo aparece en el estado vacío. La solución completa (SSR de los ítems reales del carrito, leyendo la cookie `dahila_cart_id` en `src/app/carrito/page.tsx` con el mismo patrón que ya usa `src/app/api/cart/route.ts:52-62`) eliminaría el CLS del todo, pero **tiene un costo real**: hoy `/carrito` usa el cliente sin cookies (`@/lib/supabase/public`, ver `src/lib/supabase/public.ts`) y por eso ES la única página del embudo con TTFB de 57 ms (servida cacheada); leer `cookies()` ahí la volvería dinámica en cada visita (mismo mecanismo que ya mató el ISR de `/tienda`, ver R-03) — pasaría de 57 ms cacheados a un render por visita. Es una decisión de trade-off (velocidad de carga vs. CLS perfecto), no algo para aplicar sin decidir → esa parte queda **(B)**, para decidir con Mati.

---

### R-03 — `/tienda` — por qué es la única ruta dinámica del catálogo, y cómo arreglarlo sin tocar los filtros

**Qué pasa:** `curl` (medido antes de esta sesión) muestra `/tienda` con `Cache-Status: "Netlify Durable"; fwd=bypass` — se renderiza en cada visita (5,25 s en frío, 0,64-1,03 s después) — mientras `/tienda/cardigans` (misma familia de datos, mismo `getCatalog()`) se sirve cacheada en 0,51-0,72 s.

**Causa (archivo:línea):** `src/app/tienda/page.tsx:25-30` declara `searchParams: Promise<...>` y hace `await searchParams`. Leer `searchParams` en un Server Component es una Dynamic API — opta a la ruta entera fuera del prerender (doc oficial: `node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md`, sección Dynamic Rendering). `src/app/tienda/[slug]/page.tsx:20-28,536-539` tiene el fix ya aplicado y **documentado en su propio comentario**: evita declarar `searchParams` a propósito, precisamente para poder usar `generateStaticParams()` y quedar ISR.

**Lo importante — el filtro NO necesita este dato en el servidor:** `src/app/tienda/TiendaClient.tsx:115-133,205-219` recibe `initialProducts` = el catálogo **completo sin filtrar** (`src/app/tienda/page.tsx:108`, mismo array pase lo que pase en `searchParams`) y hace TODO el filtrado en el cliente con `useState`/`useMemo` (líneas 205-219, 327-364). Los `searchParams` del servidor solo se usan para inicializar en qué valor arranca cada `useState` (`initialFilter`, `initialSearch`, etc., pasados como props) — es decir, se paga "toda la ruta dinámica" únicamente para que el chip de categoría aparezca ya marcado en el primer HTML, sin cambiar qué datos se piden ni dónde se filtra.

**Evidencia:** doc oficial citada arriba + `curl` (Cache-Status) + lectura de `TiendaClient.tsx` confirmando que el filtrado es 100% cliente.

**Impacto:** alto — es la segunda página más visitada (35 sesiones según la auditoría del 03/09) y la única sin caché de borde; cada visita consume una function invocation de Netlify (ver memoria `isr-muerto-rutas-dinamicas`) en vez de servirse gratis desde el CDN.

**Clasificación: (A) aplicar ya**, con el patrón que la propia documentación de Next recomienda para este caso exacto (`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-search-params.md:80-86`, sección "Prerendering"): mover la lectura de `searchParams` DENTRO de `TiendaClient` (que ya es `'use client'`) usando el hook `useSearchParams()` en vez del prop server-side, envuelto en `<Suspense>`. Cita textual de la doc: *"If a route is prerendered, calling `useSearchParams` will cause the Client Component tree up to the closest Suspense boundary to be client-side rendered... this allows a part of the route to be prerendered while the dynamic part that uses `useSearchParams` is client-side rendered."* Con eso, `src/app/tienda/page.tsx` deja de declarar `searchParams` (igual que ya hace `tienda/[slug]/page.tsx`), vuelve candidata a ISR con `revalidate = 3600` (ya declarado en línea 11), y el JSON-LD (`collectionJsonLd`, líneas 52-97) se sigue generando igual porque no depende de `searchParams`.

**Trade-off:** el chip de filtro activo pasaría de "ya marcado en el HTML servido" a "se marca al hidratar" — con `useState(() => …)` leyendo `useSearchParams()` en el render inicial del cliente (parte del mismo ciclo de hidratación, antes de que el usuario vea nada distinto), el efecto visual debería ser imperceptible, pero hay que verificarlo visualmente tras aplicar (y confirmar que no rompe compartir `/tienda?cat=cardigans` desde Instagram). Esfuerzo: medio (tocar `page.tsx` + envolver en `Suspense`).

---

### R-04 — Todas las páginas — `CartDrawer` recibe el catálogo completo con joins anidados en cada carga (el payload RSC más pesado del HTML)

**Qué pasa:** el HTML de `/` pesa 312 KB sin comprimir (69,7 KB gzip — `curl -H "Accept-Encoding: gzip" -o /dev/null -w '%{size_download}' --compressed https://dahila.uy/`, 12/09) y de eso, **197 KB son 16 bloques `self.__next_f.push([...])`** (el mecanismo de React 19 Server Components para mandarle al cliente los props de árboles que van a hidratarse). Un solo bloque tiene **113.972 caracteres** — más de un tercio del documento entero — y contiene, contado por campo: 37 ocurrencias de `base_price_uyu` (una por producto activo) y 101 URLs de `storage/v1/object/public` (fotos de Supabase). Dividiendo por esos 37 productos da **~3 KB de JSON por producto**, embebido en el HTML de **todas** las páginas del sitio (`/`, `/tienda`, la ficha, `/carrito`, `/encargo` — mismo layout raíz).

**Causa (archivo:línea):** `src/app/layout.tsx:163,271` — `const catalog = await getCatalog()` trae el catálogo con `select('*, category:categories(*), media:product_media(*), sizes:product_sizes(*), colors:product_colors(color:colors(*))')` (definido en `src/lib/catalog.ts`), y la línea 271 lo pasa **completo, sin recortar**: `<CartDrawer products={catalog.products} />`. `Header` (línea 260-266), en cambio, solo recibe `categories` (slug+label) y un `readyToShipCount` numérico — la fuga es específicamente `CartDrawer`.

**Para qué lo usa `CartDrawer`, y qué le sobra:** `src/components/CartDrawer.tsx:65-66` pasa `products` a `pickAddonSuggestions()`. Esa función (`src/lib/addons.ts:11-31`) filtra y ordena usando **solo 6 campos escalares**: `id`, `is_custom_only`, `base_price_uyu`, `category_id`, y los campos de descuento que consume `getFinalPrice()` — nunca toca `media`, `sizes` ni `colors` para filtrar. Esos arrays anidados (los que inflan cada producto a ~3 KB) solo se necesitan para los 3 productos que finalmente se muestran como sugerencia (`getPrimaryPhoto`) — no para los 37 candidatos que se escanean.

**Evidencia:** medido con `node -e` sobre el HTML en vivo de `https://dahila.uy/` (ver conteos arriba); lectura de `layout.tsx`, `CartDrawer.tsx` y `addons.ts` citada.

**Impacto:** alto — es carga que paga **cada visita a cada página**, no solo quien abre el carrito. Explica en buena parte el tiempo de CPU que Lighthouse atribuye al documento HTML mismo (2,7 s en `/`, 2,8 s en `/tienda`, 2,7 s en la ficha — la fila "el documento HTML mismo gasta 1,9-3,2 s" del enunciado): React tiene que deserializar y reconstruir en el cliente 37 objetos completos con arrays anidados solo para que `pickAddonSuggestions` los vuelva a filtrar a 3.

**Clasificación: (A) aplicar ya.** Fix concreto: en `src/app/layout.tsx`, construir un array liviano antes de pasarlo —
```ts
const addonCandidates = catalog.products.map(p => ({
  id: p.id, slug: p.slug, name: p.name, category_id: p.category_id,
  is_custom_only: p.is_custom_only, base_price_uyu: p.base_price_uyu,
  discount_percent: p.discount_percent, discount_active: p.discount_active,
  photo: getPrimaryPhoto(p), // string, no el array `media` completo
}))
```
y pasar `<CartDrawer products={addonCandidates} />`, ajustando el tipo que espera `pickAddonSuggestions`/`CartDrawer` (hoy pide `Product[]` completo — cambiar a un tipo `AddonCandidate` más chico, o a un `Pick<Product, …>` con `photo` agregado). Reduce el payload de ~3 KB/producto a un puñado de escalares + 1 URL corta (~200-300 B/producto), un recorte estimado de ~85-90 KB del HTML de cada página.

**Trade-off:** hay que tocar la firma de `pickAddonSuggestions` (usada también por `CarritoClient.tsx`, que hoy le pasa `featuredProducts: Product[]` completo — mismo problema ahí, en menor escala porque son 24 productos, no 37, y solo en `/carrito`) y el tipo de `CartDrawer`'s prop — no es un cambio de una sola línea, pero es mecánico y bajo riesgo (no cambia ningún dato mostrado, solo qué se transporta). Verificar con el patrón de imagen: `getPrimaryPhoto` ya existe en `src/lib/types.ts` y ya se usa así en el propio `CartDrawer` para renderizar la sugerencia final.

---

### R-05 — Ficha de producto — LCP 7,3 s: la imagen principal ya está bien priorizada, pero pesa 162 KB y Netlify sirve WebP en vez de AVIF a Chrome real

**Qué pasa:** el `lcp-discovery-insight` de `ficha.json` da **score 1** (perfecto): la imagen de `Spring cardigan` ya tiene `fetchPriority="high" loading="eager"`, es descubrible en el HTML inicial y usa `sizes="(max-width: 720px) 100vw, 640px"` correcto. El problema no es la prioridad — es el peso: `lcp-breakdown-insight` reparte los 7,3 s en TTFB 422 ms + resource load **delay** 43 ms + resource load **duration 1500 ms** (el subpart más grande) + render delay 682 ms. La imagen (`spring-cardigan-dahila-crochet-8gjc.jpg?w=750&q=90`) transfiere **162.586 bytes** — la request más pesada de toda la página (coincide con el "159 KB" del resumen).

**Hallazgo adicional (verificado con curl, no estaba en el resumen):** con el `Accept` header exacto que manda Chrome para imágenes (`image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8`), la misma URL devuelve `Content-Type: image/webp` — **no AVIF**, pese a que `next.config.ts` declara `formats: ['image/avif', 'image/webp']` (AVIF primero). Pidiendo `Accept: image/avif` a secas, la misma URL SÍ devuelve `image/avif` — confirma que el servidor **puede** generarlo, pero no lo elige cuando el header trae ambos formatos como en un navegador real:
```
curl -sD - -o /dev/null -H "Accept: image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8" \
  "https://dahila.uy/_next/image?url=...&w=750&q=90"  →  Content-Type: image/webp
curl -sD - -o /dev/null -H "Accept: image/avif" \
  "https://dahila.uy/_next/image?url=...&w=750&q=90"  →  Content-Type: image/avif
```
La doc oficial de Next (`node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md:743-745,772`) dice: *"Next.js automatically detects the browser's supported image formats via the request's Accept header... If the Accept header matches more than one of the configured formats, the first match in the array is used"* y **"If you self-host with a Proxy/CDN in front of Next.js, you must configure the Proxy to forward the Accept header."** Este sitio corre en Netlify vía `@netlify/plugin-nextjs`, que intercepta `/_next/image` con su propio servicio de imágenes (headers de respuesta `Netlify-Vary: ...,header=Netlify-Image-Accept`, `Cache-Status: "Netlify Edge"` — no son headers de Next) — la negociación de formato la hace **Netlify**, no el código de este repo, y con un Accept header realista de navegador está sirviendo WebP en vez de AVIF (que la propia doc de Next cita como ~20% más chico).

**Impacto:** medio. AVIF real podría bajar esos 162 KB a un estimado de ~130 KB (20% según la doc de Next) — en la conexión simulada (1,6 Mbps down) son unos 150-200 ms menos en el subpart que más pesa del LCP. No es la causa principal de los 7,3 s, pero es un desperdicio gratis si se puede activar.

**Clasificación: (B) — necesita verificar con la plataforma, no es un fix de código en este repo.** `next.config.ts` ya está configurado correctamente (`formats: ['image/avif', 'image/webp']`, línea 74); el comportamiento observado depende de cómo `@netlify/plugin-nextjs`/Netlify Image CDN interpreta el `Accept` header, algo que no se controla desde `next.config.ts` ni desde el código de la app. Acción concreta para Mati: revisar la versión de `@netlify/plugin-nextjs` en `package.json` (puede haber un fix en una versión más nueva) y/o abrir un ticket a soporte de Netlify con el `curl` de arriba como repro. **No es urgente** — WebP sigue siendo un formato moderno y bien comprimido; esto es una optimización marginal, no un bug que rompa nada.

---

### R-06 — Home — LCP 5,5 s: el "element render delay" (1,5 s) es la imagen esperando a que el hilo principal se libere, no la descarga

**Qué pasa:** a diferencia de la ficha, en `/` el subpart más grande del LCP es **`elementRenderDelay`: 1543,7 ms** (TTFB 390 ms + resource load delay 52 ms + resource load duration 616 ms + **render delay 1544 ms**). La imagen del hero (`fetchPriority="high"`, discoverable, sin lazy-load — mismo score 1 que en la ficha) YA está descargada a los ~1 s; lo que tarda es que el navegador la **pinte**, porque el hilo principal está ocupado con otra cosa.

**Relación con R-04:** esto es consistente con el hallazgo de arriba — el mismo documento que contiene la imagen del hero trae ~197 KB de payload RSC (`self.__next_f.push`), con un solo bloque de 114 KB que es el catálogo completo (37 productos con joins anidados) para `CartDrawer`. Deserializar y reconciliar ese árbol en React consume el hilo principal exactamente en la ventana en la que el navegador, si estuviera libre, pintaría la imagen ya descargada. El propio enunciado de esta auditoría ya había ubicado "el documento HTML mismo gasta 1,9-3,2 s de CPU" como sospechoso — este dato lo conecta directamente con el LCP.

**Evidencia:** `lcp-breakdown-insight` de `home.json` (extraído arriba) + R-04.

**Impacto:** alto, pero es el mismo esfuerzo que R-04: no es un fix aparte, es la métrica que **confirma por qué vale la pena** achicar el payload de `CartDrawer`. No se propone una acción nueva acá — se prioriza R-04 más arriba en el top-5 justamente por este dato.

**Clasificación:** ver R-04 (misma causa, mismo fix).

---

### R-07 — Todas las páginas — el token de texto secundario `ink500` (#8C8285) no cumple contraste AA, y es la causa de (casi) todas las fallas de accesibilidad

**Qué pasa:** accesibilidad 96/100 en las 5 páginas, con `color-contrast` fallando en 10 a 46 nodos por página (120 nodos en total entre las 5 corridas). Extrayendo el color de cada nodo fallido (`audits['color-contrast'].details.items`, los 5 JSON) el resultado es **siempre el mismo color: `#8C8285` / `rgb(140, 130, 133)`** — ni un solo nodo fallido usa otro color.

**Qué es:** `#8C8285` es el token `ink500` del design system — `src/app/globals.css:37` (`--ink-500: #8C8285;`) y `src/components/ui/Primitives.tsx:25` (`ink500: '#8C8285'`), fuente única de verdad reusada en **31 archivos / 109 usos** del storefront (eyebrows, timestamps, "Talle: X", notas de plazo, contadores, placeholders de búsqueda — siempre como `color:` de texto de 10 a 13px, nunca como fondo).

**Contraste calculado (fórmula WCAG 2.x, relative luminance):** `#8C8285` sobre blanco (`#FFFFFF`) o `cream50` (`#FFFBF2`, el fondo real de la mayoría de estas superficies) da **≈3,7:1**. WCAG 2.1 SC 1.4.3 exige **4,5:1** para texto normal (todo lo flagged acá es texto de 10-13px, muy por debajo del umbral de "texto grande" de 18px/14px-bold que se conforma con 3:1) — referencia: `https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html`.

**Evidencia:** `node -e` sobre los 5 JSON de Lighthouse (conteo por color, arriba) + cálculo de luminancia relativa manual + grep de `ink500` en el repo.

**Impacto:** medio-alto. Es una sola causa detrás de prácticamente el 100% de los hallazgos de accesibilidad del sitio, y toca elementos de uso frecuente (talles, plazos de entrega, contador de "en stock") — texto que además cumple un rol informativo real, no puramente decorativo.

**Clasificación: (B) — necesita el ok de Anush/Mati, aunque el fix es de una sola línea.** Como es un *design token* de fuente única, el arreglo técnico es trivial (cambiar el valor en `globals.css:37` y `Primitives.tsx:25` alcanza para corregir los 31 archivos a la vez, sin tocarlos uno por uno). El motivo para no marcarlo (A) directo: los únicos tokens **ya existentes** en la paleta más oscuros que `ink500` son `ink700` (`#4A4143`, contraste ≈9,9:1 contra blanco — cumple de sobra, pero es un salto grande de "gris quieto" a "casi negro") e `ink900` (el texto principal, demasiado oscuro para una etiqueta secundaria). No hay un `ink600` intermedio (~4,7-5:1) en la paleta hoy — inventar un valor nuevo contradice la regla de la skill `dahila-storefront` ("use tokens existentes, no inventes valores"), así que la resolución real es una decisión de diseño: **(a)** aceptar `ink700` para texto secundario (cumple AA, pero cambia el peso visual del sitio entero) o **(b)** que Anush/Mati definan un tono intermedio nuevo. Cualquiera de las dos es una sola línea de código una vez decidida — por eso el esfuerzo es bajo pese a la clasificación (B).

---

### R-08 — Todas las páginas — Google Analytics con `afterInteractive`: ya está bien, no diferir a `lazyOnload`

**Qué pasa:** el pedido de esta auditoría era evaluar si `GoogleAnalyticsScript.tsx` (171 KB, la request más pesada de las 5 páginas) conviene diferirla con `strategy="lazyOnload"` en vez de `afterInteractive`.

**Verificado contra la doc oficial:** `node_modules/next/dist/docs/01-app/03-api-reference/02-components/script.md:162-185` — Next dice explícitamente que `afterInteractive` (la que ya usan `GoogleAnalyticsScript.tsx:18` y `ClarityScript.tsx:15`) **"should be used for any script that needs to load as soon as possible but not before any first-party Next.js code"**, y lista como ejemplos concretos recomendados para esa estrategia: *"Tag managers"* y *"Analytics"*. `lazyOnload` (línea 186-188) está documentada para *"Chat support plugins"* y *"Social media widgets"* — no para analítica, precisamente porque diferirla a "cuando el navegador está idle" puede perder sesiones cortas (alguien que entra, mira 3 segundos y se va nunca dispara el evento).

**Impacto de las 171 KB:** es el peso real de `gtag.js` de Google, no una decisión de este código — `afterInteractive` ya evita que bloquee el render inicial (se inyecta después de la hidratación). Bajarlo a `lazyOnload` ahorraría milisegundos de TBT a costa de perder pageviews reales en sesiones cortas, justo cuando la memoria del proyecto (`umami-subcuenta-prueba-dura`) ya documenta que la analítica actual **subestima** el tráfico real (6 visitantes reportados vs. 21 carritos reales en la misma ventana).

**Clasificación: (D) descartar.** El código ya sigue la práctica recomendada por la documentación oficial de Next.js para este tipo de script. Cambiarlo a `lazyOnload` iría en contra de la doc y empeoraría un problema de medición ya conocido, a cambio de una ganancia de rendimiento marginal.

---

### S-01 — `/tienda/[slug]` — un slug inexistente responde `200 OK` (no 404): comportamiento documentado de Next 16, ya mitigado con `noindex`, no un bug

**Qué pasa:** pedir cualquier slug que no existe bajo `/tienda/` (probado con un slug aleatorio nunca visto, `curl -D -`, `Age: 1`, `fwd=uri-miss` — o sea, sin caché de por medio) devuelve **`HTTP/1.1 200 OK`**, con el body de la página `not-found.tsx` ("Esta página se perdió") pero con el `<title>` de la función `generateMetadata` ("Producto no encontrado", `src/app/tienda/[slug]/page.tsx:159`) y `<meta name="robots" content="noindex">` correctamente presente.

**Por qué pasa (documentado, no es un bug de este código ni de Netlify):** `src/app/tienda/[slug]/page.tsx:300,556` sí llama a `notFound()` correctamente. Pero `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/loading.md:103-113` (sección "Status Codes") explica exactamente este caso: *"When streaming, a 200 status code will be returned to signal that the request was successful... Because the response headers have already been sent to the client, the status code of the response cannot be updated... Next.js includes a `<meta name="robots" content="noindex">` tag... Some crawlers may label these responses as 'soft 404s'. In the streaming case, this does not lead to indexation because the page is explicitly marked noindex."* Es decir: en cualquier ruta con streaming (todas las de App Router con Server Components async, como esta), un `notFound()` profundo en el árbol **no puede** cambiar el código HTTP una vez que el streaming ya arrancó — es una limitación de la arquitectura de streaming de Next 16, igual de "no es un bug" que el gotcha ya documentado de `permanentRedirect` devolviendo 200 + meta-refresh (memoria `slugs-sucios-y-cache-windows`).

**Impacto real:** bajo — el propio Google dice que el `noindex` presente evita la indexación pese al 200. El riesgo que sí queda: herramientas de monitoreo de links rotos, Search Console (categoría "rastreada, no indexada" en vez de "no encontrada"), y analítica de errores no van a distinguir estos casos de una página real.

**Clasificación: (D) descartar como bug — es comportamiento correcto y ya mitigado.** Si en el futuro Anush/Mati quieren un 404 real (por ejemplo, para que un checkeador de links rotos lo detecte, o para limpiar Search Console), la propia doc da el camino: *"You can run this check in `proxy` to rewrite missing slugs to a not-found route, or produce a 404 response there."* — es decir, en `src/proxy.ts` (el middleware de Next 16), con una verificación **rápida contra el catálogo ya cacheado** (no una consulta nueva a Supabase por request, que la doc pide evitar: *"Keep proxy checks fast, and avoid fetching full content there"*). Quedaría como **(B)** si algún día se prioriza — hoy no hay evidencia de que esté costando indexación ni conversión.

---

## Verificado y bien (no tocar)

Cosas puntuales que esta ronda revisó porque estaban en el alcance, y confirmó que ya están resueltas correctamente — para no perder tiempo re-chequeándolas en la próxima auditoría:

- **Blog ya NO da 404 en producción.** El `research/auditoria-tecnica-2026-09.md` del 03-04/09 marcaba esto como P0 crítico; verificado hoy con `curl`, las 8 URLs de blog citadas ahí (y las notas nuevas) responden 200. Resuelto entre esa fecha y `a0e3b91`.
- **H1 de categorías ya tiene el modificador.** El mismo informe pedía cambiar el H1 genérico ("Cardigans") por uno con intención real. Verificado en vivo: `/tienda/cardigans` tiene H1 "Cardigans de crochet tejido a mano" y las 5 categorías reales (`cardigans`, `tops`, `sweaters`, `sets`, `accesorios`) tienen `<title>` y meta description propios y distintos entre sí (verificado con `curl` en las 5).
- **`/encargo` ya tiene `FAQPage`.** El informe del 04/09 lo marcaba como ausente (`_seo-ranking-2026-09.md` §1.6/§6). Hoy `src/app/encargo/page.tsx:52-58` declara `FAQPage` con las mismas preguntas visibles en la página (fuente única), además del `Service` que ya existía.
- **`MerchantReturnPolicy` fue removido a propósito y sigue afuera.** `src/app/layout.tsx:126-128` y `src/app/tienda/[slug]/page.tsx:448-450` solo tienen el comentario explicando por qué se sacó (04/09) — no hay ninguna mención activa de devoluciones/cambios en ningún JSON-LD, cumpliendo la regla vigente de "nada de retracto/IVA en el sitio".
- **Product/Offer JSON-LD de la ficha usa el precio con descuento** (`getFinalPrice(product, undefined, discounts)`, `tienda/[slug]/page.tsx:375`), imágenes absolutas vía `botImageUrl` (evita el egress de Supabase a bots), `availability` honesto según `lead_time_weeks` (no todo es `InStock`), y `sku` sin inventar `gtin`/`mpn` — todo verificado leyendo el bloque completo (líneas 401-460).
- **BlogPosting de las notas tiene todos los campos que pide Google:** `headline`, `image`, `datePublished`, `dateModified`, `author`, `publisher.logo` (`src/app/blog/[slug]/page.tsx:300-322`) — nada inventado (autoría a nivel Organization, con el comentario explícito de por qué no hay firma personal).
- **`robots.ts` permite rastrear las páginas `noindex`** (`/carrito`, `/favoritos`, `/encargo/estado`, `/ig`, `/gracias`) en vez de bloquearlas por `disallow` — es la práctica correcta que pide Google (un crawler necesita poder leer la página para ver la etiqueta `noindex`); verificado que las 5 páginas realmente traen `robots: { index: false }` en su metadata.
- **Sitemap = 72 URLs en vivo = las mismas 72 que reporta Search Console.** `curl https://dahila.uy/sitemap.xml` cuenta 72 `<loc>`; coincide exacto con el "61 de 72 indexadas" del informe del 12/09. Las 3 URLs puntuales que aparecían "sin indexar"/"Google no reconoce" (`sweater-cherry`, `tienda/sweaters`, `tienda/top-race`) responden 200 en vivo — es demora normal de indexación de páginas nuevas, no un error técnico.
- **Rutas OG dinámicas responden bien:** `/og` y `/tienda/spring-cardigan/og` → 200, `image/jpeg`, ~104 KB y ~103 KB. `/tienda/opengraph-image` (archivo propio) → 200, `image/png`, 30 KB. `/opengraph-image` y `/encargo/opengraph-image` dan 404 **a propósito** — home y `/encargo` usan `OG_BASE`/`OG_DEFAULT_IMAGE` (`src/lib/og.ts`), que apunta a `/og`, no a un archivo `opengraph-image.tsx` propio; ya está documentado en el propio `og.ts` (gotcha de que `images` en metadata le gana al archivo, verificado 11/09).
- **`/carrito` SÍ tiene ISR real, contradiciendo parcialmente la memoria `isr-muerto-rutas-dinamicas` (63 días, desactualizada para esta ruta).** Usa `@/lib/supabase/public` (sin `cookies()`), por eso el TTFB medido es 57 ms — la memoria es de julio, antes de que existiera este cliente separado; sigue siendo cierta para cualquier página que use `@/lib/supabase/server`.
- **Convención de `quality` en `next/image` respetada:** 82 en tarjetas/miniaturas (13 usos), 90 en hero/PDP/galería (6 usos), 95 en el hero de home (1 uso deliberado, ya permitido por `next.config.ts`), 100 en el lightbox (1 uso) — sin valores sueltos fuera de la convención de la skill.
- **`globals.css` pesa 31 KB / 762 líneas** — razonable para un design system completo servido una sola vez (cacheado); no es un candidato de optimización.
- **Fuentes:** `next/font` con `display: 'swap'` en ambas familias (`layout.tsx:28-42`), autohospedadas (Next las preloada solo cuando corresponde) — sin `@import` de Google Fonts, sin duplicados. Los dos woff2 de 66 KB/47 KB del resumen son el costo real de Fraunces+Inter con los pesos usados, no un bug.

---

## Tabla de línea de base (para re-medir a los 30 días)

Todo medido el 12-13/09/2026, Lighthouse mobile por defecto (throttling simulado 4x CPU, benchmarkIndex 785,5) contra producción (`a0e3b91`). Repetir con el mismo comando (`curl` a PageSpeed Insights, ver `research/prompt-auditoria-total-2026-09.md` §7) para comparar manzanas con manzanas.

| Métrica | / | /tienda | /tienda/spring-cardigan | /carrito | /encargo |
|---|---|---|---|---|---|
| Rendimiento (Lighthouse) | 46 | 48 | 43 | 15 | 51 |
| FCP | 1,9 s | 2,1 s | 2,3 s | 3,4 s | 2,0 s |
| LCP | 5,5 s | 5,4 s | 7,3 s | 6,9 s | 4,7 s |
| TBT | 4,0 s | 2,9 s | 1,8 s | 2,4 s | 2,9 s |
| CLS | 0,000 | 0,006 | 0,000 | **0,455** | 0,031 |
| Accesibilidad | 96 | 96 | 96 | 96 | 96 |
| Buenas prácticas | 73 | 73 | 73 | 73 | 73 |
| SEO | 100 | 100 | 100 | 69 (noindex a propósito) | 100 |
| Peso total (KB) | 1312 | 1480 | 1082 | 876 | 739 |
| HTML sin comprimir / gzip | 313 KB / 70 KB | — | — | — | — |
| Errores de consola | 2 (Clarity/CSP) | 2 | 2 | 2 | 2 |
| TTFB (`curl`, tibio) | 0,34-0,68 s | 0,64-1,03 s (dinámica) | 0,64 s | 0,99 s | 0,37 s |

**Qué debería cambiar si se aplican los (A) de este informe:** R-01 → 0 errores de consola (buenas prácticas debería subir); R-02 → CLS de `/carrito` de 0,455 a "chico" (no cero, ver trade-off); R-03 → `/tienda` con `Cache-Status` cacheado en vez de `fwd=bypass`, TTFB tibio bajando de ~0,8 s a rango de `/tienda/cardigans` (~0,6 s); R-04 → HTML de todas las páginas ~85-90 KB más liviano, con impacto esperado en el `elementRenderDelay` del LCP de home (R-06).

---

## Top-5

1. **R-04 — El catálogo completo (37 productos con joins anidados) viaja en el HTML de cada página solo para `CartDrawer`.** Es el hallazgo con más impacto por esfuerzo: una sola función en `src/app/layout.tsx:271` recorta ~85-90 KB de cada página del sitio y explica buena parte del "element render delay" del LCP de home (R-06).
2. **R-01 — Clarity está roto por la CSP (`next.config.ts:29,40`) desde antes de esta sesión.** Dos líneas de fix, y hoy Anush/Mati podrían estar tomando decisiones mirando grabaciones de Clarity que no existen — contradice directamente la memoria que daba esto por confirmado.
3. **R-02 — CLS 0,455 en `/carrito`**, la página justo antes de la conversión: el fetch del carrito diferido a propósito (`CartProvider.tsx:134-155`) golpea de lleno contra el estado vacío con la grilla de sugeridos. Fix acotado de bajo esfuerzo disponible ahora; el fix completo (SSR del carrito) es una decisión de trade-off con Mati.
4. **R-03 — `/tienda` es la única página del catálogo sin caché de borde**, por leer `searchParams` en el servidor cuando el filtrado ya es 100% client-side (`TiendaClient.tsx`). Next mismo documenta el patrón (`useSearchParams` + `Suspense`) para este caso exacto.
5. **R-07 — Un solo color (`ink500` / `#8C8285`, 3,7:1) explica casi el 100% de las fallas de accesibilidad del sitio**, en 31 archivos mediante un token único. Corregirlo es una decisión de diseño de una línea (`globals.css:37`), no un proyecto — solo falta que Anush/Mati elijan entre `ink700` (ya existe) o un tono nuevo intermedio.

**No bloqueante para el negocio, pero gratis si hay una sesión de deploy:** S-01 (soft-404 documentado, ya mitigado con noindex) y R-08 (GA ya está bien, confirmado no tocar) no requieren acción — se dejan documentados para que la próxima auditoría no vuelva a investigarlos desde cero.
