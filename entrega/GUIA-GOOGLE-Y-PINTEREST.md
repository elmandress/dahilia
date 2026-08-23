# Guía: Google Analytics, Merchant Center y Pinterest

Escrita para leer de corrido, sin saber nada técnico. Todo lo que dice
"verificado" lo comprobé contra tu sitio real el 23/08/2026.

---

# PARTE 1 — Google Analytics

## Lo primero: está bien instalado. El problema es dónde estás mirando.

Verifiqué las tres capas que tienen que funcionar:

- El código de medición (`G-H77DMN5KLV`) está en tu sitio ✅
- Es el ID correcto ✅
- La seguridad del sitio le permite a Google recibir los datos ✅

**"No data received" en la pantalla de inicio es normal las primeras 24-48
horas.** Esa pantalla tarda en llenarse. No significa que esté roto.

### Para comprobar HOY que funciona

**Analytics → Informes → Tiempo real** (Realtime).

Abrí dahila.uy en el celular. En 10-20 segundos tenés que aparecer ahí como
usuario activo. Si aparecés: está funcionando y solo hay que esperar.

⚠️ **Probalo con datos móviles, no con WiFi de casa.** Si tenés un bloqueador
de anuncios en la compu, no te vas a ver a vos misma — y eso te haría pensar
que está roto cuando no lo está.

## Lo más importante que tenés que saber de Analytics

**Los números van a ser MUCHO más bajos que la realidad.** No es un error de
configuración: es que los bloqueadores de anuncios cortan el script de Google
antes de que mida.

Te lo comprobé con datos de tu propia base:

| | |
|---|---|
| Umami reportó, en cierto período | **6 visitantes** |
| Personas que en ese mismo período agregaron algo al carrito | **21** |

Agregar al carrito requiere entrar, abrir un producto y tocar "agregar". Esas
21 llegaron hondo. Las visitas reales fueron **varios cientos**.

**Qué hacer con eso:** usá Analytics para ver *tendencias* y *de dónde viene
la gente*, nunca para contar cuántas personas te visitaron. Para números
reales, mirá tu propio panel: carritos, pedidos y encargos. Eso no lo bloquea
nadie porque no pasa por Google.

## Qué mirar y qué ignorar

**Mirá esto:**

- **Tiempo real**: solo para comprobar que funciona.
- **Adquisición → Adquisición de tráfico**: de dónde viene la gente
  (Instagram, Google, directo). Acá es donde el link de la bio con medición
  se paga solo.
- **Interacción → Eventos**: `product_view`, `add_to_cart`, `order_sent`.
  Es tu embudo: cuántos miran → cuántos agregan → cuántos van a WhatsApp.

**Ignorá esto por ahora:** todo lo demás. GA4 tiene decenas de reportes
pensados para empresas grandes. Con tu volumen, no te van a decir nada que
no veas mejor en tu propio panel.

## Marcar los eventos clave (2 minutos, una sola vez)

**Admin → Eventos** (Events). Buscá `order_sent` y `encargo_sent` y prendé el
interruptor **"Marcar como evento clave"**.

Sin eso, Google no sabe cuáles de todos los eventos son "una venta" y no te
los va a mostrar como conversiones en ningún reporte.

⚠️ Los eventos solo aparecen en esa lista **después** de que ocurrieron al
menos una vez. Si no los ves todavía, es porque nadie completó un pedido
desde que instalaste el tag. Volvé a mirar en unos días.

---

# PARTE 2 — Google Merchant Center

## Qué es, en una frase

