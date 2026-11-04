# Recorridos de compra: 6 personas, del Instagram al WhatsApp (04/11/2026)

**Qué es esto.** Seis recorridos completos de compra hechos en el celular sobre el estado **LOCAL** del repo (con los cambios sin commit), más una investigación de cómo compra ropa de marcas chicas por Instagram una persona promedio de Uruguay y Argentina. Al final hay una lista de mejoras priorizadas, separadas en *código* y en *contenido que carga Anush*.

**No repite** lo que ya está en `research/auditoria-cro-2026-11.md` ni en `research/auditoria-sitio-ronda2-2026-11.md`. Cuando algo de esos informes sigue pendiente y pesa en un recorrido, se nombra en una línea con la etiqueta "(pendiente, ya informado)".

**Método.**
- Servidor local con `next dev -p 3124` (lee la base de producción). Playwright con un iPhone 13 (390×844), `es-UY`, hora de Montevideo.
- Fotos reemplazadas por un GIF de 1 px, así que en las capturas se ven como bloques beige. `dahila_interno=1` y medición bloqueada (píxel de Meta, `/api/meta`, GA, Clarity, Umami).
- Todo POST/PATCH/DELETE a `/api/*` se respondió con 204, y las acciones del servidor se abortaron. `/api/cart` se simuló en memoria con productos reales leídos por GET público.
- WhatsApp interceptado: no se abrió nunca. Se capturó la URL `wa.me` y se decodificó el mensaje.
- **Escrituras reales en producción: cero.** Lo único que intentó salir fue `POST /api/orders` (×4, respondido 204), `POST /api/favorites` (×1, 204) y la acción del servidor de `/encargo` (×1, abortada).

