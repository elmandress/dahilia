# Auditoría — Carrito, salto a WhatsApp, encargo y favoritos (2026-09-12)

Área de la auditoría total (`research/prompt-auditoria-total-2026-09.md`). Solo lectura de código — nada commiteado ni buildeado desde esta sesión. Auditando el **working tree** (incluye los cambios sin commitear del 12/09: `cart_id` end-to-end y la frase "No pagás nada ahora…"), no solo `https://dahila.uy` (que corre `a0e3b91`, sin esos cambios).

Estado: **COMPLETO** (12/09/2026, sesión de continuación). Cubre carrito, mensaje de WhatsApp, hipótesis 4 (navegador de Instagram), encargo y favoritos — todo contra el working tree. Hallazgos: C-01 a C-04 (carrito y mensaje), H4-01 (Instagram), E-01 (encargo), F-01 (favoritos), más un apéndice de menores. Ver el Top-5 y "lo bloqueante" al final del archivo.

---

## Notas de método

- No repetir hallazgos ya cerrados de `auditoria-mercado-producto-2026-09.md` §3.4/§3.5 (mini-cart sin caché de catálogo, cupón invisible, tope de 20u sin mensaje, link a guía de talles en encargo ya aplicado, patrón de resiliencia de `EncargoForm` ya bueno) ni de `auditoria-tecnica-2026-09.md` (rate limits en `/api/cart`, `/api/favorites`, `/api/orders` ya aplicados). Los reverifico contra el código actual, no los re-propongo salvo que algo cambió.
- DB: solo lectura anon key sobre tablas públicas. `cart_items`, `orders`, `favorites`, `custom_orders` cerradas — no se leen.
- No se toca `src/app/gracias/` ni el cupón GRACIAS15 (WIP QR).

---

## Hallazgos — Carrito

### C-01 · Carrito, resumen del total · el costo real de envío existe en Configuración pero no se muestra donde se decide (hipótesis 1)

**Qué pasa:** el bloque de totales del carrito (`CarritoClient.tsx:679-695`) siempre termina en una de dos frases genéricas — "El envío no está incluido — te paso el costo exacto por WhatsApp según tu zona" o "Te faltan $X para el envío gratis — el costo exacto te lo paso por WhatsApp" — sin importar lo que Anush haya cargado en Configuración → `shipping_estimate` ("Envío — línea corta", hoy en producción "Envío a todo Uruguay · Montevideo y por agencia al interior", placeholder de ejemplo "Montevideo $200 · Interior por agencia"). Ese campo sí llega al carrito (`CartProvider.tsx` lo recibe como prop, `layout.tsx:207` lo lee de `settings.shipping_estimate`) pero **solo se usa en la tira de confianza al pie** (`CarritoClient.tsx:544`, ícono de camión, letra chica, después del botón de WhatsApp) — nunca junto al total, que es donde Baymard ubica el momento crítico de decisión de envío.

**Archivo:línea:** `src/app/carrito/CarritoClient.tsx:679-695` (totales), `:544` (tira de confianza, donde sí se usa hoy), `src/app/layout.tsx:207` (de dónde sale el prop), `src/app/admin/configuracion/page.tsx:201-202` (los dos campos ya existentes: `shipping_estimate`, `free_shipping_threshold`).

**Evidencia:** Baymard Institute, investigación de abandono de checkout — el costo de envío inesperado al final es la razón de abandono más citada (~48% en su encuesta de motivos de abandono, "Cart & Checkout Usability" — Baymard reporta este hallazgo de forma sostenida en sucesivas rondas de su estudio de 50.000+ sesiones grabadas). El principio aplicable acá no es "faltan los montos" — Anush ya tiene un campo para cargarlos — es que el dato, cuando existe, está en el lugar equivocado de la pantalla.

**Impacto en conversión:** alto — es la hipótesis #1 del prompt de auditoría, y es la que menos esfuerzo de código pide: no hay que inventar UI nueva, ni pedirle un campo nuevo a Anush, solo mover/repetir un dato que ya se carga.

**Esfuerzo:** bajo (mover un `<span>`, sin cambio de schema).

**Clasificación:** (A) aplicar ya, en dos partes — una de código ya lista para aplicar, otra que depende de que Anush cargue montos reales en `shipping_estimate` (hoy el texto en producción no tiene montos, así que la mejora de posición no alcanza sola).

**Fix concreto:**
1. En el bloque de totales (reemplazando las líneas 687-695), mostrar `shippingEstimate` (si no está vacío) en vez del texto fijo cuando NO hay envío gratis activo, y dejar el fallback actual solo si el campo está vacío:
   ```
   {freeShipping ? (
     <span>Tu cupón incluye envío gratis</span>
   ) : overThreshold ? (
     <span>✓ Envío gratis — tu pedido supera los {formatPrice(freeShippingThreshold)}</span>
   ) : missingForFree > 0 ? (
     <span>
       Te faltan {formatPrice(missingForFree)} para el envío gratis.
       {shippingEstimate.trim() ? ` Envío: ${shippingEstimate.trim()}.` : ' El costo exacto te lo paso por WhatsApp.'}
     </span>
   ) : (
     <span>{shippingEstimate.trim() || 'El envío no está incluido — te paso el costo exacto por WhatsApp según tu zona'}</span>
   )}
   ```
