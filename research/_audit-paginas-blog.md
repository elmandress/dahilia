# Auditoría: resto de páginas públicas + blog (2026-09-12)

Área: `/colecciones`, `/colecciones/[slug]`, `/ofertas`, `/atelier`, `/info`, `/contacto`, `/tejedoras`, `/terminos`, `/ig`, `/resena`, y todo el blog (`src/content/blog/*`, `src/app/blog/**`). SOLO LECTURA — este es el único archivo que edito.

Contexto ya cubierto por otras auditorías (no repetir aquí): mercado/precios (`auditoria-mercado-producto-2026-09.md`), rendimiento/seguridad/código (`auditoria-tecnica-2026-09.md`), SERP/competencia (`_seo-ranking-2026-09.md`), SEO+IA (`seo-ia-2026-09.md`), Search Console 12/09 (`mediciones/seo-2026-09-12.md`).

Working tree auditado (no producción): incluye `src/lib/profiles.ts` y `/resena` sin commitear (12/09). Producción hoy = commit `a0e3b91`, sin esos cambios — lo marco cuando la diferencia importe.

Estado: **COMPLETO** (12/09/2026, continuación de una sesión cortada por límite de uso).

---

## Hallazgos

### P-01 — `/ig` — el footer completo (11 links + firma de estudio) sigue debajo del linktree, aunque el header y los 4 flotantes ya se excluyeron

**Qué pasa:** `/ig` (`src/app/ig/page.tsx`) está construida a propósito como un linktree de una columna — el propio comentario del archivo lo dice: *"Pensada para el navegador in-app de Instagram: una columna, tap targets grandes"* (líneas 23-25). Y de hecho, **ya se excluyó `/ig`** de 5 componentes globales:
- `src/components/Header.tsx:152` — `if (pathname.startsWith('/admin') || pathname === '/ig') return null` (con comentario explícito: *"/ig es la landing de la bio de Instagram: pensada como un Linktree"*).
- `src/components/WhatsAppFloat.tsx:41`, `src/components/VipCallout.tsx:80`, `src/components/WeaverCallout.tsx:62`, `src/components/BackToTop.tsx:22` — los 4 excluyen `pathname === '/ig'`.

Pero **`src/components/Footer.tsx:136` solo excluye `/admin`** (`if (pathname.startsWith('/admin')) return null`) — no tiene la misma línea `|| pathname === '/ig'` que los otros cinco. Resultado: hoy, debajo del linktree de una columna, se renderiza el footer completo de 4 columnas (`Footer.tsx:154-193`): marca+tagline, "Tienda" (4 links), "Info" (7 links: envíos, notas, sobre nosotros, contacto, estado de encargo, tejé con Dahila, términos), "Contacto" (2 links) — 13 links de navegación en total — más el formulario de lista VIP y la fila "Desarrollado por SIAR".

**Matiz importante:** no es un simple "ocultar todo el footer en `/ig`". El propio copy de `/ig` dice *"la lista VIP la ve 24 horas antes. Anotate al pie de la página"* (`src/app/ig/page.tsx:183-184`), y ese "pie de la página" es exactamente el componente `VipSignup` que vive dentro de `Footer.tsx:195`. Si se oculta el footer entero, esa frase queda apuntando a nada. El fix correcto es quirúrgico: en `/ig`, mostrar `VipSignup` + la fila de copyright, pero **no** el grid de 4 columnas con los 13 links de navegación (ni la fila "Desarrollado por").

**Evidencia:** el propio patrón ya aplicado 5 veces en el código (Header + 4 flotantes) es la evidencia de que esto ya se identificó como problema y se resolvió en todos lados menos acá — es una inconsistencia, no una decisión de diseño. Baymard/NN·g: cada elemento de navegación extra en una landing de conversión de un solo objetivo diluye el clic al objetivo (ya citado en `auditoria-mercado-producto-2026-09.md` §3.7 para el mismo hallazgo, sin el detalle del footer).

**Impacto:** medio (afecta a la landing que recibe la mayor parte del tráfico de Instagram — 344/588 sesiones vienen de ahí, aunque hoy la bio todavía no apunta a `/ig` según `seo-ia-2026-09.md`). **Esfuerzo:** bajo.

**Clasificación:** (A) aplicar ya — seguro, reversible, seis líneas de código, mismo patrón ya usado 5 veces en el repo.

