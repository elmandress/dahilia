# Auditoría del sitio, segunda vuelta — 04/11/2026

**Alcance:** lo que el informe anterior (`research/auditoria-cro-2026-11.md`) no miró. Entran la home, `/tienda` y sus categorías, la búsqueda, favoritos, `/regalo`, `/encargo`, `/info`, `/blog` y dos notas, las 404, `/terminos`, el header y el menú del celular, el pie, el cajón del carrito, los estados vacíos, la accesibilidad (axe), los datos estructurados, OG, las imágenes, CLS, las fuentes, el bundle y el copy. No repito lo que ya está en el informe anterior ni lo que ya está hecho en los cambios locales sin commit.

**Método:** recorrí producción (`https://dahila.uy`) con Playwright en un iPhone 13 (390×844), y la búsqueda también en un iPhone SE y un Pixel 7. Corrí axe (WCAG 2.0/2.1/2.2 A y AA + best-practice) en 24 rutas. Medí CLS y LCP con PerformanceObserver, desarmé el payload RSC de cada página y bajé los chunks de JS de producción para ver qué hay adentro. Leí `curl -I` (caché), el JSON-LD, el feed de Merchant y el código.

Durante todo el recorrido las fotos se reemplazaron por un GIF de 1 px y quedaron bloqueados facebook.com/tr, `/api/meta`, GA, Clarity, Umami y todo POST/PATCH/DELETE a `/api/*` y a las acciones del servidor (se respondían con 204). En producción no se escribió nada.

