# Microinteracciones para mobile — research 13/09/2026

Investigación de solo lectura para dahila.uy: microinteracciones de e-commerce mobile con evidencia externa, pensadas para un catálogo tejido a mano, checkout por WhatsApp (sin pago en el sitio) y ~70% de tráfico desde el navegador interno de Instagram. No repite lo ya hecho en `research/auditoria-total-2026-09-12.md` (precio único, plazo visible, CLS del carrito, etc.) — cuando algo de esa auditoría toca el mismo tema, se nombra para no chocar.

**Estado: en construcción.** Se va completando idea por idea a medida que aparece evidencia. Si la sesión se corta, lo de abajo ya está guardado.

---

## Qué existe hoy en el código (lectura rápida, 13/09/2026)

- **Galería (`src/components/ProductGallery.tsx`):** una imagen principal (tap → lightbox) + grilla de miniaturas debajo (tap para cambiar). Sin gesto de swipe ni `scroll-snap` en el carrusel principal — sí se usa `scroll-snap` en otras partes del sitio (riel de categorías, `globals.css` líneas ~535-549), pero no acá. Sin indicador de posición ("2/5" o puntos) en la vista principal (solo aparece dentro del lightbox).
- **Lightbox (`src/components/ProductLightbox.tsx`):** tap-to-zoom centrado en el punto tocado (no es pinch real — no hay gesto de dos dedos), contador "N / total" arriba, flechas `lightbox-arrow` y tira de miniaturas abajo. Carga bajo demanda (`next/dynamic`, `ssr:false`).
- **Agregar al carrito:** `ProductDetailsClient.handleAdd` cambia el botón a "✓ Agregado" (aria vía texto, no aria-live explícito) y `CartProvider.addToCart` abre el drawer por default (`setDrawerOpen(true)` salvo `openDrawer:false`, usado en los "agregados de un toque" como "Completá el look"/"Sumale un detalle"). No hay toast aparte. **`navigator.vibrate` no se usa en ningún lugar del repo** (grep confirmado).
- **Selector de talle:** `useSizeSelection` (`src/lib/product-selection.ts`) arranca siempre en el primer talle disponible de ESE producto — no hay memoria entre productos (ni `localStorage` ni contexto). `SizeGuide` (`src/components/SizeGuide.tsx`) es un modal con tabla de medidas + nota editable; ya contesta "¿estás entre dos talles?" en el pie de la tabla, pero solo si Anush cargó una nota distinta a la default.
- **Checkout WhatsApp (`src/app/carrito/CarritoClient.tsx`):** arma el mensaje con talle/plazo/subtotal, hace `fetch('/api/orders', {keepalive:true})` sin esperar respuesta, intenta `window.open(url, '_blank')` y si falla (bloqueado) hace `window.location.assign(url)` en la misma pestaña. Ya pregunta por el costo de envío en el propio mensaje (cambio de la auditoría 12/09). No hay botón "copiar mi pedido" como respaldo visible.
- **WhatsApp contextual:** existe SOLO para "avisame cuando vuelva" (`getRestockWhatsAppUrl`, nombra el producto) y para el mensaje del carrito (nombra cada producto + talle + link). El botón flotante genérico (`WhatsAppFloat.tsx`) manda siempre el mismo texto genérico ("tengo una consulta"), sin importar en qué ficha esté la clienta. Se oculta en `/admin`, `/carrito`, `/encargo` y `/ig`.
- **Prueba social:** no hay testimonios/reseñas de clientas en la ficha de producto (`ProductDetailsClient.tsx` no las muestra). Existe `/resena` (nuevo, sin revisar en detalle) y un bloque "Hecho por Anush" (maker bio) pendiente de texto de Anush.
- **Plazo:** ya resuelto en la auditoría 12/09 (`leadTimeMessage`, fecha concreta tipo "lista entre el X y el Y", junto al precio). No se repite acá salvo matices nuevos.
- **Encargo (`src/app/encargo/EncargoForm.tsx`):** un solo formulario largo (sin pasos/stepper de progreso), con recuperación ante fallo (WhatsApp prellenado si falla el submit), foco movido a la confirmación para lectores de pantalla, y opción de sumarse a lista VIP. `EncargosDisponibles` muestra cupos reales de producción.

