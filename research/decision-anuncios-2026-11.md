# Decisión de anuncios: ¿web, mensajes o nada? (04/11/2026)

Alcance: análisis de decisión con los números que pasó Mati y el informe `research/meta-ads-expertos-2026-11.md`. No se tocó Meta, ni código, ni la base. Las cuentas están hechas con distribución binomial y de Poisson; los supuestos van marcados como **[SUPUESTO]** y lo que no sabemos como **[FALTA]**.

---

## 1. Respuesta corta

**Sí, fue correcto pausar la web.** Pero no porque los 0 carritos prueben algo (con tan pocas visitas, 0 carritos era esperable aunque todo anduviera bien). Fue correcto porque **la cuenta no cierra ni en el mejor caso**: a UYU 9 por vista de prenda y 1 pedido cada 415 vistas, cada pedido web cuesta unos **UYU 3.735**, y la prenda más cara del drop sale 2.210.

**Opción elegida: la 1** (solo mensajes a UYU 100/día hasta que termine sola el martes 10/11), **sumando gratis lo bueno de la 4** (WhatsApp personal a clientas previas + reels orgánicos). Lo máximo que se puede perder en estos 6 días son ~UYU 600 más. Además hay un **techo duro de UYU 1.500 en anuncios desde el 4/11 sin ninguna venta**: si se llega ahí, se apaga todo.

**El dato que más vale es gratis:** que Anush mire cuántas de las 36 conversaciones de marzo–abril terminaron en venta. Ese número pesa más que 6 días de anuncios.

---

## 2. Datos de partida y supuestos

| Dato | Valor | Fuente |
|---|---|---|
| Ticket del drop (con −15%) | bolsos 1.360 · poncho 1.607 · manguitas 2.210 → **uso 1.700 como promedio** | Mati |
| Web: costo por vista de prenda | ~UYU 9 | Meta, mejor anuncio 3/11 |
| Histórico web (90 días) | 1.660 vistas de prenda → 35 carritos (2,1%) → 4 pedidos (0,24% = 1 cada 415 vistas) | GA4/base |
| Campaña web con píxel andando (2–4/11) | ~UYU 600, 0 carritos, 0 pedidos | GA4 + píxel + base |
| Mensajes mar–abr 2026 | UYU 3.931 → 36 conversaciones = **~UYU 110 por conversación** | Meta |
| Campaña actual de mensajes | UYU 100/día, 27 gastados, termina sola el **martes 10/11** | Meta |
| Tasa de cierre de conversaciones | **[FALTA]**. La pruebo a 5%, 10% y 20% | — |
| Clientas previas a las que se les puede escribir | **[FALTA]**. La pruebo con 10, 20 y 30 | — |

Supuestos que sostienen las cuentas:
- **[SUPUESTO]** El costo por conversación de ahora se parece al de marzo–abril (UYU 110). Puede salir más caro con creativos nuevos o con menos días; por eso miro también 160 y 220.
- **[SUPUESTO]** La gente que llega por un anuncio compra **igual o peor** que el promedio histórico de la web, que es mayormente tráfico de Instagram (seguidoras que ya conocen la marca). O sea que el 1/415 es el mejor caso para la web paga, no el esperado.
- **[SUPUESTO]** Las prendas del drop ya están tejidas (en stock). Entonces, para estas piezas, el punto de equilibrio es **plata que entra contra plata en anuncios**: el costo de la lana y las horas ya está hecho. Para piezas que se tejen al encargar, el equilibrio es más exigente (habría que usar el margen, no el precio).
- "Resultado neto" en este informe = ingresos esperados − gasto en anuncios. No es ganancia: no descuenta envío ni el tiempo de Anush.

---

## 3. ¿Los 0 carritos de la web dicen algo? Casi nada

- UYU 600 a ~UYU 9 por vista da, como mucho, **~67 vistas de prenda** (probablemente menos, porque no todo el gasto fue del mejor anuncio).
- Si la gente del anuncio se comportara como el histórico (2,1% agrega al carrito), la probabilidad de ver **0 carritos en 67 vistas es 24%**. Uno de cada cuatro intentos daría exactamente lo que vimos.
- Además, desde el 3/11 a las 14:37 hasta el 4/11, la ficha decía "se teje al encargar, listos en noviembre" por el bug. Si contamos solo la mitad limpia (~35 vistas), la probabilidad de 0 carritos sube a **47%**: es tirar una moneda.

