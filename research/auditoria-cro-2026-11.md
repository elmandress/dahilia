# Auditoría CRO / UX móvil — 04/11/2026

Alcance: `/colecciones/sunset-26`, `/tienda/manguitas-tramonto`, `/tienda/poncho-ete`, `/tienda`, `/carrito`, `/` y `/ig`, en el celular.
Método: leí el código (rutas y componentes citados con archivo:línea), navegué producción con Playwright en un iPhone 13 (390×844) y leí datos públicos de la base, solo lectura. Las imágenes se reemplazaron por un GIF de 1 px, así que en las capturas las fotos se ven como bloques beige. El carrito se simuló con `/api/cart` interceptado y todo POST a `/api/*` se respondió con 204. No se escribió nada en producción (el único POST real que intentó salir fue `/api/orders`, y quedó bloqueado). Los píxeles y la analítica también se bloquearon.

Capturas: `C:\Users\mati\AppData\Local\Temp\claude\c--Users-mati-Downloads-dahilia\a19b3bf8-59c7-432b-bb7a-f8235c73bcfe\scratchpad\cro\` (los nombres se citan abajo, por ejemplo `manguitas-1.png`).

Contexto que pesa: el 75 % del tráfico viene de Instagram y casi todo desde iPhone. De la colección, ~41 % abre una prenda. De las fichas, 0–2 % agrega al carrito. El drop Sunset '26 tiene 4 piezas, todas en stock y con −15 %.

---

## (a) Top 10 cambios, ordenados por impacto y esfuerzo

| # | Cambio | Impacto | Esfuerzo | Quién |
|---|---|---|---|---|
| 1 | Sacar o actualizar el aviso **"Por demanda, los pedidos estarán listos en noviembre"**. Hoy aparece arriba de `/tienda` y en "Nuevo" de la home, al lado de 4 prendas que dicen "En stock". Ya es noviembre y el texto contradice el drop. | Alto | 2 min | **Anush** |
| 2 | **Barra de promoción** con el drop: hoy dice "Hecho a mano en Uruguay · Envío a todo el país · A medida" en todas las páginas. Quien entra desde IG a cualquier URL no se entera de que hay −15 % en stock. | Alto | 2 min | **Anush** |
| 3 | **Ficha en el celular: el nombre, el precio y el botón aparecen recién a 1,4–1,5 pantallas.** La barra fija de "Agregar" solo entra *después* de pasar el botón, así que en el primer pantallazo y medio no hay ninguna llamada a la acción. | Alto | Bajo | Código |
| 4 | **Envío dicho con números y con "lo pagás al recibir".** Hoy el carrito dice "El costo exacto te lo paso por WhatsApp" (es la objeción n.º 1 de abandono, Baymard). Además, si Anush carga un monto, el código imprime "Se suma al total", que es falso porque el envío se paga al recibir. | Alto | Bajo | Anush (dato) + Código (frase) |
| 5 | **"Hecho por Anush" no aparece en ninguna ficha**: `maker_bio` está vacío en la base. Es la señal de confianza más barata para una marca artesanal y hoy la ficha no tiene ni cara ni nombre. | Alto | 10 min | **Anush** |
| 6 | **Colección del anuncio: la primera prenda está a 1,28 pantallas.** La portada, la descripción y los 3 pasos ocupan todo el primer pantallazo, y quien viene del anuncio ve texto, no prendas. | Alto | Bajo | Código |
| 7 | **Checkout en 3 toques en vez de 2.** El cajón del carrito obliga a pasar por `/carrito` ("Ver carrito y coordinar"), y la barra fija de `/carrito` dice solo "COORDINAR", sin el "no pagás nada ahora" al lado. | Medio-alto | Medio | Código |
| 8 | **Poncho y bolsos sin categoría**: por eso "Completá el look" de las manguitas sugiere el BEACH set y el Set LUREX y no los bolsos Margot del mismo drop. Con un bolso, la manguita llega a $3.570, cerca del envío gratis ($4.500). | Medio | 5 min | **Anush** |
| 9 | **`/ig` (la bio) dice "Próximo drop"** con el drop abierto desde el 28/10. "Lo nuevo" no muestra las manguitas (la prenda del reel y del anuncio) y no muestra el precio tachado. | Medio | Bajo | Código + Anush ("Fijar en la bio") |
| 10 | **Talles confusos**: las manguitas ("Talle único") muestran "¿Qué talle soy?" y "A medida". La guía del poncho recomienda S/M/L, pero sus talles son "XS/S" y "M/L", así que la recomendación no se puede tocar. Ninguna ficha del drop tiene medidas de la prenda. | Medio | Bajo (código) + 20 min (Anush, medidas) | Código + Anush |

Fuera del top (detalle abajo): hay textos viejos del drop en la home, el botón "Ver Colección" de la portada lleva a `/tienda`, el H1 de `/tienda` es "Colección", el precio del poncho queda en $1.607, la primera visita a la colección después de 5 minutos tarda 1,4–3,8 s, el testimonio de la ficha habla de otra prenda y el −15 % no tiene fecha de fin.

---

## (b) Detalle por página

### 1. `/colecciones/sunset-26` (donde aterriza el anuncio)

Capturas: `coleccion-1.png`, `coleccion-2.png`, `coleccion-3.png`, `coleccion-full.png`.

**Qué ve la clienta:** la cinta negra, el header, el breadcrumb, una portada de 260–420 px con "Sunset '26", la descripción en cursiva de 4 líneas y el paso "1. Elegís tu pieza". Ninguna prenda ni ningún precio. Las tarjetas empiezan a **1,28 pantallas** (bolsos) y **1,85** (poncho y manguitas), medido con Playwright.

| Hallazgo | Evidencia | Impacto | Esfuerzo | Resuelve |
|---|---|---|---|---|
| Ninguna prenda en el primer pantallazo. Quien viene de un anuncio de producto espera ver producto (Baymard: en mobile el contenido del listado tiene que asomar arriba). | `colecciones/[slug]/page.tsx:155` (portada `clamp(260px, 42vh, 420px)`), `:174` (descripción), `:185-198` (3 pasos en tarjetas de ~90 px cada una) | Alto | Bajo | Código |
| Arreglo propuesto: en `max-width:720px`, bajar la portada a ~28vh, cortar la descripción a 2 líneas con "Leer más" y pasar los 3 pasos a **una sola línea** debajo de la primera fila de prendas (por ejemplo: "Agregás · lo pedís por WhatsApp · pagás cuando confirmamos"). El paso a paso hoy suma ~0,75 pantallas antes de las prendas. | ídem | | | |
| La portada no dice lo que vende el drop: falta "4 piezas · en stock · −15 %". El −15 % solo se descubre en las tarjetas. | `:161-164` | Medio | Bajo | Código (subtítulo calculado: cantidad de prendas, `isReadyToShip`, descuento máximo) |
| El paso 3 dice "te la enviamos a todo Uruguay", pero no dice quién paga el envío ni cómo. | `:23` | Medio | Bajo | Código (texto) |
| `revalidate = 300`: la primera visita después de que vence la caché tarda. Medí un TTFB de 3,8 s (Playwright) y de 1,4 s / 2,9 s (curl) contra 0,2–0,4 s en caliente. Es la página de destino de un anuncio pago. | `:18`; los headers dieron `Cache-Status: hit; ttl=-13` | Medio | Bajo | Código (pasar a 3600, como la ficha, y revalidar al guardar desde el admin) |
| La burbuja flotante de WhatsApp tapa la tarjeta del paso 1. | `coleccion-1.png` | Bajo | — | — |
| Bien resuelto: las tarjetas muestran −15 %, precio final en rojo y tachado, "En stock" y material (`ProductCard.tsx:126-247`). Las reseñas reales van después de la grilla. | `coleccion-2.png`, `-3.png` | | | |

### 2. `/tienda/manguitas-tramonto` (la prenda del anuncio)

Capturas: `manguitas-1.png` (primer pantallazo), `manguitas-2.png`, `manguitas-3.png`, `manguitas-drawer.png`.

**Qué ve la clienta:** el primer pantallazo es **solo la foto** (más la cinta, el header y el breadcrumb). El nombre, el precio, "En stock" y el botón están a **1,54 pantallas**. La barra fija aparece recién cuando el botón ya pasó para arriba (`stickyVisible: true` solo después de scrollear 1.400 px).

| Hallazgo | Evidencia | Impacto | Esfuerzo | Resuelve |
|---|---|---|---|---|
| **No hay ninguna llamada a la acción durante 1,5 pantallas.** La barra fija se escondió el 12/10 porque "tapaba el nombre y el precio en la primera pantalla", pero en un iPhone ese nombre y ese precio ni siquiera están en la primera pantalla. Hoy la barra aparece solo si `boundingClientRect.top < 0`, o sea después de pasar el botón. | `ProductDetailsClient.tsx:115-123` (línea 119), `globals.css:499-504`, `manguitas-1.png` | Alto | Bajo | Código: mostrar la barra cuando el botón principal **no está a la vista, en cualquier dirección** (quitar `&& top < 0`). La barra ya trae nombre y precio, así que justamente cubre lo que falta. |
| El breadcrumb "INICIO / TIENDA / TOPS / MANGUITAS TRAMONTO" ocupa ~60 px del primer pantallazo y no ayuda a quien viene de IG. | `ProductDetailsClient.tsx:202-207` | Bajo-medio | Bajo | Código (ocultarlo en mobile o bajarlo debajo del bloque de compra) |
| Muestra "TALLE · ¿Qué talle soy? · [Talle único] · [A medida]" en una pieza de talle único. Abrir una guía de talles para algo que no tiene talle genera duda donde no la hay. Pasa porque la base tiene una fila de talle "Talle único", y el código lo trata como si tuviera talles. | `ProductDetailsClient.tsx:361` (`sizes.length > 0`), `manguitas-2.png` | Medio | Bajo | Código: tratar como talle único si la única fila es "Único/Talle único". Mostrar "Talle único · le queda a …" con la medida que cargue Anush. |
| La descripción no explica qué son ni cómo se usan las manguitas ("La pieza protagonista para levantar cualquier outfit básico…"). Faltan: si viene el par, medidas (largo, contorno), cómo se ponen y con qué. Para una prenda poco conocida, esa es LA objeción. | Base: `products.description`; `manguitas-2.png` | Alto | 15 min | **Anush** (ver la sección c) |
| El testimonio pegado al botón dice "El sweater superó mis expectativas", que habla de otra prenda. Hay 15 testimonios y ninguno tiene foto ni habla del drop. | `page.tsx:684-701` (`pickTestimonial`, cae al azar por slug), `manguitas-2.png` | Bajo-medio | — | Anush: pedirles a las primeras clientas del drop una foto y una frase (sin descuento a cambio) y cargarlas con `product_id` |
| **No aparece "Hecho por Anush"**: el bloque existe, pero solo se muestra si `maker_bio` tiene texto, y en la base está vacío. Tampoco hay foto. | `ProductDetailsClient.tsx:723`; settings `maker_bio=""`, `maker_photo_url=""` | Alto | 10 min | **Anush** |
| "Completá el look" sugiere el BEACH set ($2.520) y el Set LUREX ($2.100), dos sets de otra temporada, en vez de los bolsos Margot del drop ($1.360). Causa: los bolsos y el poncho tienen `category_id = null` y el filtro de complementos exige categoría. | `tienda/[slug]/page.tsx:437-438`; base: `bolso-margot-*` y `poncho-ete` sin categoría; `manguitas-3.png` | Medio | 5 min | **Anush** |
| Bajo el botón conviven 4 enlaces secundarios (dudas por WhatsApp, regalo, favoritos y compartir, Pinterest) antes de la descripción. En una pieza en stock, el de tarjeta de regalo y el de Pinterest compiten con el botón. | `:542-579`, `:713-720` | Bajo | Bajo | Código (el de regalo solo en piezas con talles reales; Pinterest abajo) |
| Bien resuelto: el precio con tachado y −15 %, la línea "En stock: sale sin la espera de los encargos", la tira de confianza junto al botón con "Pagás recién al confirmar", "Lleva unas 8 horas de tejido a mano" y la línea de pagos. | `manguitas-2.png`, `-3.png` | | | |

**Al tocar "Agregar al carrito"** se abre el cajón (`manguitas-drawer.png`): total $2.210, "Te faltan UYU 2.290 para el envío gratis", "Coordinás envío y pago con Anush por WhatsApp" y el botón **"VER CARRITO Y COORDINAR"**, que lleva a otra página y no a WhatsApp. Las sugerencias son Pulseras Terra, Mini bufandas y Bufanda Sophie, en vez del bolso del drop (mismo problema de categoría).

### 3. `/tienda/poncho-ete`

Capturas: `poncho-1.png`, `poncho-2.png`, `poncho-3.png`.

| Hallazgo | Evidencia | Impacto | Esfuerzo | Resuelve |
|---|---|---|---|---|
| El botón está a 1,41 pantallas y la barra tampoco aparece antes (mismo caso que las manguitas). | Playwright `buyBlock.screens = 1.41` | Alto | Bajo | Código (#3) |
| El talle **XS/S viene preseleccionado** (`aria-pressed=true`) y la barra fija dice "Talle XS/S". Baymard: preseleccionar talle en ropa genera pedidos con el talle equivocado y tapa la decisión. Acá lo corrige Anush por WhatsApp, pero es fricción y confusión evitable. | `lib/product-selection.ts:53` (`firstAvailable`); `poncho-2.png` | Medio | Bajo | Código: con 2+ talles disponibles, sin talle elegido y con "Elegí tu talle" en el botón (hay que validar que no rompa `?talle=` ni el talle recordado) |
| **"¿Qué talle soy?" no sirve para el poncho**: la tabla es de cuerpo (busto, cintura y cadera, XS–XL) y el botón "Elegir este talle" compara `"S" === "XS/S"`, que nunca coincide. La clienta recibe una recomendación que no puede tocar. | `SizeGuide.tsx:13-18`, `:61`; `ProductDetailsClient.tsx:372-375` | Medio | Bajo | Código (mapear XS y S a "XS/S", M y L a "M/L") |
| Sin medidas de la prenda: largo y ancho por talle. En un poncho, el largo es lo que define cómo queda. | `products.description` | Medio | 15 min | **Anush** |
| El precio con descuento queda en **UYU 1.607** (1.890 × 0,85 = 1.606,5). Es un número raro al lado de $1.360 y $2.210 y parece un error de cálculo. | `poncho-2.png` | Bajo | 2 min | **Anush** decide si redondea (el precio lo define ella, no lo propongo yo) |
| La descripción tiene un error: "para las tarde" → "para las tardes". | `products.description` | Bajo | 1 min | **Anush** |
| No tiene categoría, así que el breadcrumb salta "Tienda / Poncho Été" y la pieza no sale en ningún filtro de `/tienda`. | Base `category_id null` | Medio | 2 min | **Anush** |

### 4. `/tienda` (listado)

Capturas: `tienda-1.png`, `tienda-2.png`.

| Hallazgo | Evidencia | Impacto | Esfuerzo | Resuelve |
|---|---|---|---|---|
| El primer texto es **"Por demanda, los pedidos estarán listos en noviembre"**: es noviembre, el drop está en stock y la frase sugiere espera. Contradicción directa con "En stock" dos tarjetas más abajo. | `TiendaClient.tsx:521-529`; setting `queue_note_text` | Alto | 2 min | **Anush** |
| El H1 es "Colección", genérico. No dice qué se vende ni que hay un drop. | `TiendaClient.tsx:487` | Bajo | Bajo | Código ("Tienda" o "Todo lo tejido") |
| "Viste hace poco" queda arriba de la grilla y empuja la primera prenda a ~1,6 pantallas. | `tienda-1.png` | Medio | Bajo | Código (bajarlo después de la primera fila) |
| No hay un acceso visible al drop desde el listado: las chips son solo categorías. | `tienda-1.png` | Medio | Bajo | Código (chip "Sunset '26 · −15 %" primera cuando hay un drop activo) o la barra de promoción (#2) |
| Bien resuelto: la tarjeta tiene "Vista rápida" siempre visible en táctil (`globals.css:426-432`), el precio tachado y "En stock". | | | | |

### 5. `/carrito`

Capturas: `carrito-1b.png`, `carrito-fullb.png`, `carrito-despues.png`. Mensaje de WhatsApp capturado (decodificado):

```
Hola Anush! Quiero coordinar este pedido:

1. Manguitas Tramonto
   • Talle: Talle único
   • Cantidad: 1
   • En stock
   • Precio unitario: UYU 2.210 (antes UYU 2.600)
   • Subtotal: UYU 2.210
   https://dahila.uy/tienda/manguitas-tramonto

2. Poncho Été
   • Talle: XS/S
   ...
Total: UYU 3.817

¿Me confirmás el plazo, el costo de envío a mi zona y la forma de pago? ¡Gracias!

Código de pedido: PED-C57QXJ (para seguirlo en dahila.uy/pedido)
```

El mensaje está bien armado. Se abre en una pestaña nueva y después aparece "¿No se abrió WhatsApp? · Abrir de nuevo · Copiar mi pedido" (bien pensado para el navegador de Instagram).

| Hallazgo | Evidencia | Impacto | Esfuerzo | Resuelve |
|---|---|---|---|---|
| **El envío queda sin número**: "Te faltan UYU 683 para el envío gratis. El costo exacto te lo paso por WhatsApp." Un costo desconocido es la causa n.º 1 de abandono (Baymard, 48 %). La realidad es más simple de lo que dice la pantalla: **se paga al recibir**. | `CarritoClient.tsx:807-818`; setting `shipping_estimate` sin números | Alto | Bajo | Anush (rango de DAC) + Código |
| Bug de texto: si `shipping_estimate` tiene números, imprime **"Envío: X. Se suma al total."** Con pago al recibir, no se suma al total que se transfiere. | `CarritoClient.tsx:815` | Alto (en cuanto Anush cargue el monto) | Bajo | Código: "Envío: X, lo pagás al recibir." |
| La barra fija de mobile dice solo **"COORDINAR"** (icono más palabra). No queda claro qué pasa, y la frase que baja el miedo ("No pagás nada ahora: se abre WhatsApp con tu pedido ya escrito") está en el resumen, ~2 pantallas más abajo. | `CarritoClient.tsx:1031`, `:911-916`; `carrito-1b.png` | Medio-alto | Bajo | Código: botón "Pedir por WhatsApp" y una línea chica arriba de la barra: "No pagás nada ahora". |
| El mensaje pide "el plazo" aunque todo sea en stock, y no ofrece el dato que Anush necesita para cotizar el envío: departamento o barrio. Un campo opcional "¿A qué zona va?" ahorra un ida y vuelta en el chat. | `CarritoClient.tsx:119` | Medio | Bajo | Código (si todo está en stock, pedir "costo de envío a mi zona y forma de pago"; campo opcional de zona) |
| "Te faltan UYU 683 para el envío gratis" aparece, pero las sugerencias no ayudan a llegar: Pulseras $280, Mini bufandas $380 y Bandana $720. La Bandana sí alcanza y no se dice. | `carrito-fullb.png`; `lib/addons` | Bajo-medio | Bajo | Código ("Con la Bandana llegás al envío gratis" cuando un complemento cruza el umbral) |
| "Talle: Talle único" se lee raro en el carrito y en el mensaje. | `:91`, `:517` | Bajo | Bajo | Código (ocultar la línea si es único) |
| Carrito vacío: bien resuelto (botón "Ir a la tienda" y 4 sugerencias). | `carrito-vacio-1.png` | | | |

### 6. Home `/`

Capturas: `home-1.png` … `home-5.png`.

| Hallazgo | Evidencia | Impacto | Esfuerzo | Resuelve |
|---|---|---|---|---|
| La portada dice "Ver Colección" pero lleva a `/tienda`, no al drop. Con el drop en vivo, el botón principal de la home no lleva a lo que se está pautando. | `HomeClient.tsx:227` (href fijo), setting `hero_cta = "Ver Colección"` | Medio | Bajo | Código (si el drop está en vivo, `href = dropCollectionHref`) o Anush (cambiar el texto a "Ver la tienda") |
| El bloque del drop ya dice "YA ESTÁ ONLINE", pero el texto sigue con "**Anotate gratis en la Lista VIP para entrar 24 hs antes**", que es de antes de la apertura. | `home-2.png`; setting `drop_teaser` | Medio | 2 min | **Anush** |
| "Nuevo" repite el aviso "listos en noviembre" (#1). | `HomeClient.tsx:310-320`, `home-2.png` | Alto (mismo problema que #1) | 2 min | **Anush** |
| El bloque de confianza dice "Envío: A todo el país por DAC. El costo lo coordinamos por WhatsApp." Es la misma vaguedad del carrito. | `home-5.png` | Medio | — | Anush (lo arregla el dato de envío, #4) |
| La home rebota un 78 % (memoria 20/09), pero recibe poco tráfico de IG. No es la prioridad de esta ronda. | | | | |

### 7. `/ig` (link de la bio)

Captura: `ig-full.png`.

| Hallazgo | Evidencia | Impacto | Esfuerzo | Resuelve |
|---|---|---|---|---|
| El bloque negro dice **"PRÓXIMO DROP · Sunset '26"** con el drop abierto desde el 28/10. Quien lo lee entiende que todavía no se puede comprar. `DropTeaser` de la home sí distingue (`isLive ? 'Ya está online'`), pero `/ig` no. | `ig/page.tsx:129` | Medio-alto | Bajo | Código (usar `parseDropDateUY` y mostrar "Ya está online · −15 %") |
| "Lo nuevo" ordena por fecha de creación: Pulseras Terra, Bolso cherry, Bolso butter y Poncho. **Las manguitas, la prenda del reel y del anuncio, no aparecen.** | `ig/page.tsx:40` | Medio | — | **Anush**: "Fijar en la bio" en /admin/productos (hoy `ig_destacado_slug` está vacío, así que no hay prenda grande arriba) |
| Los precios de "Lo nuevo" van sin tachado ni −15 % ("UYU 1.360"): el descuento no se ve en la página de la bio. | `ig/page.tsx:153`, `:169` | Medio | Bajo | Código (usar `PriceBlock` como en las tarjetas) |
| Bien resuelto: una columna, botones grandes, WhatsApp verde y sin burbuja flotante duplicada. | | | | |

### Transversales

- **Velocidad percibida:** con imágenes vacías, el primer contenido pintó a 0,7–1,3 s en ficha, `/ig` y home (bien). Lo que falta está documentado en la memoria: Lighthouse móvil de la ficha da perf 42 y TBT 6,6 s (GA ~0,8 s, Meta ~0,9 s, chunk propio ~1,3 s). En un iPhone de gama media eso se siente como un botón que tarda en responder al primer toque. Siguiente paso de código: cargar GA y el píxel recién después de la primera interacción o con `requestIdleCallback` + timeout. Esfuerzo medio e impacto medio, a medir con Clarity.
- **Urgencia honesta:** el −15 % no tiene fecha de fin en ningún lado. Si tiene una real (por ejemplo, hasta el domingo), decirla en la barra de promoción es la urgencia más efectiva y honesta que hay. Si no la tiene, no inventarla.
- **Moneda:** "UYU 2.210" en vez de "$ 2.210". En Uruguay el público lee "$". Impacto bajo, es un cambio en un solo lugar (`formatPrice`, `lib/types.ts:342`), pero toca el feed y el JSON-LD. Lo dejo como hipótesis para un test, no como cambio directo.
- **Mensajes contradictorios hoy:** (1) "listos en noviembre" contra "En stock"; (2) "Próximo drop" contra "Ya está online"; (3) "Anotate en la Lista VIP para entrar 24 hs antes" con el drop abierto; (4) la portada de la home dice "Ver Colección" y lleva a la tienda; (5) la cinta superior dice "A medida" mientras se pauta stock.

---

## (c) Lo que puede hacer Anush desde el admin (texto exacto sugerido)

> Todo esto se hace sin tocar código. Donde hay `___`, va un dato que solo ella sabe. No completé precios ni montos.

**1. Configuración → Lista de espera (tiempo de entrega)** — prioridad máxima
- Opción A (recomendada mientras dure el drop): **¿Mostrar el aviso de lista de espera? → No**.
- Opción B, si los encargos a medida tienen espera real: Texto del aviso →
  `Lo que dice "En stock" sale ya. Los encargos a medida que entran ahora están listos en ___.`

**2. Configuración → Barra de promoción (arriba de todo)**
- Texto: `Sunset '26 ya está online · 4 piezas en stock · −15 %`
  (si el descuento tiene fecha real de fin: `Sunset '26 · −15 % hasta el ___ · en stock, sale ya`)