---

*(Las ideas con evidencia se agregan abajo, en la sección "Ideas".)*

---

## Ideas

### 1. Swipe con `scroll-snap` en la galería principal del PDP (no solo miniaturas)

**Qué es:** que la foto principal de la ficha se pueda cambiar deslizando el dedo (swipe horizontal), además de tocando una miniatura, con un indicador de posición visible ("2/5" o puntos) en la vista principal (hoy ese contador solo existe dentro del lightbox).

**Evidencia:** Baymard Institute, *"Mobile Gestures: 40% of Sites Don't Support Pinch or Tap Gestures for Product Images"* (12/01/2016, benchmark cualitativo de 50 sitios top de e-commerce en EE.UU. + tests de usabilidad 1:1): *"los usuarios móviles casi universalmente usan el gesto de swipe al intentar navegar galerías de imágenes"* y *"en mobile, la suposición por defecto es que existen imágenes adicionales y se pueden ver deslizando, independientemente de si esa posibilidad está indicada"*. Es un hallazgo de 2016 pero sigue siendo la referencia citada en el research vigente de Baymard (su página de metodología *Mobile E-Commerce Usability Guidelines*, actualizada, sigue incluyendo "Product Image Gallery" con 8 guías como tema propio).

**Por qué aplica a Dahila:** ~70% del tráfico es mobile desde Instagram; la fotografía es gran parte de cómo se vende una prenda tejida (textura, punto, color real). Si el gesto esperado no funciona, Baymard documenta que el usuario simplemente no encuentra las fotos adicionales — no es una degradación menor, es contenido invisible.

**Qué existe hoy:** `src/components/ProductGallery.tsx` — una imagen principal (tap → abre el lightbox) + grilla de miniaturas debajo (tap para cambiar). Sin gesto de swipe ni `scroll-snap` en la vista principal. El proyecto ya usa `scroll-snap` en otras partes (riel de categorías y `RecentlyViewed.tsx`, `globals.css` líneas ~535-549), así que es un patrón conocido en el propio código, no una dependencia nueva.

**Impacto esperado:** Alto (es el gesto n.º1 esperado en mobile, según Baymard).

**Esfuerzo:** Bajo — envolver la imagen principal en un contenedor `overflow-x: auto; scroll-snap-type: x mandatory` con las imágenes en fila (mismo patrón CSS que ya existe en el repo) + un indicador de puntos que lea la posición de scroll. Sin librería nueva.

**Riesgos / trade-off:** hay que decidir si el swipe convive con el tap-to-zoom del lightbox (evitar que un swipe accidental abra o cierre el zoom). Probar en un dispositivo real antes de dar por terminado.

---

### 2. Pinch-to-zoom real en el lightbox (hoy es tap-to-center, no pinch)

**Qué es:** que el visor de pantalla completa responda al gesto de pellizcar con dos dedos (y honestamente, o double-tap), no solo a un tap que centra un zoom fijo de 2.2x en el punto tocado.

**Evidencia:** mismo estudio de Baymard (*Mobile Gestures*, 2016): *"en mobile, pinch-to-zoom y double-tap son los gestos esperados, así que la galería tiene que soportarlos en vez de encerrar la imagen en un marco fijo"*; ~40% de los sitios de su benchmark fallan en soportar el pinch/double-tap que los compradores buscan por instinto. Cita textual de un usuario del estudio: *"nunca compraría nada en una página así porque no puedo ver bien lo que estoy por comprar"*.

**Por qué aplica a Dahila:** el punto del crochet, la textura de la lana y el acabado de las costuras son justo el tipo de detalle que se evalúa por zoom — y es la clase de duda que hoy termina preguntándose por WhatsApp en vez de resolverse mirando la foto.