**Evidencia** (capturas y JSON): `C:\Users\mati\AppData\Local\Temp\claude\c--Users-mati-Downloads-dahilia\a19b3bf8-59c7-432b-bb7a-f8235c73bcfe\scratchpad\r2\`. Los archivos principales son `crawl.json` (24 rutas: meta, OG, JSON-LD, axe, CLS, LCP, JS), `interact.json` (menú, búsqueda, cajón, favoritos, 404, pie), `search.json` con `search-iPhone13.png` (el buscador se sale de pantalla) y `popup.json` con `popup_tienda_manguitas-tramonto.png` (el popup de la lista).

---

## Top priorizado

| # | Hallazgo | Impacto | Esfuerzo | Quién |
|---|---|---|---|---|
| 1 | El **popup de la lista privada** dice «Sunset ‘26 ya se está tejiendo… la lista la ve 24 horas antes» **en la ficha y en la colección del drop**, que ya está abierto y en stock. Sale a los 12 s y tapa el 48 % de la pantalla. | Alto | Bajo | Código |
| 2 | En el celular, el **buscador abierto se sale de la pantalla**: la X para cerrar, favoritos y el carrito quedan afuera, y el panel de resultados pierde 86 px a la derecha. | Alto | Bajo | Código |
| 3 | **iOS hace zoom al tocar 10 campos de texto** (buscador, cupón y nota de regalo del carrito, email de la lista, encargo). La regla global de 16 px pierde contra el estilo en línea de 13–14 px. | Medio-alto | 1 línea | Código |
| 4 | **La búsqueda no encuentra el drop**: "sunset" responde «No lo tengo en la tienda… Pedir «sunset» a medida». "blanco" da 0 resultados y "mangas" no trae las manguitas. | Medio-alto | Bajo | Código |
| 5 | **La política de privacidad quedó falsa**: dice que la medición "no se usa para publicidad" y que los datos "no son cedidos", pero desde 800c967 el sitio manda a Meta la IP, el navegador y las cookies `_fbp`/`_fbc`. | Alto (legal y cuenta publicitaria) | 10 min | Código |
| 6 | **/info → Envíos** dice "lo coordinamos por WhatsApp **antes de que pagues**", y el carrito (cambio local) va a decir "lo pagás al recibirlo". | Alto | 2 min | **Anush** |
| 7 | El **menú del celular no lleva al drop**. "Tejé con Dahila" ocupa un lugar de compra cuando hay más tejedoras que pedidos. | Medio | Bajo | Código |
| 8 | La **imagen OG de la colección** es el original de Supabase: 420 KB, sin optimizar. WhatsApp suele no mostrar la vista previa con imágenes de ese peso, y cada vista previa gasta egress. | Medio | 2 líneas | Código |
| 9 | **JSON-LD y feed del drop**: las piezas en stock declaran 0–21 días de preparación (15 en el feed), el −15 % va como precio normal (sin `sale_price`) y el feed tiene un título "talle Talle único". | Medio | Bajo | Código |
| 10 | **Home**: "Nuevo" y "Disponible ahora" repiten las mismas prendas del drop, "Accesorios" muestra 1 sola prenda (error de recorte) y las notas fijadas son de **Navidad**. | Medio-bajo | Bajo | Código |
| 11 | Si se le pone link a la **barra de aviso** (lo recomienda el informe anterior), el área que se puede tocar mide **12 px** de alto. | Medio | Mínimo | Código |
| 12 | **Accesibilidad**: un contraste de 3,79:1 en "Ya está online", 5 enlaces de `/terminos` sin subrayado (1,37:1), `aside role=dialog` en el cajón y la acción de la tarjeta hecha con un `<div onClick>` que no se puede usar con teclado. | Bajo-medio | Bajo | Código |

Después del top: la lista de deseos compartida se previsualiza como la home, hay CLS 0,26 intermitente en `/favoritos`, el título de la 404 es el de la home, el cajón dice "Talle: Talle único", el buscador muestra los precios sin el tachado, las notas no tienen autora, las itálicas son falsas y `/tienda` se arma en cada visita. De Anush: un error de puntuación en "Soy Anush", el apóstrofo de "Sunset ‘26", el horario del JSON-LD y la mezcla de "yo" y "nosotros".

---

## A. Código

### 1. El popup de la lista contradice al drop en las páginas de compra
**Problema.** `VipCallout` sale en todas las páginas, salvo carrito, encargo, `/vip` y `/ig`, a los 12 s de la primera visita, y siempre con el texto de antes del lanzamiento. En `/tienda/manguitas-tramonto`, que es a donde llega el anuncio, ocupa del px 245 al 564 de un alto útil de 664 (el 48 %). Encima del botón "Agregar al carrito" se lee:

> «Sunset ‘26» ya se está tejiendo. Son pocas piezas por tanda. La lista las ve 24 horas antes que nadie y elige primero.

Ese texto es al revés de lo que dice el anuncio ("en stock, −15 %"). Quien llega de Instagram entiende que todavía no se puede comprar y que tiene que anotarse. 12 s es justo el tiempo que alguien pasa leyendo una ficha.

**Evidencia:** `src/components/VipCallout.tsx:47-58` (el filtro de rutas), `:94` (el texto fijo), `src/app/layout.tsx:308-310`, `popup.json` y `popup_tienda_manguitas-tramonto.png`. La página `/vip` tiene el mismo H1: `src/app/vip/page.tsx:58`.

**Cambio propuesto:**
```diff
// src/app/layout.tsx
-              <VipCallout dropName={catalog.settings.drop_enabled !== 'false' ? (catalog.settings.drop_name ?? '').trim() : ''} />
+              <VipCallout
+                dropName={catalog.settings.drop_enabled !== 'false' ? (catalog.settings.drop_name ?? '').trim() : ''}
+                dropDate={catalog.settings.drop_date ?? ''}
+              />
```
```diff
// src/components/VipCallout.tsx
+import { dropHasLaunched } from '@/lib/drop-date'
-export function VipCallout({ dropName = '' }: { dropName?: string }) {
+export function VipCallout({ dropName = '', dropDate = '' }: { dropName?: string; dropDate?: string }) {
   const pathname = usePathname()
   const [show, setShow] = useState(false)
+  // Se decide en el reloj del navegador (no en el HTML cacheado 1 h).
+  const [live, setLive] = useState(false)
   useEffect(() => {
     if (snoozed()) return
-    const timer = setTimeout(() => setShow(true), DELAY_MS)
+    const timer = setTimeout(() => { setLive(dropHasLaunched(dropDate)); setShow(true) }, DELAY_MS)
     return () => clearTimeout(timer)
-  }, [])
+  }, [dropDate])
   if (
     pathname.startsWith('/admin') ||
     ...
+    // Drop abierto: en la ficha y en la colección el popup contradice al
+    // anuncio ("ya se está tejiendo" al lado de "En stock") y tapa media pantalla.
+    (live && (pathname.startsWith('/tienda/') || pathname.startsWith('/colecciones/'))) ||
     pathname === '/ig'
   ) return null
 ...
