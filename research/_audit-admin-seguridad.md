# Auditoría — Admin, seguridad/privacidad y consistencia (2026-09-12)

Auditor de solo lectura. Área: `src/app/admin/**` (pensando en Anush desde el celular), seguridad/privacidad (`src/proxy.ts`, `src/app/api/**`, RLS en `database/*.sql`, cookies, cron) y consistencia de código. Verifica contra el working tree actual (incluye los cambios sin commitear del 12/09: `/admin/carritos`, `/admin/pedidos`, `/admin/estrategia`, `/api/orders` con `cart_id`, `src/lib/cart-cookie.ts`, `src/lib/profiles.ts`).

No se toca el WIP de la tarjeta QR (`src/app/gracias/`, sección `qr_thanks` de `/admin/configuracion`, `database/tarjeta-qr-agradecimiento-2026-08.sql`).

Estado: **COMPLETO** (13/09/2026, continuación de una sesión cortada por límite de uso). 9 hallazgos (1 crítico ya conocido y reverificado, 2 nuevos de impacto alto/medio, 6 de prolijidad/código), tabla de estado de `database/*.sql` y top-5 al final.

---

## Hallazgos

### X-01 — El signup de Supabase Auth sigue abierto (CRÍTICO, sigue igual desde julio)
**Qué pasa:** cualquiera puede crear una cuenta llamando directo a `POST {SUPABASE_URL}/auth/v1/signup` con la anon key (que viaja en el bundle público del sitio) — no hace falta que exista un formulario de registro en el sitio, alcanza con la API. Una vez logueada, esa cuenta es `authenticated`, y la mayoría de las tablas de administración (`products`, `site_settings`, `discounts`, `collections`, `testimonials`, `coupons`, `subscribers`, `product_costs`, etc.) siguen con policies `FOR ALL TO authenticated USING (true)` — "cualquier logueado es admin". Además, `src/lib/supabase/middleware.ts:39-56` (el `proxy.ts` de Next 16) protege `/admin/*` solo con `if (!user)`, nunca con `is_admin()` — o sea que esa misma cuenta cualquiera puede directamente entrar a las páginas del admin en el navegador (`/admin/productos`, `/admin/configuracion`, etc.), no solo pegarle a la API.
**Verificación propia (13/09, solo lectura, con la anon key):** `curl https://nuihzsytxolftcaggbbk.supabase.co/auth/v1/settings -H "apikey: <anon>"` → `"disable_signup":false,"email":true`. Confirma que sigue exactamente como lo dejó la auditoría de seguridad del 03-04/09 (`research/auditoria-tecnica-2026-09.md` §2): el archivo `database/schema-security-hardening.sql` ya tiene el PASO 3 corregido (tablas + los 2 nombres de policy con espacio) pero **sigue sin correrse en producción**. No repito ese análisis acá, solo confirmo que sigue vigente y que es lo más urgente de todo lo que toqué en esta ronda.
**Evidencia/fuente:** OWASP A01:2021 (Broken Access Control) — autorización a nivel de fila que depende de un check de "está logueado" en vez de "es admin"; verificación propia en vivo.
**Impacto:** alto (riesgo). Con signup abierto, cualquiera puede leer/editar/borrar el catálogo, cupones, config del sitio y la lista de suscriptoras (PII), y `product_costs` (info interna de costos) desde el propio navegador admin.
**Esfuerzo:** el fix ya está escrito (PASO 2 + PASO 3 de `schema-security-hardening.sql`); falta que Anush lo corra. No es código nuevo.
**Clasificación:** (C) necesita que Anush corra el SQL — más el PASO 0 (apagar "Enable email signups" en el dashboard de Supabase Auth), que es un toggle, no SQL, y cierra el agujero al instante mientras se hace el resto con calma.

