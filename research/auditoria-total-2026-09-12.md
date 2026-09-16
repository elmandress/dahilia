# Auditoría total de dahila.uy — 12 y 13/09/2026

Ejecución de `research/prompt-auditoria-total-2026-09.md`, de la Fase 0 a la 4. **Nada commiteado ni pusheado:** el deploy lo confirma Mati.

**Método:**
1. Línea de base: Search Console, Lighthouse, tiempos de respuesta y capturas a 390 px.
2. Seis auditores en paralelo (Sonnet), uno por área, con salida en `research/_audit-<área>.md`. Se cortaron una vez por límite de sesión y se relanzaron retomando sus archivos.
3. Verificación propia de cada hallazgo antes de tocarlo: código, base con la anon key, HTML en vivo y capturas.
4. Implementación en tandas.
5. Quality gate: typecheck, lint, build, smoke test sobre el build local y capturas a 390 px.

---

## 1. Resumen ejecutivo: las 10 mejoras de mayor impacto

1. **Un solo precio por producto en todo el sitio.** El Granny's cardigan salía UYU 3.300 en `/ig` (la landing de la bio de Instagram) y UYU 3.800 en la tienda. El Sweater cherry salía 2.760 en `/ig` y 2.560 en la tienda.
   - Causa: la tarjeta usaba el primer talle que devolvía la base, sin ordenar, y el resto de las superficies usaba el precio base.
   - Ahora todo usa el talle disponible más barato, con "Desde" cuando el precio cambia según el talle: tarjeta, `/ig`, buscador, orden por precio, JSON-LD, meta description, imagen para compartir y sugerencias del carrito.
2. **Sin talles inventados.** 13 productos sin talles cargados (bolsos, bufandas, poncho) mostraban botones XS–XL, y el talle "elegido" llegaba al mensaje de WhatsApp como si fuera real. Ahora dicen "Talle único".
3. **El plazo, a la vista y cierto.**
   - En la ficha sube junto al precio; antes estaba a tres pantallas en el celular.
   - Las piezas en stock dicen "En stock". Antes les aparecía la cola de septiembre y la frase "Hecho a tu medida".
   - La cola ahora también se ve en la home, en la tienda y en la vista rápida.
4. **Envío junto al total.** El carrito muestra el texto de "Envío — línea corta" al lado del total cuando tiene montos. El mensaje de WhatsApp ahora pregunta por el costo de envío a su zona. *Falta un paso de Anush: cargar los montos.*
5. **Microsoft Clarity no estaba grabando.** La CSP bloqueaba el script real y el beacon, y cada página tiraba 2 errores de consola. Ya está arreglado y verificado.
6. **El HTML de cada página, más liviano.** El mini-carrito recibía el catálogo entero (~114 KB de JSON) en todas las páginas. Ahora recibe solo los candidatos a complemento.
   - Home local: 204 KB, contra 304 KB en producción (sin comprimir).
   - Menciones de `base_price_uyu` en el HTML: 23, contra 54.
7. **Una caída de la base ya no muestra la pantalla en blanco de Next.** Nuevo `error.tsx`, con marca, "Probar de nuevo", link a la tienda y WhatsApp.
8. **"En stock" coherente entre la tienda y Google.** Había tres definiciones distintas. Ahora hay una sola (`isReadyToShip`) en la interfaz, los filtros, el menú y todo el JSON-LD.
9. **El salto de layout del carrito.** Pasó de CLS 0,455 en producción a **0,000** en el build final. Fueron dos cambios:
   - el esqueleto de carga reserva la pantalla, así que el footer ya no salta a la vista;
   - cada estado (cargando, vacío, con piezas) tiene su propia `key`, así que React ya no reutiliza los nodos del esqueleto y el contenido nuevo no cuenta como desplazamiento.
10. **El admin, usable desde el celular.**
    - Los botones Principal y Quitar se ven siempre en pantallas táctiles.
    - Las fotos se ordenan con flechas ◀ ▶, porque el arrastre no funciona con el dedo.
    - El menú avisa si hay cambios sin guardar.

**Además:**
- Honestidad del contenido:
  - la tira "Lana natural · Materiales nobles" era falsa: 22 de 37 piezas son de algodón y 8 de acrílico, lurex o chenille;
  - se sacó una cifra inventada ("donde se rompe el 90% de los bolsos");
  - se sacaron 6 "artesanal" y ~45 rayas largas en notas y metadata;
  - se corrigieron dos erratas del blog.
- `/ig` sin la grilla de 13 links.
- `/favoritos` con vista rápida real.
- `/encargo/estado` con links a WhatsApp.
- Un solo `WebSite` en el JSON-LD.
- "Envíos y pagos" en lugar de "Envíos y cambios".

---

## 2. Línea de base (Fase 0) y cómo volver a medir a los 30 días

### Search Console (13/08 → 09/09)
| Métrica | Valor |
|---|---|
| Clics | 120 (+532%) |
| Impresiones | 739 |
| CTR | 16,2% |
| Posición media | 10,0 |
| Búsquedas con la marca | 4 clics / 13 impresiones |
| URLs indexadas | 61 de 72 (segunda corrida, 12/09 noche; la primera daba 59) |

Siguen sin indexar:
- 6 notas "descubiertas";
- `tops-de-crochet-para-verano` y `materiales-de-una-prenda-tejida` ("Google no reconoce esta URL");
- `/tienda/sweaters`, `/tienda/sweater-cherry` y `/tienda/top-race`.

`como-lavar` y `como-guardar` ya están indexadas, así que no se consolidan (ver §7).

### Lighthouse mobile contra producción (`a0e3b91`)
PageSpeed sin clave tiene cuota diaria 0, así que se usó Lighthouse 13 local, con el Chromium de Playwright instalado en el scratchpad (no en el repo). `benchmarkIndex` fue 785, con throttling simulado 4x.

| Página | Rend. | FCP | LCP | TBT | CLS | Accesib. | Buenas prácticas | SEO |
|---|---|---|---|---|---|---|---|---|
| `/` | 46 | 1,9 s | 5,5 s | 4,0 s | 0 | 96 | 73 | 100 |
| `/tienda` | 48 | 2,1 s | 5,4 s | 2,9 s | 0,006 | 96 | 73 | 100 |
| `/tienda/spring-cardigan` | 43 | 2,3 s | 7,3 s | 1,8 s | 0 | 96 | 73 | 100 |
| `/carrito` | 15 | 3,4 s | 6,9 s | 2,4 s | 0,455 | 96 | 73 | 69 (noindex) |
| `/encargo` | 51 | 2,0 s | 4,7 s | 2,9 s | 0,031 | 96 | 73 | 100 |

### Tiempo de respuesta (curl, en tibio)
| Página | TTFB | Caché |
|---|---|---|
| `/` | 0,34–0,68 s | cacheada |
| `/tienda` | 0,64–1,03 s (5,25 s en frío) | dinámica |
| `/tienda/cardigans` | 0,51–0,72 s | — |
| ficha | 0,64 s | — |
| `/carrito` | 0,99 s | — |
| `/encargo` | 0,37 s | — |

### Datos pedidos a Mati y todavía sin respuesta
- `/admin/carritos` y `/admin/pedidos`, período de 30 días.
- Clarity (que además no estaba grabando, ver R-01).
- La prueba del botón de WhatsApp desde Instagram.

### Cómo re-medir el 12/10/2026 (mismo método)
1. `npm run seo-report`: clics, impresiones, marca e indexación.
2. Lighthouse sobre las mismas 5 URLs de producción, con el mismo comando. Si hay clave de API, con PageSpeed, que además trae datos de campo.
3. `/admin/carritos`, período 30 días contado desde el deploy:
   - pedidos cada 100 carritos;
   - carritos con pieza en stock contra solo a pedido.

   Compararlo con el mismo período anterior al deploy.
4. `/admin/pedidos`: ventas marcadas como "Vendido".
5. Clarity, desde el deploy: clics de frustración y profundidad de scroll en `/carrito` y en las fichas.

**Qué debería moverse:**
- 0 errores de consola, y por lo tanto buenas prácticas por encima de 73;
- CLS de `/carrito` muy por debajo de 0,1;
- menos TBT y menos demora de render del LCP en todas las páginas (payload más chico);
- más pedidos cada 100 carritos si Anush carga los montos de envío.