**Conclusión:** la prueba web quedó contaminada y fue chica. No muestra que la web "no funciona". Lo que decide es la cuenta de la sección 4.

---

## 4. Por qué la web pierde aunque ande bien

- Costo por pedido en el mejor caso: 9 × 415 = **UYU 3.735** contra un ticket de ~1.700. Se pierden ~2.000 por pedido.
- Para empatar, **una** de estas dos cosas tendría que pasar:
  - que la vista de prenda cueste **UYU 4,1 o menos** (hoy cuesta 9, y eso con el mejor anuncio), o
  - que la gente paga compre **2,2 veces mejor** que el histórico: 1 pedido cada 189 vistas en lugar de 415. Es lo contrario de lo que se espera del tráfico frío.
- Probarlo en serio es carísimo:
  - para descartar con 95% de confianza que el anuncio trae carritos al ritmo histórico hacen falta **~141 vistas sin ningún carrito**, o sea **~UYU 1.270**;
  - para tener 95% de chance de ver **un** pedido (si la tasa fuera la histórica) hacen falta **~1.240 vistas**, o sea **~UYU 11.200**.

Gastar UYU 11.000 para confirmar algo que, si sale bien, igual pierde plata no tiene sentido.

---

## 5. Las 4 opciones, con números

### Resumen

| | Costo máximo 6 días (4/11–10/11) | Qué compra | Probabilidad de ≥1 venta (cierre 5% / 10% / 20%) | Resultado neto esperado (5% / 10% / 20%) |
|---|---|---|---|---|
| **1. Solo mensajes 100/día** | **~UYU 630** | ~5,7 conversaciones | **25% / 45% / 72%** | **−140 / +340 / +1.320** |
| 2. Web 50 + mensajes 100 | ~UYU 930 | lo mismo que la 1 + ~33 vistas de prenda | igual que la 1 + web: 50% de ver ≥1 carrito, **8%** de ver ≥1 pedido | lo de la 1 **−165** (la web resta en el mejor caso) |
| 3. Mensajes 50/día | ~UYU 330 | ~2,7 conversaciones | 13% / 25% / 46% | −70 / +160 / +630 |
| 4. Pausar todo | UYU 27 (ya gastado) | nada sobre anuncios | depende de las clientas previas **[FALTA]** | 0 en anuncios |

Cómo se calcula: conversaciones esperadas = gasto / 110. Probabilidad de ≥1 venta = 1 − (1 − cierre)^conversaciones. Neto = conversaciones × cierre × 1.700 − gasto.

**El punto de equilibrio de mensajes:** 110 / 1.700 = **6,5% de cierre**. Si Anush cierra más de 1 de cada 15 conversaciones, los mensajes se pagan solos con piezas en stock. Si las piezas se tejen al encargar y el margen fuera ~50% **[SUPUESTO]**, el equilibrio sube a ~13%.

### Opción 1: solo mensajes a UYU 100/día (ya está andando)
- **Costo máximo:** ~UYU 630 (27 ya gastados + 6 días × 100). No hay que tocar nada: termina sola el 10/11.
- **Información:** ~5,7 conversaciones. Es la única opción que mide lo que falta saber, la tasa de cierre, y lo hace con el embudo que ya vende (DM).
- **¿Alcanza para concluir?** No del todo. Con 6 conversaciones y 0 ventas, si el cierre real fuera 20% igual había 26% de chance de no vender nada. Para descartar con 95% que el canal sea **claramente rentable** (cierre de 20%) hacen falta **~14 conversaciones sin venta, unos UYU 1.500**. Para medir con precisión el equilibrio justo (6,5%) harían falta ~46 conversaciones (~UYU 5.000): no vale la pena, y por eso la regla de abajo apunta a "¿es claramente bueno?" y no a "¿empata?".
- **Riesgo:** perder ~600 si el cierre es bajo. Es el piso de pérdida más chico de las opciones que aprenden algo.
- **Beneficio:** con un cierre de 10% o más el resultado esperado da positivo, y una sola venta de manguitas (2.210) paga los 6 días tres veces.

### Opción 2: web 50 + mensajes 100
- **Costo máximo:** ~UYU 930.
- **Qué agrega la web:** ~33 vistas de prenda (5,5 por día). 50% de chance de ver un carrito y **8% de ver un pedido**. En 2 días serían ~11 vistas: **21%** de ver un carrito y **2,6%** de ver un pedido. Encima, un carrito suelto no dice mucho, porque solo 1 de cada 9 carritos históricos terminó en pedido.
- **Resultado esperado de la parte web:** 33/415 × 1.700 − 300 = **−165** en el mejor caso.
- **Veredicto:** gasta 50% más que la opción 1 para comprar una información que no cambia ninguna decisión. Si hay carrito, igual no cierra la cuenta; si no hay, era lo esperable. **Descartada.**