### X-02 — `product_costs` ya existe en producción (el SQL de costos SÍ se corrió) — corregir la memoria
**Qué pasa:** `database/costos-produccion-2026-09.sql` estaba anotado como "pendiente, opcional" en el prompt de la auditoría total y en la memoria del proyecto, pero ya está corrido: `GET .../rest/v1/product_costs?select=product_id&limit=1` devuelve `200 []` (tabla existe, RLS la cierra a anon — correcto, tal como documenta el propio SQL en su comentario "acá NO hay policy de lectura para anon"). No se puede confirmar desde acá si las 31 filas de precarga entraron (eso requiere sesión de admin), pero la tabla y la policy están.
**Evidencia:** verificación propia con la anon key (13/09).
**Impacto:** bajo (es una corrección de estado, no un problema) — evita que una sesión futura pierda tiempo re-proponiendo correr un SQL que ya corrió, o recalculando el marcador de precios asumiendo que no hay costos cargados.
**Clasificación:** (D) descartar como pendiente — ya está aplicado. Pendiente real: confirmarle a Anush si cargó los 31 valores o si hay que verificarlo desde una sesión con acceso admin.

### K-01 — `schema-security-hardening.sql` PASO 4 quedó desactualizado y puede confundir a Anush
**Qué pasa:** el comentario del PASO 4 (`database/schema-security-hardening.sql:129-148`) dice que hace falta migrar `/api/cart` y `/api/favorites` a la service role key antes de poder cerrar `cart_items`/`favorites` — pero eso **ya se hizo** (confirmado en `src/app/api/cart/route.ts:24-26` con `createAdminClient()`, y en `src/lib/supabase/admin.ts`), y esas dos tablas **ya están cerradas del todo** por un archivo más nuevo y más fino, `database/cerrar-carritos-favoritos.sql` (que además le da a Anush una policy de lectura vía `is_admin()`, algo que el PASO 4 comentado ni contempla — dejaría la tabla en `FOR SELECT USING (false)` para todos, admin incluida). Si alguien lee `schema-security-hardening.sql` de punta a punta sin saber esto, puede pensar que el PASO 4 sigue pendiente y perder tiempo, o peor, descomentarlo y correrlo — lo que dejaría a `/admin/carritos` sin poder leer nada (policy `USING(false)` sin excepción para admin) hasta corregirlo.
**Archivo:línea:** `database/schema-security-hardening.sql:128-148`.
**Evidencia:** lectura cruzada de los dos archivos SQL + `src/app/api/cart/route.ts`.
**Impacto:** bajo-medio (confusión operativa, no un agujero de seguridad — la tabla ya está bien cerrada por el otro archivo).
**Esfuerzo:** bajo — una nota de una línea arriba del PASO 4 alcanza ("Superado por cerrar-carritos-favoritos.sql, correrlo YA — no tocar este PASO 4").
**Clasificación:** (A) aplicar ya. Trade-off: ninguno, es solo comentario.