2. Pedirle a Anush (dato, no código) que cargue en `shipping_estimate` el costo real y corto ("Montevideo $200 · Interior por agencia", el propio placeholder del campo) en vez del texto actual sin montos. Sin ese paso, el fix de código sigue mostrando una frase honesta pero sin precio.

**Trade-off:** ninguno real de UX — es estrictamente más información en el mismo lugar. El único costo es que si Anush deja `shipping_estimate` con una frase larga, puede desbordar la línea del total en mobile; conviene que quede corta (el propio label del campo ya lo pide: "línea corta").

---

### C-02 · Carrito, botón de WhatsApp · "No pagás nada ahora…" repite el paso 1 de la lista de abajo (hipótesis 3)

**Qué pasa:** el párrafo agregado el 12/09 bajo el botón principal (`CarritoClient.tsx:785-790`) dice "No pagás nada ahora: se abre WhatsApp con tu pedido ya escrito y coordinamos juntas talle, envío y pago." Dos líneas más abajo, el primer ítem de la lista numerada "Qué pasa al tocar el botón" (`:809-816`) dice "1 · Se abre WhatsApp con tu pedido ya armado — no pagás nada todavía." Son la misma idea, con casi las mismas palabras, separadas por el aviso de lista de espera (que puede o no aparecer). Repetir el mensaje no lo refuerza — en una pantalla ya larga en mobile, es una línea más para leer antes de tocar el botón, justo en la fricción que se está tratando de bajar.

**Archivo:línea:** `src/app/carrito/CarritoClient.tsx:785-790` (párrafo nuevo) y `:809-816` (lista de 3 pasos, preexistente).

**Evidencia:** NN/g, principio de redundancia de contenido ("Content redundancy" en microcopy) — repetir el mismo hecho con palabras distintas no reduce la ansiedad, satura la lectura y hace más difícil detectar qué es información nueva. Nielsen Norman Group, "Plain Language Is for Everyone" y las pautas de escaneabilidad web (F-pattern) documentan que los usuarios leen menos, no más, cuanto más largo es el bloque de texto de apoyo.

**Impacto en conversión:** medio — no bloquea la compra, pero es ruido justo antes del CTA más importante de la página, y punto de partida para pulir el copy de la hipótesis 3.

**Esfuerzo:** bajo (borrar o fusionar una frase).

**Clasificación:** (A) aplicar ya.

**Fix concreto:** eliminar el párrafo nuevo (`:785-790`) y en su lugar reforzar el paso 1 de la lista ya existente, que es la que de verdad se lee como secuencia ("qué pasa después"):
```
<li>1 · Se abre WhatsApp con tu pedido ya armado — no pagás nada todavía, solo coordinás.</li>
```
(cambio mínimo: agregar ", solo coordinás" al final del ítem 1 ya existente, y borrar el `<p>` de las líneas 782-790 entero). Así el mensaje de "no es un pago" queda dicho una sola vez, en el lugar que ya se diseñó para explicar la secuencia paso a paso.

**Trade-off:** el mensaje pierde el énfasis visual de tener su propio párrafo centrado — se vuelve un ítem más de una lista en letra chica. Si Anush quiere mantenerlo destacado, la alternativa es al revés: dejar el párrafo autónomo y borrar la redundancia del ítem 1 de la lista (volver a "Se abre WhatsApp con tu pedido ya armado.", sin la coletilla de pago) — mismo resultado, un solo lugar dice "no pagás nada".

---

### C-03 · Carrito, mismo párrafo · "coordinamos juntas" asume que quien compra es mujer

**Qué pasa:** el texto "…y coordinamos juntas talle, envío y pago" (`CarritoClient.tsx:789`) usa la forma femenina de "juntos/as", que en español asume que quien lee es mujer. El resto del sitio (revisado en `EncargoForm`, `/info`, textos de producto) no usa género en la segunda persona salvo acá. Dahila vende ropa de mujer mayormente, pero quien compra —un regalo, por ejemplo, el propio flujo de "nota de regalo" del carrito lo prevé (`:711-744`)— no necesariamente se identifica como "compañera" de coordinación en femenino.

**Archivo:línea:** `src/app/carrito/CarritoClient.tsx:789`.

**Evidencia:** guía de estilo del propio proyecto (`AGENTS.md` / memoria "Etiqueta DAHILA" y el resto de la voz es-UY del sitio) evita marcar género salvo que sea necesario; es una inconsistencia interna, no una regla externa citada — se marca como hallazgo de consistencia, no de accesibilidad.

