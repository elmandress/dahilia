# Megaprompt: auditoría de mercado y producto (precios + UX/retención, ancladas en datos reales)

Escrito 2026-09-03, a pedido explícito de Mati. Pensado para pegarse como
primer mensaje en una sesión **nueva** de Claude Code sobre este mismo repo,
corriendo **Claude Opus 5** (mejor con effort alto/xhigh — es una tarea de
investigación larga y agéntica; avisale al usuario que lo elija si tiene la
opción). No hace falta editarlo: ya trae las coordenadas del repo, las
trampas conocidas y las reglas duras del proyecto adentro, así la sesión
nueva no tiene que re-derivar nada de esto.

**Si Opus 5 no está disponible (caída/errores elevados) cuando quieras
correr esto:** no hace falta esperar. Corré el mismo prompt tal cual en
**Sonnet 5 con effort/thinking al máximo (ultrathink)**. Este trabajo es
mayormente investigación amplia en paralelo (precios SKU por SKU con
fuentes, barrido de UX, síntesis de estadísticas) — el tipo de tarea donde
Sonnet 5 ya rinde bien (ver memoria `recomendacion-modelo-auditoria`). La
ventaja real de Opus está concentrada en el juicio fino puntual de la
síntesis final (¿esta framing de precio es honesta o manipuladora?, ¿este
copy suena a Anush?, tensiones entre $/h y precio de mercado) — si querés
esa pasada extra, hacela después como una segunda pasada corta sobre el
documento ya armado, no repitiendo toda la investigación.

Investigación previa a escribir este prompt: se leyó la guía oficial de
Anthropic ["Prompting Claude Opus 5"](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5)
y ["Prompting best practices"](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices).
Tres cosas de ahí moldearon la forma del prompt: (1) Opus 5 rinde mejor
cuando recibe la especificación completa de una y solo una vez, y se lo deja
correr — por eso el prompt es largo y denso en coordenadas, no un resumen;
(2) Opus 5 ya se autoverifica y autocorrige solo, así que el prompt evita a
propósito instrucciones tipo "chequeá dos veces" o "verificá tu trabajo"
(inflan tokens sin mejorar el resultado) — en cambio exige *fuentes
externas verificables* para cada precio/dato, que es un requisito distinto
(grounding, no autochequeo); (3) si un prompt de revisión pide "solo lo
importante" o "sé conservador", el modelo lo toma literal y reporta menos
— por eso acá se pide explícitamente reportar TODO sin autocensura y
priorizar recién en una pasada final separada, que es justo lo que pidió
Mati ("cada minima cosa").

---

## EL PROMPT (pegar todo lo de abajo)

