# Auditoría profunda — Dahila Crochet

**Fecha:** 2026-07-07 · **URL auditada:** https://dahila-crochet.netlify.app/
**Stack:** Next.js 16.2.6 · React 19 · Supabase (Postgres 17) · Netlify · `@netlify/plugin-nextjs`
**Método:** lectura completa del código, revisión de las 8 migraciones SQL, e **inspección de la base de datos de producción en vivo** vía su REST API (`nuihzsytxolftcaggbbk.supabase.co`) con la anon key del bundle. Los números de carritos, productos y datos vacíos son reales, no estimados.

> Nota importante de infraestructura: el proyecto Supabase conectado por herramientas (MCP) es **otro** (`luisrossello`, un CRM inmobiliario con tablas `properties`/`leads`/`contacts`). La tienda usa un proyecto Supabase distinto (`nuihzsytxolftcaggbbk`). No hay contaminación de datos entre ambos, pero conviene ordenar los proyectos para no confundirlos al operar.

---

## 0. Hallazgos de datos en vivo (la base de la auditoría)

| Métrica | Valor real hoy |
|---|---|
| Productos activos | 32 (0 agotados visibles, drafts ocultos) |
| Productos **sin descripción** | ~30 de 32 (**~94%**) — solo Set BRISA y Set LUEUR tienen texto |
| Productos sin categoría | 2 (`falda-serenada`, `box-de-regalo`) |
| Tabla `colors` | **0 filas** → filtro de color y swatches del PDP están muertos |
| Tabla `product_colors` | **0 filas** |
| Tabla `collections` | **0 filas** → `/colecciones` y su sitemap son páginas vacías |
| Tabla `discounts` activas | **0** → `/ofertas` vacía pero listada en sitemap |
| Tabla `homepage_media` | 0 filas |
| Carritos con ítems | 9 carritos · 14 ítems · **UYU 10.760 acumulados** |
| Carritos inactivos >14 días | **7 de 9 (78%)** |
| Testimonios | 8 · Favoritos | 1 |
| Integración de email/notificaciones | **Ninguna** (0 líneas de código) |
| Signup de Supabase Auth | **ABIERTO** (`disable_signup:false`, email habilitado) |

---

## 1. Lo que está muy bien

Reconocer lo acertado, porque hay bastante y de buena calidad:

1. **Higiene de configuración y seguridad de cabeceras.** [`next.config.ts`](next.config.ts) trae CSP real, `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` y HSTS solo en producción. `poweredByHeader:false`. Está por encima del promedio de tiendas pequeñas.
2. **Variables de entorno centralizadas y validadas** en [`src/lib/env.ts`](src/lib/env.ts) — falla temprano con mensaje accionable en vez de "Invalid URL" a mitad de request.
3. **`SITE_URL` centralizado** y usado en `metadataBase`, canónicos, OG, sitemap y JSON-LD. La migración a `dahila.uy` se resuelve **cambiando una sola variable** (`NEXT_PUBLIC_SITE_URL`). Decisión muy buena.
4. **SEO técnico ya sembrado:** sitemap dinámico ([`sitemap.ts`](src/app/sitemap.ts)), `robots.ts`, JSON-LD de Organization/LocalBusiness/WebSite/FAQPage/Product/BreadcrumbList, OG images dinámicas (`opengraph-image.tsx` por sección). Muy por encima de lo esperable.
5. **Protección real de PII en encargos:** `custom_orders` no es legible por `anon` (verificado: devuelve `[]`), y el estado público se consulta por un RPC `SECURITY DEFINER` ([`schema-encargo-tracking.sql`](database/schema-encargo-tracking.sql)) que solo expone estado + primer nombre. Esto está bien pensado.
6. **Validación y saneamiento del formulario de encargo** ([`encargo/actions.ts`](src/app/encargo/actions.ts)): longitudes máximas, strip de control chars, email opcional pero validado, tracking code sin caracteres ambiguos.
7. **PDP con buena base de conversión** ([`ProductDetailsClient.tsx`](src/app/tienda/[slug]/ProductDetailsClient.tsx)): columna de compra sticky, selector de talle que **tacha y deshabilita** los no disponibles, default al primer talle disponible, escasez honesta (`getScarcity` deriva de datos reales, nunca inventa urgencia), trust strip, guía de talles, bio de la artesana.
8. **`next/image` bien configurado**: AVIF/WebP, `deviceSizes`/`imageSizes` a medida, `qualities` allowlisted, blur placeholder cream para el LCP.
9. **Next 16 al día**: usa `proxy.ts` (nuevo nombre de middleware) y `searchParams`/`params` como Promises. Se nota que leyeron los docs.
10. **Detalles de UX cuidados**: skip-link de accesibilidad, mensaje de WhatsApp del carrito bien formateado con subtotales y links, nota de regalo, estados vacíos con recomendaciones.