Es lo que hace que tus productos aparezcan **con foto y precio** en Google
Shopping, en Google Imágenes y en el buscador. Es gratis (los "listados
gratuitos"); los anuncios pagos son otra cosa aparte que no necesitás.

## Por qué ves muchos avisos y cuáles importan

Merchant Center muestra tres tipos de mensaje, y **se ven todos parecidos
aunque significan cosas muy distintas**:

| Tipo | Qué significa | ¿Urgente? |
|---|---|---|
| **Error** | Ese producto NO se va a mostrar hasta que lo arregles | Sí |
| **Advertencia** | Se muestra igual, pero podría andar mejor | No |
| **Pendiente de revisión** | Google todavía lo está mirando | No, esperá |

**La mayoría de lo que ves en una cuenta nueva es la tercera categoría.**
Google revisa las cuentas nuevas y eso tarda: para listados gratuitos puede
llevar **días o incluso algunas semanas**, más que para los anuncios pagos.
No es que hiciste algo mal.

**Regla práctica:** filtrá por "Error" y ocupate solo de esos. Las
advertencias y los pendientes, dejalos correr.

## Lo que ya está resuelto de tu lado (verificado)

No hace falta que toques el sitio para esto:

- ✅ Datos de producto completos (nombre, descripción, precio, moneda, stock,
  marca, fotos)
- ✅ Declarado que son productos hechos a mano sin código de barras — que es
  justo lo que Google pide para artesanías, y su ausencia es la causa más
  común de que queden productos pendientes
- ✅ Disponibilidad honesta: "a pedido" para lo que tejés, no "en stock"
- ✅ Rango de precios real cuando una prenda cuesta distinto según el talle
- ✅ Las páginas que Google exige existen y tienen contenido: `/info`
  (envíos, cambios, pago), `/terminos` y `/contacto`

## Lo que sí depende de vos

1. **Verificar el sitio** (si no lo hiciste ya con Search Console).
2. **Vincular Merchant Center con Search Console**: Configuración →
   Herramientas empresariales.
3. **Activar "Listados gratuitos"** y elegir **Uruguay** como país de venta.
4. **Configurar envío**: Google necesita saber cuánto cobrás. Si el costo lo
   coordinás por WhatsApp, poné una tarifa plana aproximada — es mejor eso
   que dejarlo vacío.
5. **Tiempo de entrega**: acá va tu plazo real de producción, no "1 día".
   Poner un plazo que no cumplís es peor que poner uno largo: Google compara
   lo que prometés con la realidad.

## Errores comunes en cuentas nuevas y qué son

- *"Falta información de envío"* → configurar el punto 4 de arriba.
- *"El precio no coincide con la página"* → esto era tu problema con el Top
  FLOWER, **ya está arreglado**.
- *"Falta política de devoluciones"* → tenés `/info` con eso; hay que
  indicárselo a Google en la configuración de la cuenta.
- *"Imagen demasiado chica"* → tus fotos están bien.

---

# PARTE 3 — Pinterest desde cero

## Por qué vale la pena para vos, específicamente

Pinterest no es una red social: **es un buscador visual**. La diferencia
práctica es enorme:

- Un post de Instagram vive 48 horas. **Un pin sigue trayendo gente meses o
  años después.**
- La gente entra a Pinterest **buscando qué comprar o qué hacerse**, no a ver
  qué hicieron sus amigas.
- Para crochet es terreno fértil y **casi nadie lo usa en Uruguay**.

Y lo mejor: **tus 34 productos ya son contenido de Pinterest**. No hay que
producir nada nuevo.

## Verificado: tu sitio ya está listo

Los "Rich Pins" son pines que muestran **precio y disponibilidad
actualizados solos** — cuando cambiás un precio en tu admin, el pin se
actualiza. Requieren cierta información técnica en las páginas.

**Ya la tenés toda.** Lo comprobé en tu sitio. No hay que tocar código: solo
activarlo desde Pinterest.

## Paso a paso

### 1. Crear la cuenta (5 minutos)

`pinterest.com/business` → **Convertir a cuenta de empresa**. Es gratis.

**El nombre importa para que te encuentren.** No pongas solo "Dahila":

> **Dahila Crochet | Tejido a mano Uruguay**

Pinterest usa ese texto para búsquedas. "Dahila" solo no lo busca nadie que
todavía no te conoce.

### 2. Reclamar dahila.uy (el paso que más rinde)

**Configuración → Sitios web reclamados.** Pinterest te va a dar un código
para poner en el sitio.

**Pasámelo y lo pongo yo** — son 5 minutos de mi lado.

Reclamar el sitio hace tres cosas: activa los Rich Pins, te da estadísticas
reales, y las cuentas con sitio reclamado tienen mejor tratamiento en el
algoritmo.

### 3. Armar los tableros por MOMENTO, no por producto

Este es el error más común. No hagas "Tops", "Cardigans", "Bolsos" — eso ya
lo tenés en la tienda y no es lo que la gente busca.

Hacé tableros por **el momento en que alguien lo necesita**:

- Regalos tejidos a mano
- Para un casamiento de día
- Prendas que no vas a ver repetidas
- Crochet para el invierno uruguayo
- Ropa a medida para tu cuerpo

Pinterest lee el **nombre del tablero** como palabra clave. Poné lo que la
persona escribiría al buscar.

### 4. Subir los productos

**Ya tenés un botón "Guardar" en cada producto de tu sitio** (al lado de
"Compartir"). Lo tocás, elegís el tablero y listo — arma el pin solo con la
foto y el link.

**Cómo repartirlo:** no subas los 34 el mismo día. Pinterest premia la
constancia, no las ráfagas. **1 a 5 pines por día, todos los días**, rinde
más que 30 de golpe y después silencio. Con 34 productos tenés para dos
semanas sin producir nada nuevo.

### 5. Qué escribir en cada pin

El texto es lo que Pinterest usa para encontrarte. Escribí como buscaría
alguien que no te conoce:

> ❌ "Top CHERRY"
> ✅ "Top de crochet tejido a mano — a tu medida, hecho en Uruguay"

Lo mismo que ya aprendimos para el sitio: concreto y buscable, no el nombre
interno de la pieza.

### 6. Formato de las fotos

Pinterest es vertical. La proporción que mejor funciona es **2:3** (por
ejemplo 1000×1500). Tus fotos de producto ya son verticales, así que van
bien.

## Qué esperar, con honestidad

Pinterest es **lento al principio y después se acumula**. No esperes tráfico
la primera semana: los primeros resultados suelen verse **entre uno y tres
meses**. La contrapartida es que lo que subís hoy te sigue trayendo gente el
año que viene.

Público: Pinterest tiene menos uso en Uruguay que Instagram, así que parte
del alcance va a ser internacional. Para vos eso no es malo — es la puerta a
consultas del exterior, que ya tenés resueltas ("envío bajo consulta").

---

# PARTE 4 — Reddit

Es raro pero tiene una razón concreta: **Reddit es la fuente que más citan
ChatGPT, Gemini y los resúmenes de Google** cuando alguien pregunta algo.

**La lógica es al revés que en Instagram.** No se trata de promocionarte —
si entrás a vender, te echan. Se trata de responder preguntas reales de
forma genuinamente útil.

**Cómo se hace:**

1. Entrá a r/crochet y a la comunidad de Uruguay.
2. **Mirá una o dos semanas sin postear nada.**
3. Respondé preguntas donde sepas de verdad (cómo se toman medidas, qué lana
   usar, cómo se lava). Sin mencionarte.
4. Recién después de 20-30 comentarios útiles, si viene al caso, mencionás lo
   tuyo.

**Costo/beneficio honesto:** es lento y no da ventas directas. Vale como
inversión a largo plazo para existir en el lugar del que la inteligencia
artificial saca sus respuestas. Si tenés poco tiempo, va **después** de
Pinterest.

---

# PARTE 5 — Automatizar respuestas y mensajes

## La respuesta corta: empezá sin herramientas

Y no es por ahorrar: es que **la opción "gratis con herramienta"
prácticamente dejó de existir**.

**En marzo de 2026 ManyChat recortó su plan gratis de 1.000 contactos a 25.**
Un recorte del 97,5%. Con tus 5.100 seguidores, **un solo Reel que ande bien
te revienta ese límite el primer día** (un "contacto" es cada persona que
interactúa en el mes).

Mientras tanto, Instagram y WhatsApp ya te dan gratis casi todo lo que
necesitás. Eso es lo que hay que agotar primero.

---

## Lo que ya tenés gratis y probablemente no estás usando

### WhatsApp Business (la app que ya tenés)

| Función | Qué hace | Límite |
|---|---|---|
| **Respuestas rápidas** | Escribís `/precio` y aparece el texto completo | **50** respuestas, 500 caracteres cada una |
| **Mensaje de ausencia** | Contesta solo fuera de tu horario | Uno |
| **Mensaje de bienvenida** | Al primer mensaje de alguien nuevo | Uno |
| **Etiquetas** | Clasificar chats (consulta / seña / tejiendo / entregado) | **20** |
| **Catálogo** | Productos con foto y precio dentro de WhatsApp | 500 |
| **Listas de difusión** | Un mensaje a muchos, cada uno lo recibe como privado | 256 |

**Las respuestas rápidas son, lejos, lo que más tiempo te va a ahorrar — y
casi nadie las usa.** No son un robot: son tu teclado con memoria. Si
escribís cuarenta veces por semana "los tiempos de entrega son…", eso se
resuelve acá, no con un bot.

⚠️ **La trampa de las listas de difusión:** el mensaje **solo le llega a
quien te tenga agendada en su teléfono**. Es el detalle que arruina el 90%
de las estrategias de difusión. Si querés usarlas, pediles explícitamente
que te agenden: *"guardame el contacto así te aviso cuando abra la próxima
tanda"*.

### Instagram: el "comentá LINK" existe nativo y es GRATIS

Esto es lo que la mayoría no sabe y por lo que mucha gente paga sin
necesidad.

**Meta Business Suite → Automatizaciones → "Comentario a mensaje"** hace
exactamente lo mismo que ManyChat: alguien comenta una palabra y le llega el
link por privado. Sin pagar nada.

**⚠️ Tiene que ser desde la computadora, no desde el celular.**

Tres detalles que importan:

1. **Tarda 15 minutos** en mandar el mensaje. La versión paga es instantánea
   — esa demora es, literalmente, la razón principal por la que la gente
   paga. Para una marca artesanal donde nadie espera respuesta al segundo,
   15 minutos está perfecto.
2. **Distingue mayúsculas y es coincidencia exacta**: si configurás `LINK`,
   quien escriba `link` no recibe nada. Decí la palabra en mayúsculas en el
   video.
3. **Antes hay que dar permiso:** Instagram → Configuración → Privacidad →
   Mensajes → **Herramientas conectadas → Permitir acceso a mensajes**. Sin
   eso no funciona nada.

También tenés gratis: **respuestas guardadas** (igual que las de WhatsApp) y
**4 preguntas frecuentes** que la persona puede tocar antes de escribirte.

---

## Si algún día pagás: cuánto y cuándo

| Plan ManyChat | Precio | Contactos por mes |
|---|---|---|
| Gratis | $0 | **25** ← no sirve |
| Essential | **$17/mes** | 250 |
| Pro | $39/mes | 2.500 |

**La regla:** pagá solo si un posteo te junta más comentarios de los que
podés contestar a mano en un día, **y** podés ver que eso te trajo ventas.
Si el DM automático no te trae al menos una o dos ventas por mes que no
hubieras tenido, no lo pagues.

Ojo: aunque pagues, **WhatsApp se cobra aparte** (Meta cobra por mensaje,
unos USD 0,06 por conversación en Latinoamérica).

**Alternativas más generosas para probar gratis:** Chatrace (100 contactos,
Instagram + WhatsApp) o BotSailor (1.000 suscriptores). Son más difíciles de
configurar. De Chatrace hay una reseña independiente que cuestiona que la
empresa no dice quién está detrás — para algo que maneja datos de tus
clientas, eso pesa.

---

## ⛔ Lo que NO hay que usar

| Qué | Por qué |
|---|---|
| **AutoResponder for WA** y apps que contestan WhatsApp desde el celular | No usan la vía oficial. **Riesgo real de que te bloqueen el número para siempre** — y ese número es tu canal de venta. Ni para probar |
| Cualquier herramienta que te pida **tu contraseña de Instagram** | Vía directa a que te suspendan la cuenta |
| **Chatfuel** | $39/mes por 150 contactos y ya no tiene plan gratis |
| **Zapier / Make gratis** | No sirven para contestar mensajes (100 tareas/mes, o 15 min de espera mínima) |
| **Pasar TikTok a cuenta Business ahora** | Perderías el acceso a la música popular. Con 650 seguidores necesitás alcance, no automatización |
| **IA que converse en tu nombre** | Usala para escribir plantillas que después revisás vos, no para hablar con tus clientas |

---

## Lo que la evidencia dice de verdad

Busqué estudios independientes sobre si el "comentá una palabra" funciona.
**No existen.** Todo lo que circula —"3 veces más conversión", "12 veces
mejor", "90% de apertura"— sale de ManyChat o de gente que vende lo mismo.

El estudio más citado (6.000 creadores, 40-150% más comentarios) **lo hizo
ManyChat como socio**, y es correlacional: los que usan automatización
**también publican más seguido**. Puede que crezcan por eso y no por el bot.

El *"90% de apertura de DMs"* es cierto pero engañoso: un privado se "abre"
porque salta la notificación en el teléfono. Abrir no es leer, leer no es
responder, y responder no es comprar.

## La distinción que importa para tu marca

Alguien que compra crochet hecho a mano en Montevideo está comprando, en
parte, el vínculo con vos.

- **Automatizar el envío de información** (link, precio, medidas, tiempos,
  cómo cuidar la prenda) → **bueno**. Te libera tiempo sin tocar el vínculo.
- **Automatizar la conversación** (que un bot aconseje, negocie, cierre la
  venta) → **malo acá**. Ahí es exactamente donde vendés.

Y una sospecha que te dejo: tu cuello de botella probablemente no sea
*contestar*, sino *escribir lo mismo cuarenta veces*. Eso lo resuelven las
respuestas rápidas, no un bot.

## Plan concreto

**Semana 1 (2 horas, gratis):**
1. 10-15 respuestas rápidas en WhatsApp: precio, tiempos, envíos, talles,
   pago, cuidado, encargos, link a la tienda
2. Mensaje de ausencia con tu horario **real** (no aspiracional)
3. Mensaje de bienvenida corto con el link
4. Las mismas respuestas guardadas en Instagram + las 4 preguntas frecuentes
5. Etiquetas: consulta / seña / en producción / entregado

**Semanas 2-3 (gratis):**
6. Probá "Comentario a mensaje" desde la computadora en 2-3 posteos. Una
   palabra en MAYÚSCULAS, dicha en voz alta en el video. Medí cuántas
   comentan y cuántas entran al sitio.

**Mes 2 en adelante:** recién ahí, y solo si los números lo justifican,
ManyChat Essential ($17/mes).

---

# En qué orden hacer todo

1. **Analytics** → mirá Tiempo real para confirmar que anda (5 min)
2. **Merchant Center** → filtrá por "Error", ignorá el resto (15 min)
3. **Respuestas rápidas de WhatsApp** → es el mayor ahorro de tiempo por
   hora invertida de toda esta guía (1 hora)
4. **Pinterest** → crear cuenta + reclamar sitio (20 min) → después 10
   minutos por día subiendo pines
5. **"Comentá LINK" nativo** de Instagram, desde la computadora
6. **Reddit** → cuando todo lo de arriba esté andando