### A-01 — En el editor de producto, desde el celular Anush NO puede sacar una foto, elegir cuál es la principal, ni reordenarlas (impacto alto)
**Qué pasa:** en "Fotos y videos" (ficha de producto, `src/app/admin/productos/[id]/page.tsx` y `.../nuevo/page.tsx`, mismo componente en ambos), cada miniatura tiene un overlay con los botones "Principal" y "Quitar" — pero ese overlay solo aparece con `:hover` (`src/app/admin/admin.css:749-763`: `opacity:0` por defecto, `opacity:1` recién en `.admin-media-item:hover`). En una pantalla táctil no existe `:hover`, así que esos dos botones **no se pueden activar de forma confiable desde el celular**. Y el tercer control — reordenar las fotos para elegir cuál queda primera (la propia UI dice "Arrastralas para ordenarlas · La primera es la principal", `productos/[id]/page.tsx:895`) — usa el Drag and Drop nativo de HTML5 (`draggable`, `onDragStart`, `onDrop`; `productos/[id]/page.tsx:971-974`), que **no funciona con gestos táctiles** en Safari/Chrome mobile sin una librería aparte (no hay ninguna acá). Resultado: subir fotos nuevas sí funciona desde el celular (el dropzone también abre el selector de archivos con un tap), pero las tres acciones para ORGANIZARLAS — sacar una que salió mal, marcar la principal, cambiar el orden — dependen todas de gestos de mouse que el celular no tiene.
**Archivo:línea:** `src/app/admin/admin.css:749-763` (overlay hover-only); `src/app/admin/productos/[id]/page.tsx:895` (texto que asume drag), `:971-974` (drag nativo), `:1001-1005` (botones dentro del overlay); mismo patrón en `src/app/admin/productos/nuevo/page.tsx:551` y `:585`.
**Evidencia/fuente:** el propio pedido de esta auditoría ("subir fotos… a un toque", "formularios usables en 390 px"); es el antipatrón "hover-only control" documentado por Nielsen Norman Group ("Touchscreen gestures... hover states don't exist on touch") — no hay ningún `@media (hover: none)` ni `(pointer: coarse)` en `admin.css` que dé una alternativa, confirmado con grep. HTML5 Drag and Drop no dispara eventos táctiles nativos sin polyfill — hecho conocido de la API (spec de WHATWG, sección de eventos de puntero).
**Impacto:** alto para el trabajo de Anush. La propia consigna de esta sesión es "admin para Anush, desde el celular" y "subir fotos" es una de las tareas que más usa. Hoy, para corregir cuál foto es la principal o sacar una mala, necesita una computadora — cuando sube fotos recién sacadas con el celular, es justo el momento en que NO tiene una a mano.
**Esfuerzo:** medio. No hace falta reescribir el drag and drop: (1) agregar `@media (hover: none), (pointer: coarse) { .admin-media-item .media-overlay { opacity: 1 } }` en `admin.css` para que "Principal"/"Quitar" queden siempre visibles en táctil — esto solo (bajo esfuerzo) ya destraba 2 de las 3 acciones; (2) para reordenar sin mouse, agregar dos botones "◀"/"▶" (mover atrás/adelante) en el mismo overlay que reutilicen la lógica de swap que ya existe para el drop (`handleMediaDragOver`/`handleDrop`), en vez de depender de arrastrar.
**Trade-off:** con el overlay siempre visible en táctil, la grilla de fotos se ve más cargada en el celular (textos superpuestos todo el tiempo en vez de solo al tocar) — aceptable frente a que hoy la función es directamente inalcanzable; se puede mitigar con iconos en vez de texto.
**Clasificación:** (A) aplicar ya — no depende de ningún dato ni decisión de Anush, es un bug de accesibilidad táctil verificable en el código.

### A-02 — El aviso de "cambios sin guardar" no cubre el caso más probable: navegar a otra página del admin
**Qué pasa:** `src/lib/use-unsaved-warning.ts` usa `beforeunload`, que solo dispara al cerrar la pestaña, recargar o salir del sitio — el propio comentario del archivo (líneas 14-16) ya avisa que "la navegación interna del App Router no dispara `beforeunload`". El menú del admin (`src/app/admin/AdminChrome.tsx`) usa `<Link>` de Next para cada ítem — o sea que si Anush está a mitad de escribir la descripción de un producto o de Configuración y toca "Pedidos" o cualquier otro ítem del menú lateral, **pierde los cambios sin ningún aviso**, porque esa navegación es del lado del cliente y nunca pasa por `beforeunload`. Es justo el escenario más probable de perder trabajo (tocar el menú para revisar otra cosa un momento), más probable que cerrar la pestaña.
**Archivo:línea:** `src/lib/use-unsaved-warning.ts:14-16` (comentario que ya documenta el hueco) · `src/app/admin/AdminChrome.tsx` (los `<Link>` del menú, sin chequeo de "hay cambios sin guardar en la página actual").
**Evidencia:** lectura del código; WCAG 3.3.4 (Error Prevention) recomienda poder revisar/confirmar antes de una acción que pierde datos ingresados.
**Impacto:** medio — depende de cuánto tiempo pasa Anush escribiendo antes de guardar (Configuración y el editor de producto son formularios largos).
**Esfuerzo:** medio. La forma menos invasiva: en las 3 páginas que ya trackean `isDirty`/`hasUnsavedChanges` (Configuración, editor de producto nuevo/existente), agregar un `onClick` a los propios `<Link>` del layout que, si hay cambios sin guardar, haga `e.preventDefault()` y muestre el mismo `confirm()` que ya usan esas páginas para su botón de "volver" (`productos/[id]/page.tsx:126`) — reusar el patrón existente en vez de interceptar el router globalmente (que sí sería invasivo, como bien dice el comentario).
**Trade-off:** exige que cada página con formulario largo exponga su estado "sucio" a un lugar que el layout pueda leer (un contexto chico, o un evento). Alcanza con las 2-3 páginas que ya lo trackean; no hace falta tocarlo en todo el admin.
**Clasificación:** (A) aplicar ya (es un gap conocido y acotado), aunque con más esfuerzo que un cambio de una línea — priorizar después de A-01.