```
Sos el CTO técnico part-time de Dahila Crochet, e-commerce de una sola
persona (Anush) en Uruguay: ropa y accesorios de crochet tejidos a mano y a
medida. Next.js 16 + React 19 + Supabase + Netlify. El checkout NO es una
pasarela de pago: es un botón que arma un mensaje y abre WhatsApp para
coordinar. Repo: c:\Users\mati\Downloads\dahilia. Leé AGENTS.md primero
(Next 16 tiene breaking changes reales vs tu training data — hay docs
oficiales en node_modules/next/dist/docs/).

ANTES DE EMPEZAR: leé toda tu memoria persistente de este proyecto (el
directorio de memoria de Claude Code para esta sesión). Ahí está el estado
real de auditorías anteriores, investigación de CRO/SEO/persuasión ya
hecha, y pendientes de Anush sin confirmar. No re-derives nada de eso desde
cero. Puntos de esa memoria que son especialmente cargados para ESTE trabajo
y que te conviene tener presentes desde el arranque:

- Dos rondas de investigación de persuasión/CRO/SEO/canales gratis ya se
  hicieron (22/08/2026) con top-5 priorizados cada una. Varias cosas de ahí
  YA ESTÁN IMPLEMENTADAS (tabla de talles en cm, selector de talle por
  botones, structured data completo) — verificalo contra el código antes de
  volver a "descubrirlo". Y hay una decisión cerrada: Etsy está DESCARTADO
  como canal de venta para Dahila (no lo vuelvas a sugerir como vidriera).
  Esto NO te impide usar precios de Etsy como dato de referencia de mercado
  internacional — es una prohibición sobre venta ahí, no sobre mirar sus
  precios.
- Hay un hallazgo duro sobre medición: en una ventana donde Umami reportó 6
  visitantes, la propia tabla `cart_items` tenía 21 carritos distintos
  (imposible sin visitas reales). Umami y GA4 subestiman por un factor
  grande y desconocido (adblockers). NUNCA saques una conclusión de negocio
  de un número crudo de Umami o GA4 sin cruzarlo contra datos propios.
- El MCP de Supabase conectado a este entorno ve OTRO proyecto (un CRM
  inmobiliario). No sirve para nada de Dahila. Los cambios de base van como
  SQL idempotente en database/ que Anush corre a mano.
- Toda propuesta de cambio de UX/diseño necesita, antes de proponerse: qué
  problema resuelve, qué evidencia externa lo respalda (Baymard, NN/g, un
  caso real de e-commerce comparable), y qué trade-off tiene. Preferí 3
  mejoras bien fundamentadas a 20 cambios cosméticos sin respaldo — pero
  para ESTE trabajo puntual Mati pidió explícitamente exhaustividad (ver
  más abajo): encontrá todo, fundamentá todo, y dejá que la priorización
  ordene la lista larga en vez de recortarla de entrada.
- Nunca inventar precios, plazos, ni cantidades de negocio. Si falta un
  dato real, se pregunta o se deja documentado como pendiente — no se
  estima a ojo y se presenta como hecho.

TU MISIÓN tiene dos pilares igual de importantes, y ambos tienen que apoyarse
en datos reales, no en intuición ni en "se ve lindo":

## PILAR 1 — Cada precio de Dahila contra la competencia, acá y afuera

Punto de partida (no lo repitas desde cero, profundizalo):
- Tabla de precios aprobada (columna HOY, jul-2026): `src/app/admin/estrategia/data.ts:132-165`
  (`PRICE_TABLE`, 30 filas, UYU) y `ESTRATEGIA-DEFINITIVA.md` (tabla completa
  desde la línea 30, más el criterio de negocio en la sección "El criterio
  que ordena todo: contribución por hora" — línea 67 en adelante).
- Ya hay una primera pasada de benchmark de mercado uruguayo en
  `ESTRATEGIA-DEFINITIVA.md` sección 1 (línea 7): Moda crochet by me ($850
  top), Indian a máquina ($899–1.499), Zara/Mango UY (~$1.500–3.500), Manos
  del Uruguay ($4.000–10.000+), Etsy como techo global (~$1.200–4.000 USD→UYU
  sin fecha de conversión). Es de julio 2026, con pocas fuentes y sin
  comparar producto por producto — tu trabajo es llevarla de "4-5 anclas
  categóricas" a una comparación SKU por SKU con fuentes reales y fechadas.
- Precios reales EN PRODUCCIÓN pueden diferir de la tabla aprobada: el
  catálogo vivo (`src/lib/catalog-snapshot.json`, snapshot del 22/08/2026,
  o mejor aún los precios actuales en https://dahila.uy/tienda) tiene
  `base_price_uyu` en un rango más ancho (360–2.800) que las 30 filas de
  `PRICE_TABLE` (590–1.490) — señal de que hay productos nuevos o variantes
  que la tabla aprobada no cubre. Empezá comparando ambas fuentes y
  marcando cualquier producto que esté vivo en el sitio pero ausente de
  `data.ts`/`ESTRATEGIA-DEFINITIVA.md`: eso es un hallazgo en sí mismo, antes
  de llegar a la competencia.
- Solo hay 4 categorías reales: tops, cardigans, accesorios, sets (definidas
  en `database/schema.sql:157-162`). Los "bolsos", "bandanas", etc. son
  nombres de producto dentro de accesorios, no categorías propias.

Qué hacer:
1. Para cada producto vivo (o al menos cada familia de producto — un
   cardigan estándar, un top estándar, un set, un bolso, una bandana, una
   bufanda), buscá comparables REALES con precio publicado: mercado
   uruguayo (emprendimientos de crochet en Instagram/Mercado Libre Uruguay,
   ferias, retail a máquina como anclaje de "techo alcanzable sin ser
   artesanal"), mercado regional si hay algo comparable (Mercado Libre
   Argentina/Brasil), y mercado internacional (Etsy — como referencia de
   precio, no de canal —, y cualquier otro marketplace handmade real que
   encuentres, tipo Depop o similar si aparece algo comparable).
2. Cada precio de competencia que cites tiene que ser trazable a una
   búsqueda o página real, con URL y fecha de consulta. Si una búsqueda no
   te da un precio concreto, decilo explícitamente ("no encontré publicado")
   en vez de estimarlo. Un precio "aproximado" sin fuente no sirve — es
   indistinguible de inventado.
3. Convertí todo a UYU (y mostrá también USD) con un tipo de cambio
   explícito y fechado, para que las comparaciones sean legibles.
4. La conclusión de cada comparación tiene que cruzar el precio de mercado
   CON la economía real de Dahila (columna $/h de ESTRATEGIA-DEFINITIVA.md):
   el hallazgo de julio fue que cardigans/poncho/Set BRISA pagan $34–44/hora
   contra $67–104/hora de bolsos — la subvaluación real está ahí, no en la
   distancia con Etsy. No propongas "subir a precio de Etsy" sin conectarlo
   con esa lógica interna; si el mercado externo sugiere algo que contradice
   el criterio de $/h, decilo como tensión a resolver, no la ignores.

## PILAR 2 — Auditoría exhaustiva de producto, UX, microinteracciones y retención

Mati pidió literalmente "cada minima cosa que pueda mejorar el sitio":
recorré el sitio entero buscando fricciones, oportunidades de
microinteracción, señales de confianza faltantes, y cualquier cosa que
ayude a vender más, a que la gente vuelva, o a sostener tráfico — sin
autocensurarte por parecer un detalle chico. Priorizá recién al final, en
una pasada separada; no filtres mientras buscás.

Puntos de partida para no repetir trabajo ya hecho:
- Dos rondas de investigación de persuasión/CRO/SEO ya están en memoria
  (ver arriba) con top-5 priorizados y una lista explícita de "esto NO
  sirve para este negocio" (nada de blog de tips de crochet, nada de
  "auténtico"/"artesanal con amor", nada de GEO/AEO/llms.txt). Léela antes
  de proponer algo de esa lista de nuevo.
- `research/blog-estrategia-seo.md` tiene el roadmap de contenido/SEO y qué
  falta de Anush (materiales concretos, plazos por prenda, más fotos,
  testimonios reales) — no lo re-investigues, retomalo donde quedó.
- Los skills `dahila-storefront` y `ui-review` de este repo ya encodean
  reglas de diseño, accesibilidad, y los "tells" de sitio hecho con IA que
  se identificaron en auditorías previas. Usalos como checklist base, no
  como techo — andá más allá si encontrás algo que no cubren.
- Funnel completo para recorrer (con o sin código, y también navegando el
  sitio real en https://dahila.uy porque el comportamiento en producción
  puede diferir del código): home (`src/app/page.tsx`), listado/categoría
  (`src/app/tienda/page.tsx` y `tienda/[slug]/page.tsx`), ficha de producto
  (`ProductDetailsClient.tsx`), carrito (`carrito/CarritoClient.tsx`),
  encargo a medida (`encargo/EncargoForm.tsx`), blog (`src/app/blog/`),
  `/info`, y la página post-checkout `/gracias`. Hay un WIP sin commitear
  en `src/app/gracias/` (tarjeta QR de agradecimiento, en pausa esperando
  el OK de Anush) — no lo toques ni lo borres, es ajeno a esta auditoría.
- Considerá explícitamente mobile primero (la mayoría del tráfico entra
  desde Instagram) y el momento de decisión real: alguien que ve un precio
  sin fecha de entrega concreta, sin prueba de que hay una persona real del
  otro lado de WhatsApp, o sin razón para volver mañana en vez de hoy.

## EL PILAR ESTADÍSTICO — es la base de los otros dos, no un capítulo aparte

Todo lo de arriba tiene que estar anclado en números reales. Fuentes
disponibles, con sus límites reales — usalas todas, y sé explícito sobre
qué SÍ y qué NO se puede concluir de cada una:

- `src/lib/catalog-snapshot.json` (22/08/2026): catálogo completo con
  precios, categorías, lead times, stock. Sirve para stats de catálogo
  (distribución de precios, cuántos productos en 0/1/2 semanas de espera —
  relevante porque la sección "En stock" de /tienda está vacía hoy porque
  ningún producto tiene lead_time_weeks_min=0).
- `C:\Users\mati\Downloads\analitycs\*.csv`: export real de GA4 del
  02/09/2026 (adquisición de tráfico, landing pages, queries orgánicas,
  engagement/retención). OJO: la propiedad arrancó a medir recién el
  23/08/2026 — son ~10 días de datos, no la serie "Jan–Sep" que el CSV
  aparenta. Las cohortes de retención están en cero por eso, no porque no
  haya retención. Filtrá el tráfico de /admin (ensucia los promedios). No
  hay eventos marcados como conversión todavía, así que "0 conversiones" en
  el CSV es un problema de configuración, no de negocio real.
- `database/schema-daily-summary.sql` define `get_daily_summary()`, una
  función RPC pública de solo agregados (encargos por status, carritos
  distintos, valor de carritos, top 5 productos en carrito) — si tenés
  forma de invocarla contra el proyecto real (`nuihzsytxolftcaggbbk`) con la
  anon key, es una fuente de verdad mejor que GA4/Umami para todo lo de
  carrito/encargo.
- Se puede LEER producción con la anon key pública vía REST para verificar
  datos de catálogo (no de PII). Si necesitás un número fresco de negocio
  que no está en ningún archivo local y no podés leerlo con la anon key
  (por ejemplo AOV real, top productos por encargo, o cuántos carritos
  activos hay hoy), NO lo estimes: escribí la consulta SQL exacta lista
  para pegar en el SQL Editor de Supabase y pedile a Mati que la corra y te
  pase el resultado (mismo patrón que `entrega/QUE-SQL-CORRER.md`) — seguí
  trabajando en el resto mientras tanto, no bloquees la auditoría por esto.
- Instagram (@dahila.crochet) no se puede leer bien sin sesión iniciada:
  un fetch automático puede alucinar bio/highlights que suenan creíbles
  pero son inventados (pasó en una auditoría anterior). Si necesitás algo
  de ahí, quedate solo con lo que confirmes en el HTML crudo (el
  `og:description` trae seguidores/siguiendo/posts reales) y no le pidas a
  una herramienta de fetch que "describa" el perfil completo.

## CÓMO TRABAJAR

Los tres pilares (precios, producto/UX, estadísticas) son pistas
genuinamente independientes y grandes: repartilas en subagentes en paralelo
en vez de hacerlas en serie vos mismo. Un subagente por pilar alcanza; si el
de precios necesita más paralelismo, un subagente por familia de producto
(tops/cardigans/accesorios/sets) es razonable, pero no dispares más de 4-5
subagentes a la vez. El subagente de estadísticas debería terminar primero
y sus hallazgos (qué dice y qué no dice cada fuente) le sirven de insumo a
los otros dos, así que dale prioridad o compartile el resultado en cuanto
esté.

Al final, sintetizá los tres pilares en UN solo documento — no tres
reportes sueltos. El cruce entre pilares es donde está el valor real: un
precio más alto necesita una señal de confianza que lo sostenga; una
estadística de abandono de carrito importa distinto si el precio de esa
pieza está por debajo del piso de mercado o por encima.

## ENTREGABLE

Un único archivo en `research/auditoria-mercado-producto-2026-09.md`.
Estructura sugerida (adaptala si encontrás una mejor forma de organizar
esta cantidad de hallazgos, pero mantené la exhaustividad):
1. Resumen: 5-8 hallazgos que más mueven la aguja, en una frase cada uno.
2. Precios: tabla SKU por SKU (o por familia si el detalle por talle no
   aporta) con precio Dahila, comparables locales e internacionales
   (con fuente y fecha), y una recomendación de posicionamiento conectada
   al criterio $/h.
3. Producto/UX/retención: hallazgos agrupados por etapa del funnel, cada
   uno con problema, evidencia, referente externo, trade-off, y
   impacto/esfuerzo estimado — más un apéndice al final con todo lo menor
   que encontraste y no amerita ir arriba (no lo descartes, coleccionalo).
4. Estadísticas: qué dicen hoy los datos reales, qué no se puede concluir
   todavía, y la lista de consultas SQL pendientes para Mati/Anush si
   quedó algo sin poder verificar.
Cubrí todo con densidad, sin rellenar con resúmenes redundantes ni
secciones de relleno — la extensión la define cuánto encontraste, no una
meta de palabras.

Arreglos de código seguros, reversibles y de bajo riesgo (una microinteracción
chica, un copy que no toca precio/marca, un fix de accesibilidad) podés
aplicarlos directo vos mismo, corriendo el skill `quality-gate` antes de
darlos por terminados. Todo lo que toque precios, plazos, RLS/seguridad de
datos reales, o una reescritura grande de copy de marca se documenta con
evidencia para que decida el usuario — no se aplica a ciegas.

Al terminar, actualizá tu memoria persistente con lo que encontraste, lo
que quedó priorizado sin implementar, y cualquier consulta SQL pendiente de
respuesta — para que la próxima sesión no vuelva a arrancar de cero.
```
