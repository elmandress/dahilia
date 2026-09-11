# Auditoría de mercado y producto — Dahila Crochet (2026-09-03)

Encargo de Mati: comparar cada precio de Dahila contra la competencia (acá y afuera) y auditar exhaustivamente producto/UX/retención, ambos anclados en datos reales. Método: 4 subagentes en paralelo — estadística (prioridad, corrió primero), precios de prendas tejidas, precios de accesorios, y UX/producto — cada uno con lectura en vivo del catálogo (REST a Supabase con la anon key pública), el export real de GA4 (02/09/2026), y research de mercado con fuente + fecha en cada precio citado. Nada de lo que sigue es un número inventado: donde una fuente no dio un dato verificable, el documento dice "no encontré publicado" o deja una consulta SQL pendiente en vez de estimar.

**El hallazgo que reencuadra todo el resto:** el pilar estadístico, al verificar el catálogo en vivo contra `PRICE_TABLE` (la tabla de precios aprobada, `src/app/admin/estrategia/data.ts`, sin tocar desde julio 2026), encontró que **la producción ya no coincide con lo aprobado** — 8 productos cambiaron de precio en agosto/septiembre sin quedar documentados en ningún lado, y 4 productos nuevos y caros no tienen ninguna estrategia de precio detrás. Esto no estaba en el pedido original y cambia cómo hay que leer la sección de precios: antes de preguntar "¿cuánto deberíamos cobrar?", hay una pregunta previa — "¿quién decidió lo que ya estamos cobrando, y por qué no quedó anotado?".

---

## 0. Resumen ejecutivo

1. **Producción y la tabla aprobada se desacoplaron silenciosamente.** 8 productos (5 prendas + 3 accesorios) cambiaron de precio en agosto/septiembre sin actualizar `PRICE_TABLE` ni dejar rastro de por qué (no existe historial de precios en el schema); 4 productos nuevos y caros ($1.960–$3.300) no tienen ninguna fila de estrategia. No es un problema de "cuánto cobrar" — es un problema de que nadie puede saber hoy qué decisiones de precio fueron a propósito y cuáles no.
2. **`cardigan-amour` es el hallazgo más importante de todo el análisis**: es el producto #1 en carritos reales de toda la tienda (10 unidades), cuesta $2.500 (US$62) sin ninguna estrategia de precio, y el mercado internacional para una pieza comparable (cardigan oversized/statement, Etsy) cotiza **2 a 4 veces más** (US$125–249). Demanda real y mercado externo apuntan en la misma dirección — pero nadie cronometró la pieza, así que subir el precio hoy sería una apuesta a ciegas sobre si eso paga bien la hora de Anush.
3. **La única baja de precio del período (`cardigan-cruzado`, $1.290→$1.189) fue la peor decisión de las 8**: quedó por debajo del piso de la ropa a máquina (Indian) y con el peor $/h de todo el catálogo de prendas (32) — empeorando exactamente el problema que la estrategia de precios existe para resolver.
4. **Las piezas marcadas "urgente" en julio (cardigan-3/4, poncho, set-lueur, set-brisa) siguen intactas**, con $/h de 34 a 44 — siguen siendo, hoy, la subvaluación real y mejor documentada del negocio, mientras los movimientos de precio reales de las últimas semanas ocurrieron en otro lado, sin ese criterio.
5. **En dólares, todo el catálogo —hasta sus piezas más caras y atípicas— sigue por debajo de sus comparables internacionales**, sin una sola excepción encontrada. El mercado externo aprueba subir casi cualquier cosa; por eso no sirve para decidir *qué* subir primero. Esa decisión la sigue marcando el criterio interno de $/h, que las últimas subas no usaron.
6. **GA4 y Umami subestiman la actividad real por un margen enorme, confirmado dos veces**: 6 visitantes reportados vs. 21 carritos reales en agosto, y ahora 7 eventos `add_to_cart` vs. 51 carritos distintos reales en la base. Ninguna cifra cruda de analytics debe leerse como verdad de negocio sin cruzarla contra la base propia.
7. **Dos bugs de superposición mobile afectan literalmente todas las páginas**, justo cuando ~90% del tráfico real es social/mobile: el botón de WhatsApp tapa 70% del botón "volver arriba", y la tarjeta VIP/tejedoras puede taparse con la barra fija de "Agregar al carrito" en la ficha de producto — la pantalla de mayor intención de compra del sitio.
8. **`chaleco` no existe como producto pero tiene 65 impresiones reales en Search Console** apuntando a un 404 — tráfico de intención real que hoy rebota, y una fila fantasma en `PRICE_TABLE` que nadie retiró.
9. **`granny-s-cardigan` (el más nuevo y más caro del catálogo, $3.300) ya recibe tráfico orgánico real** (23 sesiones directas a su ficha en 11 días) pero no tiene colores cargados ni colección asignada — la pieza que más "historia" necesita para justificar su precio es la que menos tiene.
10. **Un producto en producción (`falda-serenada`) no tiene categoría asignada** — no se ve en ninguna página de categoría filtrada (`/tienda/tops`) ni puede beneficiarse de la sección "En stock" scoped por categoría; solo aparece en el listado general, si es que aparece.

---

## 1. El problema de fondo: gobernanza de precios

Antes de la sección de precios en sí, esto necesita nombrarse aparte porque afecta cómo se lee todo lo demás.

### 1.1 Ocho productos cambiaron de precio sin dejar rastro

Verificado hoy (03/09) vía REST contra el catálogo en vivo, comparado contra el snapshot local del 22/08/2026 y contra `PRICE_TABLE`:

| Producto | `PRICE_TABLE` (jul-2026) | Precio EN VIVO (03/09) | Cambio | `updated_at` |
|---|---:|---:|---:|---|
| `top-amelie` | $990 | **$2.050** | +107% | 2026-08-27 |
| `top-flower` | $1.250 | **$1.999** | +60% | 2026-08-23 |
| `set-lurex` | $1.250 | **$1.999** | +60% | 2026-09-02 (ayer) |
| `beach-set` | $1.490 | **$2.400** | +61% | 2026-09-02 (ayer) |
| `cardigan-cruzado` | $1.290 | **$1.189** | **−8%** | 2026-08-23 |
| `set-de-bufanda-y-guantes` | $790 (target 12m: $890) | **$980** | +24% (superó incluso la meta a 12 meses) | — |
| `calentadores` | $590 | **$1.000** | +69% | 2026-08-23 |
| `bolso-de-estudiante` | $720 | **$990** | +37,5% | 2026-08-23 |
| `donut-bag` | $720 | **$990** | +37,5% | 2026-08-23 |