---

## 3. Tabla de hallazgos

**Estados:**
- **Aplicado:** está en el working tree y pasó el quality gate.
- **Anush:** necesita un dato o una decisión de ella.
- **Mati:** necesita una acción o una decisión de Mati.
- **SQL:** va como archivo en `database/`.
- **Descartado:** con motivo en §7.

Los IDs remiten a los informes por área (`research/_audit-*.md`). CO-xx son hallazgos del coordinador.

| ID | Área | Hallazgo | Evidencia | Dónde | Sev. | Estado |
|---|---|---|---|---|---|---|
| CO-01 | Precio | El mismo producto tenía precios distintos según la página, y los talles venían sin ordenar | Captura 390 px + `product_sizes.sort_order` + curl en vivo | `lib/types.ts` (getListingPrice…), `lib/catalog.ts`, ProductCard, `/ig`, buscador, TiendaClient, JSON-LD, OG | Alta | Aplicado |
| T-06 / CO-02 | Ficha | Talles XS–XL inventados en 13 productos, que llegaban al WhatsApp | curl `bolso-lola` en vivo | ProductDetailsClient | Alta | Aplicado |
| T-07 | Ficha | Una pieza en stock mostraba la cola de septiembre y "Hecho a tu medida" | curl `mini-bufandas` en vivo | ProductDetailsClient, `leadTimeMessage` | Alta | Aplicado |
| H9 | Ficha | El plazo estaba a tres pantallas del precio en el celular | Capturas 390 px | ProductDetailsClient | Alta | Aplicado |
| G-04 | Home y tienda | Con cola activa, ninguna decía cuánto tarda | Código | HomeClient, TiendaClient | Alta | Aplicado |
| T-03 | Vista rápida | No mostraba plazo ni cola, y el WhatsApp estaba fijo en el código | Código + `site_settings` | QuickViewModal, CartProvider | Alta | Aplicado |
| T-02 | Tarjetas | No había "En stock" en la tarjeta | Código | ProductCard | Media | Aplicado |
| CO-04 | Tarjetas (home, relacionados) | Sumaban un talle sin que la clienta lo eligiera | Código (Baymard: los talles preseleccionados pasan inadvertidos) | ProductCard ("Elegir talle") | Media | Aplicado |
| T-13 / T-01 | JSON-LD | Tres definiciones de "en stock": el hub decía todo InStock y la ficha BackOrder | curl en vivo | `tienda/page`, `[slug]/page`, colecciones | Media | Aplicado |
| — | Meta description | Mostraba el precio base, que en 3 productos no es el de ningún talle disponible | Código | `[slug]/page` | Media | Aplicado |
| C-01 | Carrito | El envío nunca aparecía junto al total (hipótesis 1) | Código + `site_settings` | CarritoClient | Alta | Aplicado (faltan los montos, ver Anush) |
| C-04 | Mensaje de WhatsApp | La pregunta final no mencionaba el envío | Código | CarritoClient | Media | Aplicado |
| C-02 / C-03 | Carrito | "No pagás nada" dicho dos veces, y "coordinamos juntas" | Código | CarritoClient | Media | Aplicado |
| R-02 | Carrito | CLS 0,455 | Lighthouse (`layout-shifts`) | CarritoClient (esqueleto con altura) | Media-alta | Aplicado |
| E-01 | `/encargo/estado` | "Escribinos por WhatsApp" sin link, y sin burbuja flotante | Código | EstadoClient, page | Media | Aplicado |
| FAV (F-01 del informe de carrito) | `/favoritos` | "Vista rápida" navegaba a la ficha | Código | FavoritosClient, page | Media | Aplicado |
| G-01 | Ficha mobile | La burbuja de WhatsApp quedaba tapada por la barra fija | Código + medición con Playwright | WhatsAppFloat, BackToTop, `globals.css` | Media | Aplicado y medido |
| G-03 | Global | No había `error.tsx`: se veía la pantalla en blanco de Next | `ls` + doc de Next 16 | `app/error.tsx` | Alta (peor caso) | Aplicado |
| T-14 | Ficha | Al cargar se veía un esqueleto de grilla | `find` | `tienda/[slug]/loading.tsx` | Media | Aplicado (trade-off en §7) |
| P-01 | `/ig` | El footer traía 13 links debajo del linktree | Código | Footer | Media | Aplicado |
| T-05 | Ficha de sweaters | "Completá el look" sin criterio para esa categoría | Código + base | `lib/complements.ts` | Baja | Aplicado |
| T-09 | Ficha | Ícono de regla para el material | Código | ProductDetailsClient | Baja | Aplicado |
| G-02 | JSON-LD de la home | Dos `WebSite` sin `@id` | Código | `page.tsx`, `layout.tsx` | Media | Aplicado |
| P-04 | Voz | ~45 rayas largas en 12 notas y 5 metadatas; 3 descripciones de más de 160 caracteres | grep | notas + `/atelier`, `/contacto`, `/colecciones`, `/ofertas` | Baja-media | Aplicado |
| CO-03 | Home | "Lana natural · Materiales nobles" no es cierto para el catálogo | Base: 22/37 algodón, 8 sintéticos | HomeClient | Media | Aplicado; los textos de Configuración quedan para Anush |
| CO-05 | Blog | "Donde se rompe el 90% de los bolsos", sin fuente | Lectura | `bolsos-de-crochet-por-que-duran` | Media | Aplicado |
| P-03 / CO-06 | Voz | "artesanal" en `/terminos`, 2 notas, `/tejedoras` y `llms.txt`; erratas "se destejé" y "la entretiempo" | grep | Varios | Baja | Aplicado |
| G-06 | Footer | "Envíos y cambios" (contradice la limpieza legal) | Código | Footer | Baja | Aplicado |
| R-01 | Medición | Clarity no grababa: la CSP bloqueaba el script y el beacon | Lighthouse (`errors-in-console`) + CSP | `next.config.ts` | Alta | Aplicado y verificado |
| R-04 | Rendimiento | ~114 KB de catálogo en el HTML de cada página | Medición del HTML en vivo | `layout.tsx`, CartDrawer, `addons.ts` | Alta | Aplicado |
| R-03 | Rendimiento | `/tienda` se renderiza en cada visita (lee `searchParams`) | curl `Cache-Status` | `tienda/page.tsx` | Media | Descartado por ahora (§7) |
| R-05 | Imágenes | Netlify sirve WebP en vez de AVIF a Chrome | curl con `Accept` real | Plataforma | Baja | Mati / Netlify |
| R-07 / G-05 | Accesibilidad | `ink500` (#8C8285) da 3,7:1 y es casi todas las fallas de contraste | Lighthouse + cálculo WCAG | Token en `globals.css` y `Primitives.tsx` | Media | Decisión de diseño (Mati/Anush) |
| X-01 | Seguridad | El signup de Supabase sigue abierto, con policies `USING(true)` | `/auth/v1/settings` → `disable_signup:false` | Dashboard + `schema-security-hardening.sql` | **Crítica** | Mati (toggle + SQL) |
| A-01 | Admin | Las fotos no se podían organizar desde el celular | Código (hover/drag) | `admin.css`, editores de producto | Alta | Aplicado |
| A-02 | Admin | El aviso de cambios sin guardar no cubría el menú | Código | `use-unsaved-warning.ts`, AdminChrome | Media | Aplicado |
| K-01 | SQL | El PASO 4 del hardening está obsoleto y es peligroso | Lectura cruzada | `schema-security-hardening.sql` | Baja | Aplicado (nota de "no correr") |
| K-02 | Cron | El fallback daba ceros en silencio | anon key | `api/cron/daily-summary` | Baja | Aplicado (queda log) |
| K-03 | Admin | Botones de 34–40 px | CSS | `admin.css` | Baja-media | Decisión (cambia todo el admin) |
| K-04 | Admin | `aria-label` en inglés | Código | AdminChrome | Baja | Aplicado |
| X-02 | Estado de la base | `costos-produccion-2026-09.sql` ya estaba corrido (la memoria decía pendiente) | anon key | — | — | Corregido en la memoria |
| T-11 | Contenido | Las 3 fichas con más tráfico tienen la descripción más genérica | Base | `products.description` | Alta | Anush |
| T-12 | Contenido | Set Brisa y Set Lueur solo dicen qué incluyen | Base | `products.description` | Media | Anush |
| T-08 | Confianza | El bloque "Hecho por Anush" no aparece (`maker_bio` vacío) | `site_settings` | Configuración | Media | Anush |
| T-10 | Catálogo | Hay 0 colores cargados en toda la base | anon key | Colores | Media | Anush |
| T-04 | Catálogo | Tops y Sweaters tienen el mismo orden | anon key | Categorías | Baja | Anush (desde el admin) |
| P-02 | Legal | `/tejedoras` no dice nada sobre menores de 18 (carné del INAU) | Código | TejedorasClient | Media | Anush (texto) |
| — | Configuración | "Envio " sin tilde | `site_settings` | `process_3_title` | Baja | SQL |
| — | Configuración | "Lana natural" (proceso) y "Lana y algodón natural" (valores) | `site_settings` | `process_2_body`, `about_value_3_body` | Media | Anush (SQL opcional para el primero) |
| — | Configuración | La FAQ "¿Cuánto tarda?" no da ningún plazo | `site_settings` | `faq_1_a` | Media | Anush (SQL opcional) |
| H4-01 | Checkout | El salto a WhatsApp desde el navegador de Instagram puede quedar en la web de wa.me | Fuentes técnicas; sin dato de Dahila | CarritoClient | ? | Mati (prueba real) |

Menores del informe de carrito, clasificados como Anush:
- deshacer al quitar una pieza del carrito;
- barra de progreso hacia el envío gratis (hoy el umbral está apagado);
- talle y tipo preseleccionados en el formulario de encargo.

---

## 4. Qué se cambió y cómo se verificó

**Código (ninguna dependencia nueva):**
- **`src/lib/types.ts`:**
  - `sortSizes`, `getListingSize`, `getListingPrice`, `hasPriceRange` y `formatListingPrice`: el precio único;
  - `leadTimeMessage`: el plazo compartido entre la ficha y la vista rápida.
- **`src/lib/catalog.ts`:** talles ordenados por `sort_order`, también en el snapshot.
- **`src/lib/product-selection.ts`:** talle por defecto en el orden de la dueña.
- **`src/components/ProductCard.tsx`:**
  - precio "Desde";
  - "En stock";
  - "Elegir talle" en lugar de sumar un talle que nadie eligió.
- **`src/components/ui/PriceBlock.tsx`:** nueva prop `from`.
- **`src/app/tienda/[slug]/ProductDetailsClient.tsx`:**
  - "Talle único";
  - plazo o "En stock" junto al precio;
  - "A tu medida" solo en prendas con talle y a pedido;
  - ícono de material;
  - precios del "Completá el look".
- **`src/components/QuickViewModal.tsx`:** plazo, WhatsApp desde el contexto y talles ordenados.
- **`src/components/CartProvider.tsx` y `src/app/layout.tsx`:**
  - `whatsappUrl` en el contexto;
  - candidatos livianos para el mini-carrito;
  - `@id` en Organization y WebSite.
- **`src/app/page.tsx`:** fuera el segundo `WebSite`.
- **`src/app/HomeClient.tsx`:** tira de materiales verdadera y aviso de cola.
- **`src/app/tienda/TiendaClient.tsx`:** precio de listado en filtro, orden y límites; "con descuento" corregido; aviso de cola.
- **`src/app/tienda/page.tsx`, `src/app/tienda/[slug]/page.tsx`, `src/app/colecciones/[slug]/page.tsx`:** JSON-LD (precio y disponibilidad) y meta description.
- **`src/app/tienda/[slug]/og-card.tsx`:** precio "desde" en la imagen para compartir.
- **`src/app/ig/page.tsx`:** precio de listado y copy.
- **`src/app/api/search/route.ts` + `src/components/Header.tsx`:** precio de listado, "desde" y descuentos por lote.
- **`src/app/carrito/CarritoClient.tsx`:**
  - envío junto al total;
  - mensaje de WhatsApp;
  - "En stock";
  - frase única, sin "juntas";
  - esqueleto con altura;
  - precios de las sugerencias.
- **`src/components/CartDrawer.tsx`, `src/lib/addons.ts`:** precio de listado.
- **`src/components/WhatsAppFloat.tsx`, `BackToTop.tsx`, `src/app/globals.css`:** posiciones sobre la barra fija.
- **`src/components/Footer.tsx`:** `/ig`, "Envíos y pagos" y copy.
- **`src/app/error.tsx` (nuevo), `src/app/tienda/[slug]/loading.tsx` (nuevo).**
- **`src/app/encargo/estado/*`, `src/app/favoritos/*`.**
- **`src/lib/complements.ts`.**
- **`next.config.ts`:** CSP de Clarity y GA.
- **Admin:** `admin.css`, `AdminChrome.tsx`, `use-unsaved-warning.ts`, `productos/[id]/page.tsx`, `productos/nuevo/page.tsx`.
- **`api/cron/daily-summary/route.ts`:** comentario y log.
- **Copy:**
  - `terminos`, `tejedoras`, `llms.txt`;
  - metadata de `atelier`, `contacto`, `colecciones`, `ofertas`;
  - 13 notas del blog.

**Datos y documentos:**
- `database/textos-configuracion-2026-09.sql` (nuevo);
- nota de "no correr" en el PASO 4 de `database/schema-security-hardening.sql`;
- 12 tareas nuevas en `NEXT_ACTIONS`;
- `research/_audit-*.md` (6 informes por área);
- este informe;
- la fila duplicada de `research/mediciones/historial.csv` corregida.

**Verificación:**
- **Typecheck:** 0 errores. **Lint:** 0 errores y 0 advertencias (se corrieron dos veces, la última después de los últimos cambios).
- **Build de producción:** OK dos veces, sin advertencias en el log. El segundo corrió en orden (typecheck, lint, build) después de los últimos cambios y generó 117 páginas. `/favoritos` y `/encargo/estado` pasan a prerenderizarse con 1 h de caché. `next-env.d.ts` se revirtió después de cada build.
- **Lighthouse local del build final:** `/carrito` con CLS 0,000 y ningún desplazamiento (producción: 0,455). Los demás números locales no se comparan con producción: no hay CDN, y el servidor y Lighthouse compiten por la CPU de la misma PC. La comparación válida es medir producción después del deploy, con el mismo comando.
- **CSP con Clarity y GA** (evaluando `next.config.ts` con las variables simuladas):
  - `script-src` incluye `https://*.clarity.ms https://c.bing.com`;
  - `img-src` incluye Clarity y GA;
  - `connect-src` sin cambios de fondo.
- **Smoke test sobre `next start` (62 chequeos):**
  - 30 rutas en 200;
  - el 404 muestra la página propia con noindex;
  - mismo precio en `/ig`, la tienda, la ficha, el buscador y la meta description;
  - Granny's arranca en S a 3.300, con los talles en orden S, M/L y AggregateOffer 3300–3800;
  - el bolso sin XS–XL y con "Talle único";
  - Mini bufandas en stock, sin la cola ni "a tu medida", con InStock en el JSON-LD;
  - JSON-LD de `/tienda`: 22 BackOrder y 2 InStock (antes 48 InStock);
  - un solo `WebSite` con `@id`;
  - sin "artesanal" ni el "90%";
  - la OG de la ficha en JPEG.

  Los 2 FAIL eran falsos positivos del test: el texto buscado aparecía dentro del payload RSC en `<script>`, no en la página. Se verificó contra el texto visible en los dos builds. El smoke test completo se repitió sobre el build final con el mismo resultado.
- **Medición con Playwright, ficha a 390 px:**
  - burbuja de WhatsApp: 692–744 px;
  - barra fija: 774–844 px;
  - "volver arriba": 636–680 px.

  No se pisan y la burbuja queda encima de todo.
- **Capturas a 390 px del build local:** home, tienda, Granny's, bolso LOLA, Mini bufandas, carrito, `/ig` y ficha. Sin desborde horizontal en ninguna.

---

## 5. Hipótesis de conversión (§10 del prompt): estado

| # | Hipótesis | Qué se hizo | Cómo medirla |
|---|---|---|---|
| 1 | El envío sin precio frena | Envío junto al total (si tiene montos) y el mensaje pregunta por el envío | Pedidos cada 100 carritos, 30 días antes y después de que Anush cargue los montos |
| 2 | El plazo frena | "En stock" en tarjeta, ficha, carrito y mensaje; la cola se ve antes de elegir; el plazo junto al precio | "¿Frena el plazo?" en `/admin/carritos` (con pieza en stock contra a pedido) |
| 3 | Miedo a comprometerse | "No pagás nada ahora" queda, una sola vez y sin "juntas" | Tasa carrito → pedido desde el deploy |
| 4 | Instagram corta el salto a WhatsApp | Sin dato real: la evidencia general dice que en iOS no hay escape confiable. El 13/09 se sumó el plan B, que solo aparece después del toque: "¿No se abrió WhatsApp?", con "Abrir de nuevo" y "Copiar mi pedido". También se arregló el checkout, que abría 2 pestañas (sección 9) | Prueba de 5 minutos en iPhone y Android (Mati). Eventos `order_reopen` y `order_copy` en Umami |
| 5 | Falta prueba social | Bloque "Hecho por Anush" listo, esperando texto; `/resena` y testimonios reales ya existen | Reseñas en el Perfil de Google |
| 6 | Descripciones abstractas | Identificadas las 5 más flojas (T-11, T-12); no se inventó nada | Tareas de Anush |
| 7 | Dudas de talle | Verificado: la guía está donde se elige el talle; los "Talle único" quedaron claros | Clarity (ahora sí graba) |
| 8 | Respuesta lenta por WhatsApp | Tarea para Anush: respuestas rápidas y mensaje de bienvenida | Tiempo de primera respuesta |
| 9 | Primeras pantallas en el celular | Precio con "Desde", plazo junto al precio, cola en home y tienda | Clarity: scroll y clics en las fichas |

---

## 6. Pendientes: quién hace qué

**Mati:**
1. **Crítico:** en Supabase, Authentication, apagar el registro de cuentas nuevas. Después correr los PASOS 2 y 3 de `schema-security-hardening.sql`. **El PASO 4 no.**
2. Probar el botón de WhatsApp desde el link de la bio de Instagram, en iPhone y en Android.
3. Pasar los números de `/admin/carritos` y `/admin/pedidos` (30 días) para cerrar la línea de base.
4. Decidir el gris del texto secundario (R-07): usar `ink700` o definir un tono intermedio (~#736A6D da 5,2:1). Es una línea una vez decidido.
5. Opcional: consultar a Netlify por AVIF (R-05).
6. En Search Console, pedir a mano la indexación de las 11 URLs que faltan y quitar el `sitemap.xlm` mal escrito. **No usar la Indexing API:** Google acepta los avisos pero no los registra (sección 9).
7. A los 2 o 3 días del deploy, confirmar que Clarity graba.

**Anush** (en `/admin/estrategia`, "Para hacer"):
- montos de envío;
- aviso de cola al día;
- descripciones de Spring, Amour, Granny's, Set Brisa y Set Lueur;
- bio de "Hecho por";
- textos "Lana natural";
- respuestas rápidas de WhatsApp;
- orden de categorías;
- aviso para menores de 18 en `/tejedoras`;
- colores (opcional).

**SQL, en este orden:**
1. `database/textos-configuracion-2026-09.sql`: la errata "Envio " y dos mejoras opcionales, comentadas, para que decida Anush. Idempotente.
2. `database/schema-security-hardening.sql`, PASOS 2 → 3, con el toggle del dashboard antes.

Ya corridos: `embudo-pedidos-2026-09.sql` y `costos-produccion-2026-09.sql`.

---

## 7. Descartado, con motivo

- **Consolidar `como-lavar` y `como-guardar` en `como-cuidar`:** el informe del 12/09 las da indexadas por separado y cada una tiene contenido propio. El mecanismo quedó documentado en `_audit-paginas-blog.md` por si vuelven a "rastreada, sin indexar".
- **`/tienda` con `useSearchParams` + `Suspense` (R-03):** según la doc de Next, todo lo que queda bajo ese límite se renderiza en el cliente. Eso sacaría la grilla del HTML servido, con peor SEO y peor LCP. Se mantiene dinámica: 0,6–1 s en tibio.
- **GA con `lazyOnload` (R-08):** la doc de Next recomienda `afterInteractive` para analytics, y diferirlo pierde sesiones cortas (la analítica ya subestima).
- **404 con código real (S-01):** es comportamiento documentado del streaming de Next y ya lleva noindex.
- **Unificar los hex sueltos del admin (K-05):** son 17 páginas sin impacto para Anush ni para las clientas.
- **H1 de categoría "tejido" contra "tejidos":** decisión documentada en el código (concuerda con "crochet").
- **Títulos de ficha con " — ":** es el separador estándar de un título, no prosa. Cambiar 37 títulos indexados no aporta.
- **Color en el mensaje de WhatsApp:** está así por diseño, la paleta es informativa.
- **"Elegimos juntas" en el stepper de `/encargo`:** el valor de Configuración manda y el stepper está apagado.
- **"Soy Anush Tejo…":** es un salto de línea en Configuración, no una errata.
- **Trade-off aceptado de T-14:** el segmento `/tienda/[slug]` sirve fichas y categorías, así que al navegar a una categoría ahora se ve un esqueleto con forma de ficha (antes, con forma de grilla). Se eligió así porque la navegación hacia fichas es mucho más frecuente.

---

## 9. Segunda vuelta (13/09): microinteracciones y estadísticas

Pedido de Mati: pensar microinteracciones que hagan diferencia, ver si la indexación de Google funciona e interpretar las estadísticas. El análisis de datos está en `research/estadisticas-2026-09-13.md`. Las ideas con evidencia (subagente de investigación, 11 ideas, top 8) están en `research/_ideas-microinteracciones-2026-09.md`.

### Qué se cambió

| Cambio | Problema | Evidencia o referente | Trade-off |
|---|---|---|---|
| **Checkout: una sola pestaña de WhatsApp** (`CarritoClient.handleCheckout`) | `window.open(url, '_blank', 'noopener,noreferrer')` devuelve `null` siempre (así lo define el estándar HTML). El código lo tomaba por "bloqueado" y además llevaba la pestaña del carrito a wa.me | Reproducido con Playwright contra dahila.uy, con todas las escrituras interceptadas: 2 pestañas en WhatsApp y el carrito perdido. En local, después del arreglo: 1 pestaña y el carrito queda | Sin `noreferrer`, wa.me recibe el origen como referer. El `opener` se corta a mano |
| **Con cupón, la pestaña se abre antes del canje** | Safari en iOS (y el navegador de Instagram) bloquea `window.open` si pasa cerca de 1 s desde el toque, y el canje se esperaba antes | Don't Panic Labs (jul. 2025); WICG, *transient activation* | Una pestaña en blanco durante una fracción de segundo. Si el cupón se agotó, se cierra |
| **"¿No se abrió WhatsApp?"**, con "Abrir de nuevo" y "Copiar mi pedido" | Si la app no abre (navegador de Instagram, compu sin WhatsApp), no había salida (hipótesis 4) | Idea 4 del research; mecanismo documentado por varias fuentes técnicas (⚠️ con interés comercial) | Solo aparece después del toque y no detecta el navegador. En el celular queda fijo arriba de la barra de abajo y se puede cerrar |
| **Galería de la ficha con swipe** (riel con scroll-snap y contador "N / total") | La foto solo cambiaba tocando las miniaturas | Baymard, *Mobile Gestures*: en el celular se asume que las fotos se deslizan | Sin librería. En desktop sigue con miniaturas y trackpad. Las fotos 2 en adelante cargan diferidas |
| **Talle recordado entre fichas** | Cada ficha arrancaba en el primer talle | Baymard, talles en ropa; heurística de Nielsen (reconocer en vez de recordar) | Solo si el talle existe tal cual y está disponible. Se aplica después de hidratar: el botón cambia de estado sin mover nada |
| **WhatsApp flotante con la prenda y el talle** | En la ficha mandaba "tengo una consulta", sin decir cuál | El mismo patrón que ya usan el carrito y "avisame cuando vuelva" | La evidencia externa es débil (⚠️), pero cuesta poco |
| **Encargo con la prenda de referencia** (`/encargo?desde=&talle=`) | "A medida" desde la ficha abría el formulario vacío | NN/g: prellenar con lo que el usuario ya dio | /encargo sigue siendo estática (`useSyncExternalStore`, sin `useSearchParams`). La referencia se puede quitar |
| **/ofertas vacía: noindex y piezas para seguir** | 71 impresiones en Google para una página sin ofertas | Search Console | Cuando haya ofertas, vuelve sola al índice y al sitemap |
| **Categorías: "Antes de elegir"** con sus notas | Las notas de cardigans, tops y sets no tenían enlaces desde la tienda y Google no las conocía | Inspección de URLs, 13/09 | Una sección más al pie de la categoría |
| **Título de la nota de cuidados** | 90 impresiones, 0 clics, posición 5,8 | Search Console | Es una prueba: medir el 11/10 |

Fuera del sitio:
- `npm run seo-report -- --detalle`: sitemaps, páginas, búsquedas por página, dispositivos, día por día y oportunidades. El historial queda en una fila por día.
- `npm run index-urls -- --status`.
- 4 tareas nuevas en `NEXT_ACTIONS`: `sitemap-xlm`, `pedir-indexacion`, `palabras-busqueda` y `medir-titulo-cuidados`.

Descartado de esta vuelta:
- **Pinch-to-zoom propio en el lightbox:** el pellizco nativo no está bloqueado (`touch-action: manipulation`) y hay que probarlo en un teléfono real antes de escribir gestos a mano.
- **Vibración al agregar:** iOS no la soporta y el aviso visual ya es claro.
- **Recortar el mensaje de WhatsApp en carritos grandes:** evidencia débil, y los carritos típicos son chicos.
- **Testimonios cerca del botón:** solo con contenido real de Anush.

### ¿Funciona la indexación de Google?

- **Indexing API (`npm run index-urls`): no.** Google aceptó los 68 avisos (200) y no registró ninguno. `--status` devuelve "Requested entity was not found." para las 68. Su documentación oficial la limita a empleos y transmisiones en vivo. Dejar de usarla.
- **Sitemap y rastreo: sí.** `sitemap.xml` se envió el 11/09 y Google lo leyó el 13/09, sin errores. 61 de 72 URLs indexadas. Las 11 que faltan son las más nuevas: pedido manual de indexación (Mati) y enlaces nuevos desde las categorías. Queda quitar `sitemap.xlm`, que está mal escrito.

### Verificación

- Typecheck, lint y build: OK.
- `micro.mjs` (Playwright a 390 px, escrituras y analítica interceptadas; el encargo nunca se envía): **17 de 17 en local**. Galería (swipe con eventos táctiles reales y miniaturas), talle recordado, WhatsApp flotante, encargo con referencia y sin ella, /ofertas, notas en 4 categorías, checkout con 1 pestaña, aviso y copia del pedido, sin escrituras sin interceptar y sin errores de JS ni de hidratación. Contra producción, el checkout falla como se describe arriba.
- `smoke.mjs`: 60 de 62. Las 2 "fallas" son texto que solo está en el payload RSC ("finales de septiembre", "Materiales nobles" de /atelier): no se ve, comprobado sobre el texto visible.
- Lighthouse local (celular, analítica bloqueada; no es comparable punto a punto con la línea de base de producción):

  | Página | Performance | LCP | TBT | CLS |
  |---|---|---|---|---|
  | Ficha | 56 | 5,1 s | 975 ms | 0,000 |
  | Carrito | 56 | 5,5 s | 668 ms | 0,000 |
  | Encargo | 76 | 2,5 s | 935 ms | 0,031 |

  La primera medición de la ficha dio 93 de accesibilidad. Fallaba `target-size`: el nombre y el "+ Agregar" de "Completá el look" medían unos 17 px de alto, uno pegado al otro, y WCAG 2.5.8 pide 24. Se corrigió con padding, que entra en los 56 px de la miniatura sin agrandar la fila. Segunda medición: **96**, igual que producción; solo queda el contraste del gris secundario (R-07, decisión de Mati). CLS 0,000. Después de la corrección: typecheck, lint y build OK, y `micro.mjs` 17 de 17.

---

## 10. Tercera vuelta (13/09, tarde): blog, fotos y clics

Pedido de Mati:
- que el blog no repita siempre las mismas fotos;
- sumar notas del estilo que más funciona;
- conseguir más clics por impresión;
- aplicar todas las recomendaciones.

Los datos están en `research/estadisticas-2026-09-13.md`, secciones 3, 4 y 8.

### Hallazgos

- **Las fotos del blog no mostraban lo que decían.** Las 21 notas se repartían las 5 fotos de `public/photos/`, y ninguna muestra lo que dice su nombre:

  | Archivo | Lo que se ve | Texto alternativo que tenía |
  |---|---|---|
  | `top-lace-parque.jpg` | Set violeta de trapillo sobre una mesa de café | "Top tejido a crochet con punto calado" |
  | `atelier-tejiendo.jpg` | Anush sentada en un parque, con un top calado | "Manos tejiendo a crochet en el taller" |
  | `bufanda-verde.png` | Top blanco con el hombro al aire | "Bufanda verde tejida a mano a crochet" |
  | `detalle-tejido.jpg` | El chaleco, puesto | "Detalle del punto de una prenda tejida" |
  | `atelier-escritorio.png` | Selfie con una bufanda roja y rosa | "Piezas tejidas a crochet sobre la mesa del taller" |

- **Google Imágenes:** 381 impresiones y 1 clic en 28 días (posición 38,9). Ya muestra esas fotos, con las descripciones equivocadas.
- **La home no enlazaba ninguna nota**, y 11 páginas seguían sin indexar.
- **La foto "Sobre Anush"** decía "Anush tejiendo", y es un retrato.

### Qué se cambió

| Cambio | Evidencia | Trade-off |
|---|---|---|
| **27 portadas propias y 15 fotos dentro del texto.** Son 42 fotos en `public/photos/blog/`, sacadas de las fotos de producto, con nombre de archivo y texto alternativo que dicen lo que se ve. El encuadre va con `hero.position`, y el bloque `image` lleva a la ficha | La tabla de arriba y la guía de imágenes de Google Search Central (nombre de archivo, alt y contexto descriptivos) | Suma 9,2 MB al repo, aunque se sirven optimizadas en AVIF o WebP. Si Anush cambia la foto de un producto, la del blog no cambia: es a propósito, para que no se rompa |
| **6 notas nuevas.** Amigo invisible, Navidad de verano y regalos para una amiga (el estilo que más impresiones trae). Playa: "bolso playa" y "tote bag playa" no tenían página que las conteste. Chaleco: la ficha sale en posición 44 a 66 para "chaleco tejido". Pelotitas: cuidados es el segundo estilo que más rinde | Search Console, 28 días | Lo que dicen de cada pieza sale de su ficha, y lo general va marcado. Sin precios en el cuerpo |
| **Títulos nuevos** en la nota de regalos y en la de comprar crochet en Uruguay (la de cuidados cambió antes) | Regalos: 117 impresiones y 2,6% de CTR. Comprar: 46 y 4,3% | Es una prueba: medir el 11/10 |
| **Categorías con título en las palabras de la gente** ("tops de hilo"; "bolsos, bufandas y bandanas"; "sets de playa, salida y abrigo") y "Desde UYU X." al principio de la descripción | Accesorios: 70 impresiones y 0 clics. Búsquedas "top de hilo" y "set crochet" | El precio sale del catálogo en vivo, sin reglas de lote, igual que en las fichas |
| **Home: franja "Notas del taller"** con 3 notas | La home es la página que Google rastrea más seguido | Una sección más, antes de las preguntas frecuentes |
| La nota de comprar crochet en Uruguay recomienda las piezas más agregadas al carrito | Base, 12/09 | — |
| Texto alternativo de la foto de Anush en la home y en /atelier | Lo que se ve en la foto | — |
| `database/orden-y-palabras-2026-09.sql`, para Anush: Cardigans primero; "tops de hilo", "sets de crochet" y "bolsa dona" en las descripciones | Carritos y Search Console | Es idempotente, y todo se puede cambiar después desde el admin |
| `seo-report --detalle` incluye Google Imágenes | — | — |
| **Tareas nuevas:** `link-bio-ig` y `dahila-en-posts`. **Actualizadas:** `orden-categorias`, `palabras-busqueda` y `medir-titulo-cuidados` | — | — |

Ya estaba resuelto:
- las miniaturas grandes en Google (`max-image-preview: large`);
- el UTM de Instagram: las visitas a `/ig` se atribuyen solas a la bio.

### Lo que no se pudo hacer desde acá

- **Quitar `sitemap.xlm`.** Los permisos del entorno bloquearon el borrado por la API de Search Console: lo toman como un borrado irreversible. A mano es un minuto (tarea `sitemap-xlm`).
- **Pedir indexación.** Search Console no tiene API para eso; es manual (tarea `pedir-indexacion`).

### Verificación

- **Typecheck, lint y build:** OK (123 páginas, 27 notas).
- **Control de voz en las notas nuevas:** sin rayas largas, sin "artesanal" ni "auténtico", sin devoluciones ni IVA.
- **`blogtest.mjs`** (Playwright, 390 px):
  - las 6 notas nuevas y 6 de las cambiadas responden 200, con FAQ en el JSON-LD y sin ninguna foto vieja;
  - el índice del blog muestra 27 fotos distintas;
  - la home muestra las 3 notas;
  - las 5 categorías tienen el título nuevo y "Desde UYU": tops 990, accesorios 360, sets 980, cardigans 1.490 y sweaters 1.760.
- **Fotos "sin cargar" en la primera corrida:** eran fotos que seguían cargando con la caché del optimizador fría. `imgcheck.mjs`, esperando cada foto: **0 sin cargar de 62**, antes y después del último build.
- **Un 500 aislado de `/api/favorites`:** fue un "Gateway Timeout" de Supabase, pasajero y ajeno a estos cambios.
- **Lighthouse local** (celular, con la analítica bloqueada):

  | Página | CLS | LCP | Accesibilidad |
  |---|---|---|---|
  | Nota de Navidad | 0,000 | 3,9 s | 96 |
  | Home | 0,000 | 5,0 s | 96 |

  Solo queda el contraste del gris (R-07).
- **`micro.mjs`:** 17 de 17, como regresión de las microinteracciones.

---

## 11. Cuarta vuelta (13/09, noche): velocidad en el celular

Pedido de Mati:
- que la home cargue más rápido en el celular;
- repasar los clics de las notas;
- explicar lo del sitemap;
- commitear y pushear.

### Diagnóstico (Lighthouse, celular)

- **La foto principal bajaba rápido y tardaba en pintarse.** Terminaba de bajar en 0,3 a 0,6 s y tardaba otros 1,3 a 1,5 s en aparecer ("element render delay").
- **La causa principal fue el `loading.tsx` de la raíz** (y los de `/tienda` y la ficha), que envolvía cada página en un Suspense. En las páginas estáticas, el HTML traía primero el esqueleto y la página real escondida en `<div hidden id="S:0">`. React la revelaba con un script ubicado ~85 KB más abajo, y encima con un freno de ~300 ms (React 19 agrupa los revelados).
- **Google Analytics era el script más pesado:** 171 KB, ~0,9 s de CPU y 73 KB sin usar.
- **Polyfill de `Buffer` en todas las páginas.** Una mención a `Buffer` en `types.ts` (el fondo borroso de las fotos) sumaba un polyfill de ~9 KB comprimidos.
- **La foto principal se servía en calidad 95.**
- **Íconos PNG sin comprimir.** El de 192 px se descarga en cada primera visita.

### Cambios

| Cambio | Trade-off |
|---|---|
| **Sin `loading.tsx` en la raíz ni en la ficha.** El esqueleto de `/tienda` vive en `tienda/(listado)` y solo envuelve el listado, que se arma en cada visita. Además, una ficha inexistente ahora devuelve un 404 de verdad (antes, 200 con noindex) | Al navegar dentro del sitio hacia una página que no se precargó, no aparece el esqueleto. Las estáticas se precargan |
| **Google Analytics y Clarity con `lazyOnload`** (cambia la decisión R-08) | GA puede perder visitas de menos de un par de segundos, y Clarity empieza a grabar un poco más tarde. Umami sigue en `afterInteractive` |
| **Foto principal de la home en calidad 82** | Sin diferencia visible a ese tamaño |
| **`BLUR_DATA_URL` como texto fijo**, sin `Buffer` | — |
| **Íconos PNG comprimidos con paleta:** 192 px, de 37 a 9 KB; 512 px, de 187 a 46 KB; logo, de 222 a 46 KB; apple-touch, de 34 a 9 KB | Comparados a ojo: iguales |
| **Notas sin "\| Dahila Crochet" en el título:** quedan entre 40 y 61 caracteres. Zyppy (2021): Google reescribe menos los títulos de 51 a 60 caracteres, y el nombre del sitio ya aparece aparte | — |

### Medición

Lighthouse local, celular, con la analítica bloqueada, la caché caliente y la mediana de 3 corridas:

| Página | Antes | Después |
|---|---|---|
| Home | perf 53 · LCP 4,7 s · TBT 2.130 ms | perf 61 · LCP 4,1 s · TBT 1.626 ms |
| Ficha (Spring cardigan) | perf 48 · LCP 5,2 s · TBT 3.088 ms | perf 51 · LCP 5,1 s · TBT 2.046 ms |

En local la analítica va bloqueada, así que el efecto de diferir GA y Clarity no entra en estos números: se va a ver en producción. La línea de base del 12/09 era perf 46, LCP 5,5 s y TBT 4,0 s, con 0,9 s de gtag.

### Lo que falta para bajar más

- **La primera pintura sigue esperando.** En la medición sin simulación, el HTML de la home ya está leído a los 0,3 s, pero no se pinta nada hasta ~1,5 s. En el medio hay tareas largas de estilo, maquetado y JS al arrancar.
- **La próxima palanca es que la home sea sobre todo componentes de servidor.** Hoy es un solo componente de cliente de 27 KB que se hidrata entero. También conviene revisar el costo de los estilos: DOM grande, estilos en línea y `body:has(...)`. Es una refactorización para hacer con tiempo, no antes de un push.
- **Medir en producción con PageSpeed Insights después del deploy** (tarea `medir-velocidad`).

### Verificación

- **Typecheck, lint y build:** OK. Hubo que borrar tipos generados viejos en `.next/dev/types`, que apuntaban a `tienda/page.tsx`. En Netlify el build arranca limpio.
- **HTML:** la home, la ficha, la nota y el carrito ya no traen `template B:0` ni `div hidden`, y el contenido arranca en `<main>`. La home pasó de 220 a 208 KB y la ficha, de 195 a 172 KB.
- **Rutas:** responden 200 `/`, `/tienda` (con su esqueleto), `/tienda/cardigans`, `/tienda/spring-cardigan`, `/blog`, una nota, `/carrito` y `/encargo`. Una ficha inexistente devuelve 404.
- **Pruebas:**
  - `micro.mjs`: 17 de 17;
  - `smoke.mjs`: 60 de 62 (las 2 de siempre, texto que solo está en el payload).

---

## 12. Quinta vuelta (14/09): medición en GA4 e indexación del blog

Pedido de Mati: revisar qué muestran Search Console y GA4, qué eventos faltan, y seguir mejorando.

| Cambio | Problema y evidencia | Trade-off |
|---|---|---|
| **GA4 recibe eventos recomendados.** `view_item`, `add_to_cart`, `begin_checkout` (pedido por WhatsApp) y `generate_lead` (encargo), con precio y producto, más `sign_up` (lista VIP) y `search`. Umami sigue igual | GA4 mostraba "Eventos clave: 0" y recomendaba medir leads: los nombres propios no llenan los informes de e-commerce | En GA4 los eventos del embudo cambian de nombre; en Umami no |
| **Colas para gtag y Umami** | Con los scripts diferidos, la vista de la ficha se medía antes de que existieran y se perdía | — |
| **Tráfico interno excluido.** Nada se mide en `/admin`, ni en un navegador que entró al admin | "Admin \| Dahila Crochet" tenía 66 vistas en GA4 | Las visitas de Anush a la tienda, desde un dispositivo donde abrió el admin, no cuentan (a propósito) |
| **Búsquedas sin resultados** (`search_no_results` en Umami, `search` en GA4) | No había forma de ver qué busca la gente y no encuentra | Desde 4 letras y una vez por término, para no llenar de pedazos de palabra |
| **"Regalos tejidos a mano" entra en la franja de la home** | Search Console: sus impresiones subieron 232% | Sale la de pelotitas, que se pide a mano |
| **RSS `/blog/feed.xml` y `npm run sitemaps`** | La API de indexación no sirve y no hay API para "Solicitar indexación"; reenviar el sitemap sí se puede automatizar | — |

Estado al 14/09:
- 69 de 78 URLs indexadas.
- 5 de las 6 notas nuevas entraron en menos de 24 h.
- Search Console tiene 3 días de atraso: el efecto del deploy del 13/09 se ve desde el 16 o 17/09.

Verificación:
- typecheck y lint: OK;
- build con IDs falsos: OK;
- `analytics.mjs`: 9 de 9;
- `micro.mjs`: 17 de 17.

Pendiente de Mati después del deploy (tareas `medicion-on` y `tiktok-utm`):
- marcar `begin_checkout` y `generate_lead` como eventos clave;
- vincular Search Console con GA4;
- poner UTM en el link de TikTok.

---

## 13. Sexta vuelta (14/09): seguridad y de dónde vienen las ventas

Pedido de Mati: seguir mejorando las ventas y el análisis, y revisar la seguridad ("el script de SQL del admin").

**Estado verificado en vivo** (con la clave pública, solo lectura):
- El registro de cuentas de Supabase sigue abierto (`disable_signup: false`).
- Sin cuenta no se ve ninguna fila de carritos, favoritos, pedidos, encargos, suscriptoras, tejedoras, cupones ni costos. Eso está bien desde agosto.
- Lo que sigue abierto es "cualquier cuenta es admin":
  - el PASO 3 de `schema-security-hardening.sql` nunca se corrió;
  - el proxy del admin solo pedía tener sesión.
- `get_daily_summary()` la podía llamar cualquiera sin cuenta (carritos y encargos agregados).
- Next 16.2.6 tenía un aviso crítico. Entre otros problemas: saltarse el proxy con Turbopack y ejecución remota en el optimizador de imágenes con AVIF.
- Las cabeceras de seguridad en producción están bien (CSP, HSTS, X-Frame-Options, nosniff).
- Los datos de `/admin/estrategia` no aparecen en ningún JS público (0 de 19 archivos de las páginas públicas).

| Cambio | Problema y evidencia | Trade-off |
|---|---|---|
| **`database/seguridad-2026-09.sql`.** Un solo script: admin por mail, cierre de permisos por contenido, fotos solo para admin, `get_daily_summary` solo para el servidor, y una tabla de resultado al final | El PASO 3 viejo había que descomentarlo a mano, podía dejarte afuera del panel y dependía de los nombres de las policies (ya falló una vez por un nombre con espacio) | Hay que escribir el mail una vez, y lo tiene que correr Mati |
| **El proxy exige `is_admin()` en `/admin`.** El login cierra la sesión de las cuentas sin permiso | Con el registro abierto, cualquiera con cuenta entraba al panel | Una consulta más por cada navegación dentro del admin; el sitio público no la paga |
| **`getAdminUser()` en `updateEncargoStatus` y `/api/seo/reindex`** | Se pueden llamar directo, sin pasar por la página del admin | — |
| **El resumen diario usa la clave de servicio** | Hacía falta para poder cerrar `get_daily_summary` a la clave pública | Sin esa variable en Netlify el resumen sale en cero. Ya está cargada, porque el carrito la usa |
| **Next 16.3.5 y `npm audit` en 0** | Había avisos críticos y altos | Es una versión menor nueva: se probó con toda la batería |
| **Atribución "último clic no directo", 30 días** | El canal se guardaba solo en la pestaña, y quien volvía otro día quedaba como "Directo". GA4 registró 172 sesiones directas en 7 días | Una visita directa que llega después de una de Instagram se le acredita a Instagram (el mismo criterio que usa GA4) |
| **Los links de "Compartir" llevan `utm_source=compartido`**, y se manda el evento `share` | El boca a boca llegaba sin referrer y se contaba como "Directo" | El link compartido queda más largo |
| **Canal en el admin.** `/admin/pedidos` suma "De dónde vienen · 30 días" (pedidos, vendidos y monto por canal); `/admin/encargos`, una línea por canal | Se podía ver qué canal trae visitas, pero no cuál vende | — |

Orden para Mati:
1. Apagar el registro en Authentication.
2. Correr el SQL con su mail.
3. Hacer el deploy.

Si el deploy va antes y su cuenta no estaba en `admins`, el panel la rebota hasta que corra el SQL.

Verificación, sobre un build local de Next 16.3.5 con IDs de analítica falsos:
- typecheck y lint: 0 errores y 0 avisos;
- `security.mjs`: 13 de 13;
- `share.mjs`: 5 de 5;
- `analytics.mjs`: 9 de 9;
- `micro.mjs`: 17 de 17;
- `smoke.mjs`: 62 de 62. Se corrigieron 2 chequeos que daban falso positivo: el aviso de cola en los datos del carrito, y un texto de Configuración.

Lo que no se pudo probar desde acá: el panel con una cuenta admin real (no hay credenciales en este entorno) y el SQL en la base real.

Hallazgo en producción: `/tienda/sweater-cherry` dio 404 una vez. Era una copia vieja en la caché de Netlify, que se refrescó sola. Las 78 URLs del sitemap dan 200 desde entonces. Si Google la pidió en ese momento, eso explicaría por qué no está indexada: hay que pedir la indexación a mano (está en la lista).

---

## 14. 15/09: estadísticas, indexación y el 404 de sweater-cherry

**Seguridad:**
- El SQL se corrió: `get_daily_summary` da "permission denied" con la clave pública.
- El registro de cuentas sigue abierto (`disable_signup: false`): falta apagarlo en Authentication.

**Search Console** (16/08 a 12/09):
- 129 clics (+514%) y 891 impresiones (+532%), posición media 9,2.
- El 12/09 fue el día con más impresiones (82).
- Solo queda `sitemap.xml`: leído el 15/09, con 78 páginas y 64 imágenes, 0 errores. `sitemap.xlm` se quitó.

**Indexación:**
- De las 9 URLs que faltaban, 7 ya están: las 6 notas nuevas y /tienda/sweaters, rastreadas el 14/09.
- Faltan dos:
  - `/tienda/sweater-cherry`: Google la vio con 404 el 14/09 a las 13:05 UTC;
  - `/tienda/top-race`: Google todavía no la conoce.

**Qué búsquedas llevan a cada página:**
- /info, /contacto y /ofertas solo aparecen por "dahila" y "dahila uy": son los sublinks de la marca, así que su CTR bajo es normal.
- /tienda/tops sale por búsquedas de producto sin clics, en posiciones de 1,5 a 8: "top de hilo", "tops de lana", "tops tejidos", "top poncho". El título nuevo es del 13/09: medir desde el 21/09.

| Cambio | Problema y evidencia | Trade-off |
|---|---|---|
| **`resolveSlug` y `generateMetadata` lanzan un error** cuando la base falla y la copia de respaldo no conoce el slug | Google vio 404 en sweater-cherry. Se creó el 03/09 y la copia de respaldo era del 22/08: con una falla pasajera de la base, la ficha respondía "no existe", y ese 404 quedaba en la caché | Durante una caída, un producto nuevo muestra un error en vez de un 404. Es lo correcto, porque no se sabe si existe |
| **Copia de respaldo regenerada** el 15/09: 37 productos, con la clave pública | Tenía 3 semanas: le faltaban 2 productos y los precios estaban viejos | — |
| **`data-nosnippet` en el bloque de lista VIP del footer** | Google usaba "Anotate y comprá 24 horas antes…" como texto de los sublinks de Sets, Accesorios y Colección | Ese texto deja de aparecer en Google, pero se repite en todas las páginas, así que no aporta |

**Reseñas:** hay 9 de 5 estrellas en el Perfil, pedidas a cambio de un 10%. La política de Google lo prohíbe (support.google.com/contributionpolicy/answer/7400114): de acá en más hay que pedirlas sin incentivo.

**En Configuración falta** cargar el Perfil de Google, el link para reseñas y TikTok: el JSON-LD solo declara Instagram.

**Verificación:**
- typecheck, lint y build: OK;
- security: 13 de 13;
- share: 5 de 5;
- analytics: 9 de 9;
- micro: 17 de 17;
- smoke: 62 de 62. Incluye que un slug inexistente sigue dando 404 con noindex.

**No verificado:** el caso "base caída + slug fuera de la copia de respaldo", porque la base caída no se puede simular en el build local. Se revisó leyendo el código, que repite el criterio que ya usa `ProductPage`.

---

## 15. 16/09: reseñas reales de Google, fotos y CTR

**Search Console** (17/08 al 13/09): 130 clics (+519%) y 1.048 impresiones (+608%), posición media 8,8. El 13/09 marcó 166 impresiones en un día, contra 82 el 12/09 y unas 50 antes. El CTR bajó de 14,5% a 12,4%, que es lo esperable cuando entran muchas impresiones nuevas en posiciones más bajas.

**Indexación:** entraron 7 de las 9 que faltaban. Siguen afuera `/tienda/sweater-cherry` (Google no volvió a pasar desde el 404 del 14/09) y `/tienda/top-race`, que pasó de "no la reconoce" a "descubierta, sin indexar".

**Qué se descartó con datos:** /info, /contacto y /ofertas tienen 78 a 88 impresiones con casi ningún clic, pero las únicas búsquedas visibles que las traen son "dahila" y "dahila uy": son los sublinks de la marca y no se optimizan. El margen real está en las páginas en posición 6 o 7 con intención propia (cuidados 118, Accesorios 82, Tops 70, Tejedoras 64), y esas ya tienen título nuevo del 13/09: se miden el 21/09.

| Cambio | Problema y evidencia | Trade-off |
|---|---|---|
| **Sección de reseñas reales de Google en la home** (`GoogleReviews` + `/api/resenas` + `src/lib/google-reviews.ts`) | El Perfil tiene 9 reseñas de 5 estrellas y no aparecían en el sitio. Copiarlas a mano las deja viejas y sin atribución | Se piden al entrar en pantalla y no se guardan: la política de Places solo exime al identificador del lugar. Necesita `GOOGLE_PLACES_API_KEY`; sin clave, la sección no se dibuja |
| **Texto alternativo con el tipo de prenda** ("Spring cardigan: cardigan de crochet tejido a mano en Uruguay") | Google Imágenes da más de 200 impresiones en posiciones 20 a 50 y 1 clic, y 101 fotos no tienen alt propio | El alt es más largo, y también lo lee un lector de pantalla: por eso queda corto y sin relleno |
| **`/tienda` con precio de entrada en la descripción** ("Desde UYU 360.") | Es la segunda página con más impresiones (195, posición 4,5) y era la única sin número en el snippet | La descripción se arma con el catálogo: si no responde, va sin precio |
| **`database/perfiles-2026-09.sql`** (TikTok y Perfil de Google) | Sin esos links, el JSON-LD solo declara Instagram, y Google sigue sugiriendo "Dahlia Crochet" | Falta el link para dejar reseña, que solo está en el panel de Google |

**Reglas de Google verificadas el 16/09:**
- "You must not pre-fetch, cache, or store Places API content beyond the allowed exceptions"; el place ID es la excepción y "You can therefore store place ID values indefinitely". El permiso de 30 días de los términos es para coordenadas.
- Costo: SKU "Place Details Enterprise + Atmosphere", USD 25 cada 1.000 llamadas, con 1.000 gratis por mes.

**Verificación:** typecheck, lint y build OK. Reseñas 13 de 13 (incluye que sin clave no dibuja nada, que la respuesta va con `no-store`, y el render con datos simulados: nombre, foto, texto completo y link por reseña). Seguridad 13 de 13, Compartir 5 de 5, analítica 9 de 9, micro 17 de 17, smoke 62 de 62. Contra producción: las 78 URLs del sitemap dan 200.

**No verificado:** la llamada real a Google (la clave todavía no existe) y el panel con una cuenta admin real.

### Segunda parte del 16/09 (pedido de Mati: "optimizá y aplicá todo lo seguro")

| Cambio | Problema y evidencia | Trade-off |
|---|---|---|
| **Las reseñas van pasando solas** (una por vez, con flechas, puntos y pausa al pasar el cursor o con el teclado; 9 segundos) | Pedido de Mati. Tres tarjetas fijas ocupaban mucho y mostraban solo 3 de las 5 que trae Google | Cambia el texto mientras alguien lee: por eso 9 segundos y no 5, y respeta a quien pidió menos movimiento en su sistema |
| **Texto alternativo en TODAS las fotos de producto**: tienda, carrito, cajón del carrito, relacionados, "viste hace poco" y la página de Instagram | Google Imágenes da más de 200 impresiones con 1 clic. Antes esas fotos decían solo el nombre de la prenda | — |
| **`npm run indexnow`** (`scripts/indexnow-submit.mjs`) | El sitio solo avisaba a Bing cuando Anush guardaba algo en el admin: una nota nueva del blog llega por deploy y nunca se avisaba. La llave ya estaba publicada y responde 200 | Google no usa IndexNow; esto es para Bing, y ChatGPT busca con Bing |
| **`npm run seo-report -- --velocidad`** | "Medir la velocidad" era una tarea a mano cada vez. PageSpeed Insights lo hace por API, gratis | Sin clave comparte un cupo global que algunos días se agota: el informe lo dice y sigue. La clave gratuita (sin tarjeta) va en `PAGESPEED_API_KEY` |
| **`pinterest_url` en el SQL de perfiles** | Faltaba declarar la cuenta de Pinterest como oficial | — |

**`npm run ga` (nuevo):** informe de Google Analytics con la MISMA cuenta de servicio que Search Console, solo lectura. Saca usuarios, sesiones, eventos clave, canales, páginas, eventos y ciudades a `research/mediciones/ga-FECHA.md`. Con esto se termina la dependencia de capturas de pantalla para ver las analíticas. Falta que Mati habilite "Google Analytics Data API" y "Google Analytics Admin API" y agregue la cuenta de servicio como Lector en GA4. Probado: el script consigue el token y devuelve el error exacto con el link para habilitarla. La API de Analytics no cobra; limita consultas por hora.

**Tramo gratuito de Google Maps Platform (verificado el 16/09):** no es parejo. Las SKU Essentials traen 10.000 eventos gratis por mes, las Pro 5.000, y las Enterprise y "Enterprise + Atmosphere" (la de las reseñas) **1.000**. Lo que pasa del tope se cobra automáticamente. Por eso la tarea `places-tope`: ponerle un límite diario de solicitudes en Cloud, para que si algún día se pasa deje de responder en vez de facturar.

**Verificación de esta segunda parte:** typecheck, lint y build OK. Reseñas 17 de 17 (incluye que van pasando, que la segunda se abre en Google, los puntos y que sin foto muestra la inicial), seguridad 13 de 13, Compartir 5 de 5, analítica 9 de 9, micro 17 de 17, smoke 62 de 62. La etiqueta de Pinterest aparece una sola vez. `npm run indexnow -- --listar` lista las 78 URLs sin mandar nada.

**Dos cosas que se revisaron y NO había que tocar:**
- **Fichas de producto en Google.** Los datos estructurados ya están completos en todas: precio (o rango con `AggregateOffer`), moneda, disponibilidad, estado, `priceValidUntil`, envío, `sku`, marca, imagen y material. La diferencia entre una ficha que muestra la caja con precio y otra que no es la disponibilidad: las piezas a pedido salen como `BackOrder` y Google las muestra menos que las `InStock`. Se cambia marcando piezas como "Disponible ahora" en el admin, no en el código.
- **Pinterest** ya tiene el dominio verificado con una etiqueta cargada a mano en `layout.tsx` desde antes. Se probó agregar una segunda por variable de entorno y se revirtió: duplicaba la etiqueta.

---

## 8. Qué no se tocó

- El WIP de la tarjeta QR: `src/app/gracias/`, `database/tarjeta-qr-agradecimiento-2026-08.sql`, `entrega/tarjeta-agradecimiento-qr.md` y la sección `qr_thanks` de `src/app/admin/configuracion/page.tsx`. Este archivo no se editó en esta auditoría.
- Precios y plazos: ninguno cambió. Solo cambió qué precio real se muestra y con qué etiqueta.
- La base de producción: nada escrito. Todo cambio va como SQL para Anush.
- Nada commiteado ni pusheado.