**Impacto en conversión:** bajo — probablemente nadie deja de comprar por esto, pero es una fricción de tono para quien no se reconoce en el femenino (o compra para otra persona).

**Esfuerzo:** trivial.

**Clasificación:** (A) aplicar ya (viene incluido en el fix de C-02, que ya reescribe esta frase).

**Fix concreto:** si se conserva el párrafo (ver trade-off de C-02), cambiar "coordinamos juntas" por "coordinamos" a secas — dice lo mismo sin marcar género:
"No pagás nada ahora: se abre WhatsApp con tu pedido ya escrito y coordinamos talle, envío y pago."

**Trade-off:** ninguno.

**Nota — mismo patrón en otro archivo:** el paso por defecto "Elegimos juntas" del stepper de `/encargo` (`src/app/encargo/page.tsx:101`, texto de fallback de `pdp_process_step_2_label`) tiene el mismo problema de género marcado. Es un valor por defecto editable desde `site_settings`, no texto fijo, pero si Anush no lo tocó nunca en Configuración, hoy se está mostrando esa versión. Mismo fix trivial si se quiere: "Elegimos" en vez de "Elegimos juntas" (clasificación (A), esfuerzo trivial).

---

## El mensaje de WhatsApp — texto exacto para un carrito de ejemplo

Simulando `buildWhatsAppMessage()` (`CarritoClient.tsx:56-105`) con 2 ítems (uno con descuento de producto activo), sin cupón, con nota de regalo — exactamente lo que recibiría Anush en el chat:

```
Hola Anush! Quiero coordinar este pedido:

1. Cardigan Amour
   • Talle: M
   • Cantidad: 1
   • Subtotal: UYU 2.500
   https://dahila.uy/tienda/cardigan-amour

2. Top Flower
   • Talle: S
   • Cantidad: 2
   • Precio unitario: UYU 1.699 (antes UYU 1.999)
   • Subtotal: UYU 3.398
   https://dahila.uy/tienda/top-flower

Total: UYU 5.898

🎁 Nota de regalo: "Con cariño para vos"

¿Me confirmás stock, plazos y forma de pago? ¡Gracias!
```

**Qué ya está bien (coincide con lo señalado en `auditoria-mercado-producto-2026-09.md` §"Apéndice": "el mensaje... es notablemente bueno"):** ítem por ítem, con talle, cantidad, precio antes/después cuando hay descuento, link directo a la ficha (para que Anush confirme qué pieza es sin adivinar), subtotal y total. Se reverifica: sigue así en el working tree, sin regresión.

**Qué falta para cerrar la venta, sin inventar campos nuevos:**

### C-04 · Mensaje de WhatsApp · la pregunta de cierre no menciona el envío

**Qué pasa:** la última línea del mensaje — "¿Me confirmás stock, plazos y forma de pago? ¡Gracias!" (`CarritoClient.tsx:102`) — no menciona el envío en absoluto, aunque es el tema que, según la hipótesis 1 de este mismo prompt, más frena la decisión. La clienta ya vio en el carrito (una vez aplicado C-01) una estimación corta de envío o el aviso de "te paso el costo por WhatsApp"; pero el mensaje que efectivamente se manda no le recuerda a Anush que ese es un dato pendiente de confirmar rápido, ni le pide a la clienta indicar su ciudad o zona para que Anush pueda cotizar sin una ida y vuelta extra.

**Archivo:línea:** `src/app/carrito/CarritoClient.tsx:102` (línea de cierre del mensaje).

**Evidencia:** consistente con Baymard (ver C-01) — la ansiedad por el costo de envío no se resuelve solo mostrándolo en el carrito si el primer mensaje real a la vendedora no lo pone sobre la mesa; cuanto antes se calcule el envío en la conversación, menos fricción hay entre "quiero esto" y "ya sé cuánto pago en total".

**Impacto en conversión:** medio — no es un bloqueo (Anush igual va a preguntar), pero acelera la primera respuesta y reduce los mensajes de ida y vuelta antes de confirmar.

**Esfuerzo:** trivial (una palabra en un string).

**Clasificación:** (A) aplicar ya.

**Fix concreto:** cambiar la línea de cierre para incluir el envío explícitamente, sin agregar ningún campo de formulario nuevo (evita fricción de más inputs antes de abrir WhatsApp):
```
lines.push('¿Me confirmás stock, el costo de envío a mi zona y la forma de pago? ¡Gracias!')
```

**Trade-off:** ninguno real — es una palabra más en un mensaje que la clienta de todos modos revisa antes de enviar (queda editable en el campo de texto de WhatsApp).

### Color: verificado y bien, no es un hallazgo

