# Auditoría global + home — dahila.uy (12/09/2026)

Auditor de solo lectura. Área: componentes globales (header, mega-menú, búsqueda, footer, overlays flotantes, carrito, estados 404/error/carga, tipografías, scripts de terceros) + home (`src/app/page.tsx`). Working tree auditado (incluye cambios sin commitear del 12/09); producción hoy corre `a0e3b91`, así que donde el HTML en vivo difiere del working tree lo digo explícitamente.

No repito lo ya verificado como "aplicado" en `research/auditoria-mercado-producto-2026-09.md` (overlays WhatsAppFloat/BackToTop, VipCallout/WeaverCallout vs. PDP sticky bar, FAQ aria-controls, aria-pressed talles, TestimonialsStrip pausa touch) ni en `research/auditoria-tecnica-2026-09.md` (rendimiento, RLS, rate-limits) salvo para confirmar que siguen bien o detectar una regresión.

Estado: **cerrada.** 6 hallazgos (G-01 a G-06); el resto del alcance (footer, mega-menú, drawer, loading/404, scripts, contraste, JSON-LD) se revisó y quedó en la lista de verificado-bien de abajo, sin hallazgo nuevo que valga la pena.

---

## Hallazgos

### G-01 — WhatsAppFloat queda escondido detrás de la barra sticky de la PDP en mobile (Global · bug de superposición no cubierto por el fix anterior)

**Estado:** working tree = producción (ninguno de los 2 archivos involucrados está en el diff sin commitear).

**Qué pasa:** en la ficha de producto (`/tienda/[slug]`), en mobile (≤720px), existe `.pdp-sticky-bar` (`src/app/globals.css:413-435`): `position:fixed; bottom:0; left:0; right:0; z-index:45`, con el botón "Agregar" ocupando el lado derecho de la barra (`src/app/tienda/[slug]/ProductDetailsClient.tsx:493,514-528`, `flex:1` + `marginLeft:16`, extendido casi hasta el borde derecho). `WhatsAppFloat` (`src/components/WhatsAppFloat.tsx`) NO excluye esa ruta de su lista de páginas (línea 38-41: solo excluye `/admin`, `/carrito`, `/encargo`, `/ig` — falta `/tienda/`), y se posiciona en `bottom:28, right:24, width:52, height:52, zIndex:40` (líneas 63-64, 69-71) — es decir, ocupa exactamente la franja vertical 28-80px desde abajo, adentro de la franja 0-84px que cubre la barra sticky.

El propio comentario del código (líneas 58-61) reconoce el problema y lo "resuelve" bajando el z-index de WhatsApp por debajo del de la barra (40 < 45) para que la barra no quede tapada — pero el efecto real es el inverso: como la barra es casi opaca (`background: rgba(255,255,255,0.97)` + blur, `globals.css:427-429`) y tiene mayor z-index, es **el botón de WhatsApp el que queda completamente tapado/invisible** detrás de la barra en toda ficha de producto comprable, en mobile. No es un choque de clics (nadie toca "nada"), pero el botón flotante de contacto —canal principal de esta tienda— desaparece exactamente en la página de mayor intención de compra del sitio, sin que se note que fue algo intencional.

Es la misma familia de bug que **3.0.2** de `auditoria-mercado-producto-2026-09.md` (VipCallout/WeaverCallout vs. `.pdp-sticky-bar`), pero esa vez el fix fue real (ver "Verificado y bien" — `body:has(.pdp-sticky-bar) .weaver-callout { bottom: 100px }`, `globals.css:743-752`) y **no se extendió a `WhatsAppFloat`**, que no tiene ni siquiera un className para engancharle una regla `:has()` equivalente.

**Evidencia:** mismo principio que Baymard/NN/g ya citado en 3.0.1/3.0.2 (overlays fijos que se tapan entre sí o desaparecen sin aviso) — acá el resultado es peor que un simple choque visual: el control desaparece del todo justo donde más se lo busca. Verificable por lectura directa de coordenadas/z-index (no requiere captura de pantalla): ambos elementos son `position:fixed` sin transform/filter en sus ancestros que los aísle en otro stacking context (`<main>` en `layout.tsx:267-269` no tiene estilo propio), así que la comparación de z-index es directa.

**Impacto en conversión:** medio — no rompe el flujo principal (Agregar al carrito sigue andando), pero saca un canal de contacto/consulta justo en la página donde más dudas surgen (talle, plazo, materiales) y donde el resto del sitio SÍ lo mantiene visible. Esfuerzo: bajo.