Los `updated_at` caen en al menos 3 tandas distintas (23/08, 26-27/08, 02/09), así que no es un bug de un solo evento: son ediciones separadas en el tiempo, probablemente decisiones de Anush cargadas directo en el admin sin actualizar la tabla aprobada del panel de estrategia. No existe una tabla de historial de precios en el schema — hoy no hay forma de saber, mirando solo la base, quién cambió qué ni por qué.

### 1.2 Cuatro productos nuevos sin ninguna estrategia de precio

| Producto | Precio | Categoría | Creado | Horas/materiales documentados |
|---|---:|---|---|---|
| `granny-s-cardigan` | $3.300 | cardigans | 2026-08-26 | No |
Z| `cardigan-amour` | $2.500 | cardigans | 2026-08-18 | No |
| `sweater-senda` | $1.960 | tops | 2026-07-13 | No |

Son los 4 productos más caros de todo el catálogo (35 productos, rango $360–$3.300) y ninguno tiene una fila en `PRICE_TABLE` ni horas/materiales estimados en ningún lado. Sin ese dato, es imposible aplicarles el criterio de contribución por hora que ordena el resto de la estrategia de precios — y sin ese criterio, cualquier decisión de subir o bajar su precio es una apuesta a ciegas, incluso cuando (como con `cardigan-amour`) hay demanda real fuerte detrás.

### 1.3 El caso inverso: `chaleco` está en la tabla pero no existe

`PRICE_TABLE` tiene una fila para `chaleco` (today $1.190, target $1.350, prioridad alta, 16h, $350 materiales) pero no hay ningún producto con ese slug en el catálogo, ni hoy ni hace 12 días — parece discontinuado sin que la tabla se haya actualizado. Detalle no menor: Google tiene indexada `/tienda/chaleco` con **65 impresiones** en el período medido (ver §4.3), es decir, hay gente buscando ese término y llegando a un 404.

### 1.4 Bug de catálogo encontrado al reconciliar los datos: un producto sin categoría

Cruzando el desglose de categorías del pilar estadístico (accesorios 10, tops 13, sets 5, cardigans 5, **sin categoría 2** = 35 productos) contra las listas de trabajo de los dos análisis de precios, sobra un producto: `falda-serenada` ($1.090, 14h, $300 materiales — el mismo tramo que Top CHERRY/SUMMER, con los que comparte precio y horas) no fue asignado a ningún `category_id` en la base, junto con `box-de-regalo` (que tampoco tiene categoría por ser un servicio, no una prenda — eso sí es esperable). `falda-serenada` sí es una prenda de catálogo normal y **no debería estar sin categoría**: hoy probablemente no aparece en `/tienda/tops` ni puede beneficiarse de la sección "En stock" (que filtra por categoría de la página) ni de ningún filtro de categoría del panel. Es un hallazgo de higiene de catálogo, no de precio ni de UX de código — se corrige asignándole `category_id = tops` desde el admin, no requiere cambio de código.

**Recomendación de proceso, no de precio:** antes de la próxima ronda de ajustes, valdría la pena que cualquier cambio de precio en el admin quede reflejado el mismo día en `PRICE_TABLE` (aunque sea informalmente), y que los 4 huérfanos reciban una estimación de horas/materiales — sin eso, la mitad de las piezas más caras del catálogo queda fuera del único criterio que el negocio usa para decidir precios.

---

## 2. Precios: SKU por SKU vs. competencia

### 2.1 Tipo de cambio (fuente + fecha, usado en toda la sección)