**Fix concreto:** en `Footer.tsx`, después de `const pathname = usePathname()`, agregar `const isIgLanding = pathname === '/ig'`. Envolver el `<div className="footer-grid">` (columnas de navegación, líneas 155-193) en `{!isIgLanding && (...)}`, dejando `<VipSignup />` y la fila de copyright siempre visibles. Quitar también la fila "Desarrollado por SIAR" en `/ig` (es información de crédito del estudio, no de la marca — no aporta al propósito de linktree) o dejarla, a criterio de Anush; lo mínimo indispensable es sacar los 13 links de navegación duplicados.
**Trade-off:** ninguno real — el VIP signup y el copyright siguen intactos; se pierde la posibilidad de navegar a `/terminos` o `/contacto` desde `/ig`, pero esos ya están alcanzables desde `/tienda` y el resto del sitio, y no es el propósito de una landing de bio.

---

### P-02 — `/tejedoras`: no hay ningún aviso sobre menores de 18 años en el formulario público

**Qué pasa:** `src/app/tejedoras/TejedorasClient.tsx` y `src/app/tejedoras/actions.ts` no piden edad ni muestran ningún aviso sobre trabajo de menores. El formulario es público, sin gate de edad, y cualquiera puede postularse dejando nombre, WhatsApp/email, experiencia y portfolio (`actions.ts:42-118`). La memoria del proyecto (`tejedoras-cuenta-delegacion.md`, no releída acá por ser un archivo fuera del repo, solo el índice) anota: *"menor de 18 = carné INAU primero"* — es decir, ya se identificó como regla de negocio en algún momento, pero **no está implementada ni mencionada en el código ni en la página**.

**Por qué importa:** en Uruguay, el trabajo de personas menores de 18 años requiere autorización del INAU (Instituto del Niño y Adolescente del Uruguay) — es un requisito legal, no una preferencia de estilo. Una adolescente que teje bien y quiere postularse (perfil de audiencia plausible para una marca de crochet en Instagram) no tiene ninguna señal en el formulario de que existe ese requisito antes de que Anush tenga que descubrirlo a mano, ya en la conversación de WhatsApp.

**Evidencia:** el propio formulario, verificado línea por línea — cero campos de edad, cero texto sobre el tema, en `TejedorasClient.tsx` (310 líneas) ni en `actions.ts` (118 líneas).

**Impacto:** bajo/medio (protege a Anush de una conversación incómoda tardía y dice cumplimiento legal real, no es un problema de conversión). **Esfuerzo:** bajo si el texto ya está definido; medio porque el texto exacto y el criterio (¿bloquea el envío? ¿solo avisa?) es una decisión de negocio que no puedo inventar.

**Clasificación:** (B) necesita decisión de Anush — el texto legal/operativo exacto (qué pide el INAU, si se pide el carné en la postulación o después en la charla de WhatsApp) no está en el código ni en `PRICE_TABLE`/`data.ts`, así que no puedo redactarlo sin inventar un requisito. Dejar como tarea concreta: agregar debajo de "Postulate" (antes del form) una línea tipo *"Si tenés menos de 18 años, necesitás el carné de trabajo del INAU antes de empezar — contanos tu edad al escribirnos."* — pero el texto final y si el INAU exige algo más específico lo tiene que confirmar Anush.

---

---

### P-03 — `/terminos` usa "artesanal" dos veces, la palabra prohibida por las reglas de voz, justo en la única página legal del sitio

**Qué pasa:** `src/app/terminos/page.tsx:84-86` (bloque "3. Productos y prendas a medida"):

> "Todos los productos ofrecidos en este sitio son **tejidos a mano de forma artesanal** en Montevideo, Uruguay. Las prendas pueden presentar pequeñas variaciones entre sí, propias del proceso manual, lo cual forma parte de su naturaleza artesanal y no constituye un defecto."

Dos apariciones de "artesanal" en dos oraciones seguidas. El propio comentario de esta página (línea 21: *"Revisión 04/09/2026: se sacaron las cláusulas de cambios y devoluciones, derecho de retractación y 'precios con IVA'"*) muestra que esta página ya pasó por una limpieza legal reciente — confirmado también por mí: no hay "devoluci", "retracto", "cambio de talle" como derecho, ni "IVA" en ningún lado del archivo (grep completo, limpio). Pero esa limpieza no tocó "artesanal", que sigue prohibida por las reglas de voz de esta auditoría.

**Evidencia:** la lista de palabras prohibidas del brief de esta auditoría incluye "artesanal" explícitamente, sin excepción para páginas legales.

**Impacto:** bajo (una página de bajo tráfico — no aparece en "Páginas que más traen" de `seo-2026-09-12.md` — y el contenido legal en sí no cambia). **Esfuerzo:** trivial.

**Clasificación:** (A) aplicar ya — es copy puro, no cambia ninguna cláusula legal (la idea "las variaciones no son un defecto" queda intacta).

**Fix concreto**, reemplazar en `src/app/terminos/page.tsx:84-86`:

> "Todos los productos ofrecidos en este sitio son **tejidos a mano**, uno por uno, en Montevideo, Uruguay. Las prendas pueden presentar pequeñas variaciones entre sí, propias del proceso manual, y esas variaciones no constituyen un defecto."

**Trade-off:** ninguno — mismo significado legal, sin la palabra prohibida.

---

### P-04 — Rayas largas ("—") en 12 de las 21 notas del blog y en la metadata de 5 páginas: la "confeti" que las reglas de voz prohíben

**Qué pasa:** conté 46 apariciones de "—" en `src/content/blog/articles/*.ts` (grep exacto), repartidas en 12 archivos:

| Archivo | Apariciones |
|---|---|
| `que-talle-de-prenda-tejida-me-queda.ts` | 9 (5 son separadores de fila en la tabla de talles — ver nota abajo — y 4 son de prosa) |
| `primeros-auxilios-prenda-tejida.ts` | 5 |
| `materiales-de-una-prenda-tejida.ts` | 5 |
| `el-crochet-se-hace-a-maquina.ts` | 5 |
| `holgura-prenda-tejida.ts` | 4 |
| `cardigan-de-crochet-como-elegirlo.ts` | 4 |
| `bolsos-de-crochet-por-que-duran.ts` | 4 |
| `la-lana-pica-fibras-piel-sensible.ts` | 3 |
| `que-ponerse-debajo-de-un-top-de-crochet.ts` | 2 |
| `entretiempo-uruguay-prendas-tejidas.ts` | 2 |
| `cuanto-demora-una-prenda-tejida-a-mano.ts` | 2 |
| `tops-de-crochet-para-verano.ts` | 1 |

Un matiz real: en `que-talle-de-prenda-tejida-me-queda.ts:72-76`, 5 de las 9 apariciones son el separador de la tabla de talles (`'**XS** — busto 78–82 · cintura 60–64 · cadera 84–88'`) — es un uso tabular, no la "confeti" de prosa que describe la regla. Ahí un `:` en vez de `—` sería más consistente pero es cosmético, no urgente.

Las demás (~38) sí son la raya larga de prosa que las reglas prohíben — típica marca de texto generado o de un estilo "ensayo" que no es la voz cálida y concreta de Dahila. Ejemplos reales con el reemplazo exacto:

1. `holgura-prenda-tejida.ts:26` — actual: *"Ese hueco —entre la medida de tu cuerpo y la de la prenda— se llama holgura"* → fix: *"Ese hueco (entre la medida de tu cuerpo y la de la prenda) se llama holgura"*.
2. `holgura-prenda-tejida.ts:31` — actual: *"un calce al cuerpo — y eso solo funciona en puntos que estiran"* → fix: *"un calce al cuerpo, y eso solo funciona en puntos que estiran"*.
3. `holgura-prenda-tejida.ts:105` — actual: *"Busto, cintura, cadera — el paso a paso está en..."* → fix: *"Busto, cintura, cadera: el paso a paso está en..."*.
4. `el-crochet-se-hace-a-maquina.ts:41` — actual: *"Ese movimiento —entrar, tomar, salir, en tres dimensiones y decidiendo dónde entrar cada vez— es el que no se logró llevar a una máquina industrial"* → fix: *"Ese movimiento (entrar, tomar, salir, en tres dimensiones y decidiendo dónde entrar cada vez) es el que no se logró llevar a una máquina industrial"*.
5. `el-crochet-se-hace-a-maquina.ts:51` — actual: *"Es una tela legítima y tiene sus usos — el punto es que no es crochet"* → fix: *"Es una tela legítima y tiene sus usos. El punto es que no es crochet"* (dos oraciones).
6. `el-crochet-se-hace-a-maquina.ts:64` — actual: *"tiene mínimas irregularidades — no errores, variación humana"* → fix: *"tiene mínimas irregularidades: no son errores, son variación humana"*.
7. `el-crochet-se-hace-a-maquina.ts:103` — actual: *"La estructura del crochet —entrar con el ganchillo dentro de un punto ya formado— es la que no se logró industrializar"* → fix: *"La estructura del crochet (entrar con el ganchillo dentro de un punto ya formado) es la que no se logró industrializar"*.

El patrón se repite en el resto: raya doble de aposición → paréntesis; raya simple antes de una consecuencia → coma, dos puntos o punto y seguido, según el caso.