**Clasificación:** (A) aplicar ya — seguro y reversible.

**Fix concreto:** agregar `className="whatsapp-float"` al `<a>` de `WhatsAppFloat.tsx` (línea ~55) y, en `globals.css`, junto a la regla existente de `.weaver-callout` (línea 748-752), agregar:
```css
@media (max-width: 720px) {
  body:has(.pdp-sticky-bar) .whatsapp-float { bottom: 100px; }
}
```
(mismo patrón exacto ya usado para `.weaver-callout`, mismo valor 100px porque ambos comparten la misma barra de referencia). **Trade-off:** ninguno real — sube el botón 72px cuando hay barra sticky debajo, igual que ya se hace con la tarjeta VIP/tejedoras; en desktop (>720px) no aplica porque `.pdp-sticky-bar` ni siquiera se renderiza (`display:none` por defecto, línea 415).

---

### G-02 — La home emite dos objetos `WebSite` en JSON-LD, con datos distintos y sin `@id` que los una (Global/Home · SEO · JSON-LD)

**Qué pasa:** `src/app/layout.tsx:136-142` define un `websiteJsonLd` (`name`, `alternateName` con las variantes reales de escritura — Dalia/Dahlia/etc. — y `url`) que se imprime en el `<head>` de **todas** las páginas (línea 233-236). `src/app/page.tsx:70-80` define **otro** objeto, también `"@type": "WebSite"`, también con `name` y `url` iguales, pero sin `alternateName` y con `potentialAction` (el `SearchAction` para el buscador de Google), impreso en el `<body>` de la home (línea 121-124, dentro del JSX que devuelve `Home()`). Ninguno de los dos lleva `@id`, así que no hay forma de que Google los trate como el mismo nodo: la home termina publicando dos entidades `WebSite` distintas para el mismo sitio, una con las variantes de escritura y otra con la acción de búsqueda, sin que ninguna tenga las dos cosas juntas.

**Evidencia:** es un hallazgo de lectura directa de los dos archivos (no requiere herramienta externa), pero conecta con un problema real ya documentado en el negocio (`research/seo-ia-2026-09.md` / memoria `seo-ia-investigacion-2026-09`): Google corrige "dahila" a "dahlia" en el buscador, que es justo lo que el `alternateName` del `WebSite` de `layout.tsx` intenta corregir — y ese objeto es el que queda "compitiendo" contra un segundo `WebSite` sin esas variantes en la página más visitada del sitio. Google Search Central documenta `@id` como el mecanismo para fusionar entidades repetidas en JSON-LD; sin él, dos bloques `WebSite` con el mismo `url` son datos redundantes/potencialmente ambiguos, no una fusión.

**Impacto en conversión:** medio — no rompe nada visible (no es un hallazgo de UI), pero es ruido en la señal que el propio sitio ya identificó como su problema de SEO activo (corrección de marca). Esfuerzo: bajo.

**Clasificación:** (A) aplicar ya — es reordenar dos objetos ya existentes, sin tocar copy ni datos de negocio.

**Fix concreto:** eliminar el `websiteJsonLd`/`<script>` de `layout.tsx` (líneas 131-142 y 233-236) y agregar `alternateName: ['Dahila', 'Dalia Crochet', 'Dahlia Crochet', 'Dahilia Crochet', 'Dailhia Crochet']` al `websiteJsonLd` que ya existe en `page.tsx` (línea ~70-80), dejando un único objeto `WebSite` completo (nombre + variantes + `SearchAction`) que vive solo en la home. **Trade-off:** las demás páginas dejan de emitir un bloque `WebSite` propio — no hace falta: la entidad `Organization` (que sí sigue en `layout.tsx`, con las mismas variantes) ya está en todas las páginas, y Google no exige un `WebSite` por página para entender el sitio — con que esté una vez, en la home, alcanza (así lo dice la propia documentación del `SearchAction`: solo hace falta en la homepage). Efecto colateral positivo menor: un `<script>` menos por página fuera de la home.

---

### G-03 — No existe `error.tsx` ni `global-error.tsx` en ningún nivel: un error real en producción muestra la pantalla genérica de Next, sin marca ni salida (Global · resiliencia)