El selector de talle sí viaja en el mensaje; el color, no — pero es a propósito, no un olvido. `ProductDetailsClient.tsx:176-177` lo dice en el propio comentario del código: *"Colour palette — these are the tones Anush can work this piece in. Selecting is coordinated over WhatsApp, so this is informational."* `CartItem` (`src/lib/types.ts:180-189`) no tiene campo de color por eso mismo — no hay ningún lugar del flujo (PDP, carrito, `/api/cart`) que capture una elección de color, consistente con que la paleta en la ficha es solo informativa. **No corresponde agregarlo al mensaje**: forzar una elección de color antes de escribir por WhatsApp iría en contra del propio patrón de diseño del sitio (dejar personalización real para la conversación) y sumaría fricción a un carrito que hoy es liviano a propósito. Clasificación: (D) descartar — ya resuelto por diseño, no es un gap.

---

## Hipótesis 4 — Salto a WhatsApp desde el navegador interno de Instagram

### H4-01 · `handleCheckout` · el salto puede no completarse dentro del navegador de Instagram, sin que el código pueda detectarlo

**Qué pasa:** `handleCheckout` (`CarritoClient.tsx:206-275`) abre `wa.me` con `window.open(url, '_blank', 'noopener,noreferrer')` y, si devuelve `null` (bloqueo de pop-up), cae a `window.location.assign(url)`. Ese fallback cubre el caso "el navegador bloqueó el pop-up" (típico de iOS Safari fuera del gesto del usuario, ya comentado en el propio código, línea 269-271). **No cubre un caso distinto y específico de los navegadores embebidos de Instagram/Facebook**: `window.open`/`location.assign` "tienen éxito" (no devuelven `null`, no tiran error) pero la navegación queda **dentro del WebView de Instagram** en vez de entregarle el link a la app nativa de WhatsApp — la clienta ve la página web de `wa.me` (o su pantalla de "Seguir a chat"), y si no tiene sesión de WhatsApp Web activa, se topa con un cartel de login sin salida clara. Desde JavaScript no hay forma de saber si ese hand-off a la app nativa ocurrió o no: es indistinguible de un éxito.

**Archivo:línea:** `src/app/carrito/CarritoClient.tsx:272-273`.