**También aparece en metadata visible en Google/redes** (no es blog, pero es el mismo hallazgo de voz, en páginas de mi área):
- `src/app/atelier/page.tsx:12,17` — título: *"Quién teje tus prendas — el taller"* → fix: *"Quién teje tus prendas: el taller"*.
- `src/app/contacto/page.tsx:10,15` — título: *"Contacto — hablás directo con quien teje"* → fix: *"Contacto: hablás directo con quien teje"*.
- `src/app/colecciones/page.tsx:28,34` — descripción: *"Cada colección sale en cantidades chicas — es crochet tejido a mano en Montevideo."* → fix: *"Cada colección sale en cantidades chicas: es crochet tejido a mano en Montevideo."*.
- `src/app/colecciones/[slug]/page.tsx:37` (fallback) — *`Colección ${data.name} — piezas tejidas a crochet, hechas a mano por Dahila Crochet.`* → fix: *`Colección ${data.name}: piezas tejidas a crochet, hechas a mano por Dahila Crochet.`*; misma nota para el fallback del JSON-LD en la línea 89 (*`Colección ${collection.name} — Dahila Crochet.`* → *`Colección ${collection.name}, de Dahila Crochet.`*).
- `src/app/ofertas/page.tsx:12,17` — descripción: *"Pocas unidades de cada modelo — cuando se van, se van."* → fix: *"Pocas unidades de cada modelo: cuando se van, se van."*.

**Evidencia:** regla explícita de esta auditoría ("prohibido... la confeti de rayas largas —"). No es un juicio estético mío: es la instrucción de voz del proyecto, verificada letra por letra contra el código real.

**Impacto:** bajo/medio (no cambia conversión directamente, pero es exactamente la señal que un editor exigente usaría para detectar "esto lo escribió una IA sin editar" — 21 notas son la superficie de contenido más grande del sitio y esta es la inconsistencia de voz más repetida que encontré). **Esfuerzo:** bajo por instancia, medio en total (~45 reemplazos uno por uno, porque cada uno pide elegir la puntuación de reemplazo según el sentido de la frase — no es un buscar-y-reemplazar mecánico seguro).

**Clasificación:** (A) aplicar ya para las 12 instancias en metadata/títulos (listadas arriba, con texto exacto) — bajo riesgo, alto valor de consistencia. (A) también para el resto de las notas, pero como tanda separada de edición de copy (no un cambio de una línea): recomiendo una pasada dedicada, archivo por archivo, aplicando el mismo criterio (paréntesis / coma / dos puntos / punto y seguido) que los 7 ejemplos de arriba.

**Trade-off:** ninguno de fondo — es puntuación, no contenido. El único costo es el tiempo de revisar cada oración para no romper el sentido al partirla.

---

## Resto de páginas públicas — resumen

Repasé `/colecciones`, `/colecciones/[slug]`, `/ofertas`, `/atelier`, `/info`, `/contacto`, `/terminos` y `/resena` (código completo de cada `page.tsx`/route, working tree incluido). Ninguna tiene un hallazgo nuevo aparte de P-03/P-04 arriba. Notas puntuales:

- **`/colecciones`** (`src/app/colecciones/page.tsx`): metadata dinámica correcta (noindex mientras no hay colecciones visibles — `generateMetadata` líneas 15-24), estado vacío con link a `/tienda`, separa bien "próximamente" (sin link, expectativa sin frustrar) de publicadas. Sin problema.
- **`/colecciones/[slug]`**: `generateStaticParams` excluye `unlisted` a propósito (acceso VIP solo por link directo, documentado en el comentario), maneja error de Supabase lanzando (no 404) igual que la ficha de producto, JSON-LD `CollectionPage` + `ItemList` con precios reales vía `getFinalPrice`. Estado vacío con link a `/tienda`. Sin problema de fondo.
- **`/ofertas`**: filtra ofertas reales (`getFinalPrice < getEffectivePrice`, `OfertasClient.tsx:38-40`) — nada de descuentos falsos. Estado vacío con CTA a `/tienda`. El texto "Pocas unidades de cada modelo — cuando se van, se van" (además del guion, ver P-04) es una afirmación de escasez que **sí es estructuralmente real** para piezas tejidas a mano en cantidades chicas, así que no lo marco como patrón oscuro — solo el guion.
- **`/atelier`**: contenido editable desde `site_settings` con fallbacks razonables, `Person` JSON-LD para Anush (dato real, sin inventar cifras), imagen hero con `fetchPriority="high"` correcto. Sin problema.
- **`/info`**: ya enlaza a `/blog/como-cuidar-prendas-de-crochet` (no a como-lavar ni como-guardar) para el bloque de cuidados, y a `/blog/como-encargar-prenda-a-medida` para el de encargo — el enlazado interno de `/info` **ya está alineado** con el pilar, no necesita cambios si se aplica la decisión de abajo.
- **`/contacto`**: simple, dos canales (WhatsApp/Instagram), sin datos inventados. Sin problema.
- **`/terminos`**: ver P-03. Fuera de eso, confirmé de nuevo (grep completo del archivo) que no hay "devoluci", "retracto", "cambio de talle" como derecho del comprador, ni "IVA" — la limpieza del 04/09 sigue vigente.
- **`/resena`** (`src/app/resena/route.ts`, working tree sin commitear): redirect 307 a la URL de reseña de Google desde `site_settings`, con fallback a `/contacto` si falla la base. Bien resuelto, comentario explícito de que el cupón de la tarjeta QR no puede atarse a la reseña (cumple la regla dura de Google). Sin problema.