**Qué pasa:** no hay ningún archivo `error.tsx` (a ningún nivel de `src/app/`) ni `global-error.tsx` en la raíz — se confirmó con `ls` en todo `src/app/` y sus subcarpetas de primer nivel. Next.js 16 documenta que sin `error.js` un error lanzado durante el render no tiene ningún límite (boundary) que lo capture salvo el manejo por defecto del framework: una pantalla sin marca, sin copy, sin ningún camino de regreso (`node_modules/next/dist/docs/01-app/01-getting-started/10-error-handling.md:201-271`; `.../file-conventions/error.md:96` — "It does not wrap the layout.js... above it. To handle errors in the root layout, use global-error.js").

Esto no es hipotético: el propio código de `src/app/tienda/[slug]/page.tsx:298` **lanza a propósito** un `Error` real cuando Supabase está caído y el producto no está en el snapshot — `throw new Error(\`Supabase caído y sin snapshot para /tienda/${slug}\`)`, en vez de `notFound()`, precisamente para que sea un 5xx transitorio y Google reintente en vez de desindexar la ficha (comentario en línea 293-295, y ya documentado en la memoria `supabase-egress-y-resiliencia` como "error de DB lanza, nunca notFound"). Ese diseño es correcto para Google, pero para la persona real que cae en esa ficha en ese momento (por ejemplo desde una story de Instagram, justo durante una caída de Supabase — algo que ya pasó una vez, según la memoria `modo-mantenimiento-y-snapshot`, DB caída por cuota hasta el 29/07), lo que ve hoy es la pantalla cruda de Next, sin ningún puente de vuelta a la tienda o a WhatsApp — mientras que la home, para el mismo escenario (DB caída), sí tiene un `MaintenanceScreen` con marca (`src/app/page.tsx:22`, `src/components/MaintenanceScreen.tsx`). El esfuerzo puesto en la home no se extendió al resto del sitio.

**Evidencia:** confirmado por ausencia de archivo (`ls src/app/error.tsx src/app/global-error.tsx` → "No such file or directory") + comportamiento documentado de Next 16 citado arriba + el propio `throw` intencional en el código de la PDP.

**Impacto en conversión:** alto — es el peor caso posible (pantalla en blanco sin marca ni salida) para el escenario exacto que este sitio ya vivió una vez y que puede repetirse (cuota de Supabase). Esfuerzo: bajo para `error.tsx` (hereda Header/Footer porque el layout sigue montado); medio para `global-error.tsx` (debe definir su propio `<html>`/`<body>`, sin Header/Footer ni el layout normal — ver nota abajo).

**Clasificación:** (A) aplicar ya — es puramente aditivo (nuevo archivo, cero cambios a lógica existente), no hay riesgo de regresión sobre nada que funcione hoy.

**Fix concreto:** agregar `src/app/error.tsx` (Client Component, como exige la convención) con el mismo tono/registro que `not-found.tsx` (título + un texto corto + botón a `/tienda` y un link de WhatsApp), envuelto por el layout raíz (conserva Header/Footer/WhatsAppFloat). Esto cubre el caso real de la PDP y de cualquier otra página. Opcionalmente, agregar también `src/app/global-error.tsx` para el caso más raro de que el error ocurra en el propio layout raíz (fuera del alcance de `error.tsx`) — ese sí necesita maquetar su propio `<html>/<body>` mínimo, sin poder reusar `Header`/`Footer` (son Client Components dentro del árbol que estaría roto). **Trade-off:** ninguno real — no cambia el código de estado HTTP (Next sigue devolviendo 5xx cuando el render falla; lo único que cambia es qué ve la persona en esa respuesta), así que la estrategia de "dejar que Google reintente" de la PDP queda intacta.

---

---

### G-04 — En la home y en la grilla de `/tienda`, "cuánto tarda" no aparece en ningún lado (el aviso de cola solo se muestra en la PDP y en el carrito) (Home · claridad en las primeras pantallas)

**Qué pasa:** cuando hay una lista de espera activa (`queue_note_text`, hoy "Por demanda, los pedidos estarán listos a finales de septiembre"), `ProductCard.tsx:202-215` **oculta a propósito** la etiqueta de plazo por producto ("2–6 sem.") en toda tarjeta — la propia lógica dice, con razón, que mostrar un plazo corto al lado de una cola activa sería mentir. El problema es que esa nota de cola, que reemplazaría a esa información, **nunca se imprime en la home ni en la grilla de `/tienda`** — solo se renderiza como texto visible en dos lugares de todo el código: la ficha de producto (`src/app/tienda/[slug]/ProductDetailsClient.tsx:456-461`) y el carrito (`src/app/carrito/CarritoClient.tsx:794-806`, con el comentario propio "la expectativa de plazo se fija acá, pegada al botón: nadie descubre en WhatsApp que su pedido empieza en un mes"). Confirmado por búsqueda completa: `queueNote`/`queue_note` no aparece en `HomeClient.tsx` ni en ningún archivo de `/tienda` fuera de la ficha individual.