### Opción 3: bajar mensajes a UYU 50/día
- **Costo máximo:** ~UYU 330.
- **Lo importante:** bajar el presupuesto diario **no mejora lo que rinde cada peso**. El costo por conversación es más o menos el mismo; solo se consigue la mitad de conversaciones. Si el canal sirve, se deja plata sobre la mesa; si no sirve, se pierde la mitad, pero en 6 días se aprende la mitad (~2,7 conversaciones, que no es nada).
- El control real de cuánto se gasta en total es el **techo acumulado**, no el diario. Para llegar a la misma conclusión, con 50/día se tarda el doble, mientras el drop pierde novedad.
- **Riesgo/beneficio:** riesgo −300 y beneficio la mitad que en la 1. Sirve para tranquilizar, no para decidir. **No la elijo**, salvo que Anush no pueda contestar DMs varias veces por día (ver sección 7).

### Opción 4: pausar todo; orgánico + WhatsApp a clientas previas
- **Costo:** 0 en anuncios (solo tiempo de Anush).
- **Información sobre anuncios:** ninguna. Si después se quiere volver a pautar, estamos igual que hoy.
- **Beneficio del WhatsApp a clientas:** puede ser el mejor retorno por peso que existe, pero no sé cuántas clientas hay **[FALTA]**. Con mensajes personales (no masivos), si 5–10% compra:

  | Clientas contactadas | P(≥1 venta) a 5% | a 10% | Ventas esperadas |
  |---|---|---|---|
  | 10 | 40% | 65% | 0,5–1 |
  | 20 | 64% | 88% | 1–2 |
  | 30 | 79% | 96% | 1,5–3 |

  (Las tasas de 5–10% son **[SUPUESTO]**; no tenemos el dato de recompra.)
- **Orgánico:** un reel bueno llega gratis a 2.000–4.300 cuentas y la bio ya manda ~10 clics por día a la web, el doble de lo que compraban UYU 50/día de anuncios web.
- **Clave:** el WhatsApp a clientas y los reels **no compiten con la opción 1**. Son gratis y se pueden hacer igual. Lo que la opción 4 agrega de verdad es apagar los anuncios de mensajes, y eso solo conviene si el dato de marzo–abril sale malo (ver regla).

---

## 6. Decisión y regla con fechas

**Elegida: opción 1 + lo gratis de la 4.** Mensajes a UYU 100/día hasta el martes 10/11, sin tocar los anuncios. Web pausada. En paralelo, WhatsApp personal a clientas previas y reels orgánicos.

**Por qué:** es la opción con menor pérdida máxima (~600) que mide el único número que decide el futuro (cuántas conversaciones terminan en venta), y no requiere hacer nada en Meta. No cambiar los anuncios a mitad de semana no es por la "fase de aprendizaje" (con este presupuesto Meta nunca sale de ella; para eso harían falta ~50 conversiones por semana). Es para que los números de los 6 días se puedan comparar.

### Regla de decisión

**Paso 0, jueves 5/11 (gratis):** Anush cuenta cuántas de las **36 conversaciones de marzo–abril** terminaron en venta.

| Ventas de las 36 | Qué significa | Qué hacer |
|---|---|---|
| **0 o 1** (≤3%) | Cada venta por anuncio costó ~UYU 4.000 o más. Si el cierre real fuera 10%, ver 1 o menos pasa solo el 11% de las veces. | **Apagar la campaña de mensajes ya** → opción 4. |
| **2 o 3** (5–8%) | Cerca del empate | Seguir la regla del 10/11 |
| **4 o más** (≥11%) | Los mensajes se pagan solos | Seguir la regla del 10/11 con confianza |
| No se acuerda | — | Seguir la regla del 10/11 |

**Control rápido, sábado 7/11:** si ya se gastaron **UYU 300 o más con 0 conversaciones**, pausar. Si el costo real fuera 110 por conversación, eso pasaría solo el 6,5% de las veces: hay un problema con el anuncio o la entrega.

**Decisión principal, martes 10/11 a la noche** (la campaña termina sola). Mirar 3 números del 4/11 al 10/11: **gasto total** (Meta), **conversaciones iniciadas** (Meta) y **ventas que vinieron de anuncios** (planilla de Anush).