-        {dropName ? <>«{dropName}» ya se está tejiendo.</> : 'Lo próximo ya se está tejiendo.'}
+        {dropName && !live ? <>«{dropName}» ya se está tejiendo.</> : 'Lo próximo ya se está tejiendo.'}
```
En `/vip/page.tsx:58`: si `dropHasLaunched(settings.drop_date)`, el H1 pasa a ser "Lo próximo ya se está tejiendo." y debajo va una línea: «{dropName} ya está online: <Link href=colección>verla</Link>».

**Medir:** comparar agregados al carrito sobre vistas de ficha antes y después. Las altas a la lista desde `source: popup` van a bajar, y es lo esperable.

### 2. El buscador del celular se sale de la pantalla
**Problema.** Con el buscador abierto en un iPhone 13 (390 px), medido con Playwright:

| Elemento | Posición x | ¿Se ve? |
|---|---|---|
| campo | 229 → **424** | cortado |
| X "Cerrar búsqueda" | **432 → 476** | no |
| favoritos | 490 → 524 | no |
| carrito | 538 → 572 | no |
| panel de sugerencias | 156 → **476** (86 px afuera) | cortado |

En el iPhone SE (320 px) la X queda entre 401 y 445. En el celular no hay tecla Escape, así que **la única forma de cerrar es recargar o navegar**. Encima, el campo tiene 14 px y Safari hace zoom (ver el punto 3).

**Evidencia:** `src/components/Header.tsx:329-355`, `src/app/globals.css:325` (`min-width: 160px !important`), `search.json`, `search-iPhone13.png` y `search-iPhoneSE.png`.

**Cambio propuesto:** en el celular, que el buscador abierto pase a una fila propia debajo del header.
```diff
// src/components/Header.tsx:330
-              <div style={{ position: 'relative' }}>
+              <div className="header-search-wrap" style={{ position: 'relative' }}>
```
```css
/* globals.css, dentro de @media (max-width: 720px) */
/* Buscador abierto: fila propia a todo el ancho, debajo del header. En línea con
   el logo, la X, favoritos y carrito quedaban fuera de la pantalla (04/11/2026). */