**Qué existe hoy:** `src/components/ProductLightbox.tsx` — un tap alterna entre 1x y 2.2x, centrado en el punto donde se tocó (`handleStageTap`), con un aviso textual "Tocá para ampliar" que desaparece. No hay gesto de dos dedos ni double-tap real. El `<div>` del stage tiene `touchAction: 'manipulation'`, que **permite** pinch-zoom nativo del navegador (no lo bloquea, a diferencia de `touch-action: none`) — pero no hay ninguna señal en la interfaz de que ese pinch nativo esté disponible, y convive sin coordinación con el zoom-por-tap custom. Falta confirmar en un dispositivo real si el pinch nativo efectivamente funciona ahí (no se puede verificar sin dispositivo en esta investigación de solo lectura).

**Impacto esperado:** Medio-alto.

**Esfuerzo:** Medio — la ruta más barata es NO escribir un gestor de gestos a mano: confirmar que nada bloquea el pinch nativo del navegador (auditar `touch-action` y el `viewport` — hoy `src/app/layout.tsx` no fija `maximumScale` ni `userScalable: false`, así que el pinch de página no está deshabilitado a nivel global) y sumar double-tap-to-zoom con una detección simple de dos taps seguidos. Evitar reinventar pinch con `touch` events a mano: es la parte más propensa a bugs.

**Riesgos / trade-off:** si se apoya en el pinch nativo del navegador, hay que probar que no zoombee accidentalmente toda la página (scrim, botones) en vez de solo la imagen — por eso Baymard recomienda que la galería “no encierre la imagen en un marco fijo” que compita con el zoom nativo.

---

### 3. `window.open()` debe llamarse ANTES del `await` del cupón, no después

**Qué es:** un bug de timing, no una microinteracción nueva: en `handleCheckout` (carrito), cuando hay un cupón con descuento, el código hace `await fetch('/api/coupon', ...)` **antes** de llamar a `window.open(url, '_blank')`. En navegadores WebKit (Safari iOS, y el navegador embebido de Instagram en iOS que usa el mismo motor) cualquier demora asíncrona entre el toque y el `window.open` puede hacer que el navegador ya no lo considere una acción directa del usuario y bloquee la ventana.

**Evidencia:**
- Don't Panic Labs, *"Understanding window.open() Behavior on iOS Safari"* (29/07/2025): mide el comportamiento real por navegador — Safari iOS deja pasar `window.open()` con hasta ~0,5 s de demora asíncrona, pero lo bloquea a partir de 1 s; Chrome/Firefox de escritorio toleran más. Recomendación textual: *"llamar `window.open()` al principio de la función, antes de que corra cualquier otro código"*, y recién después navegar esa ventana ya abierta (`popup.location.href = url`) cuando termina la llamada async.
- WICG Discourse, *"User-gesture restrictions and async code"* y foro de Apple Developer (`developer.apple.com/forums/thread/747036`): confirman que el mecanismo (*transient activation*) es más estricto en WebKit/iOS que en Chromium, y que resolver una Promise antes de abrir la ventana es la causa típica del bloqueo.

**Por qué aplica a Dahila:** el checkout ES por WhatsApp — si `window.open` se bloquea, hoy el código ya tiene un fallback (`if (!win) window.location.assign(url)`), así que no se pierde la venta, pero sí se pierde la pestaña nueva (navega en la misma, perdiendo el carrito de vuelta) y en algunos casos puede tardar un instante en notarse. El navegador embebido de Instagram en iOS es un WKWebView (mismo motor que Safari), así que hereda esta restricción — es exactamente la superficie con más tráfico del sitio.

**Qué existe hoy:** `src/app/carrito/CarritoClient.tsx`, función `handleCheckout` (líneas ~219-288): el `await fetch('/api/coupon', ...)` del canje del cupón ocurre antes de construir la URL y llamar a `window.open`. El registro de la venta (`fetch('/api/orders', {keepalive:true})`) SÍ está bien resuelto: no se espera (`.catch()` sin `await`), así que no es la causa del problema — el problema es específicamente el `await` del cupón.

**Impacto esperado:** Medio (solo afecta al subconjunto de compras con cupón aplicado, pero cuando ocurre, empeora la experiencia justo en el paso más crítico).

