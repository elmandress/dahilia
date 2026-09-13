# Auditoría total de dahila.uy: conversión primero, cada detalle después
**Prompt para una sesión nueva de Claude Code en este mismo repo · escrito el 12/09/2026**

> **Para Mati:** abrí un chat nuevo en este proyecto y pegá esto:
> *"Leé y ejecutá `research/prompt-auditoria-total-2026-09.md` de punta a punta. Arrancá por la Fase 0 y no pushees nada sin preguntarme."*

---

## 1. Rol y objetivo

Actuás como responsable técnico y de producto de dahila.uy. El objetivo es que **más visitas terminen en venta**, auditando y mejorando **cada detalle existente** del sitio y del admin.

Qué incluye "cada detalle":
- cada página, componente y estado (vacío, cargando, error, agotado, en oferta, en stock, a pedido);
- cada texto visible y cada microinteracción;
- cada dato estructurado, cada imagen y cada formulario;
- cada pantalla del admin que usa Anush.

El orden de prioridad es:
1. **Conversión:** que quien entra encuentre, confíe, elija talle y escriba por WhatsApp.
2. **Que el sitio aparezca:** en Google, Maps y las IAs.
3. **Calidad:** accesibilidad, rendimiento, consistencia y un admin claro para alguien no técnico.

No es un rediseño: es pulir lo que existe, con evidencia, sin romper nada.

## 2. Antes de tocar nada (obligatorio)

1. **Instrucciones y memoria.** Leé `CLAUDE.md` / `AGENTS.md` y el índice de memoria del proyecto (se carga solo). Las memorias son fotos de un momento: **verificá contra el código actual** antes de afirmar algo.
2. **Next.js 16.** Este no es el Next que conocés. Antes de escribir código de Next, leé la guía que corresponda en `node_modules/next/dist/docs/`. En particular:
   - `params` es una Promise;
   - el middleware se llama `proxy.ts`;
   - `revalidateTag(tag, { expire: 0 })`;
   - un `images` escrito en la metadata le gana a un `opengraph-image.tsx`.
3. **Skills del repo:** usalas, no las re-derives.
   - `dahila-storefront`: tokens de diseño, reglas de UX/CRO e imágenes. Antes de tocar UI.
   - `ui-review`: al cambiar UI.
   - `quality-gate`: antes de dar algo por terminado.
4. **Informes previos:** leelos para no repetir trabajo.
   - `research/auditoria-mercado-producto-2026-09.md`
   - `research/auditoria-tecnica-2026-09.md`
   - `research/_seo-ranking-2026-09.md`
   - `research/seo-ia-2026-09.md`
   - el más reciente de `research/mediciones/`
5. **Conocimiento del negocio:** vive en `src/app/admin/estrategia/data.ts` (`PRICE_TABLE`, `NEXT_ACTIONS`, estrategias, planes). Es la fuente de verdad del negocio.
6. **Estado del repo:** corré `git status`. **Si hay cambios sin commitear que no son tuyos, no los descartes ni los pises.** Preguntá.

## 3. El negocio en 12 líneas

- **Quién y qué:** Dahila Crochet (la marca es "Dahila", con i). Prendas y accesorios tejidos a crochet, a mano, en Montevideo. La persona es **Anush**.
- **Tejedoras:** hay una red de tejedoras, y sus piezas llevan la etiqueta DAHILA, nunca el nombre de la tejedora.
- **Checkout:** no hay pago en el sitio. El carrito arma un mensaje y abre **WhatsApp**, y ahí se coordinan talle, envío y pago (transferencia o Mercado Pago). Cada vez que alguien toca el botón queda registrado en la tabla `orders`.
- **Producción:** casi todo se teje **a pedido o a medida**, con plazo de semanas. Algunas piezas están **en stock**; se marcan con plazo mínimo 0 y aparecen en el mega-menú como "En stock, sin espera".
- **Catálogo:** ~37 productos activos (cardigans, tops, sweaters, sets, bolsos y accesorios).
- **Precios:** la tabla aprobada es `PRICE_TABLE`, y hay un marcador de subas por etapas en `src/lib/pricing.ts`.
- **Tráfico:** Instagram es la fuente principal (en una medición, 344 de 588 sesiones). TikTok tiene tracción.
- **Search Console (12/09/2026, últimos 28 días):**
  - 120 clics, 739 impresiones, posición media 10;
  - "dahila" sale primera;
  - 59 de 72 URLs indexadas;
  - Spring cardigan es el producto que más trae desde Google.