- Link: `/colecciones/sunset-26`

**3. Configuración → Información (envíos, pagos, cuidados) → "Envío — línea corta"**
- `Envío por DAC a todo el país: lo pagás al recibir (Montevideo aprox. $___, interior aprox. $___)`
- ⚠️ Antes de cargar números conviene que entre el arreglo de código del carrito (hoy imprimiría "Se suma al total").
- Mismo bloque, "Garantía 1 (en cada producto)": `Envío por DAC, lo pagás al recibir`

**4. Configuración → La artesana**
- Descripción (sale de su propio texto de "Sobre nosotros"; ella confirma que la última frase sea cierta):
  `Soy Anush. Tejo hace más de 5 años y amo traer a la realidad las ideas de mis clientas, sin apuro, para que cada prenda hable de vos. Si tenés una duda, me escribís y te respondo yo.`
- Foto: una foto de ella (o de sus manos tejiendo), cuadrada.

**5. Configuración → Próximo drop → Texto de expectativa** (sacar la parte de la lista VIP, que ya pasó)
- `Inspirada en los colores del atardecer cuando empieza a bajar el sol. Nuestra primera cápsula tejida a mano, con entrega inmediata y unidades súper limitadas. Ya está online.`

**6. Configuración → Portada (Hero) → texto del botón**
- Mientras el botón lleve a la tienda: `Ver la tienda` (o dejar "Ver la colección" cuando el código lo apunte al drop).