---

## Blog — arquitectura de contenido (`index.ts`, `types.ts`, `toc.ts`, `hero.ts`, componentes, listado y ficha)

Revisé el modelo completo: `src/content/blog/types.ts`, `index.ts`, `toc.ts`, `hero.ts`, `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`. Sin hallazgos — es la parte técnicamente más sólida de mi área:

- Cero egress nuevo: el texto vive en TS compilado, solo la foto de portada y los productos recomendados salen del catálogo ya cacheado (comentarios explícitos en `index.ts:1-15` y `hero.ts:1-9` explican por qué, y es verificable: no hay ningún `createClient()` en el modelo de contenido).
- `dynamicParams` sin `false` en `[slug]/page.tsx` — decisión bien documentada (líneas 23-40) sobre un bug real de 404 cacheado en Netlify que tuvieron en producción; el trade-off (perder un soft-404 raro) está explicitado y es razonable.
- JSON-LD correcto: `BlogPosting` + `BreadcrumbList` + `FAQPage` solo si hay bloques `faq`: (`articleJsonLd`, líneas 293-352), autoría a nivel `Organization` con el comentario explícito de por qué (*"declarar un autor persona que no existe sería inventar"*, línea 311) — exactamente la disciplina de "nunca inventar" que pide esta auditoría.
- Cada nota trae `relatedProductSlugs` + `relatedCategorySlug` + un bloque `shopCta` con link real a `/tienda`, una categoría o `/encargo` — confirmé las 21/21 por grep, ninguna nota es un callejón sin salida hacia la venta.
- `getRelatedArticles` (`index.ts:86-100`) nunca deja una nota sin "seguir leyendo": completa con el mismo cluster y después con el resto — buen enlazado interno por diseño, no por casualidad.

## Blog — las 21 notas

Sin hallazgos nuevos de datos inventados, ni de "devoluciones/IVA", ni de nombres de tejedoras individuales (grep de "tejedora" en las 21 notas: dos menciones genéricas al oficio, ninguna con nombre propio). Crucé los números que sí aparecen contra la fuente real:

- **Horas de tejido** (`cuanto-demora-una-prenda-tejida-a-mano.ts:38-44`): los rangos por familia (accesorios 3-5h, bufandas ~5h, bolsos 5-10h, tops 11-16h, sets 16-20h, poncho ~19h, cardigans 20h+) calzan exactos con las horas reales de `PRICE_TABLE` (`src/app/admin/estrategia/data.ts:133-163`) para cada slug de esa familia. Sin invención.
- **Tabla de talles** (`que-talle-de-prenda-tejida-me-queda.ts:72-76`): los números (XS 78-82/60-64/84-88 cm, hasta XL 99-105/81-87/105-111) son un calco exacto de `ROWS` en `src/components/SizeGuide.tsx:11-17` — el mismo componente que usa la ficha de producto real. Sin invención.
- **Clima de Montevideo** (`entretiempo-uruguay-prendas-tejidas.ts:38-45`): fechas y temperaturas de estación citan fuente y fecha de consulta (*"Weather Spark y las tablas estadísticas de INUMET, consultadas el 04/09/2026"*, línea 45) — es el organismo meteorológico real de Uruguay, correctamente citado.
- **`cuanto-cuesta-una-prenda-tejida-a-mano.ts`**: se cuida explícitamente de no inventar una tarifa de Dahila — nota final (línea 104): *"Las horas de trabajo mencionadas son órdenes de magnitud del tejido a mano en general, no una tarifa de Dahila."* Sin precios concretos en toda la nota.
- **Producto `chaleco`**: la auditoría de mercado del 03/09 lo marcó como huérfano (sin fila de categoría, 404 real). Verifiqué hoy contra la base con la anon key: `chaleco` está `active`, con categoría `tops` asignada — el problema que motivó la duda sobre si `entretiempo-uruguay-prendas-tejidas.ts` (que lo recomienda) apuntaba a un callejón sin salida **ya no existe**. Nota menor sin impacto: esa nota linkea su `shopCta` a `/tienda/cardigans`, pero `chaleco` vive en la categoría `tops` — quien haga clic en "Ver los cardigans" no va a ver el chaleco ahí (sí lo va a ver como product card individual más arriba en la nota, vía `pickProducts`, que matchea por slug sin importar categoría). Impacto bajo, no lo elevo a hallazgo numerado.