**Archivos.**
- Capturas: `C:\Users\mati\AppData\Local\Temp\claude\c--Users-mati-Downloads-dahilia\a19b3bf8-59c7-432b-bb7a-f8235c73bcfe\scratchpad\rec\` (por ejemplo `c-09-regalo-tarjeta-boton.jpg`).
- Script: `...\scratchpad\rec\recorridos.cjs`.
- Salida cruda: `out-bc2.txt` y `out-def.txt`.

> **Dos avisos sobre el estado local.**
> 1. Mientras corría esto, otra sesión editó `CarritoClient.tsx`. La frase de envío pasó de "lo pagás al recibirlo" a "El envío lo coordinamos por WhatsApp según tu zona", con el comentario *"afirmaba algo que no siempre es así"*. Evalué esa versión, la que está ahora en disco. Las líneas citadas de `CarritoClient.tsx` son las del 04/11 a la noche y pueden moverse.
> 2. Hay un **bug solo de desarrollo**: en `next dev`, `/carrito` queda en "Cargando…" para siempre. `CartProvider.tsx:142-163` marca `hasFetchedRef` antes de que corra el `requestIdleCallback`, y el doble montaje de StrictMode cancela ese callback y no lo vuelve a programar. En producción no pasa. Es la causa de "el mock no cargó" que figura en la memoria del 04/11. Lo destrabé disparando `visibilitychange`. Arreglo de una línea: en el cleanup del efecto, poner `hasFetchedRef.current = false`.

---

## 1. Qué dice la evidencia (resumen calificado)

Calificación: **A** = estudio grande o experimento con método publicado. **B** = informe de industria o encuesta con muestra declarada. **C** = prensa, blog o dato de segunda mano.

| Eje | Hallazgo | Ev. | Fuente |
|---|---|---|---|
| Confianza | Con 5 reseñas, la probabilidad de compra es **+270 %** que con ninguna. El efecto es mayor en productos caros. Las ventas tocan techo con 4,0–4,7★ (un 5★ perfecto da desconfianza). Pasadas las primeras 5 reseñas, cada una suma poco. | A (2017) | Spiegel Research Center / Northwestern |
| Confianza | El **60 %** busca siempre fotos o videos de clientas antes de comprar, y el 23 % no compra si no los hay (36 % en la Gen Z). | B (proveedor de reseñas, n=15.870, EE. UU.) | PowerReviews, dic-2023 |
| Confianza | Mostrar la cara y el nombre de la dueña baja la desconfianza hacia una tienda desconocida. | A− (experimento con estudiantes) | Darke et al., *Journal of Retailing* 2016 |
| Confianza | Clima de estafas: en CABA, el 20 % de los incidentes son estafas en compras online, más de la mitad ligadas a Instagram. En Uruguay, las denuncias por estafa pasaron de ~1.000 (2013) a más de 31.000 (2024). | B / C | BA-CSIRT 2024; prensa UY (no pude abrir la fuente primaria) |
| Pago | En Uruguay, Ciberlunes jun-2026 (n=1.000): crédito 58 %, débito 32 %. **El 77 % de quienes pagan con crédito lo hace en cuotas.** Comprador "analítico, no compra por impulso". | B | Factum para CEDU, 2026 |
| Pago | En Uruguay, 1er trimestre de 2026: el **ticket promedio con crédito es $2.042**, justo la franja de Dahila ($1.360–2.210). Un tercio compraría más si pagar en cuotas fuera más fácil (2023). | B | CEDU/Exante 2026; Cifra/CEDU 2023 |
| Pago | Descuento por transferencia: **no encontré evidencia**. | — | hueco |
| Envío | Motivos de abandono del carrito: **costos extra 40 %**, no ver el total desde el principio 12 %, desconfiar al poner la tarjeta 19 %. | B | Baymard, encuesta EE. UU. (versión vigente) |
| Envío | Ciberlunes UY 2026: 60 % recibe en su casa, **30 % retira en un local y 10 % en una sucursal de correo**. | B | Factum/CEDU 2026 |
| Urgencia | Escasez **real** ("quedan 5", con stock verdadero): **+12,5 % neto** de ventas, después de descontar más devoluciones. | A (observacional, un solo retailer) | Calvo, Cui y Wagner, IESE |
| Urgencia | El 40 % de los contadores regresivos de 11.000 tiendas eran engañosos. El regulador británico (CMA) sancionó contadores que se reinician. La escasez sube la intención de compra pero baja la confianza. | A / B / A− | Mathur et al. (Princeton) 2019; CMA 2023; Liu 2026 |
| Regalo | El 25 % duda en regalar ropa online por miedo a errar el talle. La tarjeta de regalo es el 2º regalo más elegido en EE. UU. | C / B | Loop Commerce 2015; NRF 2025 |
| Talle | El 83–87 % de los sitios de ropa no da información de talle suficiente. Baymard recomienda medidas de la prenda en cm, talle de la modelo y acceso a atención desde la guía. | A/B | Baymard 2022 |
| Mensajería | El 72 % es más propenso a comprarle a marcas que atienden por mensajes (22 mercados, incluye Argentina). | B (encargado por Meta) | Meta/Kantar 2025 |
| Mensajería | Responder en 5 minutos en vez de 30 multiplica ×21 la probabilidad de calificar el contacto. Medía contactos de venta, no compras. | B (2007-11) | Oldroyd/HBR |

**Huecos importantes:**
- No hay datos públicos de Uruguay ni de Argentina sobre compra por DM frente a la web.
- No encontré cuál es el costo de envío aceptable ni el umbral de envío gratis que se espera en Uruguay.
- No hay desglose de pagos por OCA, Prex o Mercado Pago, ni condiciones vigentes de cuotas en Mercado Pago Uruguay.
- No hay estudios sobre pago contra entrega ni sobre el descuento por transferencia.

**Lectura para Dahila.** Quien compra en Uruguay es analítica, paga con tarjeta en cuotas y desconfía de las tiendas que conoce por Instagram. En la web de Dahila hoy decide **sin saber cuánto le sale el envío, sin cuotas a la vista, sin cara de la dueña y sin fotos de clientas**. La tienda ofrece algo muy fuerte ("pagás recién al confirmar"), pero eso solo se lee pegado al botón, en letra de 11 px.

---

## 2. Los seis recorridos (estado LOCAL, iPhone 13)

Una "pantalla" equivale a 664 px útiles. Las posiciones salen de la medición con Playwright.

### (a) Vio un reel y toca el link de la bio → `/ig`

**Perfil:** Flor, 29 años, Montevideo. Vio el reel del drop y quiere "la del video".

| Paso | Lo que ve (medido) | Lo que piensa o duda |
|---|---|---|
| 1. `/ig` | "Tejido a mano en Uruguay, a tu medida", el bloque negro **"Ya está online · Sunset ‘26"** (local, bien) y "Lo nuevo": Pulseras Terra, Bolso cherry, Bolso butter y Poncho (UYU 1.607, **sin tachado**). | "¿Y las manguitas del reel?". No están. La prenda del reel no aparece en el link del reel. |
| 2. Toca "Poncho Été" | Primer pantallazo: solo la foto, el breadcrumb y la **barra fija abajo: "Poncho Été · UYU 1.607 ~~1.890~~ · Talle XS/S · AGREGAR"**. El H1 está a 1,10 pantallas y el botón principal a 1,45. | "¿Talle XS/S? Yo no elegí nada." **Si toca AGREGAR desde la barra, se agrega el XS/S preseleccionado sin que haya visto el selector.** Este riesgo es nuevo: lo trae el cambio local que muestra la barra desde arriba. |
| 3. Scroll | "En stock: sale sin la espera de los encargos", "¿Qué talle soy?", XS/S · M/L · A medida, la tira de confianza y el testimonio **"Me pedí 2 bufandas y son exacto lo que quería"**. La descripción no tiene medidas. | "¿Cuánto mide de largo? ¿Me queda el M/L si soy un M?". Sin medidas en cm, la duda de talle no se resuelve en la página. Como no hay devoluciones, la duda cuesta más. **Primer punto de abandono: le escribe por DM o se va.** |
| 4. Agrega | Cajón: total UYU 1.607, "Te faltan UYU 2.893 para el envío gratis", "Coordinás envío y pago con Anush por WhatsApp" y el botón **"VER CARRITO Y COORDINAR"** (otra página). | "¿Otra pantalla más?" |
| 5. `/carrito` | Barra fija: **"TOTAL UYU 1.607 · sin pagar ahora · PEDIR POR WHATSAPP"** (local, bien). Más abajo: "El envío lo coordinamos por WhatsApp según tu zona." | "¿El envío cuánto es? ¿200? ¿500?". **Segundo punto de abandono**: el costo que falta (Baymard: 40 % abandona por costos extra). |
| 6. Toca la barra | Mensaje capturado ⬇ | |

```
Hola Anush! Quiero coordinar este pedido:

1. Poncho Été
   • Talle: M/L
   • Cantidad: 1
   • En stock
   • Precio unitario: UYU 1.607 (antes UYU 1.890)
   • Subtotal: UYU 1.607
   https://dahila.uy/tienda/poncho-ete

Total: UYU 1.607

¿Me confirmás el plazo, el costo de envío a mi zona y la forma de pago? ¡Gracias!

Código de pedido: PED-PMA38N (para seguirlo en dahila.uy/pedido)
```

**Evaluación:** el mensaje es claro y completo. Le sobra "el plazo", porque todo el pedido está en stock. Le falta la zona: sin ella, Anush tiene que preguntar antes de poder cotizar el envío, y eso suma **un ida y vuelta más** antes de que la clienta sepa el total. Con 35 carritos y 4 pedidos, cada vuelta de chat pesa.

### (b) Vio el anuncio y cae en `/colecciones/sunset-26`

**Perfil:** Valentina, 34 años, Canelones. Vio el anuncio "Sunset collection", no conoce la marca.

| Paso | Lo que ve | Lo que piensa o duda |
|---|---|---|
| 1. Colección | La barra "Sunset ‘26 en stock · 15% off esta semana", la portada (30vh, local), la descripción y la franja "1. Elegís tu pieza 2. La pedís por WhatsApp 3. Pagás cuando confirmamos". **La primera tarjeta empieza a 0,91 pantallas** (antes 1,28): asoman los −15 %. | "OK, es una colección, hay descuento." "¿Esta semana hasta cuándo?" |
| 2. Grilla | 4 tarjetas: bolsos UYU 1.360 ~~1.600~~, poncho 1.607 y manguitas 2.210 ~~2.600~~, todas con "En stock" y material. | Bien resuelto. |
| 3. Ficha de las manguitas | Primer pantallazo: la foto y la **barra fija con "Manguitas Tramonto · UYU 2.210 ~~2.600~~ · AGREGAR"**. Esperé 13 s: **el popup de la lista no apareció** (el arreglo local funciona). | "Ya veo el precio, bien." |
| 4. Scroll | "Talle único", "A medida" (sin "¿Qué talle soy?", local, bien). Después la tira de confianza, **"¿Dudas con el talle? Preguntame por WhatsApp"** y **"¿Es un regalo y no sabés su talle? Regalá una tarjeta"** en una pieza de talle único. El testimonio es **"El sweater superó mis expectativas"**. La descripción no dice si viene el par ni las medidas. | "¿Talle? Si es único…". "¿Es el par o una sola?". "El testimonio habla de un sweater." |
| 5. A 2,2 pantallas | "Lleva unas 8 horas de tejido a mano · ¿Por qué tanto?" y **"Pagás por transferencia o Mercado Pago, coordinado por WhatsApp — nada se cobra hasta que confirmemos todo."** | Es lo que más tranquiliza, y está a 2,2 pantallas. No dice si hay cuotas. |
| 6. Agrega desde la barra fija | Cajón, después `/carrito`, después "Coordinar por WhatsApp" (botón del resumen). Abajo, la barra fija dice "Pedir por WhatsApp": **dos rótulos distintos para la misma acción**. | |
| Abandono probable | "Te faltan UYU 2.290 para el envío gratis. El envío lo coordinamos por WhatsApp según tu zona." No conoce la marca, no vio ninguna cara, no sabe el total. | **Se va a "lo pienso"**: el comprador uruguayo "no compra por impulso" (CEDU). |

Mensaje: el mismo formato que en (a), con "Talle: **Talle único**" y la pregunta por "el plazo" de una pieza en stock.

### (c) Busca un regalo para una amiga sin saber el talle

**Perfil:** Sofi, 27 años. El cumple de Caro es en 10 días y no sabe su talle.

| Paso | Lo que ve | Lo que piensa o duda |
|---|---|---|
| 1. Home → menú | El menú tiene Tienda, Colecciones, Ofertas, A medida, **Regalos**, Notas y Tejé con Dahila. | "Regalos, perfecto." |
| 2. `/regalo` | **Es solo la tarjeta de regalo**: "Sin adivinar el talle ni el color…", los montos "UYU 280 alcanza para Pulseras Terra · 1.460 Bolso LOLA · 3.470 Granny’s cardigan" y los campos Para, De parte de y Mensaje. No hay ninguna prenda para regalar. | "Quería regalarle algo, no un vale." Las prendas de talle único que ya están en stock (bolsos Margot, manguitas) no aparecen en la página de regalos. |
| 3. A los 12 s | **El popup de la lista privada tapa el botón "Pedir la tarjeta por WhatsApp"** y la tarjeta de vista previa (`c-09-regalo-tarjeta-boton.jpg`). Ocupa de 329 a 648 px de 664. | "¿Qué es esto?". Tiene que cerrarlo para poder pedir. **Un bloqueo en el paso final.** |
| 4. Pide la tarjeta | Mensaje: `Hola! Quiero regalar una tarjeta de regalo de Dahila 🎁 • Monto: UYU 1.460 • Para: Caro • De parte de: Sofi • Mensaje: "Feliz cumple, amiga" ¿Cómo seguimos con el pago?` | Bien armado. |
| 5. Alternativa: un bolso Margot | La ficha muestra "Talle único" y después **"¿Dudas con el talle? Preguntame por WhatsApp"** en un bolso. El testimonio es **"Hermosos bikinis, amé su trabajo"**. | Los dos textos están fuera de contexto: es un bolso. |
| 6. Carrito → "Es un regalo: agregar nota" | El mensaje incluye `🎁 Nota de regalo: "¡Feliz cumple, Caro! Te quiero mucho"`. | "¿Se lo pueden mandar directo a ella? ¿Va el precio adentro?". El mensaje no lo pregunta, así que va a ser otra vuelta de chat. |

### (d) Indecisa por el precio, compara

**Perfil:** Laura, 38 años. Le gusta el drop pero $2.210 por unas manguitas le parece mucho. Compara.

| Paso | Lo que ve | Lo que piensa o duda |
|---|---|---|
| 1. `/tienda` | El H1 "Colección" (pendiente, ya informado). La primera tarjeta a 0,39 pantallas. Orden: Destacados, Más recientes, **Precio de menor a mayor**, Precio de mayor a menor y Nombre. | |
| 2. Ordena por precio | Pulseras $280, Mini bufandas $380, Bufanda Sophie $620 (2–3 sem.), Box de regalo $680, … | Funciona bien. Las prendas baratas son casi todas por encargo ("2–3 sem."). |
| 3. `/ofertas` | "Prendas con descuento, **por tiempo limitado**. Hasta 15 % OFF. 4 prendas en oferta." | "¿Limitado hasta cuándo?". Ninguna fecha. Sin una fecha real, "por tiempo limitado" es la frase que la evidencia asocia con desconfianza. |
| 4. Ficha del poncho | Sondeo del texto de toda la ficha: **cuotas: no**, Mercado Pago: sí, transferencia: sí, **medidas en cm: no**, **monto de envío: no**, fecha de fin de la promo: no, escasez ("quedan N"): no. Como justificación del precio, "Lleva unas 8 horas… ¿Por qué tanto?" (bien). | "Si me la dejan en 3 cuotas, la llevo." **Lo que la destrabaría no está a la vista.** |
| 5. Favorito → "Guardado en favoritos · Ver" | Funciona. | Se va a pensarlo y no hay nada que la traiga de vuelta (fuera de la lista VIP). |
| 6. Pregunta por WhatsApp | `Hola! Estoy mirando Poncho Été (talle XS/S) en la web: …/tienda/poncho-ete — Tengo una consulta 🧶` | Bien: Anush sabe de qué prenda le hablan. El talle va el preseleccionado, no uno que ella eligió. |
| 7. Carrito con poncho + manguitas (UYU 3.817) | "Te faltan **UYU 683** para el envío gratis." Complementos: Pulseras (elegir talle, desde $280), Mini bufandas $380 y Bandana $720. | Nada le dice que con la Bandana llega al envío gratis (pendiente, ya informado). |

### (e) Clienta que vuelve y quiere encargar a medida

**Perfil:** Lucía, ya compró un cardigan el año pasado y quiere "otro igual en verde, mismo talle".

| Paso | Lo que ve | Lo que piensa o duda |
|---|---|---|
| 1. `/ig` → "Pedir una prenda a medida" | Va a `/encargo`. | |
| 2. `/encargo` | "Contame qué tenés en mente · Te respondo cuanto antes con un boceto, los materiales que tengo y el presupuesto." "¿Ya hiciste un encargo? Seguí su estado →". "Cómo funciona" en 3 pasos. El formulario empieza a ~1 pantalla. **No hay ningún acceso directo a WhatsApp**: la burbuja flotante está oculta en `/encargo` y el único link es el del pie. | "Yo ya hablo con Anush por WhatsApp. ¿Para qué un formulario?" "¿'Cuanto antes' es hoy o en una semana?". **Punto de abandono: cierra y le escribe por DM.** Está bien que lo haga, pero la web no la ayuda a escribir algo útil. |
| 3. Formulario | Tipo (Cardigan, Top, Set, Otro), nombre, WhatsApp, mail, talle XS–XL, "Contame de tu prenda" y "Enviar encargo". No hay forma de decir "ya te compré, usá mis medidas". | |
| 4. Envía vacío | Aparece **"Contanos cómo te llamás."**: una sola falta por vez y en "nosotros", cuando la página habla en "yo". | Pequeño. |
| 5. Envía completo (acción abortada) | "No se pudo enviar… **Mandalo directo por WhatsApp — ya va escrito →**". | Muy bien resuelto: no pierde lo que escribió. |

### (f) Llega de Google a una nota del blog

**Perfil:** Martina, 31 años. Buscó "top crochet verano" y cae en `/blog/tops-de-crochet-para-verano`.

| Paso | Lo que ve | Lo que piensa o duda |
|---|---|---|
| 1. La nota | Título, "4 min de lectura", **"Escrito por el taller de Dahila Crochet"** (pendiente, ya informado: falta la autora). La nota mide **14,4 pantallas**. | |
| 2. Primer link a una prenda | **A 4,58 pantallas** ("top HIGGIE"). Al final hay una grilla con Top SUMMER (2–3 sem.), BEACH set, Poncho y Manguitas (−15 %, en stock). | Lee, aprende y se va. La compra queda lejos. |
| 3. Ficha del top HIGGIE | La barra fija dice **"Talle S · AGREGAR"** desde el primer pantallazo. "Se teje al encargar: si la pedís hoy, lista entre el 11 y el 18 de noviembre" (urgencia honesta, bien). | Mismo riesgo que en (a): un talle preseleccionado que se agrega sin haberlo elegido. |
| 4. "¿Dudas con el talle?" | `Hola! Estoy mirando Top HIGGIE (talle S) en la web: … Tengo una consulta 🧶` | Bien. |

Ojo con el peso de este recorrido: según `research/auditoria-seo-contenido-2026-11.md`, el tráfico del blog es en buena parte de afuera y no compra. Es el recorrido de menor prioridad.

---

## 3. Los mensajes de WhatsApp: qué funciona y qué no

| | Carrito | Tarjeta de regalo | Pregunta desde la ficha | Encargo (si falla) |
|---|---|---|---|---|
| Dice qué prenda, con link | ✔ | — | ✔ | ✔ |
| Precio con "antes" | ✔ | ✔ (monto) | ✘ (no dice el precio) | — |
| "En stock" | ✔ | — | ✘ | — |
| Pregunta que sobra | "el plazo" en piezas en stock | — | — | — |
| Dato que falta para cotizar el envío | **zona o departamento** | — | — | — |
| Ruido | "Talle: Talle único" / "Talle: Único" | — | talle preseleccionado | — |
| Regalo | Va la nota, pero no "¿lo mando a ella?" | ✔ | — | — |
| Total | "Total: UYU 3.817", sin aclarar "+ envío" | — | — | — |

El **código de pedido** al final y el aviso "¿No se abrió WhatsApp? · Abrir de nuevo · Copiar mi pedido" están muy bien pensados para el navegador de Instagram.

---

## 4. Mejoras priorizadas por impacto en la decisión

Criterio: cuánto destraba la duda que hace abandonar en los recorridos (a), (b) y (d), que son el 75 % del tráfico. Después, el esfuerzo.

### A. Código

#### A1. La barra fija agrega un talle que la clienta no eligió (riesgo nuevo del cambio local)
- **Problema:** la barra fija ahora se ve desde el primer pantallazo (`ProductDetailsClient.tsx:120-126`). En prendas con 2 o más talles muestra "Talle XS/S · AGREGAR", y el botón (`:855`, `onClick={handleAdd}`) agrega el talle que viene preseleccionado (`useSizeSelection`, `lib/product-selection.ts`). Así se puede agregar sin haber visto nunca el selector de talle.
- **Por qué importa:** no hay devoluciones, así que un talle equivocado es una venta perdida o un mal rato. Baymard: preseleccionar talle en ropa causa errores.
- **Evidencia:** recorridos (a) poncho y (f) top HIGGIE.
- **Cambio propuesto:**
```diff
// ProductDetailsClient.tsx, junto a useSizeSelection (≈:106)
   const { talle, setTalle, sizeAvailable } = useSizeSelection(product)