### K-02 — Comentario y fallback de `/api/cron/daily-summary` desactualizados (bajo riesgo real hoy)
**Qué pasa:** el fallback de `src/app/api/cron/daily-summary/route.ts:43-64` (cuando `get_daily_summary()` falla) dice en su comentario "cart-only stats from **anon-readable** cart_items" — pero `cart_items` ya NO es legible por anon desde que se corrió `database/cerrar-carritos-favoritos.sql` (verificado hoy: `cart_items?select=id&limit=1` da `200 []` con la anon key). Si alguna vez el RPC `get_daily_summary` fallara (verificado hoy que SÍ existe y responde bien: `61` carritos, `75` ítems, `8` encargos), este fallback ya no devolvería "estadísticas de carritos" reales — devolvería todo en cero, sin error, y el mail del resumen diario diría "0 actividad" en un día con carritos de verdad. `database/schema-daily-summary.sql:9-10` tiene el mismo comentario desactualizado.
**Archivo:línea:** `src/app/api/cron/daily-summary/route.ts:43-45`; `database/schema-daily-summary.sql:9-10`.
**Evidencia:** verificación propia (13/09) — `get_daily_summary` RPC responde 200 con datos reales; `cart_items` responde `[]` a la anon key.
**Impacto:** bajo hoy (el camino principal funciona; el fallback casi no se ejecuta), pero silencioso si alguna vez se activa — el peor tipo de bug, porque no avisa que algo salió mal.
**Esfuerzo:** bajo — actualizar el comentario y, si se quiere prolijidad, que el fallback devuelva un aviso ("sin datos: revisá get_daily_summary()") en vez de ceros cuando la query de `cart_items` da vacío por RLS y no por falta de actividad real.
**Clasificación:** (A) aplicar ya (es de bajo esfuerzo), pero prioridad baja frente a A-01/A-02/X-01.