**Metadata:** las 21 descripciones están mayormente en el rango 131-165 caracteres que pide el propio `types.ts:72` (140-160). Tres se pasan un poco: `el-crochet-se-hace-a-maquina.ts` (173), `cuanto-demora-una-prenda-tejida-a-mano.ts` (172) y `holgura-prenda-tejida.ts` (171) — Google trunca alrededor de los 155-160 caracteres, así que esos tres pierden la última palabra o dos en el snippet. Impacto bajo, esfuerzo trivial (acortar 10-15 caracteres cada una) — lo dejo anotado para una pasada de copy, no lo numero como hallazgo aparte porque no hay texto de reemplazo único y objetivo (depende de qué palabra prefiera recortar Anush).

**Tabla resumen** (todas responden una duda de compra real, todas enlazan a tienda/categoría/encargo, ninguna tiene dato inventado ni violación legal):

| Nota | Cluster/rol | Enlaza a | Estado indexación (12/09) |
|---|---|---|---|
| `comprar-crochet-en-uruguay` | comprar/pillar | `/tienda`, 3 notas | indexada, ya trae clics reales (2 clics/44 impr.) |
| `el-crochet-se-hace-a-maquina` | comprar/support | `/tienda` | **no indexada** ("Descubierta") |
| `que-talle-de-prenda-tejida-me-queda` | comprar/support | `/encargo` | **no indexada** ("Descubierta") |
| `holgura-prenda-tejida` | comprar/support | `/encargo` | indexada |
| `cardigan-de-crochet-como-elegirlo` | comprar/support | `/tienda/cardigans` | **no indexada** ("Descubierta") |
| `entretiempo-uruguay-prendas-tejidas` | comprar/support | `/tienda/cardigans` | indexada |
| `tops-de-crochet-para-verano` | comprar/support | `/tienda/tops` | **no indexada** ("Google no reconoce") |
| `que-ponerse-debajo-de-un-top-de-crochet` | comprar/support | `/tienda/tops` | indexada |
| `materiales-de-una-prenda-tejida` | comprar/support | `/tienda` | **no indexada** ("Google no reconoce") |
| `set-tejido-vs-piezas-sueltas` | comprar/support | `/tienda/sets` | **no indexada** ("Descubierta") |
| `bolsos-de-crochet-por-que-duran` | comprar/support | `/tienda/accesorios` | **no indexada** ("Descubierta") |
| `como-cuidar-prendas-de-crochet` | cuidados/pillar | `/tienda` | indexada |
| `primeros-auxilios-prenda-tejida` | cuidados/support | `/tienda` | indexada |
| `como-encargar-prenda-a-medida` | a-medida/pillar | `/encargo` | indexada (1 clic/8 impr.) |
| `cuanto-demora-una-prenda-tejida-a-mano` | a-medida/support | `/encargo` | **no indexada** ("Descubierta") |
| `la-lana-pica-fibras-piel-sensible` | comprar/support | `/tienda` | indexada |
| `regalos-tejidos-a-mano` | regalos/pillar | `/tienda/accesorios`, `/tienda` | indexada (3 clics/108 impr. — la nota que más trae) |
| `cuanto-cuesta-una-prenda-tejida-a-mano` | comprar/support | `/tienda/accesorios` | indexada |
| `como-lavar-crochet-a-mano` | cuidados/support | `/tienda` | indexada (ver decisión abajo) |
| `crochet-o-dos-agujas-diferencias` | comprar/support | `/tienda` | indexada |
| `como-guardar-prendas-tejidas` | cuidados/support | `/tienda/accesorios` | indexada (ver decisión abajo) |

7 de 21 notas siguen sin indexar (todas del cluster "comprar", casi todas publicadas 04/09 — normal a los 8 días, Google tarda en rastrear contenido nuevo). Ninguna es un problema de contenido: todas tienen el mismo nivel de cuidado que las que sí están indexadas.

---

## Decisión pedida: como-lavar / como-guardar vs como-cuidar