**7. Productos → Bolso Margot Butter, Bolso Margot cherry y Poncho Été → Categoría**
- Bolsos: `Accesorios` (o la categoría de bolsos que use la tienda). Poncho: la que corresponda (Tops o Accesorios).
- Efecto: aparecen en los filtros de `/tienda`, en el breadcrumb y en "Completá el look" de las manguitas.

**8. Productos → Manguitas Tramonto → Descripción** (completar lo que está entre corchetes)
```
Manguitas tejidas 100 % a mano en algodón, con trama suelta, liviana y con caída, en los tonos de cuando cae el sol.
Viene [el par / una pieza unida]. Se usan [sobre un top o musculosa / …] y levantan cualquier básico.
Medidas: largo ___ cm, contorno ___ cm (estiran hasta ___ cm). Talle único: le quedan bien a [XS a L].
En stock: sale ya.
```

**9. Productos → Poncho Été → Descripción**
```
El poncho definitivo para las tardes en la playa y las noches de verano. Tejido 100 % a mano en algodón: liviano, fresco y brillante.
Medidas — XS/S: largo ___ cm, ancho ___ cm. M/L: largo ___ cm, ancho ___ cm.
En stock: sale ya.
```
- El precio con −15 % queda en $1.607. Si prefiere un número redondo, que lo elija ella.