**Evidencia (con fecha):**
- El comportamiento de los navegadores embebidos de Instagram/Facebook (interceptan enlaces, inyectan JavaScript propio y no siempre delegan a la app nativa) está documentado desde la investigación de Felix Krause (`inappbrowser.com`, 2022, seguida por cobertura de prensa) y se sigue citando como vigente en 2025-2026 en múltiples guías técnicas — [Master.dev (ex Frontend Masters) — "The Pitfalls of In-App Browsers"](https://blog.master.dev/the-pitfalls-of-in-app-browsers/) (consultado 12/09/2026, sin fecha de publicación visible en la página) confirma que **en iOS no existe hoy una vía confiable de "escape" hacia el navegador nativo desde un in-app browser** (ni siquiera con trucos de URL scheme), mientras que en **Android sí existe un mecanismo estándar** (`intent:${url}#Intent;end`) para forzar la apertura en el navegador o app por defecto.
- Reportes de terceros sobre el caso específico de `wa.me` + Instagram describen exactamente el síntoma de arriba (queda en la página web de WhatsApp dentro del navegador de Instagram, sin pasar a la app) — fuente de soporte comercial, no un paper técnico: [Chatarmin Help Center — "Instagram - WhatsApp Link not working"](https://help.chatarmin.com/en/articles/211412-instagram-whatsapp-link-not-working) (indexado por buscador 12/09/2026; el fetch directo del artículo devolvió 404 al momento de verificar, así que se cita con esa salvedad — puede haberse movido o retirado). Esta fuente es débil por sí sola: se la incluye porque coincide con el mecanismo ya confirmado por la fuente técnica de arriba, no como prueba independiente.
- No encontré una fuente con datos de tráfico reales de Dahila que confirme que esto está pasando hoy (Analytics no puede medir "se quedó atascada en el WebView de Instagram" como evento). Es un riesgo plausible y bien documentado en general, no un problema confirmado en este sitio en particular.

**Impacto en conversión:** no cuantificable con los datos disponibles — depende de qué fracción del ~72% de tráfico "Organic Social" (dato de `auditoria-mercado-producto-2026-09.md` §4.3) llega y compra sin salir del navegador de Instagram. Podría ser alto (si de verdad se traba) o irrelevante (si la mayoría ya sale a Safari/Chrome antes de llegar al carrito, por ejemplo al tocar el ícono de compartir o "abrir en navegador" desde una Story).

**Esfuerzo:** bajo para probarlo, medio para un plan B robusto.

**Clasificación:** (B) necesita una decisión/dato de Anush o Mati — **antes que nada, probarlo en un dispositivo real**: abrir un link a `dahila.uy/carrito` desde dentro de Instagram (bio, DM o Story) en un iPhone y en un Android, agregar algo al carrito y tocar "Coordinar por WhatsApp". Es una prueba de 5 minutos y es la única forma de saber si esto es un problema real en este sitio o una preocupación teórica. **No implementar el plan B sin ese dato** — agregar UI para un problema que no existe en la práctica es puro costo.

**Plan B propuesto (solo si la prueba confirma el problema):** no reemplazar el botón actual (sigue siendo lo correcto para el navegador normal, que es la mayoría). Agregar una segunda afordancia, discreta, debajo del botón principal, que aparezca **solo cuando se detecta un navegador embebido conocido** (`/Instagram|FBAN|FBAV/.test(navigator.userAgent)` — token real que Instagram/Facebook agregan a su user agent, no una suposición): un link de texto "¿No se abrió WhatsApp? Copiá tu pedido" que copia `message` (la misma variable que ya arma `buildWhatsAppMessage`) al portapapeles con `navigator.clipboard.writeText`, para que la clienta lo pegue a mano en WhatsApp si lo tiene instalado, o en el link `wa.me` abierto manualmente en su navegador.

**Trade-off:** el sniffing de user-agent es frágil (Instagram cambia su UA entre versiones; falsos negativos son posibles) y es una rama de código más para mantener sin poder probarla en CI. Si Mati confirma que el salto SÍ funciona hoy en los dispositivos que probó, la recomendación es **no tocar nada** (clasificar como D, descartar) — es el caso más probable dado que `wa.me` es justamente el dominio que WhatsApp/Meta más incentiva a que sus propios navegadores respeten (a diferencia de links a webs de terceros).

---

## Hallazgos — Encargo a medida

Verificado primero contra `auditoria-mercado-producto-2026-09.md` §3.5: **los dos fixes marcados ahí ya están aplicados y siguen bien** — el selector de talle S/M/L de `EncargoForm.tsx:260-276` ya linkea `<SizeGuide />` justo debajo (línea 273-275), y el stepper "Cómo funciona" ya aparece condicionalmente en `/encargo` directo vía `processEnabled`/`ProcessStepper` (`EncargoForm.tsx:204-208`, `page.tsx:98-103`), no solo en fichas `is_custom_only`. No se repiten como hallazgos nuevos.

### E-01 · `/encargo/estado` · "Escribinos por WhatsApp" no es un link, y en esta ruta tampoco hay botón flotante

**Qué pasa:** la página de seguimiento de encargos tiene DOS lugares donde invita a escribir por WhatsApp — el estado "cancelado" ("Si creés que es un error, escribinos por WhatsApp y lo vemos.", `EstadoClient.tsx:22`) y el pie de la vista de progreso ("¿Dudas? Escribinos por WhatsApp y te respondemos.", `EstadoClient.tsx:75`) — y en ninguno de los dos casos "WhatsApp" es un link: es texto plano, sin `href`, sin botón. `EstadoClient.tsx` ni siquiera importa ni recibe `whatsappUrl` como prop, y `encargo/estado/page.tsx` (Server Component) no lo lee de `site_settings` para pasárselo. Para colmo, el botón flotante global de WhatsApp (`WhatsAppFloat.tsx:40`) está apagado en **toda** la familia de rutas `/encargo*` (`pathname.startsWith('/encargo')`), pensado para no competir con los CTAs de WhatsApp que sí tiene `EncargoForm` (pantalla de éxito, fallback de error) — pero `/encargo/estado` no tiene ninguno de esos CTAs propios, así que hereda la ausencia del flotante sin heredar ningún reemplazo. Resultado: alguien que entra a revisar su pedido y tiene una duda no tiene ningún camino de un toque hacia WhatsApp en esta pantalla.

**Archivo:línea:** `src/app/encargo/estado/EstadoClient.tsx:22` y `:75` (los dos textos sin link); `src/app/encargo/estado/page.tsx:12-18` (Server Component que no lee `contact_whatsapp_url`); `src/components/WhatsAppFloat.tsx:40` (exclusión de toda la familia `/encargo`).

**Evidencia:** mismo principio ya aplicado por este mismo proyecto en `/info` (`auditoria-mercado-producto-2026-09.md` §3.6, ya shippeado): "las páginas de FAQ/políticas convierten mejor con una salida explícita a contacto humano" (NN/g). Acá el caso es más fuerte porque el propio texto de la página promete la salida ("escribinos por WhatsApp") sin cumplirla.

**Impacto en conversión:** medio — no es una pantalla de alto tráfico, pero es la pantalla de una clienta que ya compró/encargó y tiene una duda activa; dejarla sin salida es fricción de posventa que puede traducirse en un mensaje perdido o en frustración innecesaria.

**Esfuerzo:** bajo.

**Clasificación:** (A) aplicar ya.

**Fix concreto:**
1. `encargo/estado/page.tsx` pasa a leer `contact_whatsapp_url` de `site_settings` (mismo patrón que `encargo/page.tsx:68-84`) y lo pasa como prop a `EstadoClient`.
2. En `EstadoClient.tsx:22`, reemplazar el texto suelto por un link real:
   ```
   <p>Si creés que es un error, <a href={`${whatsappUrl.replace(/\/+$/, '')}?text=${encodeURIComponent('Hola! Tengo una duda sobre mi encargo cancelado.')}`} target="_blank" rel="noopener noreferrer">escribinos por WhatsApp</a> y lo vemos.</p>
   ```
3. En `EstadoClient.tsx:75`, mismo tratamiento:
   ```
   <p>¿Dudas? <a href={`${whatsappUrl.replace(/\/+$/, '')}?text=${encodeURIComponent(`Hola! Tengo una duda sobre mi encargo (código ${code}).`)}`} target="_blank" rel="noopener noreferrer">Escribinos por WhatsApp</a> y te respondemos.</p>
   ```
   (prellenar el código de seguimiento en el mensaje evita que Anush tenga que pedirlo de nuevo).

**Trade-off:** ninguno real — es agregar el `href` que el texto ya prometía.

### Verificado y bien (Encargo) — no tocar

- `EncargoForm.tsx` sigue teniendo el patrón de resiliencia ya elogiado en la auditoría anterior: si `submitEncargo` falla, aparece un link de WhatsApp con el mensaje prellenado (`:309-327`), y solo cuando el formulario tiene lo mínimo para ser útil (nombre + contacto).
- El foco se mueve al `<h1>` de la confirmación al enviar (`successHeadingRef`, `:38-41`) — cubre a quien usa teclado o lector de pantalla, que si no se quedaría "parado" en un botón que ya no existe.
- `ENCARGO_FAQ` (`faq.ts`) no promete plazos ni precios inventados en ningún punto; explica cómo se calculan, no un número fijo — cumple la regla del propio comentario del archivo.
- Las plantillas de mail (`templates.ts`: `ownerNewEncargo`, `customerEncargoConfirmation`, `customerStatusEmail`) no prometen nada que el proceso real no haga (nada de devoluciones, nada de plazos fijos, todo dice "coordinamos por WhatsApp").
- `actions.ts` (`submitEncargo`, `lookupEncargo`) valida longitudes, tipos y talles contra listas cerradas, tiene rate-limit propio (3/min encargo, 10/min lookup) y reintenta el insert sin columnas opcionales si una migración no corrió — sin perder el encargo.
- `notifyNewOrder`/`ownerNewOrder`/`customerOrderConfirmation` (`templates.ts`, `notifications.ts`) existen pero no se llaman desde ningún lado (`/api/orders/route.ts` no los usa) — confirma lo que ya dice la memoria del proyecto ("WhatsApp checkout no manda mail, a propósito"; código preparado para un futuro checkout con pago propio). No es un bug, no se toca.

---

## Hallazgos — Favoritos

### F-01 · `/favoritos` · el botón dice "Vista rápida" pero navega de largo a la ficha, perdiendo el agregado rápido que el propio componente ya sabe hacer

**Qué pasa:** `FavoritosClient.tsx:88` renderiza cada pieza guardada con `<ProductCard product={it.product} onQuickView={() => router.push('/tienda/${it.product.slug}')} />`. `ProductCard` (`src/components/ProductCard.tsx:47-57`) tiene un comportamiento a propósito documentado en su propio comentario: *"If a quick-view handler is provided (store grid), open it so the shopper can choose a size. Otherwise (home grid) fall back to quick-add."* — es decir, el componente espera que `onQuickView` abra un modal real de vista rápida (como hacen `/tienda` y `/ofertas`, que le pasan `setQuickView(p)` para abrir `QuickViewModal`), y que cuando NO se pasa `onQuickView`, el botón sea "Agregar al carrito" con agregado directo. En `/favoritos`, en cambio, se pasa una función que hace `router.push` a la ficha completa — ni abre un modal, ni agrega al carrito. El resultado son dos problemas a la vez: (1) el botón dice "Vista rápida" (`ProductCard.tsx:161`, la etiqueta que corresponde cuando hay `onQuickView`) pero en los hechos hace una navegación completa de página, no una vista rápida; (2) se pierde el camino más corto de favoritos→carrito que el propio componente ya sabe ofrecer (agregado directo con el primer talle disponible), justo en la página cuyo propósito es "volver después y comprar rápido".

**Archivo:línea:** `src/app/favoritos/FavoritosClient.tsx:88`; comportamiento documentado en `src/components/ProductCard.tsx:47-57` y `:161`; patrón correcto de referencia en `src/app/tienda/TiendaClient.tsx:815` y `src/app/ofertas/OfertasClient.tsx:118` (ambos abren `QuickViewModal` de verdad).

**Evidencia:** hallazgo de código verificado directamente (el propio comentario del componente documenta la intención; `/favoritos` es la única de las tres páginas que usa `ProductCard` con grilla y no sigue ninguno de los dos patrones previstos). Baymard Institute: en una página de lista de deseos, cuantos menos pasos entre "la vi" y "está en mi carrito", más alta la tasa de conversión desde wishlist — es la razón de ser de la propia página.

**Impacto en conversión:** medio — `/favoritos` es tráfico ya calificado (alguien que decidió guardar algo para después); cualquier fricción de más ahí cuesta proporcionalmente más que en `/tienda`.

**Esfuerzo:** bajo (una línea).

**Clasificación:** (A) aplicar ya.

**Fix concreto:** replicar el patrón de `/tienda`/`/ofertas` — estado local `quickView` + `QuickViewModal` — en vez de navegar:
```tsx
const [quickView, setQuickView] = useState<Product | null>(null)
// ...
<ProductCard key={it.id} product={it.product} onQuickView={() => setQuickView(it.product)} />
// ...
{quickView && <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />}
```
(revisar la firma exacta de `QuickViewModal` usada en `OfertasClient.tsx` para copiar las props tal cual). Si por alcance de esta sesión no se quiere sumar el modal, la alternativa mínima de una sola línea es **no pasar `onQuickView`**, dejando que `ProductCard` haga su fallback ya implementado de agregado directo con el talle por defecto — pero el modal es preferible porque una pieza guardada hace tiempo puede necesitar confirmar el talle, no asumir el primero disponible.

**Trade-off:** ninguno con la opción del modal (es reusar código ya probado en otras dos páginas). La alternativa de una línea (quitar `onQuickView`) agrega el riesgo de sumar el talle equivocado sin que la clienta lo elija — aceptable solo si se prioriza velocidad de implementación sobre precisión de talle.

### Verificado y bien (Favoritos) — no tocar

- El toggle de `FavoriteButton`/`FavoritesProvider` es optimista con rollback real ante error de red (`FavoritesProvider.tsx:114-145`) — se siente instantáneo y no miente si el guardado falla.
- El toast "Guardado en favoritos" con link directo a `/favoritos` (`FavoritesProvider.tsx:166-190`) es un buen empujón sin ser invasivo (`aria-live="polite"`, no roba foco).
- `/favoritos` tiene botón de WhatsApp propio con el listado de piezas guardadas prellenado (`FavoritosClient.tsx:16-22`) — mismo patrón "wishlist como conversación" que ya se señaló como acertado en el mensaje del carrito.
- Pluralización correcta ("1 pieza guardada" / "N piezas guardadas", `FavoritosClient.tsx:65`) y estado vacío con CTA claro a `/tienda` — nada que corregir.
- `/api/favorites` sigue el mismo patrón sólido que `/api/cart` (cookie `HttpOnly` de 180 días, cliente de servicio con filtro manual por `fav_id`, insert idempotente ante duplicado con `23505`, rate-limit 40/min) — sin regresiones desde la auditoría técnica anterior.

---

## Apéndice — hallazgos menores (colectados, no descartados)

- **Sin "deshacer" al eliminar una pieza del carrito.** `CarritoClient.tsx:459-464` y `CartDrawer.tsx:208-212` borran al instante con el ícono/link, sin confirmación ni forma de recuperar el ítem. No hay riesgo de borrado accidental por spam de clics (el botón "−" se desactiva en `qty=1`, así que achicar cantidad nunca llega a eliminar solo), así que el impacto real es bajo — pero un patrón de "deshacer" (toast con botón, unos segundos antes de llamar al DELETE real) es más gentil que un modal de confirmación (que sí frena a todo el mundo por el error de unos pocos). Esfuerzo: medio (hay que sostener el ítem en memoria unos segundos con un temporizador antes de confirmar el DELETE contra `/api/cart`). Clasificación: (B) — no bloqueante, para una sesión con más tiempo.
- **Progreso a envío gratis sin barra visual.** Hoy es solo texto ("Te faltan $X para el envío gratis"), tanto en `CarritoClient.tsx:687-690` como en `CartDrawer.tsx:299-303`. Una barra de progreso (aunque sea una línea de 4px que se llena) es una mejora cosmética razonable una vez que `free_shipping_threshold` esté activo con un monto real cargado — hoy en producción el campo está vacío (apagado), así que esto no tiene efecto visible todavía. Esfuerzo: bajo. Clasificación: (B) — depende de que Anush primero active el umbral; sin eso no hay nada que barra-de-progreso.
- **`EncargoForm.tsx`: "Tipo" y "Talle" arrancan preseleccionados** ('Cardigan' y 'M', `EncargoForm.tsx:24-25`) en vez de sin selección. El estado activo es visualmente claro (botón oscuro), así que el riesgo de que alguien no note el default y mande un talle equivocado es bajo, pero no es cero. Esfuerzo: bajo (agregar un estado "sin elegir" a los botones, más una validación que lo exija). Clasificación: (B) — cambio menor, no urgente.

---

## Verificado y bien (no tocar) — resumen general

Además de lo ya anotado sección por sección:

- **El mensaje de WhatsApp del carrito (`buildWhatsAppMessage`) sigue siendo el punto más fuerte del flujo**: ítem por ítem, con talle, cantidad, precio antes/después cuando hay descuento, link a la ficha, subtotal y total — reverificado línea por línea contra el ejemplo simulado en este informe, sin regresión desde la auditoría anterior.
- **El mini-cart (`CartDrawer`) ya no dispara su propia consulta a Supabase** — recibe `products` como prop del `getCatalog()` cacheado en `layout.tsx:271`. Esto **corrige** el hallazgo de `auditoria-mercado-producto-2026-09.md` §3.4 ("el mini-cart consulta Supabase sin pasar por la caché del catálogo") — no se repite como hallazgo nuevo, se marca como resuelto.
- **El tope de 20 unidades por línea ya tiene mensaje al tocarlo** (`title` con "Máximo 20 por pedido — escribinos por WhatsApp si necesitás más", en `CarritoClient.tsx:448` y `CartDrawer.tsx:204`) — **corrige** el hallazgo menor del apéndice de esa misma auditoría.
- El cupón sigue con el mismo patrón correcto: oculto tras un link (`¿Tenés un cupón?`), validado siempre contra el servidor (nunca se confía en lo guardado en `sessionStorage`), con mensajes de rechazo específicos por motivo (`COUPON_REASON_TEXT`) y un guard contra doble-canje en el checkout (`checkingOut`).
- Manejo de fallas de red consistente en todo el área: `/api/cart`, `/api/favorites` y el cupón muestran un toast o mensaje específico en vez de fallar en silencio; `CartProvider` cae a un snapshot local de `localStorage` si `/api/cart` no responde, así que una caída de la base no le hace perder el carrito a nadie a mitad de una compra.
- La selección de color queda deliberadamente fuera del carrito y del mensaje de WhatsApp (documentado en el propio comentario de `ProductDetailsClient.tsx:176-177`) — coordinarlo en la conversación, no en un formulario, es una decisión de diseño consciente, no un olvido.
- `EncargoForm`/`faq.ts`/plantillas de mail: cero promesas que el negocio no cumple hoy (nada de devoluciones, nada de plazos o precios inventados), resiliencia ante fallas de guardado con fallback a WhatsApp prellenado, y foco de teclado movido correctamente a la confirmación.
- `/api/cart`, `/api/favorites`, `/api/orders`, `/api/coupon`: rate-limits ya aplicados en los cuatro (verificado contra `auditoria-tecnica-2026-09.md`, sin regresión), cada escritura re-scopeada por cookie incluso con el cliente de servicio.

---

## Top 5 (por impacto × confianza ÷ esfuerzo)

1. **C-01 — Mostrar el envío real junto al total, no solo en la tira de confianza.** El dato (`shipping_estimate`) ya existe; solo falta moverlo/repetirlo en el bloque de totales del carrito y, en paralelo, pedirle a Anush que cargue el monto real (hoy el texto en producción no tiene números). Es la hipótesis #1 del prompt y el fix de código es de una función chica.
2. **F-01 — `/favoritos`: recuperar el agregado rápido que `ProductCard` ya sabe hacer.** Hoy el botón dice "Vista rápida" pero navega de largo a la ficha; reusar `QuickViewModal` (como ya hacen `/tienda` y `/ofertas`) devuelve el camino corto favoritos→carrito en tráfico ya calificado.
3. **E-01 — `/encargo/estado`: los dos "escribinos por WhatsApp" no son links, y en esta ruta no hay botón flotante.** Alguien con una duda sobre un pedido ya hecho queda sin ningún camino de un toque a WhatsApp. Mismo principio que ya se aplicó en `/info`.
4. **C-02/C-03 — Limpiar el párrafo "No pagás nada ahora…"**: hoy repite el paso 1 de la lista de abajo casi palabra por palabra y usa "coordinamos juntas" (asume género). Fusionar en un solo lugar el mensaje de "esto no es un pago todavía" — es la hipótesis #3, y hoy sobra texto en vez de faltar claridad.
5. **C-04 — La pregunta de cierre del mensaje de WhatsApp no menciona el envío.** Una palabra (“y el costo de envío a mi zona”) conecta el problema de la hipótesis #1 con la conversación real que Anush recibe, sin agregar ningún campo nuevo al formulario.

**Lo bloqueante — no se puede decidir sin un dato de Mati:** la hipótesis 4 (navegador interno de Instagram, hallazgo H4-01) tiene evidencia técnica general sólida (Android tiene una vía de escape estándar, iOS no tiene ninguna confiable) pero **nada que confirme que esto pasa hoy con tráfico real de Dahila**. Antes de construir cualquier plan B (detección de user-agent + "copiar pedido"), hace falta la prueba de 5 minutos en un dispositivo real descrita en H4-01 — sin eso, cualquier código nuevo ahí es una apuesta a ciegas sobre un problema que podría no existir en la práctica.