+  // ¿La clienta tocó un talle (o llegó con ?talle=)? Hasta entonces la barra fija
+  // no agrega a ciegas: lleva al selector (no hay devoluciones; 04/11/2026).
+  const [talleElegido, setTalleElegido] = useState(() =>
+    typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('talle'))
+  const variosTalles = sizes.filter((s) => s.available).length > 1
...
// botón de talle (≈:386)
-  <button key={s.id} onClick={() => setTalle(s.size)} ...
+  <button key={s.id} onClick={() => { setTalle(s.size); setTalleElegido(true) }} ...
...
// barra fija (≈:850)
-            onClick={handleAdd}
+            onClick={() => {
+              if (variosTalles && !talleElegido) {
+                document.querySelector('.pdp-sizes')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
+                return
+              }
+              void handleAdd()
+            }}
 ...
-            {added ? '✓ Agregado' : 'Agregar'}
+            {added ? '✓ Agregado' : variosTalles && !talleElegido ? 'Elegir talle' : 'Agregar'}
```
- **Ajuste en la misma barra (≈:822):** mientras no haya elección, mostrar "XS/S · M/L" en vez de "Talle XS/S".
- **Antes de dar por cerrado:** verificar que `useState` con `window` no rompa la hidratación. Si la rompe, leer `?talle=` en un `useEffect`.

#### A2. El popup de la lista tapa el botón final en `/regalo`
- **Problema:** `VipCallout.tsx:56-65` lo oculta en carrito, encargo, `/vip`, `/ig` y, con el drop abierto, en ficha y colección. Pero en `/regalo` sale a los 12 s **encima de "Pedir la tarjeta por WhatsApp"**.
- **Evidencia:** captura `c-09`.
- **Cambio propuesto:**
```diff
     pathname.startsWith('/encargo') ||
     pathname.startsWith('/vip') ||