- **Uruguay:** se compra mucho por el celular. WhatsApp es el canal natural de compra.
- **Perfil de Negocio de Google:** existe, pero sin reseñas ni ubicación visible (ChatGPT rankea más abajo por eso).
- **Brave:** no tiene indexada ninguna página. Google corrige "dahila" a "dahlia".
- **Embudo (12/09):** "muchos carritos, pocos pedidos" era en parte un error de medición:
  - los carritos no se limpiaban;
  - los convertidos no se marcaban;
  - hay un carrito por navegador.
  
  Desde el 12/09, `/admin/carritos` y `/admin/pedidos` muestran el embudo real. Detalle en la memoria `embudo-carritos-2026-09`.

## 4. Contexto técnico y trampas conocidas

- **Stack:** Next.js 16.2 (Turbopack), React 19, Supabase, Netlify (`@netlify/plugin-nextjs`). **Cada push dispara un deploy.**
- **Reglas de lint de React 19** que ya mordieron:
  - `react-hooks/purity`: nada de `Date.now()` durante el render; guardar el momento de carga en estado;
  - `react-hooks/set-state-in-effect`: el patrón del repo es `loadData()` en un `useEffect` con el disable comentado, como en las otras páginas del admin.
- **Catálogo:** `getCatalog()` (`src/lib/catalog.ts`) usa `unstable_cache` con el tag `catalog`. El layout lo carga en todas las páginas, y de ahí salen los `settings`. Si la base cae, hay un fallback a `src/lib/catalog-snapshot.json`.
- **Revalidación:** el admin revalida con `notifyReindex` / `notifySiteWideChange` → `/api/seo/reindex`.
- **Open Graph:**
  - `OG_BASE` trae la imagen por defecto;
  - las páginas con `opengraph-image.tsx` propio usan `OG_BASE_NO_IMAGE`;
  - la tarjeta de Twitter se completa sola desde el openGraph de cada página.
- **Blog:** cada nota es un archivo TS en `src/content/blog/articles/` y se registra en `index.ts`. La foto de portada se cambia en `/admin/blog`, que la guarda en `site_settings` (`blog_hero:<slug>`).
- **Perfiles de la marca:** `src/lib/profiles.ts` + Configuración → Contacto alimentan `sameAs` / `hasMap`. `/resena` redirige al link de reseñas de Google.
- **Scripts:**
  - `npm run index-urls` (Google Indexing API): **solo URLs nuevas o cambiadas**;
  - `npm run seo-report` (API de Search Console): informe mensual en `research/mediciones/`.
- **Base de datos:**
  - la anon key (`NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env.local`) sirve **solo para leer** tablas públicas;
  - `cart_items`, `favorites`, `orders` y `custom_orders` están cerradas: devuelven 0 filas con la anon key;
  - el proyecto de Supabase que ve el MCP es **otro proyecto**: no usarlo.
- **Windows + Git Bash:**
  - un argumento que empieza con `/` se convierte en ruta de Windows: usá `MSYS_NO_PATHCONV=1`;
  - los heredocs largos fallan: escribí los archivos con la herramienta Write;
  - `pkill` no mata `next`: usá `taskkill //F //T //PID <pid>`, con el PID sacado de `netstat -ano | grep :3100`;
  - `npm run build` modifica `next-env.d.ts`: revertirlo antes de commitear;
  - `build` seguido de `dev` sin borrar `.next/cache` deja `/tienda/[slug]` en un 404 fantasma.
- **Build:** tarda de 2 a 10 minutos en esta máquina. Correlo en segundo plano, y hacé el smoke test con `npx next start -p 3100` + `curl`.

## 5. Reglas duras (no negociables)