**Esfuerzo:** Bajo — reordenar: abrir una ventana en blanco (`window.open('', '_blank')`) de forma síncrona apenas se toca el botón, seguir con el `await` del cupón, y al final asignar `popup.location.href = url` (con el mismo fallback `if (!popup) window.location.assign(url)` que ya existe). Es un cambio acotado a una función.

**Riesgos / trade-off:** abrir una ventana en blanco y navegarla después puede mostrar un parpadeo en blanco de una fracción de segundo en algunos navegadores; es preferible a que quede bloqueada.

---

### 4. Fallback visible ("copiar mi pedido") cuando el navegador es el in-app de Instagram

**Qué es:** un enlace secundario, discreto, que aparece SOLO cuando se detecta el navegador embebido de Instagram (o cuando `window.open`/la navegación a WhatsApp no ocurrió tras varios segundos), y que copia el texto del pedido al portapapeles con instrucciones ("Pegalo en WhatsApp") como red de contención.

**Evidencia:** es un problema ampliamente reportado por la industria (no hay un paper académico específico, así que se marca ⚠️ evidencia de fuentes técnicas/vendors, no investigación académica): múltiples fuentes técnicas (Flyn, u2l.ai, chottulink.com — todas ⚠️ agencias/herramientas de deep-linking con interés comercial en el tema) coinciden en el mecanismo: *"cuando alguien toca un link dentro de Instagram, la plataforma lo carga en su propio navegador interno en vez de pasarlo a Safari o Chrome, lo que suprime el traspaso a nivel de sistema operativo del que dependen los Universal Links/App Links"*, y que *"el navegador embebido de Meta en iOS bloquea los lanzamientos automáticos de apps, y ningún servicio lo evita de forma confiable"*. La única solución que reportan como consistentemente efectiva es que la propia persona use el menú de opciones del navegador embebido ("Abrir en el navegador externo") — algo que no se puede automatizar.

**Por qué aplica a Dahila:** es exactamente el escenario de la hipótesis 4 de la auditoría 12/09/2026 ("Instagram corta el salto a WhatsApp"), que quedó sin resolver porque falta el dato real (la prueba de Mati desde el link de la bio). Un fallback visible es la mitigación razonable mientras no hay ese dato.

**Qué existe hoy:** nada — `handleCheckout` intenta `window.open` y cae a `window.location.assign` en la misma pestaña si falla, pero no hay ningún mensaje ni opción de copiar el pedido si la persona queda mirando la página de wa.me sin que abra la app.

**Impacto esperado:** Medio-alto SI la hipótesis 4 se confirma (una vez que Mati haga la prueba real en iPhone/Android); potencialmente bajo si en la práctica el salto ya funciona bien.

**Esfuerzo:** Medio — detectar el user-agent de Instagram (`navigator.userAgent.includes('Instagram')`, técnica estándar y bien documentada aunque no oficial) para decidir cuándo mostrar el fallback de entrada, más un botón "Copiar mi pedido" con `navigator.clipboard.writeText` (con su propio fallback de `document.execCommand('copy')` para contextos no seguros) y confirmación visible.

**Riesgos / trade-off:** No inventar un patrón oscuro: el fallback debe ser una opción discreta, no un bloqueo ni un pop-up. Depende de la prueba real de Mati para saber si de verdad hace falta (evitar construir una solución para un problema no confirmado en este sitio).

---

### 5. Vibración táctil (`navigator.vibrate`) al agregar al carrito — evaluar con cautela

**Qué es:** un pulso breve de vibración (feature-detected, sin bloquear nada si no existe) al tocar "Agregar al carrito", como refuerzo táctil de la confirmación visual que ya existe.

**Evidencia:** MDN (`developer.mozilla.org/.../Navigator/vibrate`) y caniuse (`caniuse.com/mdn-api_navigator_vibrate`), consultados 13/09/2026: **Safari/WebKit en iOS NO soporta la Vibration API** — es la posición oficial y estable de la documentación. Hay un reporte aislado en un issue de `mdn/browser-compat-data` (marzo 2026) de que "parece funcionar en iOS Safari ahora", pero el propio reportante aclara que no está seguro de cuándo empezó y que no lo había probado desde 2023 — no es evidencia sólida de soporte real, y no cambia la recomendación de tratarlo como no soportado en iOS. En Android Chrome/Samsung Internet sí funciona (soportado desde Chrome 30+). Sobre buenas prácticas de uso (⚠️ fuentes de blogs técnicos, no papers): vibraciones cortas (50-200 ms), nunca como único canal de feedback (siempre acompañado de algo visual), y debe dispararse dentro del gesto del usuario (no en un callback async tardío).