**Cambio de recomendación respecto al dato que motivó la pregunta.** El brief de esta auditoría (y el prompt total del 12/09, §9) da por hecho que *"hoy como-lavar y como-guardar están 'rastreadas, sin indexar', porque duplican a como-cuidar"*. Ese dato es de antes del 12/09. Volví a correr el chequeo contra el reporte de hoy mismo (`research/mediciones/seo-2026-09-12.md:75-91`, generado con `npm run seo-report` vía la API real de inspección de URLs de Search Console) y **ninguna de las tres notas aparece en la lista de 11 URLs sin indexar**. El script marca "indexada" cuando `verdict === 'PASS'` de la API (`scripts/seo-report.mjs:150,197-198`) — es un veredicto por URL, no una suposición. O sea: **hoy, 12/09, Google tiene indexadas las tres notas por separado**, con contenido propio.

**Recomendación: NO consolidar por ahora.** Motivos:

1. **La premisa cambió.** El único motivo dado para fusionar (Google las trata como duplicado, no las indexa) ya no es cierto con el dato de hoy. Aplicar un 301/308 ahora sería resolver un problema que dejó de existir, a costa de tirar dos URLs que Google ya decidió indexar.
2. **No son contenido duplicado real, es el modelo pilar/cluster funcionando como se diseñó.** Leí las tres notas completas. `como-cuidar-prendas-de-crochet` (pilar) menciona lavado y guardado en 1-2 párrafos cada uno y linkea "para el detalle completo" a las dos de apoyo. Cada nota de apoyo tiene contenido propio real que el pilar no tiene:
   - `como-lavar-crochet-a-mano.ts`: lista de materiales, 6 pasos detallados (vs. 4 genéricos del pilar), sección "¿Cada cuánto conviene lavar?", y FAQ propia (suavizante, tiempo de secado, destiñe, lavado en seco).
   - `como-guardar-prendas-tejidas.ts`: el "truco de la percha" (doblar el cardigan por la mitad y pasar la percha por el pliegue), cuántas prendas apilar, guardado por temporada con repelente natural (lavanda/cedro) y polillas, y FAQ propia (guardar al vacío, naftalina, agujeritos).
   Es exactamente el comentario de `types.ts:42-45` sobre el modelo pillar/cluster (*"los de apoyo enlazan hacia él y él hacia ellos"*) — no es contenido pisado, es la jerarquía a propósito.
3. **El riesgo de consolidar hoy es real y concreto:** perder 2 URLs indexadas de un sitio que recién esta semana pasó de 59 a 61 de 72 indexadas (`seo-2026-09-12.md:1-10`, clics +532% interanual) — es mal momento para restar señal justo cuando está creciendo.

**Clasificación: (D) descartar por ahora, con motivo** (arriba). No es un "nunca": si un futuro `npm run seo-report` vuelve a mostrar estas dos URLs como "rastreada, sin indexar" o "duplicado, Google eligió otra canónica", ahí sí aplica la consolidación. Dejo el mecanismo exacto documentado para ese caso:

**Si en el futuro se decide consolidar, los pasos concretos son:**

1. **Redirección en `next.config.ts`** (agregar una función `redirects()` — hoy el archivo no tiene ninguna, confirmado por grep): 
   ```ts
   async redirects() {
     return [
       { source: '/blog/como-lavar-crochet-a-mano', destination: '/blog/como-cuidar-prendas-de-crochet#lavado', permanent: true },
       { source: '/blog/como-guardar-prendas-tejidas', destination: '/blog/como-cuidar-prendas-de-crochet#guardado', permanent: true },
     ]
   }
   ```
   `permanent: true` → 308 (correcto para consolidación definitiva, transfiere la señal de SEO). Los anchors `#lavado`/`#guardado` solo funcionan si esos `h2` del pilar generan esos IDs exactos vía `headingId()` (`toc.ts:5-12`, deriva el id del texto del h2 en minúsculas/sin tildes/guiones) — hoy los h2 del pilar son *"Lavado: a mano, agua fría, sin retorcer"* → id `lavado-a-mano-agua-fria-sin-retorcer`, no `lavado`; habría que o renombrar el h2 a algo que empiece con una palabra ancla, o aceptar que el anchor no sea tan corto.
2. **Sacar de `src/content/blog/index.ts`:** las líneas 5-6 (imports de `lavarCrochet`/`guardarTejidas`) y las entradas correspondientes en el array `ARTICLES` (líneas 53 y 55).
3. **Traspasar a `como-cuidar-prendas-de-crochet.ts` el contenido único** listado en el punto 2 de arriba (el truco de la percha, el límite de prendas apiladas, el guardado por temporada con repelente, las FAQ específicas de cada una) — sin esto, consolidar pierde información real que hoy ayuda a quien lee.
4. **Enlaces internos a actualizar** (grep confirmado, son solo estos 4 lugares):
   - `src/content/blog/articles/primeros-auxilios-prenda-tejida.ts:20-21` (`relatedArticleSlugs`) y `:145` (link inline a ambas notas) → apuntar a `como-cuidar-prendas-de-crochet`.
   - `src/content/blog/articles/materiales-de-una-prenda-tejida.ts:129` (link inline a como-lavar) → apuntar a `como-cuidar-prendas-de-crochet`.
   - Dentro de la propia `como-cuidar-prendas-de-crochet.ts:76,101`, los links que hoy apuntan HACIA como-lavar/como-guardar quedarían huérfanos (se estarían citando a sí misma) — hay que borrarlos, no redirigirlos.