### K-03 — Botones del admin por debajo de 44 px (incluye los nuevos de Carritos/Pedidos)
**Qué pasa:** `.admin-btn { min-height: 40px }` y `.admin-btn-sm { min-height: 34px }` (`src/app/admin/admin.css:340-341`) son los únicos dos tamaños de botón de todo el admin — no hay ninguno que llegue a 44px. Es un patrón viejo (afecta las 17 páginas del admin por igual), pero esta ronda agregó controles nuevos que lo heredan: el selector de período (30/90/todo) y "Actualizar" en `/admin/carritos` (`admin-btn-sm`, 34px) y el mismo "Actualizar" en `/admin/pedidos`. En una tienda con ~90% de tráfico mobile y un admin pensado para el celular, son los botones que más se tocan de esa pantalla.
**Archivo:línea:** `src/app/admin/admin.css:340-341`.
**Evidencia/fuente:** WCAG 2.5.5 (Target Size, nivel AAA, 44×44px) y Apple HIG (mínimo 44pt) — el propio pedido de esta auditoría fija 44px como el estándar a usar. Nota: WCAG 2.5.8 (nivel AA, el mínimo obligatorio) solo exige 24px, así que esto no es un incumplimiento del nivel AA, es quedarse corto del nivel más cómodo para el pulgar.
**Impacto:** bajo-medio — los botones funcionan, solo son más chicos de lo ideal; no bloquea a nadie, pero suma fricción en cada toque.
**Esfuerzo:** bajo (dos líneas de CSS), con la salvedad de que subir `.admin-btn-sm` a 44px puede hacer que filas de botones chicos (como el selector de período, 3 botones en una fila) necesiten más espacio o pasen a 2 líneas en 390px — ya tienen `flexWrap: wrap`, así que el layout no se rompe, solo ocupa más alto.
**Clasificación:** (B) — es una mejora real pero pareja en las 17 páginas del admin (no algo que decida corregirse solo en las 2 nuevas); mejor que Anush confirme si vale la pena el cambio de layout en toda la barra de navegación/acciones del admin antes de tocar un token que es global.

### K-04 — Detalle menor: `aria-label` en inglés en un admin que es 100% en español
**Qué pasa:** el botón de abrir/cerrar el menú lateral tiene `aria-label="Toggle sidebar"` (`src/app/admin/AdminChrome.tsx`, botón `admin-mobile-toggle`), mientras que el resto de los `aria-label` del admin — incluido el de "Cerrar sesión" a dos líneas de distancia, en el mismo archivo — están en español. Sin impacto visual (no lo lee nadie salvo un lector de pantalla), pero es una inconsistencia de idioma detectable.
**Evidencia:** lectura directa del archivo.
**Impacto:** bajo.
**Esfuerzo:** trivial ("Abrir menú" / "Cerrar menú").
**Clasificación:** (A) aplicar ya.

### K-05 — Hex sueltos en TODO el admin (patrón viejo, no nuevo de esta ronda)
**Qué pasa:** las 17 páginas de `src/app/admin/**` usan colores hex sueltos en `style={{ color: '#8C8285' }}` etc. en vez de los tokens de `dahila`/`globals.css` — `admin.css` no define ninguna variable CSS propia (`grep '^--'` no encuentra nada). Es consistente en sí mismo (los mismos hex se repiten: `#1F1A1B`≈ink900, `#8F3B53`≈wine600, `#B6314A`=rojo de alerta, `#8C8285`/`#4A4143`/`#5B5356` como grises secundarios) y las páginas nuevas de esta ronda (`carritos/page.tsx`, `pedidos/page.tsx`) simplemente siguieron el mismo patrón que ya existía — no es una regresión de esta sesión.
**Impacto:** bajo — es cosmético/mantenimiento, no le llega a Anush ni a una clienta (el admin no es parte del storefront que cubre la skill `dahila-storefront`).
**Esfuerzo:** alto si se quisiera unificar (tocaría las 17 páginas para extraer variables CSS y reemplazar cada literal).
**Clasificación:** (D) descartar por ahora — el costo de refactorizar 17 páginas por un problema puramente cosmético/interno no se justifica frente a A-01/A-02, que si afectan el trabajo real de Anush. Dejar anotado por si alguna vez se reescribe el admin.

---

## Verificado y bien (no tocar)