+    // Páginas con un formulario y un botón final: el popup los tapaba (04/11/2026).
+    pathname.startsWith('/regalo') ||
+    pathname.startsWith('/pedido') ||
```

#### A3. El mensaje del carrito: una vuelta de chat menos
- **Archivo:** `CarritoClient.tsx:84-140` (`buildWhatsAppMessage`).
- **Cambio 1. No preguntar el plazo si todo está en stock:**
```diff
-  lines.push('¿Me confirmás el plazo, el costo de envío a mi zona y la forma de pago? ¡Gracias!')
+  const todoEnStock = items.every((i) => !i.product || isReadyToShip(i.product))
+  lines.push(todoEnStock
+    ? '¿Me pasás el costo de envío a mi zona y cómo te pago? ¡Gracias!'
+    : '¿Me confirmás el plazo, el costo de envío a mi zona y cómo te pago? ¡Gracias!')
```
- **Cambio 2. Campo opcional de zona en el resumen:** un input "¿A qué barrio o departamento va? (opcional)", guardado en el estado como `zona`. En el mensaje, antes de la pregunta, va `📍 Envío a: ${zona}`. Con ese dato, la primera respuesta de Anush ya puede traer el total.
- **Cambio 3. Total honesto:** `Total: UYU 3.817` pasa a `Total de las prendas: UYU 3.817 (+ envío según zona)`, salvo que el envío sea gratis (umbral o cupón). La clienta no se lleva la sorpresa en el chat (Baymard: 40 % abandona por costos extra).
- **Cambio 4. Regalo:** si `giftNote` tiene texto, sumar un selector "¿A dónde va? ( ) a mi casa ( ) directo a quien lo recibe". En el mensaje: `🎁 Va directo a quien lo recibe`. **No prometer "sin precio en el paquete"** salvo que Anush confirme que lo hace.
- **Cambio 5. Talle único:** omitir la línea `• Talle:` cuando es "Único" o "Talle único" (`:93`), y lo mismo en el carrito y el cajón (pendiente, ya informado; sigue en local).

#### A4. Que el testimonio no hable de otra prenda
- **Problema:** `tienda/[slug]/page.tsx:687-704`, `pickTestimonial`. Si no hay testimonio de esa prenda ni coincidencia de palabras, elige uno al azar por slug. Resultado: "bikinis" en un bolso, "sweater" en las manguitas, "bufandas" en el poncho. En la base hay testimonios neutros: "Hermoso todo lo que hacen, y siempre con una atención hermosa" (Kiara) y "Todo hermoso, está en cada detalle" (Ana).
- **Cambio propuesto:**
```diff
   const match = usable.find((t) => words(t.text).some((w) => kind.has(w)))
   if (match) return match