1. **No inventar nunca** precios, horas, stock, plazos, reseñas, testimonios, cifras ni "clientas felices". Si falta el dato, dejá el lugar marcado para Anush y listalo como pendiente.
2. **Nada sobre devoluciones, cambios, derecho de retracto o arrepentimiento, ni "precios con IVA"**: ni en el sitio, ni en el blog, ni en el JSON-LD (pedido de Mati).
3. **No tocar el WIP de la tarjeta QR** sin el OK de Anush: `src/app/gracias/`, `database/tarjeta-qr-agradecimiento-2026-08.sql`, `entrega/tarjeta-agradecimiento-qr.md` y la sección `qr_thanks` de `src/app/admin/configuracion/page.tsx`. Al commitear ese archivo, stageá **solo tus cambios**: armá el blob desde `HEAD` con tus cambios y usá `git update-index --cacheinfo`.
4. **Base de datos:**
   - nunca escribir en producción;
   - todo cambio va como SQL **idempotente** en `database/`, para que Anush lo corra;
   - nunca usar ni imprimir `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `CRON_SECRET` ni la clave de `.secrets/`.
5. **Voz:** español rioplatense con voseo, cálido y concreto.
   - Prohibido "auténtico", "artesanal", "con amor", "con pasión" y todo lo que suene a IA o a plantilla.
   - Cuidado con la concordancia: "crochet tejido" vs. "prenda tejida" ya falló antes.
6. **Nada de patrones oscuros:**
   - la escasez y la urgencia solo si son reales;
   - nada de reseñas incentivadas ni elegidas (Google lo prohíbe);
   - el cupón de la tarjeta QR nunca puede ir atado a una reseña.
7. **Canales descartados:**
   - **Etsy** no es un canal (solo sirve como referencia de precio);
   - **Merchant Center** no tiene listados gratuitos en Uruguay;
   - **checkout con IA** (ChatGPT, UCP) es solo para EE. UU.;
   - no invertir en `llms.txt` ni en "GEO" de moda.
8. **Cambios con evidencia:** todo cambio de UX lleva problema + evidencia + referente + trade-off. Verificá cada hallazgo de una auditoría contra el código antes de implementarlo.
9. **Quality gate** antes de decir "listo": typecheck → lint → build → smoke test local (y chequeo mobile cuando toca UI). Reportá los fallos tal cual, sin maquillarlos.
10. **No pushear sin preguntar.** Al final, un solo commit y un solo push (cada push es un deploy de Netlify):
    - mensaje en español;
    - terminado en `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`;
    - sin el WIP QR y sin `next-env.d.ts`.

## 6. Lo que ya está hecho (no rehacer; sí verificar que sigue bien)

- **03-09/09:**
  - auditoría de mercado y técnica, fixes de UX, rate limits;
  - sitemap y feeds con fallback;
  - blog agrupado por temas, con 21 notas;
  - "En stock" en el mega-menú;
  - el riel de categorías scrolleable en mobile;
  - limpieza legal;
  - marcador de precios por etapas;
  - estrategias de crecimiento en el admin.
- **11/09:**
  - `/admin/blog` (portadas editables);
  - imagen al compartir en todas las páginas y la tarjeta de Twitter por página;
  - script de indexación corregido;
  - las 22 URLs del blog enviadas a Google.
- **12/09:**
  - investigación SEO + IA en 2 rondas (`research/seo-ia-2026-09.md`);
  - plan de 10 pasos, textos para copiar y tareas en `/admin/estrategia`;
  - perfiles de la marca en el JSON-LD y `/resena`;
  - texto alternativo automático para las fotos;
  - etiquetas de canal para las IAs en los pedidos;
  - `npm run seo-report`;
  - embudo en `/admin/carritos`, estado de venta en `/admin/pedidos` y el `cart_id` en cada pedido;
  - la frase "No pagás nada ahora" en el carrito.
- **SQL** (se verifica con la anon key: pedir `?select=<columna>&limit=0` da 400 si la columna no existe):
  - `embudo-pedidos-2026-09.sql`: **ya corrido** (12/09, `orders.cart_id` y `orders.status` existen);
  - `costos-produccion-2026-09.sql`: pendiente, opcional;
  - `schema-security-hardening.sql` PASO 2→3: pendiente y delicado (requiere insertar el admin primero).

## 7. Datos disponibles y cómo sacarlos

- **Google Search Console:** `npm run seo-report` (consultas, páginas, marca e indexación de todo el sitemap).
- **PageSpeed Insights, sin clave:** incluye datos de campo CrUX si hay suficiente tráfico.
  `curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://dahila.uy/&strategy=mobile&category=performance&category=accessibility&category=seo&category=best-practices"`
  Corrélo para la home, `/tienda`, una ficha, `/carrito` y `/encargo`.
- **HTML en vivo y local:** `curl` a dahila.uy, y `next start` para lo que todavía no está deployado.
- **Tablas públicas con la anon key:** products, categories, product_media, product_sizes, colors, collections, discounts, site_settings, testimonials.
- **Carritos, pedidos, favoritos y encargos:** no los podés leer. Pedile a Mati los números de `/admin/carritos` y `/admin/pedidos` (período de 30 días) o un export.
- **Comportamiento real:** pedile a Mati observaciones de Microsoft Clarity (grabaciones, clics de frustración, hasta dónde se scrollea en `/carrito` y en las fichas). Umami cuenta de menos: no lo uses como verdad.
- **Búsquedas reales en Uruguay:** autocompletado de Google con `gl=uy` (`suggestqueries.google.com/complete/search?client=firefox&hl=es-419&gl=uy&q=...`).

