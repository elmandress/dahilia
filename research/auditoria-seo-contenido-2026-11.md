# Auditoría SEO y contenido, 04/11/2026

Fuentes: `research/mediciones/seo-2026-11-04.md`, `seo-detalle-2026-10-26.md`, `ga-2026-11-04.md`, fichas públicas de dahila.uy (precios, materiales y horas de las piezas del drop). La búsqueda web trajo muy poco sobre Uruguay: no hay una guía local de ponchos, manguitas ni bolsos de trapillo, y lo que rankea es en su mayoría patrones para tejer (gente que teje, no que compra). Eso confirma que hay hueco para contenido comprador local, pero no hay datos de volumen de búsqueda; no invento ninguno.

## Hallazgos priorizados

1. **La colección Sunset '26 está "descubierta, actualmente sin indexar".** Es la página que más tráfico recibe hoy (86 vistas en 2 días, casi todo de anuncios e Instagram) y Google no la tiene. Las 3 notas nuevas la enlazan, y el blog es lo que Google rastrea. Siguiente paso: enlazarla también desde la home o el mega-menú si no lo está, y no repetir "Solicitar indexación" sin cambiar nada (ver `indexacion-lastmod`).
2. **Blog = impresiones sin clics.** `la-lana-pica` 1.027 impresiones y 12 clics; `como-lavar` 621; `chaleco` 320 con pos. 7,2 (0,8% de CTR); `crochet-o-dos-agujas-diferencias` 302 impresiones y 0 clics. Es tráfico de España, Argentina y Colombia que no compra: no vale la pena pelear por más, pero sí poner en esas notas un enlace natural a la colección (ya tienen shopCta a categorías; falta la colección del momento).
3. **Títulos con CTR bajo (oportunidad directa, solo texto):** `crochet-o-dos-agujas-diferencias`, `chaleco-tejido-como-combinarlo`, `como-cuidar-prendas-de-crochet`, `accesorios-tejidos-para-la-playa` (121 impresiones, 0 clics en octubre, pos. 7,2) y `tops-de-crochet-para-verano` (65 impr., 0 clics, pos. 6,9). Propuestas abajo.
4. **No indexadas / con error** (87 de 92 indexadas):
   - `/tienda/sweater-cherry`: Google la ve como 404. Mismo caso que en `snapshot-404-cacheado`; verificar que la ficha esté activa y no haya quedado fuera del snapshot.
   - `/tienda/top-race`: "Google no reconoce esta URL". Verificar si la prenda sigue publicada; si no, sacarla del sitemap.
   - `/tienda/pulseras-terra`: descubierta sin indexar. Se enlaza desde la ficha del Bolso Margot; sumar un enlace desde `/tienda/accesorios` y desde una nota.
   - `/ofertas`: noindex a propósito (sin ofertas que mostrar). Correcto, pero entonces no debería estar en el sitemap ni se debería enlazar con peso. Hoy sale en 21 impresiones con pos. 4,3: si hay ofertas activas (el drop tiene −15%), revisar que la lógica de noindex no esté apagando una página que sí tiene contenido.
5. **Canibalización a vigilar.** `bolsos-de-crochet-por-que-duran` (pos. 5,3, CTR 4%, la que mejor convierte del blog) y `accesorios-tejidos-para-la-playa` compiten con la nota nueva de trapillo. Para evitarlo, la nueva se centra en el material ("trapillo") y enlaza a la existente en vez de repetir sus criterios. Otro par: `como-cuidar-prendas-de-crochet` / `como-lavar-crochet-a-mano` / `como-guardar-prendas-tejidas` (3 notas de cuidados con impresiones parecidas; la nuevas enlazan a `como-lavar`). Medir en 4 semanas; si dos páginas aparecen para la misma búsqueda alternando posición, fusionar.
6. **Enlaces internos del blog hacia producto.** Antes de este trabajo, el blog no mencionaba ninguna pieza de Sunset '26 ni la colección. Las 3 notas nuevas enlazan a `/colecciones/sunset-26` y a las 4 fichas (`manguitas-tramonto`, `poncho-ete`, `bolso-margot-butter`, `bolso-margot-cherry`). Falta: 6 prendas activas sin ninguna nota que las enlace (`top-julieta`, `top-margarita`, `sweater-net`, `top-higgie`, `chaleco-grannys`, `cowl-neck-top`, según la memoria del 26/10).
7. **Búsquedas con intención compradora que ya traen algo:** "poncho de verano" (1 clic, pos. 4), "conjunto tejido playa" (1 clic, pos. 1), "set crochet" (pos. 5,3), "saco crochet" (pos. 1), "bandana tejida" (pos. 7,2, 5 impresiones), "crochet uruguay" (16 impresiones, pos. 2,3). Las páginas de producto ya reciben búsquedas de bandana (varias variantes en pos. 2 a 11): una nota o un bloque en `/tienda/bandana` que use "bandana de algodón / de colores / pañuelo" las capturaría.
8. **Marca.** "dahila" trae 6 clics en 28 días y Google todavía lo corrige a otras palabras ("dalila", "dalilu"). Seguir con el nombre completo en títulos de la home y en el perfil de Google.
9. **Datos estructurados.** Las notas ya emiten JSON-LD Article y FAQPage desde el bloque `faq`, y las fichas usan Product/ProductGroup. Las 3 notas nuevas traen 4 preguntas cada una. No se agregó marcado nuevo. Pendiente de revisar: que la colección `/colecciones/[slug]` emita CollectionPage/ItemList (no lo verifiqué en este pase).