**Por qué aplica a Dahila:** el feedback visual de "✓ Agregado" y el badge del carrito (`cart-badge-pop`, ya animado) ya cumplen la recomendación de NN/g de tener una confirmación persistente y visible — la vibración sería un refuerzo adicional, no un reemplazo, y solo se sentiría en la parte Android del tráfico (no hay dato propio de Dahila sobre el split iOS/Android; no inventarlo).

**Qué existe hoy:** no se usa `navigator.vibrate` en ningún archivo del repo (confirmado por búsqueda). El feedback actual (cambio de texto del botón + animación del badge del header) ya es sólido.

**Impacto esperado:** Bajo — es un refuerzo sensorial menor sobre un feedback que ya funciona bien, y no llega a buena parte del tráfico (iOS).

**Esfuerzo:** Bajo (una función `try { navigator.vibrate?.(40) } catch {}` en el handler de agregar).

**Riesgos / trade-off:** ninguno serio si se implementa como no-op silencioso en iOS; el principal riesgo es sobrestimar el impacto — dado que gran parte del tráfico probablemente sea iOS (no confirmado con datos propios), el beneficio real puede ser chico. Por eso no entra en el top-8.

---

### 6. Recordar el talle elegido entre productos

**Qué es:** que si alguien elige "M" en un producto, el selector de talle de la siguiente prenda que mire arranque en "M" (cuando esa prenda tenga talle M disponible), en vez de reiniciar siempre en el primer talle disponible.

**Evidencia:** no hay un estudio específico de Baymard/NN sobre "recordar talle entre productos" (se dice explícitamente: no se encontró evidencia dedicada a este punto exacto). Lo que sí hay, y es sólido: Baymard, *"Apparel: 10 Best Practices on Sizing"* — el 83% de los sitios de e-commerce en desktop y el 87% en mobile fallan en dar información de talle suficiente, y la incertidumbre de talle es una causa común de abandono en los tests de usabilidad de apparel. Y el heurístico clásico de usabilidad de Nielsen ("reconocer en vez de recordar" / minimizar la carga de memoria del usuario) respalda por qué repetir una elección ya hecha genera fricción innecesaria — no es evidencia de conversión medida, es un principio de usabilidad establecido.

**Por qué aplica a Dahila:** quien navega varias prendas de la misma categoría (sweaters, cardigans) hoy vuelve a tocar el talle en cada ficha nueva — un detalle chico pero repetido muchas veces en una sesión de compra por catálogo.

**Qué existe hoy:** `src/lib/product-selection.ts` (`useSizeSelection`) arranca siempre en el primer talle disponible de ESE producto (estado local del componente); no hay memoria entre productos ni en `localStorage` ni en contexto compartido.

**Impacto esperado:** Bajo-medio (ahorra un toque, no resuelve una duda).

**Esfuerzo:** Bajo — guardar el último talle elegido en `localStorage` (o el contexto de carrito) y usarlo como default en `useSizeSelection` SOLO si ese talle existe y está disponible en el producto nuevo; si no, mantener el comportamiento actual (primer disponible).

**Riesgos / trade-off:** los talles no son comparables entre categorías (un bolso es "Único", un sweater es S/M/L) — hay que aplicarlo solo cuando el talle recordado exista literalmente entre las opciones del producto nuevo, para no arrastrar una elección que no tiene sentido.

---

### 7. Prueba social real cerca del botón de compra — condicionada a tener contenido genuino

**Qué es:** un bloque compacto con 1-3 testimonios reales (texto y, si existen, fotos de clientas) cerca del CTA de "Agregar al carrito", no un carrusel de reseñas genérico.