Resultado concreto en mobile: entre el hero (`.hero-frame`, `clamp(380px,75vh,520px)` en `globals.css:364-366`) y la barra de confianza (2×2 en mobile, `globals.css:277`), las primeras ~2 pantallas de la home no contienen ninguna mención de plazo — ni el genérico ("2-6 semanas") ni el real y vigente ("finales de septiembre"). Quien entra por Instagram ve qué es (prendas tejidas) y, al llegar a "Nuevo", cuánto sale (`ProductCard` sí siempre muestra precio) — pero no cuánto tarda hasta que abre una ficha puntual.

**Evidencia:** es exactamente la Hipótesis 9 del propio prompt de esta auditoría ("las primeras pantallas en el celular no dejan claro qué es, cuánto sale y cuánto tarda") y conecta directo con la Hipótesis 2 ("el plazo frena"). Baymard documenta que fijar la expectativa de plazo temprano, antes del compromiso de elegir un producto, reduce el abandono más que fijarla recién en el checkout.

**Impacto en conversión:** alto — es información que el propio código ya trata como crítica (de ahí el comentario en el carrito), simplemente no llegó a la home/tienda. Esfuerzo: bajo — el texto ya existe y está aprobado (es el mismo `queue_note_text` que ya se muestra en PDP/carrito), solo falta un lugar más para leerlo.

**Clasificación:** (A) aplicar ya — es reutilizar copy ya vigente en un lugar más, no inventar nada nuevo. Trade-off menor: hay que elegir bien dónde (un renglón chico bajo el CTA del hero, o encabezando la sección "Nuevo"/la grilla de `/tienda`, con el mismo ícono `arrow-clockwise` + estilo ink500 que ya usan PDP y carrito) para no sumar otra tarjeta/banner que compita visualmente con la promo bar y el trust bar que ya están ahí arriba.

---

### G-05 — `ink500` (#8C8285) no llega a 4.5:1 sobre blanco en texto chico, y se usa así en decenas de textos informativos, no solo "meta" (Global · contraste WCAG 1.4.3)

**Qué pasa:** calculando la luminancia relativa real de `dahila.ink500` (`src/components/ui/Primitives.tsx:25`, `#8C8285`) sobre fondo blanco: contraste ≈ **3.72:1**. WCAG 1.4.3 (AA) exige 4.5:1 para texto normal (< 24px o < 18.66px en negrita) y solo baja a 3:1 para texto grande — así que cualquier uso de `ink500` en texto chico (10-13px, que es como se usa en casi todo el sitio) **no cumple AA**, aunque sí sirve para iconografía/UI no textual (que solo pide 3:1). El propio skill `ui-review` ya lo intuye ("ink500 only for secondary/meta, never long body copy") pero en la práctica se usa para texto que sí transmite información, no solo decoración: el subtítulo de cada ítem de la barra de confianza en la home (`src/app/HomeClient.tsx:238`, 11px, "Ajustado a vos"/"Coordinás por WhatsApp"), la etiqueta de material y el plazo por talle en las tarjetas de producto (`src/components/ProductCard.tsx`), el texto "Coordinás envío y pago con Anush por WhatsApp" del carrito mini (`src/components/CartDrawer.tsx:305-307`, 11px) y la fila de copyright del footer (`src/components/Footer.tsx:202`, 11px). No es un caso aislado: es el patrón por defecto para "texto secundario" en todo el sitio.

**Evidencia:** cálculo directo de contraste con la fórmula WCAG (luminancia relativa de sRGB) sobre el hex real del token — no requiere captura de pantalla. WCAG 2.1/2.2 SC 1.4.3.

**Impacto en conversión:** bajo/medio — no bloquea ninguna tarea, pero afecta legibilidad real para quien tiene baja visión o usa el celular con sol de por medio (contexto físico típico de Uruguay), justo en textos que sí importan (plazo, forma de pago, material).