---

## 2. Bugs encontrados (por prioridad)

| # | Severidad | Bug | Dónde |
|---|---|---|---|
| B1 | 🔴 Crítico | **Escalada a admin por signup abierto** (ver S7). Cualquiera se registra y hereda permisos de admin. | Supabase Auth + RLS `TO authenticated USING(true)` |
| B2 | 🟠 Alto | **`cart_items` y `favorites` son world-readable/writable** por la anon key: `FOR ALL USING(true)`. Cualquiera lee/edita/borra los carritos de todos. Verificado leyendo las 9 filas. | [`schema.sql:239`](database/schema.sql#L239), [`schema-favorites.sql:34`](database/schema-favorites.sql#L34) |
| B3 | 🟡 Medio | **Rate limiter inútil en serverless.** El `Map` en memoria de módulo no persiste entre invocaciones de funciones Netlify → la protección anti-spam del encargo prácticamente no aplica. | [`encargo/actions.ts:24`](src/app/encargo/actions.ts#L24) |
| B4 | 🟡 Medio | **Colisión de namespace `/tienda/[slug]`.** Categorías y productos comparten URL; `resolveSlug` resuelve categoría primero. Si algún día un producto tiene el mismo slug que una categoría, el producto queda inaccesible (soft-404). | [`tienda/[slug]/page.tsx:22`](src/app/tienda/[slug]/page.tsx#L22) |
| B5 | 🟡 Medio | **Se puede agregar al carrito un talle no disponible.** El POST valida `status==='active'` y `!is_custom_only` pero **no** valida que ese talle esté `available`. La UI lo evita, pero la API no. | [`api/cart/route.ts:71`](src/app/api/cart/route.ts#L71) |
| B6 | 🟢 Bajo | **Dashboard cuenta filas, no carritos.** "Carritos con ítems" hace `count` de `cart_items` (14) en vez de `cart_id` distintos (9). Cifra inflada. | [`admin/page.tsx:31`](src/app/admin/page.tsx#L31) |
| B7 | 🟢 Bajo | **Errores silenciados en el admin de encargos.** `updateStatus`/`updateNotes` ignoran el error: si falla el guardado, la UI muestra éxito igual. Sin toast de error. | [`admin/encargos/page.tsx:64`](src/app/admin/encargos/page.tsx#L64) |
| B8 | 🟢 Bajo | **Páginas fantasma en sitemap.** `/colecciones` y `/ofertas` se listan siempre aunque estén vacías → thin content indexable. | [`sitemap.ts:27`](src/app/sitemap.ts#L27) |
| B9 | 🟢 Bajo | **Inconsistencia de marca vs dominio:** la marca es "Dah**i**la" pero el dominio a comprar es "dah**l**ia.uy". Riesgo de confusión de usuarios y de SEO de marca. | branding |

---

## 3. Problemas de arquitectura

1. **No existe el concepto de "pedido".** El checkout arma un texto y abre WhatsApp ([`CarritoClient.tsx:81`](src/app/carrito/CarritoClient.tsx#L81)); el carrito nunca se convierte en un registro de orden ni se limpia. Consecuencias en cadena:
   - Imposible medir conversión, ticket promedio, productos más vendidos, recompra.
   - Imposible recuperar carritos por email (no hay email asociado al `cart_id`).
   - `cart_items` crece sin límite y sin TTL de limpieza.
   - "Carritos abandonados" es incalculable de verdad porque **no hay evento de compra** que cierre el embudo.
2. **Autorización de admin = "cualquier usuario logueado".** Todas las policies de escritura son `TO authenticated USING(true)`. No hay noción de "quién es admin". Frágil y peligroso (ver S7). Falta una tabla `admins`/allowlist o custom claim.
3. **Namespace compartido categoría/producto** en `/tienda/[slug]` (B4). Mezcla dos entidades en un mismo segmento y obliga a `resolveSlug` a adivinar en cada request.
4. **Sobre-fetching en el PDP.** Un PDP puede leer el mismo producto hasta 3 veces por request: `resolveSlug` + `generateMetadata` + `ProductPage`. Mitigado por `revalidate=3600`, pero es trabajo redundante.
5. **Fetching de catálogo en el cliente.** `TiendaClient` recibe **todos** los productos y filtra en JS; el admin carga **todos** los encargos y carritos sin paginación. Correcto a esta escala, rompe a escala (ver S11).
6. **Features a medio construir en producción.** Colores, colecciones y descuentos están cableados en UI, sitemap, JSON-LD y panel, pero con **0 datos**. Es deuda: complejidad y superficie de bug sin valor entregado todavía.
7. **CMS de settings de grano fino.** 91 filas key/value en `site_settings`. Flexible, pero editar es tedioso y frágil (un typo en una key rompe silenciosamente un bloque). Funciona hoy; vigilar crecimiento.

---

## 4. Problemas de UX

1. **Checkout = salto a WhatsApp.** Es coherente con el modelo artesanal y reduce fricción de pago, pero: se pierde a quien no tiene WhatsApp en ese dispositivo, no hay confirmación en el sitio, y el usuario no recibe nada por escrito salvo el chat.
2. **PDP casi sin texto.** 94% de productos sin descripción: el cliente no sabe material, medidas, cuidado ni "qué lo hace especial". Es el mayor freno de UX y de conversión a la vez.
3. **Filtro de color vacío.** Se ofrece filtrar por color pero no hay colores cargados → o aparece vacío o confunde. Igual, los swatches del PDP no muestran nada.
4. **`/colecciones` y `/ofertas` vacías** con copy tipo "pronto…". Un usuario que llega desde el menú a una sección vacía percibe tienda incompleta.
5. **`/favoritos` sin valor de retorno.** 1 favorito en toda la historia: la wishlist sin login ni recordatorio por email rara vez se reusa.
6. **Estados de error débiles en admin** (B7): la dueña puede creer que guardó algo que no se guardó.
7. **Carritos "activos" en admin muestran carritos de hace un mes** sin filtro de antigüedad ni forma de contactar (no hay datos de contacto asociados). Es informativo pero no accionable.

---

## 5. Problemas de conversión (CRO) — priorizado por impacto

**Ranking por retorno sobre esfuerzo:**

1. **Descripciones de producto (impacto altísimo).** Sin copy no hay deseo, ni confianza, ni SEO, ni respuestas a objeciones. Es el #1 de conversión y de SEO al mismo tiempo. Incluir: material, medidas reales por talle, calce, cuidado, tiempo de tejido, "queda bien con…".
2. **Recuperación de carrito (hay UYU 10.760 parados).** Hoy no hay forma de recuperar nada. Requiere capturar email/WhatsApp en el flujo (ver S13 y S15).
3. **Prueba social en el PDP.** Hay 8 testimonios pero **no** se muestran como reseñas de producto ni alimentan `aggregateRating` en el JSON-LD → sin estrellas en Google ni prueba social donde se decide la compra.
4. **"Avisame cuando vuelva" en agotados.** Captura demanda y email; hoy un agotado es un callejón sin salida.
5. **Fricción de contacto.** El CTA es WhatsApp: agregar respuesta a objeciones frecuentes cerca del botón (envío, plazos, cambios) reduce el "lo pienso".
6. **Cross-sell / "completá el look"** en PDP y carrito: sets y accesorios se prestan a bundle. Ya hay "relacionados"; falta empujar el bundle con precio.
7. **Urgencia honesta ampliada:** ya existe `getScarcity`; combinarla con plazo de tejido visible ("si pedís hoy, lista para ~X").

---

## 6. Problemas SEO (y AEO/GEO)

1. **Contenido pobre / thin content:** 94% de productos sin descripción. Google necesita texto único por producto; hoy los PDP son casi solo imagen + precio. Es el problema SEO #1.
2. **Product JSON-LD incompleto** ([`tienda/[slug]/page.tsx:254`](src/app/tienda/[slug]/page.tsx#L254)): falta `priceValidUntil`, `shippingDetails`, `hasMerchantReturnPolicy` (Google Merchant/rich results avisará) y sobre todo `aggregateRating`/`review` (sin estrellas en SERP pese a tener testimonios).
3. **Páginas vacías indexables** (B8): `/colecciones` y `/ofertas` en sitemap sin contenido. O se llenan o se excluyen del sitemap hasta tener datos.
4. **`robots.ts` no bloquea `/favoritos` ni `/encargo/estado`** (páginas thin/privadas de baja utilidad SEO). Debería desindexarlas.
5. **Migración de dominio (dahila.uy) — pendiente y crítico para no perder ranking:** al comprar el dominio hay que (a) setear `NEXT_PUBLIC_SITE_URL`, (b) **301** desde `dahila-crochet.netlify.app` al nuevo dominio, (c) reclamar en Google Search Console y resubir sitemap, (d) actualizar OG/JSON-LD (ya salen de `SITE_URL`, ok), (e) actualizar el link de Instagram/bio. Mientras tanto, no invertir en backlinks al dominio Netlify.
6. **Marca canónica: Dahila Crochet** (con "i") — decidido. Mantené ese nombre idéntico en `<title>`, JSON-LD `name`, dominio y redes para no diluir el SEO de marca.
7. **AEO/GEO (búsqueda con IA — ChatGPT/Claude/Perplexity/AI Overviews):** la IA cita fuentes con **texto estructurado y datos concretos**. Con PDP sin texto, la tienda es prácticamente invisible para IA. Palancas: descripciones ricas, FAQ por producto, datos de negocio consistentes (NAP: nombre/dirección/teléfono), `LocalBusiness` completo (ya está), y una página "Sobre/atelier" con historia real. El JSON-LD ya ayuda; el texto es lo que falta.
8. **SEO local Uruguay:** reforzar señales locales ("crochet Montevideo", "tejido a medida Uruguay") en titles/H1/descripciones de categoría, y crear/optimizar Google Business Profile enlazado al sitio.

---

## 7. Problemas de seguridad

**🔴 CRÍTICO — Escalada de privilegios a administrador.**
`GET /auth/v1/settings` del proyecto devuelve `"disable_signup": false` con email habilitado. Todas las policies de escritura son `TO authenticated USING(true)`. La anon key y la URL del proyecto viajan en el bundle público (`NEXT_PUBLIC_*`). Por lo tanto **cualquiera** puede: registrarse con un email propio → confirmarlo → obtener sesión `authenticated` → **editar productos/precios/settings y LEER TODA la PII de `custom_orders`** (nombre, email, WhatsApp, medidas, mensajes) y manipular Storage. Es explotable solo mirando el código fuente del sitio.
- **Mitigación inmediata (minutos):** Dashboard → Authentication → **desactivar "Enable email signups"**. Asegurar que la cuenta de la dueña ya existe antes.
- **Fix durable:** cambiar las policies de admin de `USING(true)` a una allowlist real — tabla `admins(user_id)` o `auth.jwt()->>'email' = ANY(...)` o `auth.uid() = '<uuid dueña>'` — para escritura en `products`, `custom_orders`, `site_settings`, `discounts`, `collections`, `categories`, `colors`, `testimonials`, `homepage_media` y en Storage.

**🟠 ALTO — Carritos/favoritos abiertos (B2).** `FOR ALL USING(true)` en `cart_items` y `favorites` deja leer/escribir/borrar todas las filas con la anon key. No hay PII, pero: (a) fuga de comportamiento de compra, (b) un atacante puede vaciar o envenenar todos los carritos. La cookie HttpOnly da 0 protección a nivel DB porque la policy no filtra por `cart_id`. **Fix:** el scoping por cookie ya vive en las route handlers; endurecer la policy para que `anon` no pueda hacer `SELECT *` masivo (idealmente mover todo el acceso a través de las route handlers con `service_role`, o restringir por una función que valide el `cart_id`).

**🟡 MEDIO:**
- Rate limiter anti-spam inefectivo en serverless (B3) → `custom_orders` es spameable (INSERT público sin captcha). Agregar captcha invisible (hCaptcha/Turnstile) o rate limit en Upstash/Redis.
- Sin verificación de talle disponible en el POST del carrito (B5).

**Bien resuelto:** PII de encargos protegida de `anon` (verificado), RPC `SECURITY DEFINER` para tracking, CSP y cabeceras, saneamiento de inputs. La base de seguridad "de superficie" es buena; el problema es el **modelo de autorización**.

---

## 8. Problemas de rendimiento

1. **Imágenes fuente enormes en `/public/photos`:** `bufanda-rosa.jpg` **6,1 MB**, `chaleco-marron.jpg` 4,3 MB, `detalle-tejido.jpg` 2,4 MB, `bolsos-rojo-negro.jpg` 1,9 MB; `isotype-black.png` 814 KB. Total `public/` = **20 MB**. `next/image` optimiza al servir, pero: (a) varias parecen legacy **no usadas** (peso muerto en el repo/deploy), (b) el primer request de cada imagen paga la optimización on-demand en Netlify, (c) el isotype/logo pesados se usan en `<img>`/schema sin optimizar. **Acción:** recomprimir a <300 KB, borrar las no usadas, revisar que el hero pase por `next/image` con `priority`.
2. **`Home` hace `site_settings.select('*')`** (91 filas) por render; barato pero innecesario — pedir solo las keys usadas.
3. **Sobre-fetching del PDP** (S3.4): producto leído hasta 3×/request.
4. **Todo el catálogo al cliente** en `/tienda` (hoy 32 productos, ok; ver S11).
5. **Fuentes:** dos familias variables (Fraunces con ejes `opsz,SOFT,WONK` + Inter). Bien con `next/font` (self-host, `display:swap`), pero Fraunces con 3 ejes puede ser pesada; verificar en Lighthouse que no infle el CSS de fuentes.

*(No pude correr Lighthouse/CWV reales desde aquí; recomiendo PageSpeed Insights sobre la home y un PDP tras optimizar imágenes.)*

---

## 9. Mejoras recomendadas (impacto / dificultad / tiempo)

| Mejora | Impacto | Dificultad | Tiempo |
|---|---|---|---|
| Cerrar signup + RLS de admin por allowlist | 🔴 Crítico | Baja/Media | 1–3 h |
| Descripciones de los 32 productos | Altísimo | Baja (es contenido) | 4–8 h |
| Captura de email/WhatsApp antes del salto a WhatsApp + registro de "pedido" | Alto | Media | 1–2 días |
| Notificación por email a la dueña en cada encargo (Resend/Brevo) | Alto | Baja | 3–5 h |
| Endurecer RLS de `cart_items`/`favorites` | Alto (seg.) | Baja | 1–2 h |
| Reseñas de producto + `aggregateRating` en JSON-LD | Alto (CRO+SEO) | Media | 1 día |
| Papelera/archivado de encargos cancelados (ver S12) | Medio (operación) | Baja | 2–4 h |
| Optimizar/limpiar imágenes de `/public` | Medio (perf) | Baja | 1–2 h |
| Completar `priceValidUntil`/`shipping`/`returns` en Product schema | Medio (SEO) | Baja | 1 h |
| Excluir páginas vacías del sitemap hasta tener datos | Bajo (SEO) | Baja | 30 min |
| "Avisame cuando vuelva" en agotados | Medio (CRO) | Media | 1 día |
| Cargar colores reales o esconder el filtro de color | Bajo/Medio | Baja | 1–2 h |

---

## 10. Quick wins (<1 hora, mucho impacto)

1. **Desactivar signups en Supabase Auth** (cierra la vulnerabilidad crítica). ~10 min.
2. **Endurecer/limpiar el sitemap**: no listar `/colecciones` y `/ofertas` si están vacías. ~20 min.
3. **Añadir `priceValidUntil` y `hasMerchantReturnPolicy`/`shippingDetails`** al Product JSON-LD. ~40 min.
4. **Corregir el contador del dashboard** para contar `cart_id` distintos (B6). ~15 min.
5. **Bloquear `/favoritos` y `/encargo/estado` en `robots.ts`**. ~10 min.
6. **Toast de error** en `updateStatus`/`updateNotes` del admin (B7). ~30 min.
7. **Validar talle disponible** en el POST del carrito (B5). ~20 min.
8. **Recomprimir/borrar** las 3–4 imágenes de varios MB en `/public/photos`. ~40 min.
9. **Escribir 5–8 descripciones** de los productos más vendidos (empezar por tops de UYU 899–990). ~1 h.

---

## 11. Roadmap

**Hoy (bloqueantes de seguridad y datos):**
- Desactivar signup en Supabase; verificar que existe la cuenta de la dueña.
- Reescribir las RLS de admin con allowlist (o al menos confirmar que sin signup el riesgo baja).
- Endurecer `cart_items`/`favorites`.
- Quick wins 2–8.

**Esta semana:**
- Descripciones de los 32 productos + material y cuidado.
- Notificación por email a la dueña en cada encargo (Resend).
- Papelera/archivado de encargos cancelados.
- Reseñas de producto (reusar testimonios) + `aggregateRating`.

**Este mes:**
- Registrar "pedido" real: capturar contacto en el carrito y persistir la intención de compra antes del salto a WhatsApp.
- Automatizaciones de email (confirmaciones, cambios de estado) con Brevo/Resend.
- Completar colores reales o retirar el filtro; decidir el futuro de colecciones.
- Optimización de imágenes + Lighthouse/CWV.

**Antes de lanzar el dominio propio:**
- Marca canónica definida: **Dahila Crochet** (con "i"). Mantener el nombre idéntico en todos lados.
- Comprar dominio, setear `NEXT_PUBLIC_SITE_URL`, **301** desde Netlify, Search Console + sitemap, actualizar redes.
- Revisión final de RLS/seguridad y de metadatos.
- Recuperación de carrito abandonado por email (necesita el "pedido real" del mes previo).

**Futuras mejoras:**
- Pago online opcional (Mercado Pago UY) para quien no quiera coordinar por WhatsApp.
- Panel con métricas reales (conversión, ticket, top productos) una vez que exista la tabla de pedidos.
- Programa de fidelización / newsletter con Brevo.
- Multi-idioma (EN) si apuntan a export.

---

## 12. Score final (1–10)

| Dimensión | Nota | Comentario |
|---|---:|---|
| Código | 7.5 | Limpio, tipado, comentado, idiomático. Baja por features a medias y sobre-fetching. |
| Arquitectura | 5.5 | Buenas bases Next 16, pero sin "pedido", autz frágil y namespace mezclado. |
| UX | 6.5 | Cuidada en detalle; frenada por PDP sin texto y secciones vacías. |
| Diseño | 8 | Sistema visual consistente y de buen gusto (tipografías, cream, escasez honesta). |
| Conversión | 4.5 | Sin descripciones, sin prueba social en PDP, sin recuperación de carrito. |
| SEO | 6 | Técnica excelente sobre contenido pobre. El texto es el techo actual. |
| Performance | 6.5 | `next/image` bien; penalizada por imágenes fuente de varios MB. |
| Escalabilidad | 5 | Sirve hoy; sin paginación ni pedidos ni colas rompe a volumen. |
| Seguridad | 3.5 | Buenas cabeceras y PII protegida de anon, pero **escalada a admin crítica**. |
| Mantenibilidad | 7 | Migraciones idempotentes, tipos centralizados, buena documentación en código. |
| **Global** | **~6** | Proyecto sólido y con gusto, a **una capa de trabajo** (seguridad + contenido + pedidos) de ser una tienda seria. |

---

## Anexo A — Encargos cancelados: la mejor solución para la dueña

Hoy no hay forma de eliminarlos: solo se cambia el estado a "Cancelado" y se acumulan en la pestaña. La RLS ya permite `DELETE` a `authenticated`, así que la solución es de UI + un poco de esquema.

**Recomendación: archivado + papelera (soft-delete), no borrado directo.** Es lo mejor para un negocio real porque:
- La dueña nunca pierde un pedido por un clic accidental.
- Puede "sacarlo de la vista" sin destruir el historial (útil para métricas y para si el cliente vuelve).
- El borrado permanente queda como acción deliberada de segundo paso.

**Diseño propuesto:**
1. Añadir `archived_at timestamptz` (y opcional `deleted_at`) a `custom_orders`.
2. En el admin: botón **"Archivar"** en cada encargo cancelado/completado → sale de las pestañas normales.
3. Pestaña **"Archivados / Papelera"** con acciones **"Restaurar"** y **"Eliminar definitivamente"** (con confirmación).
4. **Limpieza automática opcional:** un cron (Supabase scheduled function / `pg_cron`) que borra definitivamente lo cancelado+archivado con más de 90 días. Configurable.
5. Bonus operativo: acción masiva "archivar todos los cancelados > 30 días".

Con esto la dueña tiene bandeja limpia, cero pérdida accidental y el sistema se mantiene solo.

---

## Anexo B — Base de datos: carritos abandonados (datos reales)

**No se puede calcular una tasa de abandono real** porque no existe evento de compra: el carrito salta a WhatsApp y nunca se cierra ni se vincula a una orden. Lo que sí se ve hoy:

- **9 carritos, 14 ítems, UYU 10.760** acumulados.
- **7 de 9 (78%) sin actividad hace >14 días** (varios de 25–33 días). Con altísima probabilidad no se concretaron por el canal, o se concretaron por WhatsApp y el carrito quedó "fantasma".
- Ejemplos: un carrito de **UYU 2.790** (3 ítems) parado hace 29 días; otro de UYU 1.550 hace 25 días.

**Dónde se pierde la venta (hipótesis por diseño):** el punto de fuga es el salto a WhatsApp — se pasa de "carrito" a "conversación manual" sin captura de contacto ni seguimiento. Quien no escribe en el momento, se pierde y no hay forma de recordarle.

**Registros basura / higiene DB:**
- `colors`, `product_colors`, `collections`, `homepage_media` vacías; `discounts` sin activas → features cargando código sin datos.
- `reviews` no existe en este proyecto (404) pero se referencia el concepto — confirmar que no queda código muerto.
- Falta TTL de `cart_items` (crecerá para siempre). Sugerido: limpiar ítems con `added_at` > 60–90 días.
- Índices presentes correctos (`idx_products_status_sort`, `idx_custom_orders_status_created`, `idx_cart_items_cart`, etc.). Para escala futura, agregar índice por `added_at` en `cart_items` si se hace limpieza por fecha.

**Para responder de verdad "¿cuántos carritos no terminan?"** hace falta el cambio de S13: capturar contacto y registrar el pedido. Recién ahí se mide conversión y se puede recuperar.

---

## Anexo C — Sistema de email y automatizaciones (diseño técnico, sin implementar)

**Recomendación de herramienta:** combinación **Resend + Brevo**, o **Brevo solo** si se quiere todo en una.
- **Resend** para transaccionales (deliverability y DX excelentes con Next; se dispara desde route handlers/server actions). Ideal para "aviso a la dueña" y "confirmación al cliente".
- **Brevo** para marketing/automatización con **eventos de e-commerce** (soporta flujos nativos de *abandoned cart* por evento y comportamiento) y newsletters. Su plan gratuito y su editor visual encajan con una dueña no técnica.

**Prerrequisito técnico (clave):** casi todos los flujos necesitan **capturar contacto y registrar el pedido/carrito** (S13). Sin eso, solo el aviso a la dueña de un encargo es posible hoy.

**Arquitectura de eventos propuesta:**

```
Evento en la app  ─▶  Server Action / Route Handler  ─▶  Resend (transaccional)
                                   │
                                   └─▶  Brevo API (contact + event)  ─▶  Automatización (carrito, nurture)
```

**Flujos y disparadores:**

| Flujo | Disparador | Canal | Destinatario |
|---|---|---|---|
| Nuevo encargo → aviso inmediato | `submitEncargo` OK | Resend (+ opcional WhatsApp API) | Dueña |
| Confirmación de encargo | `submitEncargo` OK | Resend | Cliente (con tracking code) |
| Cambio de estado (respondido/en proceso/listo) | update en `/admin/encargos` | Resend | Cliente |
| Encargo cancelado | estado→cancelled | Resend | Cliente (mensaje cuidado) |
| Nuevo "pedido de carrito" → aviso | checkout con contacto (S13) | Resend | Dueña |
| **Carrito abandonado** | evento Brevo `cart_updated` sin `order_placed` en Xh | Brevo automation | Cliente (1 recordatorio + 1 con incentivo suave a 24–48 h) |
| Recuperación de "casi-encargo" | encargo `new` sin `replied` en 48 h | Resend/Brevo | Dueña (recordatorio interno) |
| Newsletter / lanzamientos | manual | Brevo | Lista opt-in |

**Buenas prácticas a incluir en el diseño:** dominio propio verificado (SPF/DKIM/DMARC) — hacerlo junto con `dahila.uy`; doble opt-in para newsletter; unsubscribe en marketing; cola/reintentos para no bloquear el request del usuario si el proveedor falla; plantillas con el sistema visual de la marca.

**Orden de implementación sugerido:** (1) aviso a la dueña por encargo (hoy mismo, no requiere S13), (2) confirmación al cliente + estados, (3) captura de contacto + pedido, (4) recuperación de carrito con Brevo.

---

## Si esta tienda fuera de un cliente que me contrató, ¿qué cambiaría primero?

Priorizado **solo por retorno sobre el tiempo invertido**, en este orden:

1. **Cerrar el signup de Supabase (10 min).** Es el mayor riesgo del proyecto y la corrección más barata. No hacerlo es negligencia: hoy cualquiera puede leer los datos personales de todas las clientas.
2. **Endurecer las RLS de admin y de carritos (2–3 h).** Convierte el "parche de 10 min" en una solución real y deja la seguridad en verde.
3. **Escribir las descripciones de los 32 productos (medio día).** Un solo cambio que sube conversión, SEO y visibilidad en IA a la vez. Es el mejor ROI de contenido que existe en esta tienda.
4. **Aviso por email a la dueña en cada encargo (medio día).** Impacto operativo inmediato: deja de depender de entrar al panel a mirar. Alta probabilidad de recuperar ventas por responder rápido.
5. **Reseñas en el PDP + estrellas en Google (1 día).** Ya hay 8 testimonios sin explotar; ponerlos donde se decide la compra y en el schema.
6. **Registrar el pedido y capturar contacto en el carrito (1–2 días).** Es la llave que desbloquea medir conversión y **recuperar los ~UYU 10.760** que hoy quedan parados — y todo lo que venga después (automatización de carrito).

Todo lo demás (colecciones, colores, pago online, multi-idioma) es secundario hasta que estos seis estén hechos. Con estos seis, la tienda pasa de "linda pero incompleta" a "vende y es segura".