**Evidencia:** Spiegel Research Center (Northwestern University) + PowerReviews, *"How Online Reviews Influence Sales"* (2017, estudio con datos de compra reales de tres retailers online): la conversión de una página con 5 reseñas es, en promedio, 270% más alta que una sin ninguna; el beneficio marginal decae rápido después de las primeras 5; en productos de precio más alto el efecto es mayor (380% vs 190% en productos de precio bajo); la probabilidad de compra es más alta con calificaciones entre 4,0 y 4,7 (no 5,0 exactas, que a veces se perciben como poco creíbles). Aparte, Baymard (test de usabilidad, sin fecha específica de esta cifra) reporta que el 95% de los usuarios se apoyan en reseñas para evaluar productos.

**Por qué aplica a Dahila:** los precios de Dahila son medios-altos para ropa de tejido a mano (según `PRICE_TABLE`), justo el rango donde el estudio de Spiegel encuentra el mayor efecto (380%). Pero esto es condicional: la regla del propio pedido de esta investigación prohíbe reseñas elegidas o incentivadas — así que la idea solo es válida si Anush junta testimonios genuinos (por ejemplo, capturas de conversaciones reales de WhatsApp con permiso, o lo que sea que esté juntando en `/resena`, que no se revisó en profundidad en esta investigación de solo lectura).

**Qué existe hoy:** `ProductDetailsClient.tsx` no muestra testimonios ni reseñas — el "trust strip" actual es genérico (envío, hecho a mano, WhatsApp). Existe una ruta `/resena` (nueva, sin revisar el detalle de su función) y un bloque "Hecho por Anush" (maker bio) pendiente de texto real de Anush. No hay reseñas en el código ni en la base, según lo leído.

**Impacto esperado:** Alto SI hay contenido real disponible; nulo si no lo hay (no se puede fabricar).

**Esfuerzo:** Medio (depende de cuánto contenido real ya exista o haya que juntar — es más un tema de contenido/proceso que de código).

**Riesgos / trade-off:** el mayor riesgo es la tentación de rellenar con reseñas no genuinas, algo explícitamente prohibido por esta investigación y por la ética de la marca. Si no hay testimonios reales todavía, esta idea queda en espera, no se implementa a medias.

---

### 8. Skeleton screens ya alineados con la evidencia — nota de validación, no una tarea nueva

**Qué es:** no es una idea nueva, es una confirmación: el esqueleto de carga del carrito (ya implementado en la auditoría 12/09 para arreglar el CLS) también resulta ser la técnica correcta según la investigación de percepción de espera.

**Evidencia:** LogRocket / investigación de percepción de carga (⚠️ blog técnico, no paper académico primario, pero citando el patrón de uso extendido en la industria y respaldado conceptualmente por trabajos de Nielsen sobre tiempos de respuesta): los skeleton screens reducen la espera percibida entre ~20-30% frente a un spinner tradicional, y la recomendación de uso es: sin indicador si la carga dura menos de 100 ms, un spinner chico entre 100-400 ms, un skeleton entre 400 ms y 3 s, y skeleton + indicador de progreso arriba de 3 s.

**Por qué aplica a Dahila:** el carrito (`CarritoClient.tsx`) ya usa un esqueleto con altura reservada mientras `CartProvider` resuelve el fetch — coincide con la ventana recomendada (400 ms-3 s) para ese tipo de espera.

**Qué existe hoy:** ya aplicado — no requiere trabajo nuevo. Se incluye acá solo para que quede registrado que la solución de CLS de la auditoría anterior también es, de forma independiente, la práctica correcta de percepción de carga.

**Impacto esperado:** N/A (ya hecho).
**Esfuerzo:** N/A.

---

### 9. Botón de WhatsApp flotante contextual en la ficha de producto

**Qué es:** que el botón flotante de WhatsApp (`WhatsAppFloat.tsx`), cuando la persona está mirando una ficha de producto, mande un mensaje que ya nombre esa prenda (y el talle si hay uno elegido) en vez del texto genérico fijo ("tengo una consulta").