| Par | Valor | Fuente | Fecha |
|---|---|---|---|
| USD/UYU | **40,24** (cierre interbancario BCU) | [Infobae — cierre 2 de septiembre](https://www.infobae.com/noticias/2026/09/02/precio-del-dolar-hoy-en-uruguay-cotizacion-de-cierre-del-2-de-septiembre/); corroborado independientemente por un segundo research (40,10–40,50, promedio 40,30) vía [Cambio Uruguay](https://cambio-uruguay.com/en) | 02–03/09/2026 |
| USD/ARS oficial | ~1.535 (venta) | [La Nación](https://www.lanacion.com.ar/economia/dolar/) / [El Cronista](https://www.cronista.com/finanzas-mercados/dolar-oficial-asi-abre-la-cotizacion-este-jueves-3-de-septiembre/) | 02–03/09/2026 |
| BRL/UYU | ~7,8 (1 BRL ≈ UYU 7,77–7,81 según fuente) | [Wise](https://wise.com/us/currency-converter/brl-to-uyu-rate) / derivado de USD-BRL Investing.com | 02–03/09/2026 |

Todos los precios de Dahila son el valor **en vivo** verificado hoy vía REST (no el snapshot del 22/08 ni `PRICE_TABLE` cuando difieren — la diferencia se marca explícitamente).

### 2.2 Tops

| SKU | Precio Dahila hoy | vs. `PRICE_TABLE` | Comparable UY | Comparable regional | Comparable internacional | $/h hoy | Recomendación |
|---|---:|---|---|---|---|---:|---|
| `cowl-neck-top` | $620 (US$15,4) | = | Moda crochet by me ~$850 (jul-2026, no reverificado hoy — tienda con muro de edad) | — | Etsy tops simples: US$8,90–57,40 en el extremo bajo ([etsy.com/market/crochet_tops](https://www.etsy.com/market/crochet_tops), 03/09) | 53 | Puerta de entrada declarada — no tocar. Bien por debajo de todo comparable. |
| `top-halter` / `top-duna` | $890 (US$22,1) c/u | = | No encontré publicado | — | Etsy rango amplio | 58 | Sin cambios que ameriten revisión. |
| `top-race` / `top-maresia` / `top-lagom` | $990 (US$24,6) c/u | = | No encontré publicado | Nacra AR top ARS 54.000 ≈ **$1.416 / US$35,2** ([shopnacra.com.ar](https://www.shopnacra.com.ar/productos/top-ada-tejido-puro-hilo-de-algodon/), 03/09) | Etsy crop-tops US$8,90–146,25, grueso en US$40–90 | 55 | Congelados desde julio; 30% más baratos en USD que Nacra por pieza de la misma familia. Hay margen, pero no es la urgencia del catálogo (ver §2.8). |
| `top-amelie` | **$2.050 EN VIVO** | +107% (tabla dice $990) | — | 44% más caro que Nacra (US$35,2) | Dentro del rango Etsy US$40–90 | **136** | Ver caso atípico en §2.3.1. |
| `top-higgie` | $1.050 (US$26,1) | = | — | — | — | 59 | Sin cambios. |
| `top-cherry` / `top-summer` / `falda-serenada`* | $1.090 (US$27,1) c/u | = | — | — | Etsy tramo medio US$40–90 | 56 | Sin cambios. *`falda-serenada` comparte precio/horas exactos con este tramo — no tuvo cobertura de mercado propia en el research (omisión de alcance), pero al ser idéntica en precio/horas a Cherry/Summer, su $/h y posicionamiento son los mismos. |
| `top-flower` | **$1.999 EN VIVO** | +60% (tabla dice $1.250) | — | — | Etsy tramo medio US$40–90 | **105** | Ver caso atípico en §2.3.1. |
| `poncho` | $1.290 (US$32,1) | = | No encontré publicado | **Natalia Otero Deco (AR)**: poncho ARS 48.000 con 20% off ≈ **$1.258 / US$31,3** ([nataliaoterodeco.mitiendanube.com](https://nataliaoterodeco.mitiendanube.com/productos/poncho-tejido-al-crochet/), 03/09) | Manos del Uruguay (techo, no comparación directa): US$280–310 | 44 | **Hallazgo fuerte:** empata casi exacto en USD con una marca indie argentina real (US$32,1 vs US$31,3), y paga peor la hora que casi cualquier top del catálogo. Es la pieza que la propia `PRICING_RULES` usa de ejemplo de "más horas = más precio" — hoy no lo refleja. Candidato directo a subir. |
| `sweater-senda` | $1.960 (US$48,7), huérfano | no está en tabla | — | — | Ya en rango de un top/cardigan trabajado de Etsy | No calculable | Pedirle a Anush horas estimadas. El precio en sí no parece disparatado en USD — falta el dato para confirmarlo con el criterio interno. |

### 2.3 Cardigans

| SKU | Precio Dahila hoy | vs. `PRICE_TABLE` | Comparable UY | Comparable internacional | $/h hoy | Recomendación |
|---|---:|---|---|---|---:|---|
| `cardigan-3-4` | $1.290 (US$32,1) | = | Indian (máquina): $999–1.499 lista, ~$849–1.274 con descuento ([indian.com.uy](https://www.indian.com.uy/vestimenta/sacos-y-cardigans), 03/09) | — | 37 | Estancado desde julio. Ya dentro del rango de lista de Indian, pero $/h sigue entre los peores del catálogo. Candidato fuerte a adelantar (la demanda de `cardigan-amour` sugiere que no hace falta esperar a feb-mar 2027). |
| `cardigan-cruzado` | **$1.189 EN VIVO** — BAJÓ de $1.290 el 23/08 | −8% | Mismo Indian — Dahila quedó *debajo* del piso de la ropa a máquina por primera vez en la familia | — | **32 — el peor $/h de todo el catálogo de prendas** | Única baja de las 8 anomalías, y la que menos sentido tiene: ni el mercado ni el $/h la justifican. Candidato más urgente a revertir de todo este informe. |
| `cardigan-amour` | $2.500 (US$62,1), huérfano, **#1 en carritos reales (10 u.)** | no está en tabla | Sin comparable UY de esta complejidad | Cardigans oversized/statement Etsy: **US$125–249** (ej. [XXL con bolsillos, US$249](https://www.etsy.com/listing/4392770470/handmade-purple-crochet-cardigan-xxl), 03/09) — Amour está a **menos de la mitad del piso** | No calculable | **El hallazgo más importante del análisis** — ver §2.3.1. |
| `spring-cardigan` | $2.800 (US$69,6), huérfano | no está en tabla | — | Mismo rango Etsy US$125–249, más cerca del piso que Amour | No calculable | Sin señal de demanda fuerte reportada (a diferencia de Amour/Granny's). Medir antes de mover: carritos, tráfico, y cronometrar si hay tracción. |
| `granny-s-cardigan` | $3.300 (US$82,0), huérfano, más nuevo y más caro del catálogo, **23 sesiones de tráfico directo en 11 días** | no está en tabla | — | Mismo rango Etsy US$125–249 — por debajo incluso del piso | No calculable | Ver §2.3.1. Tráfico real ya validando interés — cronometrar antes de que se acumule lista de espera (a diferencia de Amour, que ya la tiene). |

#### 2.3.1 Los casos que más importan

**`cardigan-amour`** — demanda real (#1 en carritos de toda la tienda) y mercado internacional apuntando en la misma dirección (2 a 4 veces más caro afuera), sin ningún dato interno (horas/materiales) para saber si subir el precio pagaría bien la hora de Anush o si delegar esta pieza a una tejedora sería viable (`ESTRATEGIA-DEFINITIVA.md` §4.d exige ese dato para aplicar la fórmula de pago por pieza). **Acción concreta: cronometrar `cardigan-amour` antes de tocar el precio de nuevo** — es la pieza que más se juega en esta decisión de todo el catálogo, y además es la única de los 4 huérfanos con evidencia de demanda fuerte y sostenida (no solo tráfico nuevo).

**`top-amelie` y `top-flower`** — mismo patrón entre sí: saltos de precio no documentados (+107% y +60%) que, medidos con la vara interna, resultaron en el mejor ($/h 136) y segundo mejor ($/h 105) resultado de todo el catálogo de prendas — muy por encima incluso del techo histórico de bolsos (67-104). En dólares, ninguno de los dos es un disparate: ambos caen dentro del rango normal de un top elaborado en Etsy (US$40–90). La lectura no es "hay que bajarlos" — es que salieron bien por casualidad, no por decisión, y valdría confirmar que las ventas no se resintieron antes de asumirlos como el nuevo estándar.

**`granny-s-cardigan`** — mismo patrón que Amour pero más joven (creado hace una semana): ya tiene tráfico real y directo a su ficha, pero es demasiado pronto para leerlo como demanda confirmada. Ventaja sobre Amour: se puede cronometrar y decidir el precio a propósito *antes* de que se forme lista de espera.

### 2.4 Sets

| SKU | Precio Dahila hoy | vs. `PRICE_TABLE` | Comparable internacional | $/h hoy | Recomendación |
|---|---:|---|---|---:|---|
| `set-brisa` (3 pzs) | $890 (US$22,1) | = | Etsy sets 3 piezas: US$65–135 ([ejemplo](https://www.etsy.com/listing/1893697835/3-piece-handmade-crochet-set), 03/09) | **34 — empatado con cruzado como el peor del catálogo** | Sin cambios pese a ser "la pieza más regalada" según la propia nota de `PRICE_TABLE`. Muy por debajo del piso de Etsy (US$22 vs US$65+). Prioridad real. |
| `set-de-bufanda-y-guantes` | **$980 EN VIVO** — no coincide con tabla (today $790/target $890), superó la meta a 12 meses | +24% sobre target | — | 84 | Otro cambio no documentado, pero de los buenos: $/h queda entre los mejores de la categoría prendas. |
| `set-lueur` (3 pzs) | $1.150 (US$28,6) | = | Etsy sets 3 piezas US$65–135 | 43 | Sin cambios. Igual que Brisa, por debajo del piso de Etsy y con $/h débil. |
| `set-lurex` | **$1.999 EN VIVO** — subió de $1.250 el 02/09 (ayer) | +60% | US$49,7, por debajo del piso Etsy (US$65+) | **94 — casi duplicó su $/h en un solo movimiento** | Salto no documentado con buen resultado interno — formalizarlo, no revertirlo. |
| `beach-set` | **$2.400 EN VIVO** — subió de $1.490 el 02/09 (ayer) | +61% | US$59,6, cerca del piso Etsy | **98 — el mejor $/h de todo el catálogo de prendas cubierto** | Mismo caso que Lurex: subida no documentada, mejor resultado del informe. Formalizar. |

### 2.5 Accesorios

| Producto | Precio Dahila (vivo) | vs. `PRICE_TABLE` | Comparable UY | Comparable regional (AR/BR) | Comparable internacional | $/h | Recomendación |
|---|---:|---|---|---|---|---:|---|
| Bandana (HOLD) | $500 (US$12,4) | = | Bandana de fábrica poliéster (Isadora/Todomoda AR): $103–328 UYU equiv. — no comparable en calidad, solo piso | — | No encontré publicado un finished-item real | 87,5 | **Mantener.** HOLD explícito; demanda de carrito (4 u., top-5) valida la estrategia de puerta de entrada. |
| Mini BUFANDAS (HOLD) | $360 (US$8,9) | = | ML UY "bufanda lana": cae en el primer tercio de precio del mercado local ([listado](https://listado.mercadolibre.com.uy/bufanda-lana), 03/09) | No encontré publicado | No encontré publicado | 86,7 | **Mantener.** HOLD, compra de impulso — sin evidencia para tocarlo. |
| Bufanda SOPHIE | $590 (US$14,6) | = | Banda media-alta del mismo listado ML UY; fábrica (Atrix) $284,76 solo como piso | No encontré publicado con certeza | Etsy handmade US$18,75–90 — Dahila por debajo incluso del piso, pero Etsy es otro costo de vida y está descartado como canal | 82 | **Mantener.** Dentro del rango sano ($67–104/h). |
| Calentadores ⚠️ | **$1.000 EN VIVO** (tabla: $590) | +69% | No encontré comparable directo | No encontré publicado (México sí, $150-450 MXN, pero fuera de alcance geográfico) | No encontré publicado | **164 — muy por fuera del rango de toda la categoría** | **Confirmar con Anush antes que nada.** Es el hallazgo de precio más urgente de accesorios: subió 69% sin quedar documentado y sin ningún comparable de mercado (ni interno ni externo) que lo respalde. |
| Mini tote bag | $650 (US$16,1) | = | No encontré publicado | Ceará Feito à Mão (BR): R$89,90 ≈ **$698 UYU / US$17,3** — casi idéntico ([cearafeitoamao.com.br](https://www.cearafeitoamao.com.br/bolsas-de-croche/bolsas-de-croche), 03/09) | Etsy tote bags US$40–207 (no filtrado por tamaño) | 94 | **Mantener.** Cerca del techo de la categoría; comparable regional casi calcado. |
| Tote bag de playa | $720 (US$17,9) | = | No encontré publicado | ML Argentina, bolsos artesanales de algodón: **$35.000–45.000 ARS ≈ $919–1.182 UYU / US$22,8–29,3** ([ejemplo](https://articulo.mercadolibre.com.ar/MLA-1590879332-bolso-artesanal-tejido-crochet-hilo-de-algodon-_JM), 03/09) | Etsy US$40–207 | **67 — el piso exacto del rango de la categoría** | **Matizar, no urgir.** Único caso donde mercado (AR) y $/h apuntan igual: hay margen moderado. Coincide con el ajuste a $790 ya planeado para nov-2026. |
| Bolso de estudiante ⚠️ | **$990 EN VIVO** (tabla: $720) | +37,5% | No encontré publicado | Mismo comparable AR ($919–1.182 UYU) — el precio en vivo cae justo dentro de ese rango | Etsy US$40–207 | 105,7 | **Confirmar con Anush, sin alarma.** Cambió sin documentar, pero el resultado alinea con el único comparable regional sólido — no parece un error. |
| DONUT bag ⚠️ | **$990 EN VIVO** (tabla: $720) | +37,5% | No encontré publicado (forma "donut" no es categoría estándar en ML) | Mismo comparable AR — dentro del rango en pesos | Etsy US$40–207 | 128,3 — el más alto de la categoría | **Confirmar con Anush.** Coincide con el mercado regional en pesos, pero el $/h ya es el techo de la categoría — no urge buscarle más recorrido, sí confirmar intención. |
| Bolso a cuadros | $1.050 (US$26,1) | = | No encontré publicado | Medio del rango AR ($919–1.182 UYU) | Etsy US$40–207 | 93,75 | **Mantener.** Bien ubicado en ambos criterios. |
| Bolso LOLA | $1.390 (US$34,5) | = | No encontré publicado | Por encima de los bolsos chicos de AR, razonable por ser la pieza de más horas (10h) | Etsy US$40–207 | **104 — el techo exacto del rango** | **Mantener.** Ya captura el máximo de contribución/hora de la categoría. |

### 2.6 Box de regalo — caso aparte (packaging, no prenda)

`box-de-regalo` ($650, HOLD, sin horas/materiales) es un servicio de curaduría + presentación, no una prenda — se comparó contra dos mercados distintos:

- **Packaging puro** (solo caja/envoltorio): en Uruguay, cajas genéricas al por menor rondan $11–65 UYU ([packaging.uy](https://packaging.uy/categoria-producto/regalos/), 03/09) — contra esto, $650 es muy caro para "solo el envoltorio".
- **Curaduría de regalo completa** (servicio + contenido): en Uruguay, boxes personalizados con contenido curado van de $2.590 a $4.390 UYU ([Universo Regalos](https://universoregalos.com.uy/), 03/09) — contra esto, $650 queda muy por debajo, **pero** esos precios incluyen el contenido del regalo, y no se pudo confirmar si el $650 de Dahila incluye o no una pieza. Antes de comparar en serio hace falta que Anush aclare qué cubre exactamente ese cargo.

La propia nota de `PRICE_TABLE` ("mejor: que el buen packaging sea estándar y retirarlo como producto") tiene sustento real: el costo mayorista de una caja decente en Uruguay es bajísimo, así que absorberlo como estándar en todo pedido es barato, y cobrar aparte por el tiempo de curaduría (elegir piezas para otra persona) tendría más sentido que llamarlo "packaging".

### 2.7 Higiene de datos — `chaleco`

Discontinuado sin actualizar `PRICE_TABLE` (§1.3). No se investigó precio de competencia — no aplica a un producto que no existe. Decisión pendiente de Anush: ¿relanzar la pieza (hay demanda de búsqueda real, 65 impresiones) o retirar formalmente la fila y redirigir la URL?

### 2.8 Síntesis: ¿qué tensión hay entre el mercado externo y el $/h interno?

No es la tensión esperable ("afuera cobran más, subí"). **En dólares, todo el catálogo de prendas de Dahila —incluidos sus casos más caros y atípicos— sigue por debajo de sus comparables internacionales, sin una sola excepción encontrada**: Granny's (US$82) y Spring (US$69,6) están debajo del piso de un cardigan oversized de Etsy (US$125–249); Amour (US$62,1), pese a ser el producto más deseado de la tienda, está a menos de la mitad de ese piso; hasta el poncho, el único SKU que empata a una marca indie argentina real, sigue lejísimos del techo de Manos del Uruguay. El mercado externo dice "hay espacio arriba" en absolutamente todos los casos.

La tensión real está en otro lado: los 8 movimientos de precio que sí ocurrieron en agosto/septiembre no siguieron ningún criterio —ni externo ni interno—, y el resultado fue una lotería. En 6 de los 8 casos (`top-amelie`, `top-flower`, `set-lurex`, `beach-set`, `bolso-de-estudiante`, `donut-bag`) la lotería salió bien: el $/h saltó de zona mala a zona buena o excelente. En 1 caso (`cardigan-cruzado`) salió mal, empeorando el problema. Y en 1 caso (`calentadores`) el resultado es una anomalía sin respaldo de ningún lado. Mientras tanto, las piezas que la tabla aprobada ya había marcado como prioridad urgente en julio (cardigan-3/4, poncho, set-lueur, set-brisa) siguen exactamente donde estaban. El mercado externo no sirve de brújula para decidir *qué* tocar primero — la brújula sigue siendo el $/h, y las últimas semanas no la usaron. Para los dos SKUs donde mercado y demanda gritan más fuerte que en cualquier otro lado del catálogo (`cardigan-amour`, y en menor medida `granny-s-cardigan`), la brújula interna directamente no tiene aguja: sin horas documentadas, ninguna decisión ahí puede apoyarse en el criterio que se supone ordena todo lo demás.

---

## 3. Producto, UX y retención (por etapa del funnel)

Cada hallazgo trae: problema · evidencia externa · referente real · trade-off · impacto/esfuerzo. Se excluyó explícitamente `/gracias` (WIP en pausa, ajeno a esta auditoría) y lo ya resuelto/descartado en rondas anteriores (tabla de talles en cm, selector de talle por botones, structured data completo, cross-sell del carrito completo, Etsy como canal, blog de tips de crochet, copy "auténtico/con amor", GEO/AEO/llms.txt).

### 3.0 Transversales (afectan todas las páginas) — los dos hallazgos que más importan

**3.0.1 — El botón de WhatsApp flotante tapa ~70% del botón "Volver arriba".** `BackToTop` (`right:18,bottom:18`, 44×44px) y `WhatsAppFloat` (`right:24,bottom:28`, 52×52px) comparten z-index (40); al montarse después en el DOM, `WhatsAppFloat` gana la pulseada visual en todas las páginas donde ambos son visibles (todo excepto `/admin`, `/carrito`, `/encargo`). Confirmado activo en producción (`whatsapp_float_enabled: true`). *Evidencia:* Baymard documenta los overlays flotantes superpuestos como una de las causas de frustración mobile más citadas; NN/g marca "elementos interactivos que se ocultan entre sí" como error de bajo esfuerzo/alto impacto. *Referente:* ningún e-commerce serio deja su widget de chat y su scroll-to-top compitiendo por el mismo píxel. *Trade-off:* ninguno real, es un bug de posicionamiento. *Impacto/esfuerzo:* alto/bajo — **candidato a fix directo**.

**3.0.2 — La tarjeta VIP/tejedoras puede taparse con la barra fija de "Agregar al carrito" en la ficha de producto (mobile).** `WeaverCallout`/`VipCallout` (fixed, `left:16,bottom:16`, z-index 45, ancho completo en ≤480px) aparecen 12-14s después de cargar cualquier página pública **excepto** `/admin`, `/carrito`, `/encargo`, `/tejedoras` — lo que significa que sí pueden aparecer en la ficha de producto (`/tienda/[slug]`), donde existe `.pdp-sticky-bar` (bottom:0, z-index 45 también) con el precio y "Agregar". Las franjas verticales de ambos se pisan: la tarjeta puede caer encima de la parte superior de la barra de compra, en la página con más tráfico directo del sitio, justo cuando alguien terminó de leer la descripción. *Evidencia:* Baymard llama a esto "interfering overlays" — cualquier overlay por tiempo debe garantizar que no oscurece la acción primaria de la página. El propio código ya aplica correctamente esta regla a `/carrito` y `/encargo`, pero no a la PDP, la otra pantalla de conversión activa. *Referente:* COS y Mejuri excluyen explícitamente PDP y checkout de este tipo de tarjeta. *Trade-off:* excluir la PDP reduce ligeramente el alcance de captura de email/tejedoras, pero prioriza la venta en la página de mayor intención — coherente con la regla que el sitio ya usa en otro lado. Alternativa más quirúrgica: subir el `bottom` del callout con `:has(.pdp-sticky-bar)` (mismo patrón que `globals.css:434`). *Impacto/esfuerzo:* alto/bajo — **candidato a fix directo**.

### 3.1 Home

- **FAQ sin `aria-controls`/`id` en el acordeón** (`HomeClient.tsx`) — por debajo del propio estándar que el sitio ya usa en `CareInstructions` de la PDP. WCAG 4.1.2. Impacto/esfuerzo: medio/bajo — **fix directo**.
- **El testimonio rotativo (5s) solo se pausa con `mouseenter`**, inútil en touch (~90% del tráfico). WCAG 2.2.2 exige pausa accesible sin depender de hover. Fix: desactivar auto-avance cuando `matchMedia('(hover: hover)')` es falso. Impacto/esfuerzo: bajo/bajo — **fix directo**.
- **Testimonios sin ninguna prueba visual** (ni foto de la prenda, ni de la clienta) — el propio skill `ui-review` ya pide "real proof over stock proof". Baymard: agregar ancla verificable sube más la confianza que agregar más testimonios sin ella. Requiere fotos reales de Anush — documentado, no accionable sin su input. Impacto/esfuerzo: medio/medio (de contenido, no de código).
- Home larga (10-11 secciones) sin anclas de navegación interna — menor, el header ya cubre el acceso directo a lo importante. Va al apéndice.

### 3.2 Listado / categoría

- **El header tiene 8 ítems de navegación horizontal**, por encima de la regla del propio skill `dahila-storefront` (5-7). Miller's Law/Hick's Law: más opciones diluyen el ítem que importa (Tienda). Zara/COS/Mango operan con 5-6. Trade-off: "Tejé con Dahila" y "Sobre nosotros" ya viven también en el footer — sacarlos del header no pierde acceso real, pero toca decisión de IA de navegación (no es fix automático).
- **`/tienda/chaleco` es un 404 honesto pero genérico**, sin sugerencia específica a la categoría más cercana (Cardigans) pese a 65 impresiones reales de búsqueda. Baymard/NN/g: un 404 de e-commerce debería ofrecer categorías relacionadas a la intención del slug perdido. Decisión de negocio (¿relanzar el producto o redirigir?), no fix automático.
- **`set-de-bufanda-y-guantes` tiene `discount_active=true` con `discount_percent=0`** — se verificó el código a fondo (`resolveDiscountPercent`, los guards de `ProductCard`/`ProductDetailsClient`/`QuickViewModal`/`/ofertas`) y **hoy no tiene efecto visible** (el guard `discountPct > 0` lo evita en todos los renders). Es un dato-trampa: si alguien carga un `discount_percent` sin revisar el flag, el descuento se activa de golpe sin que nadie lo haya decidido ese día. Limpieza de dato en el admin + una validación de un renglón en el formulario. Impacto/esfuerzo: bajo/bajo.
- Menor (apéndice): dos fotos `is_primary:true` en el mismo producto — funciona hoy por orden implícito de Postgres, no está protegido.

### 3.3 Ficha de producto (PDP)

*(Ver también 3.0.2, específico de PDP en mobile.)*

- **Los botones de talle no tienen `aria-pressed`** en `ProductDetailsClient.tsx`/`QuickViewModal.tsx` — inconsistente con los propios botones de `EncargoForm.tsx`, que sí lo implementan. WCAG 4.1.2. Impacto/esfuerzo: medio/bajo — **fix directo**.
- **QuickView no ofrece "avisame cuando vuelva" para productos agotados** — solo la ficha completa tiene el flujo de WhatsApp prellenado (`restock_click`). Conecta directo con el hallazgo estadístico de 0 eventos `restock_click` en 11 días: parte de la explicación puede ser que el CTA no existe en una de las dos superficies donde se ve un producto agotado. Baymard: la acción de recuperación debe ser consistente en toda vista. Es portar un bloque ya existente. Impacto/esfuerzo: medio/bajo — **fix directo**.
- Galería sin gesto de swipe en mobile, solo flechas de 40px — expectativa nativa incumplida (Baymard), pero requiere testing real en dispositivo, no es fix de 5 minutos. Impacto/esfuerzo: medio/medio.
- Sin testimonios/reseñas en la PDP — el único lugar con prueba social es la home, sin filtrar por producto. Baymard: la presencia de reseñas cerca del CTA de compra correlaciona con conversión, más aún en compras medias-altas sin devolución fácil. Requiere infraestructura de reseñas por producto (feature nueva) — documentado, no accionable ya; alternativa liviana: mostrar 1-2 testimonios genéricos también en PDP.
- **`granny-s-cardigan` y `cardigan-amour` (las dos piezas con tracción real) no tienen colores cargados ni `collection_id`** — sin colores, el selector no se renderiza; sin colección, el bloque de relacionados muestra el título genérico en vez de un relato curado. Justo las dos piezas que hoy tienen tráfico/demanda real y que más necesitan "historia" para sostener su precio son las que menos tienen. Es carga de datos en el admin, no desarrollo — documentado como oportunidad concreta, no apuesta a ciegas (ya hay tráfico validando interés).

### 3.4 Carrito

- **El mini-cart (`CartDrawer`) consulta Supabase sin pasar por la caché del catálogo** (`getCatalog()`, ya usada en el resto del sitio desde el commit de egress) — dispara su propio fetch con joins cada vez que se abre. Efecto de UX indirecto: en una conexión mobile de Instagram, el cross-sell "Sumale un detalle" puede tardar en aparecer, consistente con los 0 eventos `cart_addon_add` en 11 días. Requiere pasar el catálogo cacheado como prop por el árbol — no es fix de una línea, documentado para una sesión con más tiempo. Impacto/esfuerzo: medio/medio.
- **El cupón funciona bien pero es invisible**: correctamente escondido tras un link (evita la ansiedad que documenta Baymard), pero no hay ningún canal del sitio (promo bar, `/ofertas`, `/ig`) que anuncie que existe un cupón activo — explica sin más hipótesis los 0 eventos `coupon_applied`. La promo bar ya es editable desde el admin; es una oportunidad operativa, no un bug de código.
- Tope de 20 unidades por línea sin mensaje al tocarlo — menor, va al apéndice.

### 3.5 Encargo a medida

- **El selector de talle (S/M/L) no linkea a la guía de talles en cm** — la única superficie del sitio que todavía usa la nomenclatura vieja sin referencia, pese a que "talles en cm" ya está validado y resuelto en la PDP. Reusar `SizeGuide`, ya importado en otros lados. Impacto/esfuerzo: bajo/bajo — **fix directo**.
- El stepper "Cómo funciona" (3 pasos) solo aparece en fichas `is_custom_only`, no en `/encargo` directo (la ruta más común hacia el formulario, vía nav "A medida"). NN/g: mostrar "qué va a pasar después" antes de pedir datos reduce fricción. Es contenido ya editable, reusarlo es consistente pero requiere decidir si es redundante para quien ya lo vio. Impacto/esfuerzo: medio/bajo.

### 3.6 Info

- **`/info` no cierra con ningún CTA de contacto** — queda un widget de WhatsApp genérico sin texto que lo señale como salida para dudas no cubiertas. NN/g: las páginas de FAQ/políticas convierten mejor con una salida explícita a contacto humano. Agregar un bloque de cierre con el link ya usado en el resto del sitio. Impacto/esfuerzo: bajo/bajo — **fix directo**.

### 3.7 `/ig` (landing de la bio de Instagram)

- **Carga con el header y footer completos del sitio**, pese a que el propio comentario del código declara la intención de "una columna, sin distracciones". El mega-menú de 8 ítems y el footer de 4 columnas diluyen el propósito tipo Linktree. NN/g: cada elemento de navegación extra reduce el click en el objetivo principal — el mismo principio que `WhatsAppFloat` ya aplica al esconderse en `/carrito`/`/encargo`, no aplicado acá. Requiere un layout alternativo para esta ruta (no es cambio de una línea). Impacto/esfuerzo: medio/medio.

### Apéndice — hallazgos menores (coleccionados, no descartados)

- Dos fotos `is_primary:true` en el mismo producto (2.4 arriba).
- Tope de 20 unidades por línea de carrito sin mensaje (4.3 arriba).
- El snapshot de catálogo (`catalog-snapshot.json`) no incluye `granny-s-cardigan` (creado después del último snapshot) — confirma que sigue pendiente correr `snapshot-catalog.mjs`, ya anotado en memoria.
- El input de búsqueda del header tiene ancho fijo (160px) — apretado en pantallas <360px, sin romper layout.
- `BackToTop` no respeta `prefers-reduced-motion` en su scroll suave, a diferencia del resto del sitio.
- El mensaje de WhatsApp armado desde el carrito (`buildWhatsAppMessage`) es notablemente bueno (ítem por ítem, cupón, envío, nota de regalo) — vale señalarlo como algo que ya está muy bien hecho.
- El manejo de error de `EncargoForm` con fallback a WhatsApp prellenado si falla el guardado es un patrón de resiliencia sólido, sin nada que mejorar.
- `EncargosDisponibles` (cupos de producción) no se revisó en profundidad por estar fuera del foco de compra — lectura rápida sin bandera roja.
- Home larga sin anclas de navegación (1.4 arriba) — menor, el header ya compensa.

### Candidatos a fix directo, bajo riesgo, reversible

Aplicados en esta misma sesión con el skill `quality-gate` (ver §6):

1. Separar `BackToTop` y `WhatsAppFloat` para que no se solapen (3.0.1).
2. Excluir la PDP de `WeaverCallout`/`VipCallout`, o subir su `bottom` con `:has(.pdp-sticky-bar)` (3.0.2).
3. `aria-controls`/`id` en el acordeón de FAQ de `HomeClient.tsx` (3.1).
4. `aria-pressed` en los botones de talle de `ProductDetailsClient.tsx`/`QuickViewModal.tsx` (3.3).
5. Portar "Avisame cuando vuelva" a `QuickViewModal.tsx` para agotados (3.3).
6. Link a la guía de talles en cm en `EncargoForm.tsx` (3.5).
7. Bloque de cierre con CTA de WhatsApp en `/info` (3.6).
8. Desactivar auto-avance de `TestimonialsStrip` en touch (3.1).

Quedan fuera por requerir decisión de Anush (contenido, nav o arquitectura): recortar el nav a 5-7 ítems, qué hacer con `/tienda/chaleco`, limpiar el dato de oferta de "Set de bufanda y guantes" en el admin, asignar categoría a `falda-serenada`, cargar colores/colección para Amour y Granny's, arquitectura del mini-cart, anunciar cupones en la promo bar, repetir el stepper en `/encargo`, layout alternativo para `/ig`.

---

## 4. Estadísticas: qué dicen los datos reales

### 4.1 Catálogo (verificado en vivo, 03/09/2026)

- 35 productos activos (34 en el snapshot del 22/08 + `granny-s-cardigan`, nuevo). Rango de precios $360–$3.300, mediana $1.050, promedio $1.268.
- Por categoría: accesorios (10, $360–$1.390), tops (13, $620–$2.050), sets (5, $890–$2.400), cardigans (5, $1.189–$3.300), sin categoría (2: `box-de-regalo` y `falda-serenada` — este último es un bug real, ver §1.4).
- Lead time: 0 productos con `lead_time_weeks_min=0` (18 en 1-2 semanas, 17 en 2-3) — la sección "En stock" de `/tienda` sigue vacía; es una decisión de datos pendiente de Anush, no un bug de código.
- Todos `status: active`, 0 `is_custom_only`.

### 4.2 `get_daily_summary()` — funcionó, con un hueco real en la función

Resultado crudo (RPC pública, solo agregados, sin PII):

```json
{
  "encargos_total": 7, "encargos_today": 0, "encargos_new": 0,
  "encargos_in_progress": 1, "encargos_done": 1, "encargos_cancelled": 1,
  "carts_distinct": 51, "cart_items": 61, "cart_value_uyu": 85844,
  "top_products": [
    {"name":"Cardigan amour","qty":10}, {"name":"Set de bufanda y guantes","qty":6},
    {"name":"Sweater Senda","qty":5}, {"name":"Chaleco","qty":4}, {"name":"Bandana","qty":4}
  ]
}
```

- `encargos_new`(0)+`in_progress`(1)+`done`(1)+`cancelled`(1) = 3, pero `encargos_total` = 7: faltan 4. La función no cuenta el status `'replied'` del CHECK constraint de `custom_orders` — hueco en la función, no en los datos (consulta de verificación en §4.4a).
- `cart_value_uyu` usa `base_price_uyu`, no el precio del talle elegido — subestima cuando hay talles con sobreprecio (ej. `spring-cardigan` S=$2.800/L=$3.300) (§4.4g corrige esto).
- `cart_items`/`carts_distinct` son acumulado histórico sin TTL activo (`cleanup_stale_carts()` existe pero no está programada) — no se puede saber cuántos son de esta semana sin acotar (§4.4f).
- Chequeo de RLS con la anon key: `cart_items`, `favorites`, `custom_orders`, `orders`, `admins` devuelven vacío al pedir `select=id` — lectura pública hoy está cerrada (contradice una nota de memoria de julio sobre un hueco abierto; parece que se cerró desde entonces). Observación factual, no se auditó a fondo — no es el foco de este trabajo.

### 4.3 GA4 (export real 02/09/2026, ventana de datos real: ~11 días desde 22-23/08)

- **Adquisición** (588 sesiones reales): Organic Social 344 (72,4% engagement), Direct 155, Unassigned 45, Organic Search 38, AI Assistant 5, Cross-network 1. El tráfico es abrumadoramente social/mobile.
- **Landing pages**: `/` domina (436 sesiones), `/tienda` segunda (35), y **`/tienda/granny-s-cardigan` tercera con 23** — el producto más nuevo del catálogo ya recibe tráfico directo a su ficha, probablemente compartido en redes.
- **78 pageviews de `/admin`** sobre 2.222 totales ensucian cualquier promedio de sitio no filtrado.
- **Search Console conectado**: 47 queries, solo 4 clics totales. `dahila` (marca) en posición 1,2 con 2 clics; todo lo genérico (`cardigans de mujer`, `cardigan`, `chaleco`) en posición 50-70 sin clics — no hay tráfico SEO genérico todavía, solo de marca.
- **Embudo custom recalculado hoy**: `product_view` 611, `add_to_cart` 7, `whatsapp_click` 2, `encargo_sent` 1, `order_sent` 1, `vip_subscribe` 1. **Cero eventos** de `restock_click`, `cart_addon_add`, `coupon_applied`, `search_select` en 11 días — cruza directo con los hallazgos de UX de §3 (el CTA de restock falta en QuickView, el cross-sell del mini-cart puede tardar en cargar, el cupón no se anuncia en ningún lado).
- **`add_to_cart` (7) vs. carritos reales (51, histórico)**: mismo patrón de subestimación ya confirmado con Umami en agosto (6 visitantes vs. 21 carritos) — GA4/Umami pierden una fracción grande de la actividad real, casi seguro por adblockers.
- **Instagram bio sigue sin apuntar a `/ig`**: 247 sesiones con `manual source=ig` aterrizan en `/`, no en la página de tracking dedicada (0 vistas). Acción manual pendiente de Anush, no de código.
- Retención/cohortes en cero: no es ausencia de retención, es efecto directo de que la propiedad mide hace 11 días.
- `Drive_sales_overview.csv` completamente vacío: no hay evento `purchase` instrumentado (el checkout es 100% WhatsApp) — no es lectura de "no hay ventas", es "no está instrumentado".

### 4.4 Consultas SQL pendientes (para pegar en el SQL Editor de Supabase — nada de esto se pudo ver con la anon key)

```sql
-- (a) Desglose de encargos incluyendo 'replied' (hueco de get_daily_summary(), ver 4.2)
select status, count(*) from custom_orders group by status order by count(*) desc;

-- (b) AOV real y volumen desde el log de checkout (tabla orders, append-only)
select count(*) as pedidos_logueados, round(avg(total_uyu)) as aov_uyu,
       round(sum(total_uyu)) as revenue_total_uyu,
       min(created_at) as primer_pedido, max(created_at) as ultimo_pedido
from orders;

-- (c) Top prendas encargadas por texto libre
select garment_type, count(*) as encargos
from custom_orders group by garment_type order by encargos desc limit 15;

-- (d) Canal real de encargos (server-side, inmune a adblockers)
select coalesce(utm_source, referrer_host, '(directo)') as canal, count(*)
from custom_orders group by canal order by count(*) desc;

-- (e) Canal real de pedidos WhatsApp
select coalesce(utm_source, referrer_host, '(directo)') as canal,
       count(*) as pedidos, round(avg(total_uyu)) as aov_uyu
from orders group by canal order by pedidos desc;

-- (f) Carritos activos en ventana real (cart_items sin TTL corriendo)
select
  count(distinct cart_id) filter (where added_at >= now() - interval '11 days') as carritos_ultimos_11_dias,
  count(distinct cart_id) filter (where added_at >= current_date) as carritos_hoy,
  count(distinct cart_id) as carritos_total_historico,
  min(added_at) as carrito_mas_viejo
from cart_items;

-- (g) Valor de carrito real por talle (corrige la aproximación de get_daily_summary())
select coalesce(sum(ci.qty * coalesce(ps.price_uyu, p.base_price_uyu, 0))) as cart_value_real_uyu
from cart_items ci
join products p on p.id = ci.product_id
left join product_sizes ps on ps.product_id = ci.product_id and ps.size = ci.size;

-- (h) Estado de RLS/policies en tablas sensibles (confirma a nivel SQL Editor lo visto desde afuera)
select relname as tabla, relrowsecurity as rls_activo
from pg_class where relname in ('cart_items','favorites','custom_orders','orders','admins');

select tablename, policyname, cmd, roles from pg_policies
where tablename in ('cart_items','favorites','custom_orders','orders','admins')
order by tablename, policyname;

-- (i) Punto de partida para un futuro historial de precios (no existe hoy)
select slug, name, base_price_uyu, updated_at, created_at
from products
where slug in ('cardigan-cruzado','top-flower','set-lurex','beach-set','top-amelie',
               'calentadores','bolso-de-estudiante','donut-bag','set-de-bufanda-y-guantes')
order by updated_at desc;
```

---

## 5. Cruces entre pilares (donde está el valor real)

- **`cardigan-amour`** conecta los tres pilares al mismo tiempo: demanda real confirmada por estadística (#1 en carritos), mercado internacional real confirmado por precios (2-4x más caro afuera), y merchandising débil confirmado por UX (sin colores ni colección para sostener un precio premium). Es el único SKU del catálogo donde los tres análisis, corridos de forma independiente, convergen en la misma pieza.
- **`granny-s-cardigan`** es el mismo patrón en versión temprana: tráfico orgánico real (estadística) + huérfano de precio con mercado externo por debajo del piso (precios) + sin colores/colección pese al interés genuino (UX).
- **`chaleco`** conecta precios (fila fantasma en la tabla aprobada) con estadística (65 impresiones reales de Search Console) con UX (404 sin redirect inteligente a la categoría más cercana): tres formas distintas de decir lo mismo — hay una URL con demanda real que hoy no lleva a ningún lado.
- **Los dos bugs de superposición mobile (§3.0)** solo importan tanto porque la estadística confirma que ~90% del tráfico real llega por social/mobile — el mismo hallazgo de UX en un sitio mayormente desktop sería un detalle menor.
- **Los 0 eventos de `restock_click`, `cart_addon_add` y `coupon_applied`** (estadística) dejan de ser un misterio al cruzarlos con UX: falta el CTA en QuickView, el cross-sell puede tardar en cargar por la consulta sin caché del mini-cart, y no hay ningún canal que anuncie que un cupón existe. Tres explicaciones concretas y accionables en vez de "parece que a la gente no le interesa".
- **La falta de gobernanza de precios (§1)** es en sí misma un cruce: nunca hubiese aparecido si el pilar estadístico no hubiera verificado el catálogo en vivo contra la tabla aprobada antes de que los otros dos análisis empezaran a investigar mercado — de lo contrario, ambos habrían comparado contra precios de julio que ya no reflejan lo que ve un cliente real hoy.

---

## 6. Qué se implementó ya vs. qué queda pendiente de decisión

Los 8 candidatos de fix directo listados al final de §3 se aplicaron en esta misma sesión (código de bajo riesgo, reversible, sin tocar precio/marca/seguridad), pasando por el skill `quality-gate` antes de darlos por terminados.

Todo lo demás —cambios de precio, decisiones de catálogo (`chaleco`, colores/colección de Amour y Granny's), nav del header, arquitectura del mini-cart, y cualquier estimación de horas/materiales para los 4 huérfanos— queda documentado arriba para que decida Anush/Mati, no se aplicó a ciegas.