5. **Sitemap:** `sitemap.ts` genera las URLs desde `getAllArticles()`, así que al sacar las dos notas del array desaparecen solas del sitemap la próxima vez que se regenere — no hace falta tocar nada ahí a mano.
6. **Reindexar:** después del deploy, correr `npm run index-urls` solo para `/blog/como-cuidar-prendas-de-crochet` (cambió de contenido) — las dos URLs viejas no se re-envían (ya no existen, la Indexing API es para URLs nuevas/cambiadas, no para bajas).

---

## Verificado y bien (no tocar)

- `/ig`, `/tejedoras`: ver P-01 y P-02 (sección anterior de este archivo).
- **Blog — arquitectura de contenido** (`types.ts`, `index.ts`, `toc.ts`, `hero.ts`, `blog/page.tsx`, `blog/[slug]/page.tsx`): cero egress nuevo, JSON-LD correcto y sin autoría inventada, enlazado interno garantizado por diseño (`getRelatedArticles`), `dynamicParams` bien documentado. Sin hallazgos.
- **Blog — datos verificados contra su fuente real:** horas de tejido (`cuanto-demora...`) contra `PRICE_TABLE`; tabla de talles (`que-talle...`) contra `SizeGuide.tsx`; clima de Montevideo (`entretiempo...`) con fuente y fecha citadas (Weather Spark + INUMET); `cuanto-cuesta...` se cuida explícitamente de no inventar una tarifa de Dahila. Nada de "devoluciones/IVA", nada de nombres propios de tejedoras, nada de reseñas o testimonios inventados en ninguna de las 21 notas.
- **Producto `chaleco`** (mencionado como huérfano en la auditoría de mercado del 03/09): verificado hoy contra la base — está `active`, con categoría `tops` asignada. El problema que tenía ya no existe.
- `/colecciones`, `/colecciones/[slug]`, `/ofertas`, `/atelier`, `/info`, `/contacto`, `/resena`: sin hallazgos de fondo — estados vacíos con CTA a `/tienda`, metadata dinámica correcta, nada de descuentos o escasez falsos, `/info` ya enlaza al pilar de cuidados correcto.
- `/terminos`: la limpieza legal del 04/09 (sin devoluciones/retracto/IVA) sigue vigente, reverificada línea por línea hoy. Solo falta lo de P-03.
- **`/resena`** (working tree, sin commitear): redirect bien resuelto, con fallback si falla la base, y respeta la regla de que el cupón de la tarjeta QR nunca se ata a dejar reseña.
- **Decisión como-lavar/como-guardar:** con el dato de hoy (12/09), las tres notas están indexadas por separado y cada una tiene contenido único real — no consolidar por ahora (ver sección arriba para el detalle y el plan si la situación cambia).

---

## Top-5 del área

1. **P-01 — `/ig`:** el footer completo (13 links de navegación) se renderiza debajo del linktree de una columna, cuando ya se excluyó `/ig` en otros 5 componentes globales. Fix de 6 líneas, mismo patrón ya usado 5 veces. (A)
2. **P-04 — Rayas largas en 12 notas del blog + 5 páginas:** 46 apariciones de "—", la "confeti" que las reglas de voz prohíben explícitamente — la inconsistencia de voz más repetida de toda mi área. Fix de metadata (12 instancias) es trivial y va con texto exacto; el resto pide una pasada de copy dedicada. (A)
3. **Decisión como-lavar/como-guardar — NO consolidar:** corrijo la premisa del brief con el dato de hoy (`seo-2026-09-12.md`): las tres notas están indexadas por separado, cada una con contenido único. Consolidar ahora tiraría 2 URLs que Google recién empezó a indexar, sin necesidad. (D, con el mecanismo exacto documentado por si el dato cambia)
4. **P-03 — `/terminos` usa "artesanal" dos veces:** única página legal del sitio, fix de una línea sin tocar ninguna cláusula. (A)
5. **P-02 — `/tejedoras` sin aviso de menores de 18:** requisito legal real (carné INAU), cero señal en el formulario público antes de que Anush lo descubra a mano en WhatsApp. (B, necesita texto/criterio de Anush)