**Clasificación:** (B) necesita una pasada visual antes de aplicarse — el fix en sí es mecánico (oscurecer un token compartido, ej. a algo como `#736A6D` da ≈5.2:1 manteniendo el mismo tono gris-cálido), pero `ink500` se usa en decenas de lugares del sitio a la vez y cambia el "peso" visual de todo el texto secundario de golpe — corresponde pasarlo por el checklist de `ui-review` (consistencia visual) con capturas antes de mergear, no aplicarlo a ciegas en una sesión de solo-lectura. Trade-off: un gris más oscuro es menos "susurrado" que el actual — hay que confirmar que se sigue viendo como jerarquía terciaria y no compite con `ink700`.

---

### G-06 — El footer promete "Envíos y cambios" en un link que ya no habla de cambios — quedó de antes de la limpieza legal del 04/09 (Global · Footer · consistencia de copy)

**Qué pasa:** `src/components/Footer.tsx:177` tiene un link a `/info` con el texto **"Envíos y cambios"**, en el footer de **todas** las páginas del sitio. Pero `/info` (`src/app/info/page.tsx:11,25-40`) se titula "Envíos, pagos y cuidados de tu prenda" y sus secciones son Envíos / Cómo encargar a medida / Formas de pago / Cuidados de las prendas — **cero mención de cambios**, confirmado por búsqueda de texto en el archivo. La palabra "cambios" quedó del footer de antes de la limpieza legal del 04/09/2026 que sacó del sitio todo lo referido a cambios y devoluciones (`src/app/terminos/page.tsx:21`, comentario: "se sacaron las cláusulas de cambios y devoluciones") — se actualizó `/terminos` y `/info`, pero no la etiqueta del link en el footer.

**Evidencia:** lectura directa de los dos archivos + la propia regla dura del proyecto (`research/prompt-auditoria-total-2026-09.md` §5.2): "Nada sobre devoluciones, cambios, derecho de retracto... ni en el sitio". Hoy la palabra "cambios" sigue viva, en la navegación de cada página, apuntando a una página que no la respalda — es tanto un incumplimiento de esa regla como una promesa rota para quien hace clic ahí buscando específicamente eso.

**Impacto en conversión:** bajo (no es un bloqueo del flujo de compra) pero alto en riesgo de coherencia/confianza: alguien que entra a esa página buscando la política de cambios no encuentra nada, justo en el único lugar del sitio que se lo prometió.

**Clasificación:** (A) aplicar ya — cambio de una palabra, cero riesgo.

**Fix concreto:** en `Footer.tsx:177`, cambiar `{ label: 'Envíos y cambios', href: '/info' }` por algo que sí describa la página, por ejemplo `{ label: 'Envíos y cuidados', href: '/info' }` (o "Envíos y pagos" — cualquiera de los dos ya está en el `<h1>`/metadata reales de la página, así que no es copy nuevo). **Trade-off:** ninguno.

---

## Verificado y bien (no tocar)