+  // Sin match: preferir uno que no nombre otra prenda ("bikinis" en un bolso
+  // restaba más de lo que sumaba; recorridos 04/11/2026).
+  const PRENDAS = /sweater|buzo|bikini|falda|bufanda|calentador|chaleco|cortina|set|cardigan|top|bolso|gorro|manta/i
+  const neutral = usable.filter((t) => !PRENDAS.test(t.text))
+  const pool = neutral.length > 0 ? neutral : usable
   const seed = [...product.slug].reduce((n, c) => n + c.charCodeAt(0), 0)
-  return usable[seed % usable.length]
+  return pool[seed % pool.length]
```

#### A5. Textos de la ficha que no corresponden a talle único
- **"¿Dudas con el talle? Preguntame por WhatsApp"** (`ProductDetailsClient.tsx:565`) sale en bolsos y manguitas. Cambio: si `sizes.length === 0` o el único talle es "Único/Talle único", el texto pasa a ser **"¿Querés ver más fotos o medidas? Preguntame por WhatsApp"**.
- **"¿Es un regalo y no sabés su talle? Regalá una tarjeta"** (`:571`, condición `sizes.length > 0`) sale en las manguitas, que tienen una sola fila "Talle único". Cambio: usar la misma regla de talle único que ya está en `:373` y, en esos casos, mostrar **"Talle único: fácil para regalar"** (sin link) o nada.
- La regla ya existe en `:373`. Conviene sacarla a `lib/product-selection.ts` como `isTalleUnico(sizes)` y usarla en los 4 lugares: guía, dudas, regalo y carrito.

#### A6. En `/regalo`, prendas sin talle además de la tarjeta
- **Problema:** el menú dice "Regalos" pero `/regalo` es solo la tarjeta. Quien quiere regalar algo físico ya no encuentra las piezas de talle único que están en stock.
- **Evidencia:** recorrido (c); Loop Commerce, el 25 % duda por el talle (C).
- **Cambio:** en `regalo/page.tsx` (≈:48) calcular
```ts
const sinTalle = products.filter((p) => isReadyToShip(p) && isTalleUnico(p.sizes ?? [])).slice(0, 4)
```
- Pasarlo a `RegaloClient` y mostrar, después del formulario, una grilla "**O regalá algo que no tiene talle · en stock**" con `ProductCard`. Hoy entrarían los bolsos Margot y las manguitas.

#### A7. El carrito: un solo nombre para el botón y un texto que corresponda
- **Problema:** el resumen dice "Coordinar por WhatsApp" (`CarritoClient.tsx:921`) y la barra fija dice "Pedir por WhatsApp". Además, "…coordinamos **talle**, envío y pago" (`:934`) aparece aunque todo sea talle único y en stock.
- **Cambio:**
```diff
-          {checkingOut ? 'Abriendo WhatsApp…' : 'Coordinar por WhatsApp'}
+          {checkingOut ? 'Abriendo WhatsApp…' : 'Pedir por WhatsApp'}
...
-          No pagás nada ahora: se abre WhatsApp con tu pedido ya escrito y coordinamos talle, envío y pago.
+          No pagás nada ahora: se abre WhatsApp con tu pedido ya escrito y {todoEnStock ? 'coordinamos envío y pago' : 'coordinamos talle, envío y pago'}.
```
- `:1015` dice "Anush te confirma disponibilidad y fecha estimada". Si todo está en stock, mejor "Anush te confirma y te pasa el envío a tu zona".
- En el cajón (`CartDrawer.tsx:319`), "Ver carrito y coordinar" pasa a "Ver carrito y pedir". El salto directo a WhatsApp desde el cajón queda como pendiente ya informado.

#### A8. Medio de pago y cuotas al lado del precio (con el dato de Anush)
- **Problema:** "Pagás por transferencia o Mercado Pago… nada se cobra hasta que confirmemos todo" está a **2,2 pantallas** (`ProductDetailsClient.tsx:792`). Al lado del botón solo dice "Pagás recién al confirmar", en 11 px.
- **Evidencia:** el 77 % de quienes pagan con crédito en Uruguay lo financia, y el ticket promedio con crédito ($2.042) coincide con los precios de Dahila (B).
- **Cambio:** una línea de 12 px debajo de `PriceBlock` en la ficha: `{paymentLine}`, que sale de un setting nuevo `pdp_payment_line` y no se muestra si está vacío. **El texto lo pone Anush** (B4), porque solo ella sabe si su link de Mercado Pago ofrece cuotas y con qué recargo.

#### A9. El −15 % sin fecha: que el descuento sepa cuándo termina
- **Problema:** `products` no tiene `discount_ends_at` (lo verifiqué: la columna no existe). Solo los descuentos por lote (`discounts`) tienen `ends_at`, y esos van por tienda entera o por categoría, no por colección; además, el poncho y los bolsos no tienen categoría.
- **Hoy:** la barra dice "15% off esta semana" y `/ofertas` dice "por tiempo limitado". Si nadie apaga el descuento el sábado, el sitio sigue diciéndolo el lunes, y eso es urgencia falsa (CMA; Mathur et al.).
- **Cambio de esfuerzo medio:**
  - SQL idempotente en `database/` que agrega `discount_ends_at timestamptz` a `products`.
  - `resolveDiscountPercent` (`lib/types.ts:242`) ignora el descuento de la prenda si `discount_ends_at < now`.
  - Un campo de fecha en `/admin/productos/[id]`.
  - Donde hay fecha, la ficha y la tarjeta dicen "−15 % hasta el sáb 7/11".
  - JSON-LD `priceValidUntil` y feed `sale_price_effective_date` (pendiente, ya informado).
- **Mientras tanto:** lo resuelve el contenido (B3).

#### A10. `/encargo`: atajo a WhatsApp para quien ya es clienta
- **Problema:** la burbuja está oculta en `/encargo` y no hay un acceso directo a WhatsApp antes del formulario.
- **Evidencia:** recorrido (e); Meta/Kantar, el 72 % prefiere marcas que atienden por mensajes (B).
- **Cambio en `EncargoForm.tsx`:** debajo de "¿Ya hiciste un encargo?…" (≈:250), un link secundario: **"¿Ya me compraste? Escribime directo por WhatsApp →"**. Va con `?text=Hola Anush! Ya te compré antes y quiero encargar: ` y el nombre de la prenda si llegó con `?desde=`.
- **En `:194`:** "Contanos cómo te llamás." pasa a "Contame cómo te llamás.", para que coincida con la voz de la página.

#### A11. El blog: la prenda más cerca
- **Problema:** el primer link a una prenda está a 4,58 pantallas en una nota de 14,4.
- **Cambio:** que el componente de la nota inserte después del primer `h2` una tarjeta chica "**Para ver cómo queda:**" con la primera prenda del `shopCta` de la nota, o la del drop si la nota es de la categoría.
- **Prioridad:** baja, porque es tráfico que en buena parte no compra.

#### A12. Bug de desarrollo del carrito (para poder probarlo localmente)
- **Archivo:** `CartProvider.tsx:142-163`. Agregar `hasFetchedRef.current = false` en los dos cleanups del efecto inicial.
- **Efecto en las clientas:** ninguno. Destraba las pruebas locales del carrito (cada auditoría del 04/11 chocó con esto).

### B. Contenido que carga Anush (texto exacto, `___` = dato que solo ella tiene)

> Nada de esto promete devoluciones ni inventa precios ni montos.

#### B1. Envío, con número y con quién lo paga
Es la duda n.º 1 en los 4 recorridos de compra. Hoy el carrito, `/info` y el cajón dicen tres cosas distintas:
- `info_shipping`: "lo coordinamos por WhatsApp **antes de que pagues**".
- La memoria: "lo paga la clienta al recibir".
- El código local: "según tu zona".

Lo primero es que **Anush confirme cuál es la regla**. Con eso:
- **Configuración → Información → "Envío — línea corta"** (`shipping_estimate`), que se ve en el cajón, el carrito y la ficha: `Envío por DAC: Montevideo aprox. $___, interior aprox. $___. ___ [lo pagás al recibirlo / lo sumamos al total]. ___ [Si estás en Montevideo, también podés retirarlo en ___.]`
- La línea de retiro va **solo si existe la opción**. En Uruguay, el 40 % retira en un local o en una sucursal (CEDU 2026, B).
- **"Envíos"** (`info_shipping`), con el mismo dato, para que no contradiga al carrito.

#### B2. La cara de Anush (sigue vacío: `maker_bio=""`, `maker_photo_url=""`)
**Configuración → La artesana:**
- Descripción: `Soy Anush. Tejo cada prenda de Dahila en Montevideo y te respondo yo por WhatsApp. ___ [años tejiendo]`.
- Foto: una cuadrada, de ella o de sus manos tejiendo.

**Por qué:** baja la desconfianza hacia una tienda desconocida (Darke 2016, A−). En el contexto de estafas por Instagram en Uruguay y Argentina (B/C), pesa más que en otros mercados.

#### B3. Urgencia honesta: una fecha real
- **Barra de promoción:** `Sunset ’26 en stock · −15 % hasta el ___ [vie 6/11 o sáb 7/11]`.
- **Ese día, apagar el descuento** de las 4 prendas en `/admin/productos` y cambiar la barra.
- **Si quedan pocas unidades reales de alguna pieza**, escribirlo en la descripción: "Quedan ___". `getScarcity` ya sabe mostrar "Quedan N" si existe `stock_qty`, pero el admin no tiene ese campo. Agregarlo es código, de esfuerzo bajo. Solo con números reales (IESE: +12,5 % con escasez real).

#### B4. Cómo se paga, al lado del precio (ver A8)
Dato a confirmar: ¿el link de Mercado Pago deja pagar en cuotas? ¿Cuántas, y con recargo para quién? Con eso:
- Si hay cuotas: `Transferencia o Mercado Pago (hasta ___ cuotas). Pagás recién cuando confirmamos.`
- Si no hay: `Transferencia o Mercado Pago. Pagás recién cuando confirmamos todo por WhatsApp.`

**Descuento por transferencia: no lo recomiendo sin medir.** No hay evidencia publicada de su efecto.

#### B5. Medidas en cm en las 4 piezas del drop (pendiente, ya informado)
Es lo que frena el recorrido (a): el poncho sin largo, las manguitas sin aclarar si vienen de a par. Texto en `auditoria-cro-2026-11.md` §c.8–10.

#### B6. Fotos de clientas del drop
- A las primeras compradoras, pedirles **sin descuento a cambio** una foto puesta y una frase.
- Cargarlas en `/admin/testimonios` **con la prenda** (`product_id`). Así reemplazan los testimonios de bikinis y sweaters.
- **Evidencia:** con 5 reseñas, +270 % (A). El 60 % busca fotos de clientas (B).

#### B7. Tiempo de respuesta, solo si es real
- En `/encargo`, "Te respondo cuanto antes" pasa a `Te respondo en el día, de lunes a sábado` (o lo que de verdad cumpla).
- El mismo texto puede ir en la tira de confianza (`pdp_trust_3`): `Te responde Anush, en el día`.
- **Evidencia:** HBR 5 vs. 30 minutos (B); el 66 % espera respuesta en una hora (C).

#### B8. "Fijar en la bio" las manguitas (pendiente, ya informado)
El recorrido (a) muestra que la prenda del reel sigue sin estar en `/ig`.

---

## 5. Lo que el estado local ya resolvió (verificado en los recorridos)

- **Ficha:** la barra fija con nombre, precio y botón está visible desde el primer pantallazo (manguitas, poncho y HIGGIE). Ver A1 por el talle.
- **Ficha y colección:** el popup de la lista **no** aparece a los 13 s con el drop abierto.
- **Colección:** la primera prenda pasó de 1,28 a **0,91 pantallas**. Los 3 pasos van en una franja. El título se lee.
- **Talle único:** las manguitas ya no muestran "¿Qué talle soy?".
- **`/ig`:** "Ya está online · Sunset ‘26".
- **Carrito:** la barra fija dice "Pedir por WhatsApp" y "sin pagar ahora".
- **Barra de promoción:** "Sunset ‘26 en stock · 15% off esta semana", con link a la colección (setting).
- **Home:** el destino del botón de la portada es configurable (`hero_cta_href` = `/colecciones/sunset-26`).
- **Encargo:** si el envío falla, ofrece "Mandalo directo por WhatsApp — ya va escrito".

## 6. Límites de este informe

- Las personas son **simuladas**: el recorrido es real (lo que el sitio muestra y dónde), pero las dudas son inferencias apoyadas en la evidencia de la sección 1 y en el embudo histórico (1.660 → 35 → 4). Para confirmarlas sirven las grabaciones de Clarity del embudo ficha → carrito → `whatsapp_click`, y preguntarle a Anush **qué preguntan las clientas en el primer mensaje** (envío, cuotas, talle).
- Las fotos fueron reemplazadas por un píxel: no evalué la calidad de las fotos, que en moda pesa mucho.
- Fue en `next dev`: no medí velocidad (eso está en la memoria: Lighthouse móvil 42–49).
- Con 4 pedidos web en 90 días, **ningún cambio va a mostrar significancia estadística en semanas**. Hay que medirlos como señal, con carritos/vistas de ficha y `order_sent`/carritos, comparando 7 días antes y 7 después.