- **Cookies del carrito y favoritos:** `httpOnly: true`, `sameSite: 'lax'`, `secure` en producción, `maxAge` 30 días (`src/app/api/cart/route.ts:42-49`, mismo patrón en `favorites/route.ts:36-38`). Como corresponde para una cookie que identifica un carrito anónimo.
- **`/api/cart`, `/api/orders`:** rate-limit + validación de tipos/longitudes + `cart_id` validado por regex antes de guardarlo (`src/app/api/orders/route.ts:76`, `src/app/api/cart/route.ts:34`) — ningún input de body pasa crudo a la base.
- **`src/lib/supabase/admin.ts`:** cliente service-role bien encapsulado (`import 'server-only'`, cae a `null` si falta la env var en vez de romper, comentario explícito de las 3 reglas de uso). Solo lo importan `api/cart` y `api/favorites` — confirmado con grep, ningún componente `'use client'` lo toca.
- **Sin secretos en el cliente:** grep de `process.env` en todos los archivos `'use client'` del repo → únicamente `NEXT_PUBLIC_CLARITY_ID` y `NEXT_PUBLIC_GA_MEASUREMENT_ID` (ambas ya públicas por diseño, con el prefijo `NEXT_PUBLIC_`).
- **`.env.local` bien excluido:** `.gitignore:13` (`.env*`) confirma que nunca se commiteó; no aparece en `git log --all`.
- **Cabeceras de producción** (`curl -sI https://dahila.uy/`, 13/09): CSP, `X-Frame-Options: DENY`, `Strict-Transport-Security` con `preload`, `X-Content-Type-Options: nosniff`, `Permissions-Policy` acotado — coherente con `next.config.ts`, sin cambios desde la auditoría de 03-04/09.
- **`/admin` doblemente fuera de buscadores:** `robots.txt` en producción lo desaloja explícitamente (`Disallow: /admin`) y además cada página del admin ya lleva su propio `noindex` (`src/app/admin/layout.tsx:6`).
- **`cart_items`/`favorites`/`orders`/`custom_orders`/`admins` cerradas a `anon`:** confirmado hoy con la anon key, las 5 devuelven `[] `/`200` (sin filas) — nadie de afuera puede leer carritos, pedidos o encargos ajenos.
- **`/api/orders`, `/admin/pedidos`, `/admin/carritos`:** sin división por cero en ningún cálculo del embudo (`pct()`, `ordersPer100`, `closeRate` guardan el caso "0 de 0" con `?? '—'`/`whole > 0 ?`); los mensajes de error de RLS/columna faltante están traducidos a texto llano para Anush, nunca un código crudo tipo `PGRST116`.
- **Todas las acciones de "Eliminar" del admin piden confirmación** (`confirm()` nativo con el nombre del ítem, o un modal propio en Productos) — verificado en Productos, Colecciones, Colores, Cupones, Descuentos, Testimonios, Categorías, Suscriptores, Tejedoras y Encargos.
- **`useUnsavedWarning`** hace lo que promete para el caso que sí puede cubrir (cerrar pestaña/recargar) y documenta honestamente su propio límite — ver A-02 para el hueco que ese límite deja abierto.
- **`/api/seo/reindex` y `/api/cron/daily-summary`:** ambos exigen autenticación (sesión o `CRON_SECRET` con comparación de tiempo constante) — sin cambios desde la auditoría de 03-04/09.

## Estado de `database/*.sql` (verificado con la anon key donde es posible)