.header-search-wrap { position: absolute !important; left: 0; right: 0; top: 100%;
  background: #fff; padding: 8px 14px 10px; border-bottom: 1px solid var(--border); }
.header-search input { min-width: 0 !important; font-size: 16px !important; }
.header-search-wrap > div { left: 14px; right: 14px !important; width: auto !important; max-width: none !important; }
```
(El último selector apunta al panel de sugerencias, que hoy tiene `width: 320, right: 0`.) Hay que confirmarlo con el test e2e del buscador (`tests/e2e/accesibilidad.spec.ts`: Escape devuelve el foco) y en un iPhone real.

### 3. iOS hace zoom en 10 campos de texto
**Problema.** `globals.css:414-421` sube los campos a 16 px en el celular para que Safari no haga zoom al tocarlos. Pero es una regla sin `!important`, y los estilos en línea le ganan. Medí el valor real en producción: el buscador del header y el email del pie quedan en **14 px**. Los campos afectados son estos:

- `Header.tsx:336`: buscador (14)
- `CarritoClient.tsx:740`: cupón (13) y `:844`: nota de regalo (13)
- `Footer.tsx:102`: email de la lista (14)
- `DropTeaser.tsx:91`: email del drop (14)
- `TiendaClient.tsx:577`: buscador (14) y `:599`: orden (13)
- `EncargoForm.tsx:383`: textarea (14)
- `TejedorasClient.tsx:325`: textarea (14)
- `ui/Primitives.tsx:202`: `TextInput` (14), que usan los formularios de encargo y tejedoras

**Cambio:** una línea.
```diff
 @media (max-width: 720px) {
   input, select, textarea {
-    font-size: 16px;
+    font-size: 16px !important;
   }
 }
```

### 4. La búsqueda no encuentra el drop ni los colores comunes
**Problema.** Lo probé contra `/api/search` en producción:

| Búsqueda | Resultado |
|---|---|
| "sunset" | sin resultados → «Pedir «sunset» a medida». En `/tienda?q=sunset`: «No tengo «sunset» en la tienda» |
| "blanco" | 0 |
| "top blanco" | 0 |
| "mangas" | 6 cardigans y sweaters, **sin las manguitas** |
| "atardecer" | solo el Bolso Margot cherry |

Quien vio el anuncio y escribe el nombre de la colección termina en el formulario de encargo.

**Evidencia:** `src/lib/vocabulario.ts:36-43`. El texto donde se busca (`haystack`) tiene nombre, descripción, categoría y colores, pero no la colección, aunque el catálogo ya la trae (`catalog.ts:92`, `collection:collections(*)`). En `QUERY_SYNONYMS` (`:26-33`) no hay colores ni "mangas".

**Cambio propuesto:**
```diff
// src/lib/vocabulario.ts
   return {
     name: normalizeText(p.name ?? ''),
-    rest: normalizeText(`${p.description ?? ''} ${p.category?.name ?? ''} ${local} ${colors}`),
+    // La colección (Sunset '26): quien viene del anuncio busca por ese nombre.
+    rest: normalizeText(`${p.description ?? ''} ${p.category?.name ?? ''} ${local} ${colors} ${p.collection?.name ?? ''}`),
   }
```
```diff
   panuelo: ['bandana'], panuelos: ['bandana'],
+  mangas: ['manguitas'], manga: ['manguitas'],
+  blanco: ['crudo', 'natural', 'hueso', 'marfil'], blanca: ['crudo', 'natural', 'hueso', 'marfil'],
```
Antes de dejar los sinónimos de "blanco", hay que confirmar los nombres reales de la tabla `colors` ("crudo" sí trae 2 cardigans). Como la grilla de `/tienda` usa el mismo `productSearchScore`, el arreglo vale para los dos lugares.

### 5. La política de privacidad no menciona el píxel de Meta
**Problema.** En `/terminos` §7 dice:
- "Los datos no son cedidos ni vendidos a terceros." (`terminos/page.tsx:152`)
- "…usa herramientas de medición (Google Analytics, Microsoft Clarity y Umami)… **Esa información no se usa para publicidad ni se vende.**" (`:158-161`)

Desde los commits 800c967 y 61ab953, el sitio carga el píxel de Meta y manda eventos por la API de conversiones con la IP, el navegador y las cookies `_fbp`/`_fbc` (`src/lib/meta-capi.ts:18-23`, `src/app/api/meta/route.ts:32-35`, `api/admin/meta-compra/route.ts:42-46`), justamente para hacer publicidad. La Ley 18.331 exige informar con qué finalidad se tratan los datos y quién los recibe. Las condiciones de las herramientas de negocio de Meta también piden avisarlo en la política.

**Cambio (texto exacto):** reemplazar el párrafo de `:158-161` por:

> Este sitio usa cookies técnicas, necesarias para el carrito y tus preferencias. Para entender cómo se usa el sitio usa herramientas de medición (Google Analytics, Microsoft Clarity y Umami), que registran qué páginas se visitan, los clics y el desplazamiento. Además usa el píxel de Meta (Facebook e Instagram) y su API de conversiones para medir y mostrar nuestros anuncios: le envían a Meta datos técnicos de tu visita (dirección IP, navegador, páginas y prendas vistas, lo que agregás al carrito y un identificador de cookie). Nunca le enviamos lo que escribís en formularios ni en WhatsApp. Podés limitar los anuncios personalizados desde la configuración de anuncios de tu cuenta de Meta o bloquear las cookies de terceros en tu navegador.

En `:152`: "Los datos que escribís (nombre, teléfono, dirección, medidas) no se venden ni se ceden a terceros, salvo a la empresa de envíos para entregarte el pedido." Y `:58` pasa a decir "Última actualización: noviembre de 2026".

### 6. (El texto de envíos de /info lo cambia Anush: ver B.1)

### 7. El menú del celular no lleva al drop
**Problema.** El primer nivel es Tienda (con 6 subítems), Colecciones (la lista), Ofertas, A medida, Regalos, Notas, **Tejé con Dahila**, Contacto y Favoritos. El panel necesita scroll: 739 px de contenido en 532 visibles. El drop que se está pautando queda a 2 toques (Colecciones → Sunset). "Tejé con Dahila" quedó ahí para reclutar tejedoras (`Header.tsx:20-25`), pero el análisis del 12/10 muestra más oferta que demanda: 11 postulaciones contra 5 pedidos.

**Evidencia:** `Header.tsx:26-37`, `:619-665`, `i_menu.png` e `interact.json` (`menu.scrollH`).

**Cambio:** el layout ya tiene `catalog.collections` y `settings.drop_collection_slug`. Con eso se le pasa al Header `drop={{ name, href }}` cuando la colección está publicada y `dropHasLaunched(drop_date)` da verdadero. En el menú del celular se agrega un primer ítem antes de "Tienda": `● Sunset ‘26` (en `#B6314A` o `wine600`). "Tejé con Dahila" sale de `NAV_ITEMS` y queda solo en el pie (ya está en `Footer.tsx:212`). En desktop pasa lo mismo: el ítem 7 lo ocupa el drop.

### 8. La imagen OG de la colección es el original de Supabase (420 KB)
**Problema.** `og:image` de `/colecciones/sunset-26` es `https://nuihzsytxolftcaggbbk.supabase.co/storage/v1/object/public/media/collections/sunset-26-dahila-crochet-crxr.jpg`, de 419.874 bytes, sin ancho ni alto. Pasada por el optimizador (`/_next/image?…&w=1200&q=82`) baja a 134.910 bytes, con caché de 1 año. WhatsApp suele dejar la vista previa sin foto cuando la imagen es pesada, y cada vez que alguien comparte el link en un DM o en WhatsApp se descarga el original desde Supabase (egress, ver el incidente del 20/09).

**Evidencia:** `src/app/colecciones/[slug]/page.tsx:57`. `botImageUrl` ya está importado en `:9`.
```diff
-      ...(data.cover_url ? { images: [{ url: data.cover_url, alt: data.name }] } : {}),
+      ...(data.cover_url ? { images: [{ url: botImageUrl(SITE_URL, data.cover_url, 1200), width: 1200, alt: data.name }] } : {}),
```

### 9. JSON-LD y feed de Merchant de las piezas en stock y con descuento
**Problema** (ficha de las manguitas y `merchant-feed.xml`):
- `handlingTime` va de 0 a **21 días** en una pieza en stock. `page.tsx:532-541` usa `lead_time_weeks_max × 7`, y en la base las piezas del drop quedaron con min 0 y max 3. El feed dice `max_handling_time` 15. Google puede mostrar "llega en 3 semanas".
- `priceValidUntil` es hoy + 1 año (`page.tsx:494`), con un −15 % que termina el 6 o 7/11. Si Google guarda el precio rebajado, lo puede mostrar después de que vuelva al normal.
- En el feed, el precio con descuento va como `g:price` y no hay `g:sale_price` ni `g:sale_price_effective_date`. Así se pierde el tachado en Shopping.
- El título del feed es "Manguitas Tramonto — talle Talle único".

**Cambio:**
```diff
// tienda/[slug]/page.tsx:538-539 (y lo mismo en merchant-feed.xml/route.ts:146-160)
-                minValue: Math.min(product.lead_time_weeks_min, product.lead_time_weeks_max) * 7,
-                maxValue: Math.max(product.lead_time_weeks_min, product.lead_time_weeks_max) * 7,
+                // En stock: sale ya (0–2 días de armado del paquete), sin importar el máximo viejo.
+                minValue: isReadyToShip(product) ? 0 : Math.min(product.lead_time_weeks_min, product.lead_time_weeks_max) * 7,
+                maxValue: isReadyToShip(product) ? 2 : Math.max(product.lead_time_weeks_min, product.lead_time_weeks_max) * 7,
```
- `priceValidUntil`: si el descuento activo (de la prenda o del lote) tiene `ends_at`, usar esa fecha. Si no, dejar el año.
- En el feed: `g:price` con el precio de lista, `g:sale_price` con el final y `g:sale_price_effective_date` cuando haya `ends_at`.
- En el título del feed, omitir " — talle X" cuando el talle es único (mismo criterio que el carrito).

### 10. Home: secciones repetidas, "Accesorios" con una prenda y notas de Navidad
**Problema** (texto renderizado en `crawl.json`):
- "Nuevo" muestra Pulseras, Bolso cherry, Bolso butter y Poncho. "Disponible ahora", un poco más abajo, muestra Bolso butter, Bolso cherry, Poncho y Manguitas. Son 3 prendas repetidas, y "Nuevo" deja afuera las manguitas, que son la prenda del anuncio.
- "Accesorios" muestra **solo Pulseras Terra** porque se filtra de los primeros 12 productos (`page.tsx:28` → `HomeClient.tsx:125`), aunque hay bandana, bufandas, bolsos, etc.
- "Notas del taller" fija 3 notas de regalo, y 2 hablan de Navidad (`src/content/blog/index.ts:110-114`). Se decidió no hacer nada de Navidad (21/10).

**Cambio:**
- `page.tsx`: calcular `accesorios` sobre `activeProducts` y pasarlo como prop. En `HomeClient`, ocultar la sección si tiene menos de 2 prendas.
- `HomeClient`: no mostrar "Nuevo" cuando todas sus prendas ya están en "Disponible ahora" (o mostrar solo una de las dos).
- `HOME_ARTICLE_SLUGS`: cuando se publiquen las notas del drop, que queden `['manguitas-tejidas-como-combinarlas', 'poncho-de-crochet-verano-playa-y-ciudad', 'regalar-ropa-sin-saber-el-talle']`.

### 11. La barra de aviso con link se toca en 12 px
**Problema.** Con `promo_bar_link` cargado, el `<Link>` envuelve solo el texto (`Header.tsx:228-230`), y el área táctil mide 358×12 px (`crawl.json`, `smallTargets`). El informe anterior recomienda que la barra lleve al drop, así que esto pasa a importar.
```diff
-            <Link href={promoLink} style={{ color: promoFg, textDecoration: 'none' }}>{promoText}</Link>
+            <Link href={promoLink} style={{ color: promoFg, textDecoration: 'underline', textUnderlineOffset: 3, display: 'block', margin: '-8px -16px', padding: '12px 16px' }}>{promoText} →</Link>
```

### 12. Accesibilidad (axe y lo que axe no ve)
axe dio **0 violaciones en 21 de las 24 rutas**. Lo que encontró, y lo que vi aparte:
- **Contraste 3,79:1** en el antetítulo "Ya está online" del bloque del drop: 10 px, `#82797c` sobre `#faf2e2` (`DropTeaser.tsx:185`, el `Eyebrow` sobre `cream100`). Se arregla con `style={{ color: dahila.ink700 }}`. Además, el `aria-label` de la sección dice "Próximo drop: …" aunque el drop esté online (`:163`): usar `isLive ? 'Ya está online' : 'Próximo drop'`.
- **`/terminos`**: 5 enlaces (WhatsApp, @dahila.crochet, Instagram) solo con color `wine600` dentro del texto, con contraste 1,37:1 contra el texto (`link-in-text-block`, serio): `terminos/page.tsx:68, 70, 155, 217, 219`. Agregar `textDecoration: 'underline'`.
- **Cajón del carrito**: `<aside role="dialog">` no es un rol permitido para `aside` (`aria-allowed-role`), en `CartDrawer.tsx:100`. Cambiarlo por `<div role="dialog">`. El botón "Quitar" (`:210`) se anuncia igual en todas las líneas: usar `aria-label={`Quitar ${item.product.name}`}`.
- **Tarjeta de producto**: la acción "Vista rápida" / "Agregar al carrito" es un `<div onClick>` (`ProductCard.tsx:164-183`), sin rol ni foco, así que con teclado o lector de pantalla no se puede usar. La tarjeta entera sí es un link. Lo mínimo es `role="button"`, `tabIndex={0}`, `aria-label` y `onKeyDown` para Enter y Espacio.

### Menores (código)
- **La lista de deseos compartida se previsualiza como la home.** `/favoritos/compartida?p=…&de=Sofi` tiene og:title, og:description, og:url **y canonical** de la home. Es el link que se manda por WhatsApp a quien va a regalar. La causa: `layout.tsx:65-78` fija `alternates.canonical: '/'` y `openGraph.url: SITE_URL` en la raíz, y las páginas sin metadata propia lo heredan (pasa también en `/baja` y en las 404). Arreglo: pasar `canonical` y `openGraph.url` de la home a `app/page.tsx` (con `export const metadata`), y darle a `compartida` un `generateMetadata` con OG propio: «La lista de deseos de {de} · N prendas tejidas a mano» y la foto de la primera prenda con `botImageUrl`.
- **CLS 0,26 en `/favoritos` (intermitente).** Pasó en 1 de 3 cargas, cuando `/api/favorites` tardó. El estado "Cargando…" (alineado a la izquierda, padding 40) se reemplaza por el vacío centrado (padding 96) y empuja el pie (`FavoritosClient.tsx:66-93`). Arreglo: el mismo contenedor y `minHeight: '60vh'` en los tres estados.
- **404.** La genérica (`not-found.tsx`) no tiene metadata: el título es el de la home ("Dahila Crochet — Ropa tejida a mano…"). Agregar `export const metadata = { title: 'Página no encontrada' }`. La 404 de prenda (`tienda/[slug]/not-found.tsx`) no muestra ninguna prenda. Cuando viene de un link viejo de Instagram, convendría mostrar 4 en stock, como hace la general.
- **El cajón del carrito dice "Talle: Talle único"** (`CartDrawer.tsx:187`). Es el mismo arreglo que el informe anterior propone para `/carrito`: ocultar la línea cuando el talle es único.
- **El buscador muestra los precios sin el descuento**: "Bolso Margot Butter · UYU 1.360", sin tachado ni −15 % (`Header.tsx:401`). `/api/search` podría devolver también `list` y usar `PriceBlock size="sm"`.
- **Las notas no tienen autora.** El texto dice "Escrito por el taller de Dahila Crochet" y en el JSON-LD `author` es una `Organization` (`blog/[slug]/page.tsx:364`). Para E-E-A-T y para que las IA citen a una persona: `author: { '@type': 'Person', name: 'Anush', url: `${SITE_URL}/atelier` }`, con la línea visible "Escrito por Anush, que teje cada prenda de Dahila". `/atelier` ya publica el `Person`.
- **Las itálicas son falsas.** Fraunces se carga solo en estilo normal (`layout.tsx:30-38`) y hay 20 `fontStyle: 'italic'` con la serif (pie, 404, colección, favoritos), así que el navegador inclina la letra en vez de usar la itálica real. Es pulido de marca: `style: ['normal', 'italic']` agrega un woff2 (decidir con Lighthouse).
- **`/tienda` se arma en cada visita** (`Cache-Control: private, no-store`, `Netlify Durable; fwd=bypass`): el TTFB es de 0,5–0,7 s, contra 0,15–0,35 s de las páginas cacheadas. Pasa porque lee `searchParams` en el servidor. Es el destino de "Ir a la tienda", "Ver colección" y la 404. Si se leen los filtros en el cliente (`useSearchParams` dentro de `Suspense`), `/tienda` sin parámetros puede quedar estática. Esfuerzo medio.
- **El horario del JSON-LD** (`page.tsx:105`, `openingHours: 'Mo-Fr 09:00-18:00'`) está escrito a mano. Hay que preguntarle a Anush si es real; si no lo es, sacarlo.

---

## B. Anush desde el admin

> Texto listo para copiar y pegar. No inventé ningún dato. Donde hay `___`, va un dato que solo ella tiene.

**1. Configuración → Información → Envíos** (`info_shipping`): prioridad alta, contradice el carrito nuevo.
Hoy: "Enviamos a todo Uruguay por DAC. El costo depende de dónde estés y lo coordinamos por WhatsApp antes de que pagues…"
Propuesto:
`Envío a todo Uruguay por DAC: lo pagás al recibirlo, según tu zona. Las piezas en stock salen en ___ días hábiles. Al exterior también mando: escribime y lo cotizamos.`

**2. Configuración → Información → Cómo encargar a medida** (`info_custom`): hoy mezcla "contanos / te respondemos / empezamos" con el "lo tejo yo" del resto del sitio.
`Contame qué tenés en mente desde «A medida» o por WhatsApp. Te respondo con opciones de modelo, lana y presupuesto. Cuando confirmás, empiezo a tejer.`

**3. Configuración → Sobre nosotros → Texto principal** (`about_body`, se ve en la home): hoy dice "…las ideas de mis clientas , sin apuro para que cada prenda hable de vos", con un espacio antes de la coma, sin la coma después de "apuro" y sin punto final.
`Tejo hace más de 5 años. Amo diseñar y hacer realidad las ideas de mis clientas, sin apuro, para que cada prenda hable de vos.`

**4. El nombre del drop** (Configuración → Próximo drop → Nombre, y Colecciones → Sunset → Nombre): hoy es "Sunset **‘**26", con la comilla de apertura. El año abreviado lleva apóstrofo: **"Sunset ’26"** (o "Sunset '26"). El slug no cambia.

**5. Configuración → Preguntas frecuentes, n.º 5** (`faq_5_a`, sale en la home): "Sí — somos Dahila Crochet. Mucha gente nos busca como…". Si se busca la voz en primera persona:
`Sí: es Dahila, con i. Mucha gente la busca como "Dalia" o "Dahlia" y llega igual. Es la misma marca, tejida a mano en Montevideo.`

**6. Horario de atención:** confirmar si "lunes a viernes de 9 a 18" es real. Si no lo es, avisarle a Mati para sacarlo del código.

---

## C. Verificado y bien (no hace falta volver a mirarlo)

- **Accesibilidad:** 0 violaciones de axe en `/tienda`, las categorías, `/regalo`, `/encargo`, `/info`, `/blog`, las notas, las 404, `/contacto`, `/atelier`, `/colecciones`, `/ofertas`, `/vip`, `/pedido`, `/carrito` (vacío), `/gracias`, la colección y la ficha. El menú del celular también da 0 en axe.
- **Metadatos:** todas las páginas indexables tienen título propio, descripción, canonical correcto, OG con imagen 1200×630 y `twitter:card`. `/favoritos`, `/carrito`, `/pedido`, `/vip`, `/ig`, `/gracias` y `/encargo/estado` son `noindex`. `/tienda?ya=1` hace canonical a `/tienda`.
- **JSON-LD:** Organization + WebSite (uno solo), LocalBusiness + FAQPage en la home, CollectionPage en el listado y las categorías, Product + BreadcrumbList en la ficha (precio con descuento, imágenes absolutas vía optimizador, InStock) y BlogPosting + BreadcrumbList + FAQPage en las notas. Todo es JSON válido.
- **Imágenes:** todas con `alt`. El LCP de la home y de la ficha usa `fetchPriority="high"` y `loading="eager"`, y tiene `sizes` correctos (`100vw` en el hero; `(max-width:720px) 100vw, 640px` en la ficha; grillas al 50vw). Detalle: en `/tienda` hay 4 tarjetas con prioridad alta y las de la segunda fila ya quedan debajo del pliegue en el celular. Bajar a 2 es una mejora marginal.
- **CLS:** 0 en la home, la tienda, la colección, la ficha y el blog. Solo aparece en `/favoritos` (arriba) y en `/tejedoras` (0,085, que no es página de compra).
- **Tiempos en caliente** (iPhone 13, sin fotos): en la home, TTFB 0,16–0,23 s y FCP 0,68–0,76 s; en la ficha, TTFB 0,34 s y FCP 0,94 s. La colección tuvo TTFB 1,1 s por la caché vencida, el punto que ya señaló el informe anterior.
- **Fuentes:** 2 woff2 precargados (Fraunces de 67 KB e Inter de 48 KB), con `font-display: swap`. No hay CSS de Google.
- **JS:** la base es de unos 590 KB sin comprimir y unos 177 KB con gzip en cada página (React y Next ~350 KB, el layout ~48 KB, la medición ~29 KB). El chunk de 112 KB con polyfills es `noModule`, así que los iPhone no lo bajan. No hay ninguna librería pesada de más: el cliente de Supabase solo está en el admin. El resto de lo que baja al navegar es prefetch de links.
- **Búsqueda sin resultados:** ofrece "Pedir «…» a medida" con la idea ya cargada (bien resuelto). El cajón vacío y `/favoritos` vacío tienen un texto propio y un botón.
- **Copy:** no hay "Dahlia" ni formas de "tú" en el texto visible. El voseo es consistente. La única mezcla es entre "yo" y "nosotros" (puntos B.2 y B.5).