- **`WhatsAppFloat`/`BackToTop` ya no se superponen** — `BackToTop` vive en `bottom: 92` justo arriba de `WhatsAppFloat` (`bottom: 28`), con el comentario del propio fix (3.0.1 de la auditoría anterior, confirmado aplicado).
- **Header con 7 ítems de navegación** (antes 8) — "Sobre nosotros" salió del header y sigue en el footer, dentro de la regla 5-7 del propio skill `dahila-storefront` (`Header.tsx:16-30`).
- **Buscador del header con ancho `clamp(110px, 32vw, 160px)`** en vez del fijo 160px que se apretaba en pantallas <360px (apéndice de la auditoría anterior, ya corregido).
- **FAQ de la home con `aria-controls`/`id` correctamente enlazados** (`HomeClient.tsx:24,38`) — WCAG 4.1.2, hallazgo de la auditoría anterior ya aplicado.
- **`TestimonialsStrip` pausa el auto-avance en touch de verdad**: `canAutoAdvance()` chequea `matchMedia('(hover: hover)')` antes de armar el timer, no confía en `mouseenter` (`TestimonialsStrip.tsx:27-34`) — WCAG 2.2.2, ya aplicado.
- **`BackToTop` ahora sí respeta `prefers-reduced-motion`** en su `scrollTo` nativo (`BackToTop.tsx:27-29`, chequeo explícito porque el guard CSS global no cubre una API de scroll nativa) — apéndice de la auditoría técnica, ya resuelto.
- **El mini-carrito (`CartDrawer`) ya no golpea Supabase al abrirse**: las sugerencias de "Sumale un detalle" salen de `products` pasado como prop desde el catálogo cacheado del layout, no de una consulta propia (3.4 de la auditoría de mercado, confirmado aplicado).
- **`CartDrawer` y el menú mobile del header están bien resueltos en accesibilidad**: `useFocusTrap` + `useScrollLock` + `inert` cuando están cerrados + `Escape` para cerrar + `role="dialog"`/`aria-modal`/`aria-label` — nivel de detalle correcto y consistente entre los dos.
- **`VipCallout` y `WeaverCallout` comparten la clase `.weaver-callout`**, así que los dos heredan el ajuste de posición sobre `.pdp-sticky-bar` (`globals.css:748-752`) sin duplicar CSS; además se excluyen mutuamente por diseño (si la de tejedoras puede salir todavía, la VIP espera a otra visita) — cero riesgo de que las dos tarjetas se apilen en una misma sesión.
- **Los skeletons de carga (`loading.tsx`, `tienda/loading.tsx`) son shimmers de marca**, no spinners genéricos, con `role="status" aria-live="polite"`; su animación queda anulada igual por el guard global `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important } }` de `globals.css:252-259`, aunque el `@keyframes` esté definido en un `<style>` local a cada archivo.
- **`/api/search` es resiliente y liviano**: lee del catálogo ya cacheado (cero consultas nuevas por letra tipeada) y devuelve `{results: []}` con status 200 ante cualquier error interno, así que el header nunca rompe — solo muestra "Sin resultados." (`src/app/api/search/route.ts:64-67`).
- **`not-found.tsx` es un 404 de marca con salida real**: copy cálido, botones ≥44px, y sugiere 4 productos activos sacados del catálogo cacheado (no una consulta nueva por cada 404, fix ya aplicado en la auditoría técnica).
- **`getCatalog()` (el layout raíz) ya tiene su propio fallback al snapshot ante caída de Supabase** — confirmado leyendo `src/lib/catalog.ts:178-183`: solo relanza el bailout dinámico de Next, todo lo demás cae al snapshot. Esto acota el problema de G-03 a las rutas que deciden lanzar a propósito (como la PDP), no al layout en sí.
- **Los testimonios de `testimonials` son reales**, no genéricos ni inventados: menciones concretas de prendas (bikinis, faldas, calentadores, sweater, chalecos), errores de tipeo incluidos — coherente con la regla de "prueba real sobre prueba de stock" del skill `ui-review`. Confirmado consultando la tabla en vivo con la anon key.
- **El `sameAs` de los tres bloques JSON-LD (Organization en `layout.tsx`, LocalBusiness en `page.tsx`) ahora sale de `brandProfileUrls(settings)`**, perfiles reales cargados en Configuración → Contacto, en vez de un array hardcodeado — cambio del working tree bien resuelto.

## Top 5 de mi área por impacto en conversión

1. **G-04** — Home y `/tienda` no dicen "cuánto tarda" en ningún lado (el aviso de cola solo vive en la PDP y el carrito). Alto impacto / esfuerzo bajo — es copy que ya existe y ya está aprobado, solo falta un lugar más.
2. **G-01** — `WhatsAppFloat` queda tapado por la barra sticky de "Agregar al carrito" en la PDP mobile (heredado de la sesión anterior, sigue sin corregir). Impacto medio, en la página de mayor intención de compra del sitio.
3. **G-03** — No hay `error.tsx` ni `global-error.tsx`: un error real (ya pasó una vez, DB caída por cuota) muestra la pantalla en blanco de Next en vez de un fallback de marca con salida a WhatsApp. Impacto alto en el peor caso, esfuerzo bajo.
4. **G-02** — La home publica dos objetos `WebSite` en JSON-LD (uno con las variantes de escritura de la marca, otro con el buscador) sin `@id` que los una — ruido justo en el problema de SEO que el sitio ya identificó como activo (Google corrige "dahila" a "dahlia"). Impacto medio, esfuerzo bajo.
5. **G-06** — El footer promete "Envíos y **cambios**" en un link a una página que ya no habla de cambios desde la limpieza legal del 04/09 — choca con la regla dura del proyecto de no mencionar cambios/devoluciones en el sitio. Impacto bajo en conversión pero esfuerzo trivial y cierra un incumplimiento de una regla propia.

(G-05 — contraste de `ink500`, quedó fuera del top 5 por ser de impacto más bajo/difuso y necesitar una pasada visual antes de aplicarse, no por ser menos real.)