**Evidencia:** no hay un estudio académico específico sobre el efecto de personalizar el mensaje de un botón flotante de WhatsApp (se marca ⚠️ explícitamente: las fuentes encontradas son todas de agencias/herramientas de marketing conversacional — ActiveCampaign, Infobip, AiChat — con interés comercial directo en vender herramientas de WhatsApp). Esas fuentes coinciden en recomendar *"evitar mensajes genéricos como 'Hola, quiero más información'"* y *"alinear el mensaje prellenado con lo que la persona ya estaba mirando"*. El respaldo más sólido no es de esas fuentes sino de NN/g (ya citado en la evidencia de formularios): prellenar campos con contexto que el usuario ya dio reduce el abandono — el mismo principio aplicado a un mensaje de chat en vez de un campo de formulario.

**Por qué aplica a Dahila:** el propio código ya aplica exactamente este principio en otros dos lugares — el mensaje de "avisame cuando vuelva" (`getRestockWhatsAppUrl`, nombra el producto) y el mensaje del carrito (nombra cada prenda + talle + link) — así que ya es un patrón validado internamente; falta aplicarlo al botón flotante genérico cuando la página activa es una ficha de producto.

**Qué existe hoy:** `src/components/WhatsAppFloat.tsx` recibe solo `enabled` y `waUrl` desde el layout raíz (server-side), sin contexto de página — su mensaje es siempre el mismo texto fijo. Se oculta ya en `/admin`, `/carrito`, `/encargo` y `/ig`, pero permanece genérico en `/tienda/[slug]`.

**Impacto esperado:** Bajo-medio (afecta solo a quien prefiere preguntar antes de agregar al carrito, un subconjunto del tráfico de ficha).

**Esfuerzo:** Bajo-medio — pasar el nombre del producto (y opcionalmente el talle activo) desde `ProductDetailsClient` hacia el botón flotante cuando la ruta es `/tienda/[slug]` (por ejemplo, vía un contexto compartido o pasando el mensaje como prop condicional en el layout de esa ruta).

**Riesgos / trade-off:** evidencia débil (fuentes ⚠️ con interés comercial) — es una mejora de sentido común más que un hallazgo medido; priorizar solo si el esfuerzo real resulta bajo.

---

### 10. El mensaje de WhatsApp del carrito puede acercarse al límite práctico de largo

**Qué es:** un chequeo de riesgo, no una microinteracción: revisar que el mensaje armado por `buildWhatsAppMessage` (en `CarritoClient.tsx`) no se acerque al límite práctico de longitud de un mensaje de WhatsApp con carritos grandes (varias prendas, cada una con nombre + talle + cantidad + precio + link).

**Evidencia:** ⚠️ fuentes de blogs de herramientas de WhatsApp (wa.expert, typecount — no hay documentación oficial de Meta sobre un límite de caracteres para el parámetro `?text=` de `wa.me`), que reportan de forma consistente que mensajes por encima de ~1000 caracteres tienden a truncarse en la interfaz antes de enviarse, aunque la URL en sí podría llegar a 8000 caracteres. No es un dato oficial de Meta — se marca como evidencia débil.

**Por qué aplica a Dahila:** cada línea de producto en el mensaje actual son ~5-6 líneas (nombre, talle, cantidad, en-stock opcional, precio con descuento opcional, subtotal, link). Con 4-5 prendas distintas en el carrito ya se acerca a varios cientos de caracteres.

**Qué existe hoy:** `buildWhatsAppMessage` en `CarritoClient.tsx` no tiene ningún límite ni recorte — genera todo el detalle para cada ítem sin tope.

**Impacto esperado:** Bajo (los carritos de una tienda chica de tejido a mano probablemente no acumulan muchos ítems distintos, pero no hay dato propio para confirmar el tamaño típico de carrito).

**Esfuerzo:** Bajo (si se decide actuar: acortar el detalle por ítem cuando hay muchos, o quitar el link individual cuando el carrito supera cierto número de líneas).

**Riesgos / trade-off:** evidencia débil y probablemente bajo impacto real — se documenta como advertencia, no se recomienda como prioridad.

---

### 11. Ya validado por evidencia: favoritos, vistos recientemente y vista rápida