| Caso | Condición | Qué hacer |
|---|---|---|
| **A. Se paga** | Lo vendido por anuncios ≥ lo gastado (con ~UYU 630 gastados, una sola venta de cualquier prenda ya alcanza) | Relanzar **7 días a UYU 100/día**, mismos anuncios, y aplicar la misma regla en cada tanda |
| **B. Hay interés, falta cierre** | 0 ventas, pero **3 o más conversaciones calificadas** (preguntaron precio, talle, color o envío) | Seguir a UYU 100/día **hasta UYU 1.500 acumulados desde el 4/11** (~9 días más), con seguimiento a las 24–48 h a quien preguntó. Si se llega a 1.500 sin ninguna venta, apagar: con ~14 conversaciones y 0 ventas, un cierre de 20% queda descartado al 95% |
| **C. No tira** | **2 o menos conversaciones**, o menos de 3 calificadas | Apagar anuncios → opción 4. Si el costo fuera el de marzo–abril, esto pasaría por mala suerte solo el 7,5% de las veces |

**Techo duro:** nunca más de **UYU 1.500 en anuncios desde el 4/11 sin ninguna venta atribuida**. Es la frase para Mati cuando se angustie: la pérdida máxima está escrita de antemano.

### Después (desde el 11/11)
- **Web:** pausada. Volver a considerarla solo si el costo por vista de prenda baja de UYU 4 (hoy es 9) o si la web empieza a convertir el doble que el histórico. Nunca más optimizando por "ver contenido".
- **Mensajes:** subir el presupuesto solo después de **2 tandas seguidas** de 7 días en las que lo vendido por anuncios sea **al menos el doble** de lo gastado, y de a 20–30% por vez.
- **Si se apagó todo:** no volver a pautar hasta tener una tasa de cierre medida con DMs orgánicos (la misma planilla sirve para eso) o un drop nuevo con un reel que haya llegado a 3x lo normal sin pagar.

---

## 7. Qué tiene que registrar Anush (sin esto no se puede decidir)

Una planilla (Google Sheets o una nota del celu, una fila por conversación):

| Columna | Ejemplo | Para qué |
|---|---|---|
| Fecha | 06/11 | Separar las tandas |
| Origen | Anuncio drop / Anuncio 1-2-3 / Anuncio manguitas / Orgánico / WhatsApp clienta / Web | Saber qué paga. En los chats que vienen de anuncios suele aparecer el anuncio; si no se ve, alcanza con "anuncio sí/no" |
| Usuario | @fulana | Evitar duplicados |
| Prenda que preguntó | poncho | Ver qué tira |
| ¿Calificada? | sí, si preguntó precio, talle, color o envío | El indicador temprano (caso B) |
| ¿Seguimiento a las 24–48 h? | sí/no | Muchas ventas por DM salen del segundo mensaje |
| Resultado | vendió / no / pendiente | **El dato clave** |
| Monto | 1.607 | Comparar con el gasto |
| Si no compró, por qué | precio / talle / envío / solo miraba / no contestó | Saber si el problema es el anuncio o la oferta |

Y dos cosas sueltas:
1. **El conteo de las 36 conversaciones de marzo–abril** (paso 0). Aunque sea aproximado ("vendí 3 o 4").
2. **Cuántas clientas previas tiene para escribirles** y cuántas compraron después del mensaje: así se mide la opción 4 y se compara con los anuncios.

Para el caso de que no pueda contestar rápido: si Anush solo puede mirar los DMs una o dos veces por día, conviene la opción 3 (UYU 50/día) con mensaje de ausencia, porque una conversación que espera horas se enfría y se pierde la plata que costó traerla.

---

## 8. Lo que no sabemos y podría cambiar la decisión
- **[FALTA] Tasa de cierre real.** Es todo. Con 0–1 de 36 se apaga, con 4+ de 36 se sigue con tranquilidad.
- **[FALTA] Costo por conversación con estos anuncios.** Si sale arriba de UYU 220, el equilibrio pide un cierre de 13% o más aun con piezas en stock.
- **[FALTA] Base de clientas previas.** Si son 20 o más, la opción 4 aporta ventas seguras gratis y hay que hacerla sí o sí.
- **[SUPUESTO] Ticket 1.700.** Si casi todo lo que se vende son bolsos (1.360), el equilibrio de mensajes sube a 8% de cierre.
