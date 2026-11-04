# Caza de bugs: lo que Anush guarda vs lo que el sitio muestra (04/11/2026)

Solo lectura de código, sobre el estado LOCAL (incluye los cambios sin commit). No se navegó el admin ni se tocó la base.
Punto de partida: el bug del 03/11 (`p.lead_time_weeks_min ? … : '2'` en el editor), ya arreglado y pusheado en 6e68680.

**Resumen:** 3 de severidad alta, 8 media y 12 baja. El barrido de "0/vacío" encontró **un solo caso más de la misma familia que cambia datos** (la foto principal, #4). El resto de los `|| n` / `? String() :` están bien porque ahí 0 no es un valor válido (ver tabla del final). Los riesgos más grandes son otros dos:
- **Configuración guarda TODAS las claves** que cargó al abrirse y pisa lo que otras pantallas (o el reloj de mails) escribieron mientras tanto.
- **Colecciones regenera el slug** cada vez que se edita el nombre.

---

## ALTA

### 1. Configuración pisa ajustes guardados desde otras pantallas (y puede re-mandar el mail del drop)
- **Dónde:** `src/app/admin/configuracion/page.tsx:557-565` (carga `select('*')` de `site_settings`) y `:591-601` (hace `upsert` de **todas** las claves cargadas).
- **Qué pasa:** el formulario carga las ~150 filas de `site_settings`, incluidas las que NO edita: `lista_email_enviado`, `lista_envio_auto`, `lista_email_estado`, `lista_drop_*`, `reels`, `ig_destacado_slug`, `blog_hero:*`, el progreso de Estrategia, `lista_cron_visto`. Al guardar las reescribe todas con el valor de cuando se abrió la pestaña.
- **Escenarios reproducibles:**
  1. Anush abre Configuración a las 18:00 y la deja abierta. A las 19:00 el reloj (`api/cron/lista-privada`) manda el aviso del drop y anota `lista_email_enviado = "Nombre|fecha"`. A las 19:30 Anush corrige un texto y guarda. Resultado: `lista_email_enviado` vuelve al valor viejo, y en la pasada de las 20:00 `alreadySent` da false (`lib/email/lista-drop.ts:100`). **El mail sale de nuevo a toda la lista.**
  2. En Suscriptores apaga el envío automático (`lista_envio_auto = 'false'`) con Configuración abierta en otra pestaña. Guarda Configuración y el envío queda **prendido otra vez**.
  3. Cambia la prenda fijada en la bio (Productos → marcador, `ig_destacado_slug`), cambia una portada del blog o la restaura (la restauración BORRA la clave), o edita Reels. Después guarda Configuración, abierta desde antes: **todo vuelve a como estaba**, y la portada borrada se re-crea.
  4. Los cambios que se hicieron en producción con service role el 04/11 (`promo_bar_text`, `hero_cta_href`, `queue_note_enabled`) se revierten si Anush tenía Configuración abierta desde antes.
- **Arreglo:** guardar solo las claves que cambiaron contra el snapshot, y solo las que esta pantalla edita.
```diff
--- a/src/app/admin/configuracion/page.tsx
+++ b/src/app/admin/configuracion/page.tsx
@@
+// Solo estas claves se editan acá. Las demás filas de site_settings las
+// escriben otras pantallas (Suscriptores, Reels, Blog, Productos → bio) o
+// el reloj de mails; reescribirlas con el valor de cuando se abrió la
+// pestaña revertía esos cambios.
+const EDITABLE_KEYS = new Set<string>([
+  ...SECTIONS.flatMap((s) => s.fields.map((f) => f.key as string)),
+  'hero_image_position',
+])
@@ const handleSubmit = async (e: React.FormEvent) => {
-      const updates = Object.entries(settings)
-        .filter(([, v]) => v !== undefined && v !== null)
+      const before = JSON.parse(savedSnapshot || '{}') as Record<string, string>
+      const updates = Object.entries(settings)
+        .filter(([k, v]) => EDITABLE_KEYS.has(k) && v != null && before[k] !== v)
         .map(([key, value]) => ({
           key,
           value: value ?? '',
           updated_at: new Date().toISOString(),
         }))
+      if (updates.length === 0) { setSuccess(true); setSaving(false); return }
```

### 2. Editar el nombre de una colección le cambia el slug (rompe /colecciones/sunset-26)
- **Dónde:** `src/app/admin/colecciones/page.tsx:201`: `onChange={(e) => { setName(e.target.value); setSlug(slugify(e.target.value)) }}`. Corre también cuando `editingId` está seteado.
- **Escenario:**
  1. En Colecciones, tocar el lápiz de "Sunset '26".
  2. Corregir el nombre, por ejemplo a "Sunset 2026" o "Sunset '26 ☀️".
  3. Guardar cambios.
- **Resultado:** el slug pasa a `sunset-2026` y `/colecciones/sunset-26` da **404**. Ese link lo usan los anuncios de Meta, `promo_bar_link`, `hero_cta_href` y `drop_collection_slug`. Con ese último roto, home, /ig y el mail de la lista dejan de mostrar el link (`page.tsx:43-49`, `ig/page.tsx:56-58`, `lista-drop.ts:60-63`). No hay ningún aviso ni redirect.
- **Arreglo:**
```diff
-              <input type="text" value={name} onChange={(e) => { setName(e.target.value); setSlug(slugify(e.target.value)) }} placeholder="Ej. Invierno 2026" required />
+              <input type="text" value={name} onChange={(e) => { setName(e.target.value); if (!editingId) setSlug(slugify(e.target.value)) }} placeholder="Ej. Invierno 2026" required />
@@ const handleSubmit
+      const original = editingId ? collections.find((c) => c.id === editingId) : undefined
+      if (original && original.slug !== finalSlug && !confirm(
+        `Vas a cambiar la dirección de /colecciones/${original.slug} a /colecciones/${finalSlug}. ` +
+        'Los links viejos (anuncios, Instagram, barra de promo) van a dar error. ¿Seguro?')) return
```
  Mismo criterio para el slug de la ficha de producto (#10).

### 3. Una prenda agotada, en borrador o con el talle sin stock se sigue pidiendo desde el carrito
- **Dónde:**
  - `src/app/api/cart/route.ts:26-27,53-62`: `loadItems` trae el producto con el **cliente de servicio**, así que sin RLS llega también en `draft` y en drops ocultos.
  - `src/app/carrito/CarritoClient.tsx:171-180` y `:81-101`: subtotal y mensaje de WhatsApp solo filtran `!!item.product`. El comentario de `:171-174` supone que la RLS esconde los borradores, pero eso dejó de ser cierto cuando la ruta pasó a service role.
  - `CartDrawer`, igual.
- **Escenario:**
  1. Una clienta agrega el único "Top X" en stock (la cookie dura 30 días).
  2. Anush lo vende por Instagram y lo marca **Agotado**, o le destilda "Stock" al talle.
  3. La clienta vuelve: el carrito muestra la prenda con precio, la suma al total y la manda en el mensaje ("Hola Anush! Quiero coordinar este pedido…"). También queda registrada en `orders`.
- **Escenario b:** Anush renombra el talle ("Único" → "Talle único"). El ítem queda con un talle que no existe, `getEffectivePrice` cae al precio base y, si la prenda solo tiene precio por talle, el mensaje dice **UYU 0**.
- **Arreglo:** marcar el ítem como no disponible y sacarlo del total y del mensaje.
```diff
--- a/src/app/carrito/CarritoClient.tsx
+++ b/src/app/carrito/CarritoClient.tsx
+/** El ítem ya no se puede pedir: la prenda dejó de estar activa, es a medida, o el
+ *  talle ya no existe / no tiene stock (cambios del admin después de agregarla). */
+function itemUnavailable(item: { size: string; product?: Product | null }): boolean {
+  const p = item.product
+  if (!p || p.status !== 'active' || p.is_custom_only) return true
+  const sizes = p.sizes ?? []
+  if (sizes.length === 0) return false
+  const row = sizes.find((s) => s.size === item.size)
+  return !row || row.available === false
+}
@@
-  const subtotal = items
-    .filter((item) => !!item.product)
+  const buyable = items.filter((item) => !itemUnavailable(item))
+  const subtotal = buyable
     .reduce(
```
  `buildWhatsAppMessage`, `couponEffect` y `/api/orders` tienen que recibir `buyable` en vez de `items`. En la fila del ítem va el aviso "Ya no está disponible · Quitar". Mismo filtro en `CartProvider` (total del drawer).

---

## MEDIA

### 4. La foto "Principal" que elige Anush se pierde al volver a guardar la ficha (misma familia que el bug del 03/11)
- **Dónde:** `src/app/admin/productos/[id]/page.tsx:179`: `is_primary: m.is_primary || idx === 0`.
- **Escenario:**
  1. En la ficha, tocar "Principal" en la 3ª foto. `setPrimary` cambia solo la marca, no el orden.
  2. Guardar. En la base: pos 0 `false`, pos 2 `true`. El sitio muestra la 3ª, bien.
  3. Volver a abrir la ficha. Al cargar, la pos 0 también queda `true` y se ven dos "Principal".
  4. Cambiar cualquier cosa (precio, descuento) y guardar. Las dos se guardan `true`.
  5. `getPrimaryMedia` (`lib/types.ts:406-409`) desempata por posición y gana la **pos 0**. Se pierde la foto elegida en la tarjeta, el JSON-LD, el feed de Merchant, el OG y el catálogo de Meta. En la galería de la ficha la 3ª queda segunda.
- **Arreglo:**
```diff
-          is_primary: m.is_primary || idx === 0,
+          is_primary: !!m.is_primary,
         }))
+      // Una sola principal: la marcada (la de menor posición si hay varias); si ninguna, la primera.
+      const firstPrimary = mappedMedia.findIndex((m) => m.is_primary)
+      mappedMedia.forEach((m, i) => { m.is_primary = i === (firstPrimary === -1 ? 0 : firstPrimary) })
       setMediaEntries(mappedMedia)
```

### 5. /carrito muestra prendas de un drop que todavía no se lanzó
- **Dónde:** `src/app/carrito/page.tsx:22-27`: consulta propia `products … eq('status','active') .limit(24)` sin `collection:collections(*)` ni `dropVisibility`. Alimenta el carrito vacío (`CarritoClient.tsx:429-440`, las 4 primeras) y "Sumale un detalle".
- **Escenario:**
  1. Para el próximo drop, Anush deja las prendas **activas** con la colección en "Borrador" o "Próximamente". Es justo lo que pide el admin: "dejalas listas de antemano".
  2. Como son lo nuevo, las sube arriba del orden.
  3. Cualquiera que abre /carrito vacío ve las prendas del drop con foto y precio, y las puede agregar: `/api/cart` POST tampoco mira `dropVisibility` (`route.ts:104-112`).
- **Arreglo:** usar el catálogo, que ya viene filtrado y cacheado (además ahorra una consulta):
```diff
-  const [settingsRes, featuredRes, discountsRes] = await Promise.all([
-    supabase.from('site_settings')…,
-    supabase.from('products').select('*, …').eq('status', 'active').order('sort_order').limit(24),
-    supabase.from('discounts').select('*').eq('active', true),
-  ])
+  const { products, discounts, settings } = await getCatalog()
+  const featured = products.filter((p) => p.status === 'active').slice(0, 24)
```
  Y en `api/cart/route.ts` POST, agregar `collection_id, collection:collections(published, unlisted)` al select y rechazar `dropVisibility(product) === 'hidden'`.

### 6. Cupones: la fecha "hasta" se corre un día cada vez que se edita el cupón
- **Dónde:** `src/app/admin/cupones/page.tsx:46-48` (`toDateInput` = `ts.slice(0, 10)`, que es la fecha **UTC**) y `:163` (guarda `${ends_at}T23:59:59` en hora local).
- **Escenario:**
  1. Crear un cupón "hasta 07/11". Se guarda `2026-11-08T02:59:59Z`.
  2. Abrir para editar. El input muestra **08/11**.
  3. Cambiar solo el nombre y guardar. Se guarda `2026-11-09T02:59:59Z`: el cupón dura un día más, y otro más con cada edición. La lista (con `toLocaleDateString`) muestra la fecha nueva sin que nadie la haya tocado.
- **Arreglo:**
```diff
 function toDateInput(ts: string | null): string {
-  return ts ? ts.slice(0, 10) : ''
+  // Fecha en Montevideo, no en UTC: "hasta 7/11 23:59" es 8/11 02:59 UTC.
+  return ts ? new Date(ts).toLocaleDateString('en-CA', { timeZone: 'America/Montevideo' }) : ''
 }
```

### 7. "Envío gratis desde 1.600" se lee como $1: envío gratis en todos los pedidos
- **Dónde:** `src/app/layout.tsx:219`: `parseInt(settings.free_shipping_threshold ?? '', 10) || 0`.
- **Escenario:** en Configuración → Información, Anush escribe `1.600`, con el punto de miles como se escribe en Uruguay. `parseInt('1.600') = 1`. El carrito promete "Envío gratis" en todo pedido y el WhatsApp dice "Envío gratis (pedido arriba de UYU 1)". Con `$1600` pasa lo contrario: `NaN` → 0, y el umbral queda apagado sin aviso.
- **Arreglo:**
```diff
-  const freeShippingThreshold = Math.max(0, parseInt(settings.free_shipping_threshold ?? '', 10) || 0)
+  // "1.600", "$1600", "1 600" → 1600 (en Uruguay el punto es de miles).
+  const freeShippingThreshold = Math.max(0, parseInt((settings.free_shipping_threshold ?? '').replace(/\D/g, ''), 10) || 0)
```
  Lo mismo para `encargos_cupos_total`/`taken` (`components/EncargosDisponibles.tsx:75-76`). En Configuración conviene mostrar debajo del campo "Se lee como $X".

### 8. Guardados que dicen "listo" sin haber guardado nada (UPDATE con 0 filas)
- **Dónde:** cada `.update(...).eq('id', …)` sin `.select()`. Con la sesión vencida o sin permiso de admin, Postgres no da error: actualiza 0 filas. Casos:
  - `productos/[id]/page.tsx:511-535` (y el delete/insert de fotos, talles y colores a continuación);
  - `productos/page.tsx:242` (publicar/despublicar), `:284` (orden), `:412-419` (precios en lote, "Guardado: N prenda(s)");
  - `colecciones/page.tsx:130,148`; `descuentos/page.tsx:88`; `categorias/page.tsx:117-126,171-174`; `colores/page.tsx:103,128,174`; `cupones/page.tsx:174,192`; `testimonios/page.tsx:55-58` (y `:74`: el delete ni siquiera mira el error);
  - `encargos/actions.ts:31-41` (devuelve `ok: true` si `data` es null).
- **Escenario:** Anush deja el admin abierto en el celular. La sesión vence (cambio de contraseña, logout en otro dispositivo, token revocado). Cambia un precio y guarda: "Producto actualizado exitosamente", y en la tienda nada cambió. Si la prenda tiene fotos, el insert sí falla, pero con un mensaje engañoso: "Ejecutá database/schema-extra.sql". `pedidos/page.tsx:125` y `Produccion.tsx:35` ya lo hacen bien.
- **Arreglo (patrón):**
```diff
-      const { error: productError } = await supabase.from('products').update({…}).eq('id', productId)
-      if (productError) throw productError
+      const { data: upd, error: productError } = await supabase.from('products').update({…}).eq('id', productId).select('id')
+      if (productError) throw productError
+      if (!upd || upd.length === 0) throw new Error('No se guardó: tu sesión del admin venció. Volvé a entrar y guardá de nuevo.')
```

### 9. La ficha abierta pisa cambios hechos después (y borra `stock_qty`)
- **Dónde:** `productos/[id]/page.tsx:511-596`. Reescribe **todas** las columnas con lo que se cargó al abrir, y borra y vuelve a insertar talles, fotos y colores. El insert de talles no lleva `stock_qty` (`:569-577`), así que vuelve a NULL.
- **Escenarios:**
  - Anush abre la ficha en el celular y en la compu cambia precios en lote, o se corrige algo por service role, como el `lead_time_weeks_min = 0` de las 4 del drop el 04/11. Después guarda la ficha del celular (por ejemplo para poner el −15%): vuelven el precio viejo y las 2 semanas. Es el mismo síntoma del 03/11 por otro camino.
  - Si algún talle tiene `stock_qty` cargado por SQL (lo lee `getScarcity`, "Quedan N"), cualquier guardado lo borra.
- **Arreglo:** control optimista con `updated_at`, y conservar `stock_qty`.
```diff
+  const [loadedUpdatedAt, setLoadedUpdatedAt] = useState<string | null>(null)   // en fillProductForm: setLoadedUpdatedAt(p.updated_at ?? null)
@@
-        .eq('id', productId)
+        .eq('id', productId)
+        .eq('updated_at', loadedUpdatedAt)   // si alguien la cambió después de abrirla, 0 filas
+        .select('id, updated_at')
+      if (!upd?.length) throw new Error('Esta prenda cambió desde que la abriste (otra pestaña o el lote de precios). Recargá la página para no pisar esos cambios.')
@@ interface SizeEntry
+  stock_qty?: number | null
@@ sizeInserts
             sort_order: i,
+            stock_qty: s.stock_qty ?? null,
```

### 10. Cambiar el slug de una prenda: 404 sin redirect, se suelta de la bio y del reel
- **Dónde:** `productos/[id]/page.tsx:771-785` (botón Auto/Manual) y `:515`. La ruta `/tienda/[slug]` solo redirige basura pegada (`lib/slug.ts`), no slugs viejos. `ig_destacado_slug` y `reels` guardan el slug.
- **Escenario:** tocar "Auto" y corregir el nombre. El slug cambia, y la URL que está en anuncios, Google, Merchant y la bio de Instagram da 404. La prenda deja de estar fijada en /ig y su reel desaparece de la ficha (`resolveReels` busca por slug). Nada lo avisa.
- **Arreglo mínimo:** `confirm()` igual que en #2 cuando `slug !== slugOriginal`. A futuro, una tabla `slug_redirects` que lea `resolveSlug`.

### 11. El catálogo cachea 1 hora un error de descuentos, de configuración o de colecciones
- **Dónde:** `src/lib/catalog.ts:173-175`: solo `productsRes.error` y `categoriesRes.error` hacen lanzar. Si falla `discounts`, `site_settings` o `collections`, se devuelve `[]`/`{}` y **queda en caché** hasta 1 h (TTL y tag).
- **Escenario:** un error transitorio de Supabase justo en la regeneración durante el −15% por lote. Toda la tienda muestra precio lleno durante 1 h. Si el que falla es settings, todos los toggles vuelven a sus valores por defecto: la barra de promo sin texto, el botón flotante de WhatsApp apagado.
- **Arreglo:**
```diff
-    if (productsRes.error || categoriesRes.error) {
+    if (productsRes.error || categoriesRes.error || discountsRes.error || settingsRes.error) {
```
  Collections puede quedar tolerante (la tabla puede no existir), pero conviene no cachear el resultado vacío. Además, `colecciones/[slug]/page.tsx:81-96` ignora el error de `discounts`.

---

## BAJA

| # | Bug | Dónde | Escenario | Arreglo |
|---|---|---|---|---|
| 12 | Testimonios: al guardar o borrar no se revalida, y el borrado no mira el error | `admin/testimonios/page.tsx:35-76` | Un testimonio nuevo tarda hasta 1 h en verse en la home y las fichas; si el borrado falla, desaparece del admin hasta recargar | Llamar a `notifySiteWideChange()` después de guardar o borrar y chequear `error` en el delete |
| 13 | Toggles de Configuración: con la clave ausente se muestran "Sí, mostrar", pero el sitio lee `=== 'true'` | `configuracion/page.tsx:721` vs `layout.tsx:232`, `HomeClient.tsx:147,586`, `tienda/[slug]/page.tsx:659`, `EncargosDisponibles.tsx:74` | Solo pasa si la clave no existe (schema-master las siembra en `'false'`): el admin muestra prendido, el sitio apagado, y el guardado no la escribe | `const DEFAULT_OFF = new Set(['home_banner_enabled','atelier_note_enabled','pdp_process_enabled','whatsapp_float_enabled','encargos_cupos_enabled'])` y `checked={DEFAULT_OFF.has(field.key) ? value === 'true' : value !== 'false'}` |
| 14 | /ofertas filtra con el precio **base** y no con el de listado | `ofertas/page.tsx:15`, `OfertasClient.tsx:32-40` | Una prenda con precio solo por talle (base vacío) y −15% no aparece en Ofertas (`0 < 0`) | `getListingPrice(p, discounts) < getEffectivePrice(p, getListingSize(p))` |
| 15 | La tarjeta OG (vista previa en WhatsApp/IG) ignora los descuentos por lote y tarda días en actualizarse | `tienda/[slug]/og-card.tsx:64` (`getFinalPrice` sin `batch`); `og/route.ts` `s-maxage=86400, swr=604800`; `:52` toma `is_primary` sin ordenar por posición | Con −15% por lote, el link compartido muestra el precio lleno | Leer `discounts` activos y pasarlos; usar `getPrimaryPhoto`; bajar `s-maxage` a 3600 |
| 16 | Mensajes de favoritos, llms.txt y analytics usan el precio base o sin lote | `favoritos/FavoritosClient.tsx:28`, `favoritos/compartida/page.tsx:41`, `llms.txt/route.ts:48`, `CartProvider.tsx:211` (GA add_to_cart sin `discounts`), `ProductDetailsClient.tsx:134` | El texto compartido dice otro precio que la tarjeta ("desde"); el valor de add_to_cart en GA queda inflado en ofertas por lote | Usar `getListingPrice(p, discounts)` / `getFinalPrice(p, size, discounts)` |
| 17 | La tarjeta muestra "2–0 sem." | `ProductCard.tsx:242-244` (no ordena min/max); el check "En stock" (`[id]/page.tsx:1226`) vuelve a 2 sin tocar el máximo | Una prenda creada con 0/0 a la que le sacan "En stock" queda 2/0 y la tarjeta dice "2–0 sem." (la ficha sí ordena) | En la tarjeta `Math.min`/`Math.max`; al destildar: `setLeadTimeMax((m) => (parseInt(m) >= 2 ? m : '3'))` |
| 18 | El check "En stock" no avisa en una prenda "a medida" | `[id]/page.tsx:1217-1235` vs `isReadyToShip` (`types.ts:451`) | Con "Prenda a medida" tildado, el check promete "Aparece en la sección En stock" y no aparece | Deshabilitarlo con aviso cuando `isCustomOnly` |
| 19 | `sort_order` 0 se guarda como 1 | `categorias/page.tsx:84,125`, `colores/page.tsx:72,106` (`parseInt(x) \|\| 1`) | Poner 0 para mandarla primera la empata con la que tiene 1 | `Number.isNaN(parseInt(x)) ? 1 : Math.max(0, parseInt(x))` |
| 20 | Se puede crear un descuento por lote de 0% activo; y si una regla tuviera `starts_at`/`ends_at`, no se ven ni se editan | `descuentos/page.tsx:66,169` | Aparece "−0%" "Activo" | Validar 1-90 como en cupones |
| 21 | Feed de Merchant, sitemap y llms.txt no se revalidan al guardar | rutas propias con `revalidate=3600`, sin `getCatalog` (no las alcanza el tag) | Un precio cambiado tarda hasta 1 h en el feed; en general aceptable porque Google lo lee 1 vez por día | Opcional: `revalidatePath('/merchant-feed.xml')` en `api/seo/reindex` |
| 22 | Prenda activa con todos los talles sin stock: el feed publica UN ítem con `id=slug`, en vez de agotado | `merchant-feed.xml/route.ts:163-196` | Merchant ve aparecer un producto nuevo, `in_stock` o `backorder`, a precio base | Si tiene talles y ninguno disponible → `out_of_stock` con los mismos ids por talle |
| 23 | El dashboard cuenta "en stock" distinto que el sitio | `admin/page.tsx:108` (`lead_time_weeks_min === 0` sin `is_custom_only`, sin drops) | El aviso "Ninguna pieza en stock" puede no salir cuando el menú no muestra el link | Usar `isReadyToShip` y `dropVisibility` |
| 24 | Duplicar un producto no chequea los errores de talles, fotos y colores; el catálogo trae `collections` con `.limit(12)` sin orden | `productos/page.tsx:212-226`; `catalog.ts:167` | Una copia sin fotos sin aviso; con más de 12 colecciones, la del drop puede no estar y /ig o el menú pierden el link | Chequear `error` en cada insert; `.order('sort_order').limit(50)` |

---

## 3. Coherencia de reglas entre lugares

| Regla | Lugares que la cumplen | Divergencias |
|---|---|---|
| **En stock** (`isReadyToShip`) | tarjeta, ficha, JSON-LD (ficha, categoría, colección, listado), feed, carrito, mensaje de WhatsApp, menú, /ig, home, ofertas, admin/carritos (inline equivalente) | dashboard (#23); check del editor con "a medida" (#18); tarjeta con min>max (#17) |
| **Precio de listado** (`getListingPrice`) | tarjeta, ficha, /api/search, JSON-LD, /ig, colecciones, carrito (por talle) | /ofertas (#14), OG (#15), favoritos, llms.txt, GA (#16) usan base o van sin lote |
| **Descuentos lote vs prenda** (`resolveDiscountPercent`, gana el mayor) | todo lo que pasa `discounts` | OG card y GA add_to_cart no pasan `discounts` (#15, #16); si `discounts` falla queda cacheado vacío (#11) |
| **Visibilidad de drops** (`dropVisibility`) | catálogo (tienda, home, buscador, /ig, ofertas, ficha → relacionados), sitemap, feed, llms.txt, `resolveSlug`, `getProductBySlug` | **/carrito** (#5), `/api/cart` POST (#5), og-card (si se adivina la URL), `/api/cart` GET con service role (#3) |
| **Foto principal** (`getPrimaryMedia`, menor posición) | tarjeta, JSON-LD, feed, alt | og-card toma la primera `is_primary` sin ordenar (#15); el editor crea dos principales (#4) |
| **Talles ordenados** (`sortSizes`) | catálogo, ficha, `getListingSize` (ordena adentro) | colección y carrito no ordenan, pero todo lo que elige un talle ordena por su cuenta: sin efecto visible |

## 4. Revalidación de caché

- **Funciona:** el root layout llama a `getCatalog()`, así que **todas** las páginas HTML llevan el tag `catalog` (verificado en `next/dist/server/web/spec-extension/unstable-cache.js:133-140`: los tags se acumulan en el store de la ruta). Toda pantalla que llame a `notifyReindex` o `notifySiteWideChange` invalida el sitio entero: productos, precios en lote, orden, publicar/despublicar, colecciones, descuentos, categorías, colores, configuración, reels, blog, bio.
- **No revalidan:** testimonios (#12); cupones (no hace falta: se validan por RPC en vivo); cambios por SQL o service role (hasta 1 h).
- **Fuera del alcance del tag:** `merchant-feed.xml`, `sitemap.xml` y `llms.txt` (consultas propias, 1 h, #21) y la imagen OG (CDN 1 día + 7 días de stale, #15).
- **Detalle:** `api/seo/reindex` corta `paths` a 10 (`route.ts:47`). En un lote de más de 8 prendas, `/tienda` y `/` quedan afuera de `revalidatePath`. No pasa nada porque el tag igual las invalida, pero IndexNow recibe menos URLs.

## 5. Errores silenciosos

- 0 filas sin error en los UPDATE: #8.
- Configuración pisa ajustes sin avisar: #1.
- `catalog.ts` cachea vacíos de descuentos y settings: #11.
- `testimonios` delete y `duplicar` producto sin chequear error: #12, #24.
- `saveProductCosts` (`lib/product-costs.ts:28`): si se borran horas, materiales y margen, no escribe nada y los valores viejos quedan (baja; en la práctica el margen nunca queda vacío).
- `notifyReindex` es fire-and-forget: si la revalidación da 401 (sesión), el guardado dice OK y el sitio sigue viejo hasta 1 h. Aceptable, pero podría mostrar "Guardado; puede tardar en verse".

---

## Barrido "0 / vacío / falsy": lo revisado que está BIEN

| Patrón | Dónde | ¿0 o '' legítimo se pierde? |
|---|---|---|
| `p.lead_time_weeks_min != null ? … : '2'` | `[id]/page.tsx:157-158` | Arreglado (6e68680). |
| `Number.isNaN(parseInt(x)) ? 2 : Math.max(0, …)` | `[id]:526-527`, `nuevo:357-358` | OK, el 0 se guarda. |
| `p.base_price_uyu ? String() : ''` / `s.price_uyu ? … : ''` | `[id]:148,191`, `productos/page.tsx:20-21` | Precio 0 → null. 0 no es un precio válido (y `getEffectivePrice` ya trata 0 como "sin precio"). OK. |
| `p.discount_percent ? String() : ''` + `parseInt(...) \|\| 0` | `[id]:149,507` | 0 → '' → 0. OK. |
| `discount_active && percent > 0` | `[id]:508`, `nuevo:339` | Intencional (dato fantasma). OK. |
| `knit_hours` `Number.isFinite && > 0` | `[id]:162-165`, ficha | La restricción de la base exige > 0. OK. |
| `c.labor_hours != null`, `margin_pct != null`, `materials >= 0` | `[id]:228-230`, `product-costs.ts` | OK (materiales 0 se guarda). |
| `s.available ?? true`, `sort_order ?? idx` | `[id]:192-193` | OK. |
| `position: m.position \|\| idx` | `[id]:178` | 0 → idx=0, equivalente. OK. |
| `is_primary: m.is_primary \|\| idx === 0` | `[id]:179` | **BUG #4.** |
| `toInt` (>0) en el lote | `productos/page.tsx:25` | Bajar a 0 → null; `saveBulk` frena si queda sin ningún precio. OK. |
| `getEffectivePrice`: `sizeObj?.price_uyu`, `base \|\| 0` | `types.ts:236-238` | Talle con 0 → usa el base. OK. |
| `discount_percent \|\| 0`, `d.percent \|\| 0` | `types.ts:244,254` | OK. |
| cupones `!= null ? String() : ''`, `num()` >0 → null | `cupones/page.tsx:122-127,152-155` | 0 usos o mínimo 0 = "sin límite". OK. Las fechas son el **BUG #6**. |
| `weaver_pay_uyu != null`, `sample_* ?? …` | `Produccion.tsx:30`, `PruebaTejedora.tsx:42-45` | OK. |
| `parseInt(...) \|\| 1` sort_order | categorías/colores | **#19** (baja). |
| `parseInt(settings…) \|\| 0` | `layout.tsx:219`, `EncargosDisponibles.tsx:75-76` | **#7**: no por el 0, sino por "1.600". |
| `=== 'true'` vs `!== 'false'` en settings | ver #13 | Coherente si la clave existe; diverge si falta. |
| `api/orders` `Number(x) \|\| 0`, `api/cart` qty | rutas públicas | Solo logs y cantidad. OK. |

### Casos pedidos explícitamente
- **Talle único:** el carrito, el feed (desde el cambio local) y la ficha lo manejan. El riesgo es renombrar el talle con ítems ya en carritos (#3b).
- **Prenda sin categoría:** el editor guarda `null` (OK). No entra en descuentos por categoría (correcto). Los "Completá el look" la ignoran (`p.category_id &&`). No hay otro efecto.
- **Colección en borrador:** las prendas quedan ocultas en todo el sitio salvo en /carrito y `/api/cart` (#5). Si fallan las colecciones al cargar el editor, el select se esconde pero `collection_id` se conserva al guardar (OK).
- **Precios en lote:** solo tocan `base_price_uyu`, `updated_at` y `product_sizes.price_uyu` de lo editado. No tocan descuento, estado, colección ni badge (OK). El riesgo es al revés: una ficha abierta desde antes pisa el lote (#9).
- **Guardar la ficha:** no borra talles, colores ni fotos que estén en el formulario. Sí pierde `stock_qty` (#9) y la foto principal elegida (#4). Reescribe estado, descuento, colección y badge con lo cargado al abrir (#9).