**Qué es:** no son ideas nuevas — quedan documentadas acá porque la investigación pedía revisar "favoritos" y "vistos recientemente" como posibles microinteracciones, y ambas ya están construidas y alineadas con la evidencia encontrada.

**Evidencia:**
- Sobre "recently viewed": los widgets de este tipo aparecen en gran parte de los catálogos de e-commerce y el clic en una recomendación de este tipo convierte notablemente mejor que el tráfico general (⚠️ estadísticas de agregadores de e-commerce, no un paper único — cifras exactas varían por fuente y no se citan números puntuales por esa razón). La práctica recomendada es ubicarlo al final de la página de producto.
- Sobre "quick view": Baymard, *blog "Provide Quick Views for Visually Driven Products"*: quick views funcionan bien específicamente para productos donde la decisión es visual (como ropa) y reducen la cantidad de idas y vueltas a la ficha completa — es exactamente el caso de Dahila.

**Qué existe hoy:**
- `src/components/RecentlyViewed.tsx`: tira con scroll-snap, ubicada al final del PDP (`ProductDetailsClient.tsx`), 100% local (`localStorage`), sin backend ni tracking — coincide con la práctica recomendada de ubicación.
- `src/components/FavoriteButton.tsx` + `/favoritos`: ya existe, con vista rápida real desde la auditoría 12/09.
- `src/components/QuickViewModal.tsx`: ya existe, con foto, precio, talle y WhatsApp contextual — el tipo de implementación que Baymard identifica como la que funciona bien en categorías visuales.

**Impacto esperado / esfuerzo:** N/A — no hay nada que cambiar, se incluye para que quede registrado que no hace falta rehacer nada acá.

---

## Top-8 (ordenado por impacto × confianza de la evidencia ÷ esfuerzo)

1. **`window.open()` antes del `await` del cupón (idea 3).** Evidencia técnica sólida y específica (WebKit/iOS), esfuerzo bajo, corrige un bug real de timing en el paso más crítico del sitio (el toque que manda el pedido).
2. **Swipe con `scroll-snap` en la galería principal (idea 1).** Evidencia Baymard fuerte y consistente en el tiempo, esfuerzo bajo (patrón ya usado en el propio repo), afecta a como se evalúa cada prenda antes de decidir.
3. **Recordar el talle elegido entre productos (idea 6).** Esfuerzo bajo, evidencia de respaldo razonable (principio de usabilidad + tamaño real del problema de sizing en apparel), fricción chica pero repetida muchas veces por sesión.
4. **Fallback "copiar mi pedido" para el navegador de Instagram (idea 4).** Impacto potencialmente alto si se confirma la hipótesis 4 de la auditoría anterior; esfuerzo medio; depende de que Mati haga la prueba real primero para no resolver un problema no confirmado.
5. **Pinch-to-zoom real en el lightbox (idea 2).** Evidencia Baymard fuerte, pero esfuerzo medio y con una parte que depende de confirmar en dispositivo real (no se puede cerrar del todo en una investigación de solo lectura).
6. **Prueba social real cerca del CTA (idea 7).** Impacto potencialmente alto (evidencia de Spiegel Research Center, más fuerte en precios altos como los de Dahila) pero condicionado por completo a que exista contenido genuino — no se puede fabricar ni incentivar.
7. **Botón de WhatsApp flotante contextual en la ficha (idea 9).** Esfuerzo bajo-medio, coherente con un patrón que el propio código ya usa en otros dos lugares, pero la evidencia externa específica es débil (fuentes ⚠️ con interés comercial).
8. **Vibración táctil al agregar al carrito (idea 5).** Esfuerzo mínimo y sin riesgo (no-op en iOS), pero impacto bajo y alcance incierto (no hay dato propio del split iOS/Android de Dahila).

**Fuera del top-8 pero documentado:** el chequeo de largo del mensaje de WhatsApp (idea 10, bajo impacto/evidencia débil) y las confirmaciones de que skeleton screens (idea 8), favoritos/vistos recientemente/quick view (idea 11) ya están bien resueltos y no necesitan trabajo nuevo.