| Archivo | Estado | Cómo se supo |
|---|---|---|
| `schema.sql` / `schema-master.sql` / `schema-extra.sql` | Corrido | El sitio funciona sobre estas tablas base (no re-verificado columna por columna esta ronda) |
| `schema-favorites.sql` | Corrido | `favorites` existe (cerrada a anon, ✓ hoy) |
| `schema-orders.sql` | Corrido | Confirmado en memoria 23/08 + `orders` existe hoy |
| `schema-orders-attribution.sql` | Corrido | `orders?select=utm_source&limit=0` → 200 (hoy) |
| `schema-encargos-attribution.sql` | Corrido | `custom_orders?select=utm_source&limit=0` → 200 (hoy) |
| `schema-archive-orders.sql` | Corrido | `custom_orders?select=archived_at&limit=0` → 200 (hoy) |
| `schema-discounts.sql` | Corrido | `discounts` responde 200 (hoy) |
| `schema-collections.sql` | Corrido | `collections` responde 200 (hoy) |
| `schema-testimonials.sql` | Corrido | `testimonials` responde 200 (hoy) |
| `schema-cupones.sql` | Corrido | Feature de cupones activo (auditorías previas) |
| `schema-suscriptores.sql` | Corrido | `subscribers` responde 200 (hoy); `/admin/suscriptores` funcional |
| `schema-tejedoras.sql` | Corrido | `/admin/tejedoras` funcional (auditorías previas) |
| `schema-encargo-tracking.sql` | Corrido | `/encargo/estado` existe y se usa (no re-verificado hoy en detalle) |
| `schema-daily-summary.sql` | **Corrido** | `rpc/get_daily_summary` responde 200 con datos reales (hoy: 61 carritos, 8 encargos) |
| `cerrar-carritos-favoritos.sql` | **Corrido** | `cart_items`/`favorites` devuelven `[]` a la anon key (hoy) — antes devolvían filas de cualquiera |
| `embudo-pedidos-2026-09.sql` | **Corrido** | `orders.cart_id`/`orders.status` existen (hoy); coincide con la memoria del 12/09 |
| `costos-produccion-2026-09.sql` | **Corrido** (dato nuevo de esta auditoría — la memoria lo daba como "pendiente") | `product_costs` existe, cerrada a anon (hoy) — no se puede confirmar desde acá si las 31 filas de precarga entraron |
| `schema-security-hardening.sql` | **PASO 1-2 corridos, PASO 3 sin correr, PASO 4 superado (no correrlo — ver K-01), PASO 5 sin programar** | `admins`/`is_admin()` existen; `disable_signup:false` hoy (PASO 0 tampoco se hizo); `cleanup_stale_carts` no se puede probar desde afuera (`REVOKE ALL ... FROM anon`), memoria del 12/09 confirma que su `cron.schedule` sigue comentado |
| `drops-2026-07.sql`, `precios-2026-07.sql`, `descripciones-productos-2026-07.sql`, `descripciones-categorias-2026-09.sql`, `faq-seo-variante-nombre-2026-07.sql`, `fix-discount-flag-2026-09.sql`, `quitar-devoluciones-2026-09.sql`, `unificar-cuidados-2026-09.sql`, `whatsapp-2026-07.sql` | No verificado en profundidad esta ronda | Son migraciones de contenido/precios, no de seguridad ni del admin — fuera del foco pedido para esta auditoría |
| `tarjeta-qr-agradecimiento-2026-08.sql` | Fuera de alcance | WIP explícitamente excluido de esta auditoría |

## Top-5

1. **X-01 (crítico, sigue abierto):** el signup de Supabase Auth sigue habilitado y la mayoría de las tablas de administración siguen en `USING (true)` para cualquier autenticado — confirmado hoy, sin cambios desde julio. El fix ya está escrito; falta que Anush lo corra (PASO 0 del dashboard primero, es un toggle).
2. **A-01 (alto, nuevo):** en el editor de producto, Anush no puede sacar una foto, marcarla como principal ni reordenarlas desde el celular — los tres controles dependen de `:hover`/drag-and-drop de mouse, que no existen en pantallas táctiles.
3. **A-02 (medio):** el aviso de "cambios sin guardar" no cubre navegar a otra página del admin por el menú (el caso más probable de perder trabajo), solo cerrar la pestaña.
4. **K-01 (bajo-medio, prolijidad):** el PASO 4 de `schema-security-hardening.sql` quedó obsoleto y puede llevar a correrlo por error, rompiendo `/admin/carritos`.
5. **K-02 (bajo, prolijidad):** el fallback de `/api/cron/daily-summary` asume que `cart_items` sigue siendo legible por `anon` — ya no lo es; si el camino principal fallara alguna vez, el mail diría "cero actividad" en silencio.

**Bloqueante real de esta ronda:** ninguno impide seguir trabajando — pero el punto 1 (X-01) es del tipo que no debería esperar otra sesión: es un toggle en el dashboard de Supabase, no requiere código.