## Propuestas de títulos y descripciones (texto exacto)

Las notas nuevas ya llevan estos textos (están en los archivos). Para las existentes, propongo:

| Página | metaTitle | description |
|---|---|---|
| `/blog/accesorios-tejidos-para-la-playa` | Bolso de playa tejido a crochet: qué llevar y cómo cuidarlo | Qué bolso, set y bandana tejidos llevar a la playa, cómo usarlos con sol y viento, y cómo sacar arena y sal del algodón para que dure varios veranos. |
| `/blog/tops-de-crochet-para-verano` | Tops de crochet para verano: cómo elegir el tuyo | Cómo elegir un top de crochet de verano: algodón, punto abierto, qué ponerte abajo y cómo lavarlo a mano. Tejidos a mano en Montevideo. |
| `/blog/chaleco-tejido-como-combinarlo` | Chaleco tejido: 5 formas de combinarlo sin que te agrande | Cómo usar un chaleco de crochet sobre remera, vestido o camisa, qué largo te conviene y cómo cuidarlo para que no pierda la forma. |
| `/blog/crochet-o-dos-agujas-diferencias` | Crochet o dos agujas: diferencias reales en una prenda | Qué cambia entre una prenda de crochet y una de dos agujas: caída, elasticidad, abrigo y cuidado. Para decidir antes de comprar o encargar. |

Nota: verificar el título actual de cada una en su archivo antes de reemplazar; si ya dice algo equivalente, no tocarlo (CTR con pocas impresiones no es concluyente).

Para la colección y fichas (editar en el admin, mueve `updated_at` y ayuda a destrabar la indexación):

- `/colecciones/sunset-26` título: `Sunset '26: manguitas, poncho y bolsos de verano tejidos a mano | Dahila`
- descripción: `Colección de verano de Dahila Crochet: Manguitas Tramonto, Poncho Été y Bolsos Margot, tejidos a mano en Montevideo. Salen en cantidades chicas. Envío a todo Uruguay.`

## Notas nuevas

| Slug | Tema | Título (H1) | Palabras aprox. |
|---|---|---|---|
| `manguitas-tejidas-como-combinarlas` | Manguitas: combinaciones y cuidado | Manguitas tejidas: cómo combinarlas en verano (y con qué) | ~730 |
| `poncho-de-crochet-verano-playa-y-ciudad` | Poncho Été en playa y ciudad | Poncho de crochet para el verano: cómo usarlo en la playa y en la ciudad | ~800 |
| `bolsos-de-trapillo-como-elegir-y-cuidar` | Qué es el trapillo + Margot | Bolsos de trapillo: qué son, cómo elegir uno y cómo cuidarlo | ~705 |

Reglas de la casa respetadas: sin precios en el cuerpo, sin devoluciones, sin raya larga, sin "artesanal/auténtico", lo general marcado con bloque `note`, datos de producto copiados de las fichas públicas (Tramonto: algodón 100%, talle único, ~8 h; Été: algodón 100%, sin horas ni talle claro en la ficha, así que no los menciono; Margot: trapillo premium, ~4 h, flecos y asa ajustable, talle único, medidas no listadas). Las notas no llevan `hero` ni imagen interna, a propósito: las fotos del drop viven en Supabase y en `public/photos` no hay ninguna de Sunset '26 (usar una foto de otra prenda con un alt equivocado repetiría el problema de las 5 fotos viejas). Para agregarlas: bajar fotos del drop a `public/photos/blog/`, y poner el `hero` desde `/admin/blog`.

## Cosas para decidir o chequear

- La ficha del Poncho Été dice "XS/SM/L" y el carrito "XS/S": inconsistencia de talles para corregir en el admin.
- La imagen de Manguitas Tramonto se describe como "top de crochet": revisar el alt.
- Agregar las notas nuevas a `HOME_ARTICLE_SLUGS` en `src/content/blog/index.ts` (la home es lo más rastreado) cuando se quiera acelerar su descubrimiento. No lo hice para no tocar la lista de Navidad.
- Si la colección se agota o se retira, las notas siguen sirviendo (hablan de la pieza, no de su disponibilidad); los enlaces a `/tienda/...` muertos los limpia `withoutDeadProductLinks`, pero el de `/colecciones/sunset-26` no.
- Notas siguientes con potencial (no escritas): "bandana de algodón: cómo usarla" ya existe, así que lo que falta es "conjunto de crochet para la playa" (intención alta, pos. 1 con 1 impresión) y "regalos hechos a mano Montevideo".

## Archivos

Creados:
- `src/content/blog/articles/manguitas-tejidas-como-combinarlas.ts`
- `src/content/blog/articles/poncho-de-crochet-verano-playa-y-ciudad.ts`
- `src/content/blog/articles/bolsos-de-trapillo-como-elegir-y-cuidar.ts`
- `research/auditoria-seo-contenido-2026-11.md`

Modificado:
- `src/content/blog/index.ts` (3 imports y 3 entradas después de `comprarUruguay`)

Verificación: `npx tsc --noEmit -p .` y `npm run lint` sin errores ni avisos. Sin commit, sin push, sin tocar la base de datos.