## 8. Método

**Fase 0 — Línea de base (no toca código).**
- `git status`;
- `npm run seo-report`;
- PageSpeed de 5 páginas;
- la lista de todas las rutas (`src/app/**/page.tsx`, `route.ts`);
- pedirle a Mati los datos del admin y de Clarity.

Anotá los números de partida: sin eso no hay forma de saber si algo mejoró.

**Fase 1 — Auditoría exhaustiva.**
- Recorré el checklist del §9 **página por página y estado por estado**, en mobile (390 px) y en desktop.
- Por cada hallazgo: archivo:línea, qué pasa, evidencia (dato propio, estudio o guía oficial), impacto esperado en conversión y esfuerzo.
- Podés paralelizar con subagentes, uno por área. Pediles que escriban su salida temprano en `research/_audit-<area>.md`: si la PC se suspende, los agentes mueren.

**Fase 2 — Priorizar.** Impacto en conversión × confianza en la evidencia ÷ esfuerzo. Clasificá cada hallazgo en:
- **(A)** Aplicar ya: seguro, reversible y con evidencia.
- **(B)** Necesita un dato o una decisión de Anush.
- **(C)** Necesita SQL.
- **(D)** Descartado, con el motivo.

**Fase 3 — Implementar las (A) en tandas chicas.**
- Cada tanda pasa typecheck → lint → build → smoke test local, más la verificación visual cuando es UI.
- Nada queda a medias: si una tanda falla, se arregla o se revierte antes de seguir.

**Fase 4 — Cierre.** Ver el §12.

## 9. Checklist de auditoría (cada detalle)

**Global:**
- header, mega-menú y búsqueda (resultados, vacío, errores);
- barra de promo, footer, botón flotante de WhatsApp, avisos (VIP, tejedoras) y cómo se superponen en mobile;
- panel del carrito, 404, página de error, skeletons de carga;
- tipografías (peso, FOIT/FOUT), favicon, títulos y descripciones por página;
- tamaño de los objetivos táctiles (≥ 44 px), foco visible, contraste, `prefers-reduced-motion`;
- scripts de terceros (Clarity, Umami, GA): peso y cuándo cargan.

**Inicio:**
- qué se ve en las 2 primeras pantallas del celular;
- jerarquía de llamados a la acción;
- bloque de piezas en stock y próximo drop;
- testimonios (¿reales? ¿se ven como reales?);
- preguntas frecuentes (coherencia con la base) y colecciones.

**Tienda y categorías:**
- H1 y texto de cada categoría;
- chips, filtros y orden; estado vacío;
- tarjetas: precio, descuento, badges, escasez honesta, agotado, en stock;
- rendimiento de la grilla (prioridad de las primeras imágenes).

**Ficha de producto:**
- galería: swipe, zoom, orden de fotos, alt;
- precio por talle y selección de talle (disponibilidad, precio que cambia);
- paleta de colores; plazo y fecha estimada; aviso de cola;
- jerarquía entre carrito, WhatsApp y encargo; barra fija en mobile;
- guía de talles, cuidados y materiales;
- bloque "cómo funciona" y bloque de quien teje;
- "completá el look", relacionados, vistos recientemente;
- compartir, Pinterest, favoritos;
- aviso de reposición por WhatsApp; breadcrumbs; JSON-LD válido;
- que las descripciones tengan datos concretos (fibra, horas medidas, calce, cuidado, para qué ocasión) y no adjetivos.

**Carrito:**
- líneas, cantidades y quitar; sugerencias de complemento; nota de regalo; cupón;
- **claridad del envío** (hoy dice "te paso el costo por WhatsApp");
- progreso hacia el envío gratis; plazo por ítem; total;
- texto del mensaje de WhatsApp;
- **salto a WhatsApp desde el navegador interno de Instagram**, en iOS y en Android;
- estado vacío; botón fijo en mobile.

**Encargo:** campos, validaciones, preguntas frecuentes, guía de talles, pasos, pantalla de éxito, mails, `/encargo/estado`.

**Resto de las páginas:** `/favoritos`, `/colecciones` (y cada colección), `/ofertas`, `/atelier`, `/info`, `/contacto`, `/tejedoras`, `/terminos`, `/blog` y cada nota (enlaces internos hacia la tienda, datos inventados: **ninguno**), `/ig` (landing de la bio de Instagram), `/resena`.