**10. Productos → Bolsos Margot → Descripción:** agregar `Medidas: ___ × ___ cm. Asa ajustable de ___ a ___ cm.`

**11. Productos → Manguitas Tramonto → "Fijar en la bio"**
- Así `/ig` muestra las manguitas grandes y primeras ("La del último reel").

**12. Testimonios** (`/admin/testimonios`)
- A las primeras clientas del drop, pedirles una foto puesta y una frase, **sin descuento a cambio** (política de Google y criterio de la tienda). Cargarlas con la prenda (`product_id`): salen en "Así les quedó" de esa ficha y reemplazan el testimonio del sweater.
- Configuración → Contacto: cargar `google_review_url`, que sigue vacío.

---

## Orden de ejecución sugerido

1. **Hoy, Anush (15 min):** puntos 1, 2, 4, 5, 7 y 11 de la sección (c). No requieren deploy y atacan 4 de las 5 contradicciones y la falta de confianza.
2. **Código, una tanda chica (cuando Mati habilite el push):** la barra fija en la ficha (#3), la frase de envío del carrito y el botón "Pedir por WhatsApp" en la barra (#4, #7 parcial), "Ya está online" y precio tachado en `/ig` (#9), la colección compacta en mobile (#6), talle único y el mapeo de talles en la guía (#10).
3. **Después:** el checkout directo desde el cajón, `revalidate` de la colección, la carga diferida de GA y el píxel, y la preselección de talle.
4. **Medir:** agregados al carrito sobre vistas de ficha (hoy 0/44) y toques a `whatsapp_click` y `order_sent`, durante 7 días antes y después. Con este volumen no va a haber significancia estadística; mirarlo como señal y cruzarlo con las grabaciones de Clarity del embudo colección → ficha.