**SEO y visibilidad:**
- metadata, canonical, Open Graph/Twitter y JSON-LD de cada tipo de página;
- sitemap vs. rutas reales; robots;
- URLs sin indexar y por qué: hoy como-lavar y como-guardar están "rastreadas, sin indexar", porque duplican a como-cuidar. Hay que decidir si se consolidan con redirección 301;
- encabezados, enlaces internos, imágenes para Google Imágenes;
- presencia de la marca (Brave, autocompletado).

**Rendimiento:**
- LCP, INP y CLS por plantilla (PageSpeed);
- peso del JavaScript por ruta; imágenes (tamaños, `sizes`, formatos);
- caché e ISR; egress de Supabase (fotos por `/_next/image`).

**Admin (para Anush, desde el celular):**
- cada página: se entiende sin saber de código, errores en su idioma, estados vacíos;
- acciones peligrosas con confirmación;
- lo que más usa a un toque.

**Seguridad y privacidad:**
- supuestos de RLS, rate limits, cabeceras/CSP;
- formularios y datos personales;
- que ningún secreto salga del servidor.

**Consistencia y código:** tokens de diseño, componentes duplicados, código muerto, TODOs, comentarios desactualizados.

## 10. Hipótesis de conversión para probar primero

Cada una con cómo medirla: embudo del admin, estado de pedidos o Search Console.

1. **El envío sin precio frena.** Los costos que aparecen al final son la causa n.º 1 de abandono (Baymard). → Publicar los costos reales (pedírselos a Anush). Puede ser un campo en Configuración que reemplace el "te paso el costo por WhatsApp".
2. **El plazo frena.** → Tener en stock las piezas con más carritos, en el talle más elegido (datos en `/admin/carritos`), y darles más visibilidad en la tienda y en las fichas. Se mide con "¿Frena el plazo?".
3. **Miedo a comprometerse al pasar a WhatsApp.** Ya se agregó "No pagás nada ahora". → Medir si cambia la tasa de carrito a pedido.
4. **El navegador de Instagram corta el salto a WhatsApp.** → Probarlo en dispositivos reales. Si falla, evaluar un plan B visible, como "copiar mi pedido".
5. **Falta prueba social verificable.** → Reseñas de Google (link `dahila.uy/resena`) y testimonios reales, bien ubicados. Nada inventado.
6. **Descripciones abstractas.** → Pasarlas a datos concretos: el efecto de las horas de trabajo y del lenguaje concreto está medido. Requiere los datos de Anush.
7. **Dudas de talle.** → La guía y el "mandame tus medidas" tienen que estar a la vista donde se elige el talle.
8. **Respuesta lenta en WhatsApp.** → Es operativo: mensaje de bienvenida y respuestas rápidas en WhatsApp Business. Proponelo como tarea para Anush.
9. **Las primeras pantallas en el celular** (inicio, tienda, ficha) no dejan claro qué es, cuánto sale y cuánto tarda. → Revisar la jerarquía.

## 11. Qué NO hacer

- No rediseñar desde cero ni sumar dependencias pesadas.
- No cambiar precios ni plazos por tu cuenta.
- No inventar prueba social, urgencia ni escasez.
- No mandar el sitio entero a la Indexing API ni re-mandar URLs sin cambios.
- No escribir notas de blog de "tips" para traer tráfico: las responde la IA de Google sin clic. Solo notas que respondan dudas de compra, con datos reales.
- No tocar el WIP QR ni la configuración de producción.
- No dejar nada a medias ni sin probar.

## 12. Entregables

1. **`research/auditoria-total-AAAA-MM-DD.md`**, con:
   - resumen ejecutivo (las 10 mejoras de mayor impacto);
   - tabla de hallazgos: área, detalle, evidencia, archivo:línea, severidad y estado (aplicado / para Anush / SQL / descartado);
   - qué se cambió y cómo se verificó;
   - la línea de base y cómo volver a medir a los 30 días.
2. **Tareas nuevas para Anush** en `NEXT_ACTIONS` (`/admin/estrategia`), en lenguaje simple.
3. **SQL nuevos** en `database/`, idempotentes y comentados, con el orden en que hay que correrlos.
4. **Memoria actualizada:** un archivo nuevo más una línea en el índice, con lo no obvio y las decisiones.
5. **Mensaje final a Mati** con:
   - qué se hizo;
   - qué falta y quién lo hace;
   - qué SQL correr;
   - la pregunta de si commitear y pushear, en un solo push.
