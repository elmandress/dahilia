# Para copiar y pegar en el admin

---

## 💡 Antes de nada: dos cosas que descubrí mirando tu base de datos

### 1. Umami no está roto — está bloqueado. Y ahora tengo la prueba.

Comparé, en **exactamente la misma ventana de fechas** que te mostraba el panel:

| | |
|---|---|
| Umami reportó | **6 visitantes, 7 visitas** |
| Personas que realmente agregaron algo al carrito | **21** |

Agregar algo al carrito exige tres pasos: entrar, abrir un producto y tocar
"agregar". Esas 21 personas llegaron hondo. Y como la mayoría de quien entra
nunca agrega nada, **las visitas reales de ese período fueron varios cientos**,
no 7.

Conclusión práctica: **no tomes decisiones mirando los números de Umami ni de
Google Analytics** — subestiman muchísimo porque los bloqueadores de anuncios
les cortan el script. Los números en los que sí podés confiar son los que salen
de tu propia base: carritos, pedidos y encargos. Por eso la atribución de canal
que armamos guarda el origen junto a cada venta: eso no lo bloquea nadie.

### 2. Tenés 11 carritos activos de esta semana. Uno es de hoy.

En total hay **42 personas** que dejaron algo en el carrito desde junio:

- **11 en los últimos 7 días** (uno de hoy mismo)
- 9 entre 7 y 30 días
- 22 de hace más de un mes

Los de esta semana son personas que eligieron una prenda, la agregaron… y no
escribieron. Es la demanda que ya tenés y no estás trabajando. Los podés ver en
**Admin → Carritos**.

*(Los 22 de más de un mes son datos viejos que conviene limpiar en algún
momento; no molestan, pero ensucian el número.)*

---

## 🔴 URGENTE — antes que todo lo demás: 2 precios fantasma

**Dónde:** Admin → Productos → editar → campo "Precio base"

Hay 2 productos cuyo precio publicado **no se puede comprar**. El precio base
quedó desactualizado respecto de los precios por talle, y el precio base es el
que se muestra en Google, WhatsApp, la grilla de la tienda, el filtro de
precio y el archivo que leen ChatGPT y buscadores.

| Producto | Anuncia hoy | Talle más barato real | Poner |
|---|---|---|---|
| **Top FLOWER** | $1.250 | **$1.999** (talle S) | `1999` |
| **Cardigan CRUZADO** | $1.290 | **$1.190** (talle S) | `1190` |

**El grave es el Top FLOWER**: alguien lo encuentra en Google leyendo "UYU
1.250", entra, y el más barato cuesta $1.999 — 60% más. Eso se siente como
carnada, aunque no sea la intención, y es exactamente lo que hace que alguien
cierre la pestaña.

Verificado en vivo el 23/08. Son 2 campos, un minuto, y arregla los 8 lugares
donde ese número aparece.

*(Revisé los 34: los otros 32 están bien. Sweater Senda y BEACH set muestran
un precio que sí existe, solo que no es el más barato — eso es normal.)*

---

Todo esto es texto que vive en la base de datos, no en el código — por eso lo
tenés que pegar vos desde el panel. Está ordenado por impacto: lo de arriba es
lo que más cambia, lo de abajo es prolijidad.

Cada bloque dice **dónde** va y **qué reemplaza**.

---

## 1. El título del home (lo más importante)

**Dónde:** Admin → Configuración → campo `hero_title`
**Dice hoy:** `Tejido artesanal y atemporal`

**Por qué cambiarlo:** es lo primero que ve el 100% de la gente que entra, y
es la frase más floja del sitio. "Artesanal" lo usan marcas industriales que
no tejen nada, así que ya no significa nada; y "atemporal" no se puede
verificar. La prueba rápida: si Zara pudiera escribir la misma frase sin
mentir, la frase no te está diferenciando.

**Opción A (la que recomiendo):**

```
Cada prenda, entre 4 y 22 horas de trabajo.
```

**Opción B (si A te suena muy fría):**

```
Tejido a mano, en tu talle, en Montevideo.
```

La A es más fuerte porque ninguna marca grande la puede copiar: es un número
real que solo aplica a como trabajás vos.

---

## 2. El subtítulo del home

**Dónde:** Admin → Configuración → `hero_subtitle`
**Dice hoy:** `Diseñado y confeccionado a mano en Uruguay.`

Está bien escrito pero suena a etiqueta de producto, no a vos. En participio
impersonal ("diseñado", "confeccionado") no hay nadie hablando.

```
Lo tejo yo, en Montevideo.
```

---

## 3. El bloque de valores del atelier

**Dónde:** Admin → Configuración → `about_value_1_body`
**Dice hoy:** `Punto por punto. Buscando la calma en lo artesanal.
Calidad y durabilidad ante cantidad`

Tiene tres problemas: "artesanal" otra vez, "calidad ante cantidad" es la
frase más copiable que existe, y hay un error de concordancia ("ante" por
"antes que").

```
Punto por punto, sin máquina en ningún paso. Un top me lleva 14 horas; un cardigan, 22.
```

---

## 4. El emoji de la bandera

**Dónde:** Admin → Configuración → `process_3_body`
**Dice hoy:** `A todo Uruguay 🇺🇾`

El checklist de diseño del propio sitio dice de no usar emojis en la interfaz
(quedan bien en Instagram, no en una tienda). Y acá se puede decir algo más
útil en el mismo espacio.

```
A todo el país por DAC. El costo lo coordinamos por WhatsApp.
```

---

## 5. La sección de envíos de /info

**Dónde:** Admin → Configuración → `info_shipping`
**Dice hoy:** `Pedidos ya y Dac`

Este es el único campo de /info que está mal: los demás están vacíos pero el
sitio muestra textos de respaldo que están bien escritos. Este tiene valor
cargado, así que pisa al bueno y se ve como una nota apurada.

```
Enviamos a todo Uruguay por DAC. El costo depende de dónde estés y lo coordinamos por WhatsApp antes de que pagues. Al exterior también mandamos — escribinos y cotizamos.
```

---

## 6. La respuesta sobre envíos al exterior

**Dónde:** Admin → Configuración → `faq_3_a`
**Dice hoy:** `Sí, utilizamos dac y el costo corre por cuenta del cliente`

Tres cosas: "dac" va en mayúsculas, "el cliente" rompe el voseo que usás en
todo el resto del sitio, y la pregunta es sobre el EXTERIOR pero la respuesta
habla de envío nacional.

```
Sí. Coordinamos por WhatsApp y el envío lo pagás vos aparte — te paso el costo exacto antes de que confirmes.
```

**Si es verdad que ya mandaste a Argentina, Brasil o España**, agregá esa
frase al final: es prueba concreta y vale más que cualquier adjetivo.

---

## 7. La política de cambios

**Dónde:** Admin → Configuración → `faq_4_a`
**Dice hoy:** `Como cada pieza se hace a medida, no aceptamos cambios. Por eso te acompaño durante todo el proceso.`

El contenido es correcto y honesto. El problema es el orden: arranca con la
negativa, y ese es el momento de mayor ansiedad de toda la compra.

```
Como tejo cada pieza a tu medida, no puedo revenderla si no te va — por eso no hago cambios de talle. Lo que sí hago es acompañarte antes: te pido las medidas, te muestro las lanas y confirmamos todo por WhatsApp antes de dar la primera puntada. Si algo llega mal de mi lado, lo arreglo.
```

---

## 8. El texto de cuidados (va en los 34 productos)

**Dónde:** Admin → Productos → editar cada producto → campo "Cuidados"

**Dos problemas, no uno:**

1. Tiene un error de redacción: "Ventilar cada cierto tiempo para que
   **ventilen** las fibras" — repite la palabra.
2. **Se contradice con el resto de tu comunicación.** Los 34 productos dicen
   lavar con **agua tibia**, pero la página /info y el carrusel de Instagram
   dicen **agua fría** (ahí aparece 4 veces). Una clienta lee una cosa en la
   ficha y otra en Instagram.

**Lo correcto es agua fría**, y no es una preferencia — es lo que corresponde
a tus materiales:

- **Lana**: el agua tibia la apelmaza, y eso **no tiene vuelta atrás**.
- **Algodón**: el calor la encoge y la deforma.
- **Acrílico**: aguanta tibia, pero el calor igual la aplasta.

O sea: fría es segura para todo lo que usás; tibia arruina algunas. Además ya
es lo que dicen /info y el carrusel, así que **el carrusel no hay que
rehacerlo** — solo corregir el campo en los productos.

Hay un detalle más que vale la pena incluir y que hoy no está en ningún lado:
el enjuague tiene que ser a la misma temperatura que el lavado. El cambio
brusco de temperatura es lo que apelmaza la lana, incluso con agua fría.

```
Lavá a mano con agua fría y jabón neutro, sin frotar ni retorcer. Enjuagá con agua a la misma temperatura: el cambio brusco es lo que apelmaza la fibra.
Para secar: apoyala en horizontal sobre una toalla, a la sombra. Nunca colgada — el peso del agua la estira. Nada de secarropas.
Si la guardás mucho tiempo, sacala del placard cada tanto para que la fibra respire.
```

**Pegá esto también en** Configuración → `info_care`, así la página /info dice
exactamente lo mismo que cada ficha. (Hoy ese campo está vacío y el sitio
muestra un texto de respaldo que dice "fría" — por eso la contradicción.)

---

## 9. Descripciones de producto (solo algunas, no las 34)

**Dónde:** Admin → Productos → editar → campo "Descripción"

**Importante — leé esto antes:** no reescribas las 34. Con una sola persona
tejiendo, esas horas compiten directamente con horas de tejido, que es lo
único que genera plata. Fijate en las estadísticas qué 5 o 6 fichas se llevan
casi todas las visitas y reescribí solo esas.

Y algo más fino: si "22 horas" aparece en las 34 fichas, deja de ser un dato y
se lee como plantilla — exactamente igual que "artesanal". Usalo donde el
número sorprende (22 h un cardigan, 4 h una bandana), no en todas.

### Cardigan 3/4 (22 h · Algodón)

```
Veintidós horas de trabajo, punto por punto, para un cardigan de mangas 3/4 que resuelve el entretiempo: sobre una camisa, sobre un vestido, o con jean y listo.

No lo tengo hecho esperando en un cajón. Lo empiezo cuando lo pedís, en tu talle y en el color que elijas — antes de arrancar te muestro los algodones que tengo y decidimos juntas.

Envío a todo Uruguay.
```

### Poncho (19 h)

```
Diecinueve horas de tejido para un poncho de esos que se heredan: abriga de verdad, no pasa de moda y queda bien encima de cualquier cosa que ya tengas puesta.

Lo tejo a pedido, así que el color lo definís vos. Si es para regalar, decímelo cuando escribas y coordinamos los tiempos con margen.

Envío a todo Uruguay.
```

### Bolso de estudiante (7 h · Trapillo reciclado)

```
Siete horas de crochet en trapillo reciclado: entra el cuaderno, la notebook chica y todo lo que arrastrás en el día. El trapillo aguanta el peso sin darse — por eso lo uso en los bolsos y no en la ropa.

Lo tejo en el color que quieras cuando lo pedís.

Envío a todo Uruguay.
```

*(El trapillo reciclado ya estaba cargado en el sistema y no se estaba usando
como argumento de venta — estaba escondido detrás de la palabra "artesanal".)*

### Calentadores (5 h · Chenille)

```
Cinco horas de tejido en chenille, la lana más suave que uso: las polainas abrigan el tobillo sin sumar bulto adentro de la bota.

Van con calzas, con jean o por encima de las botas. Las tejo en el color que elijas cuando las pedís.

Envío a todo Uruguay.
```

### Bandana (4 h)

```
Cuatro horas de crochet en el accesorio más chico del catálogo: en el pelo, al cuello o atada a la cartera. Un mismo accesorio, tres usos.

Es la forma más fácil de tener algo tejido a mano sin pensarlo mucho — y de regalarlo. Elegís el color y la tejo para vos.

Envío a todo Uruguay.
```

---

## 10. Lo que NO puedo escribir por vos

**El plazo de entrega en la ficha de producto.** Este es probablemente el
cambio que más ventas destraba de toda la lista, y necesita un dato que solo
vos tenés: cuántas piezas podés hacer por semana hoy.

Hoy el sitio dice **seis** cosas distintas sobre cuánto se espera. Las busqué
una por una:

| Dónde | Qué dice |
|---|---|
| El cartel de arriba (lo editás vos) | "listos a finales de septiembre" (~5 semanas) |
| La sección de proceso del home | "el plazo lo charlamos según el modelo" |
| Cada producto por dentro | entre 1 y 3 semanas |
| Los Términos | "entre 1 y 6 semanas" |
| El mail que recibe la clienta al encargar | "de 2 a 6 semanas" |
| El archivo que leen ChatGPT y buscadores | "2 a 6 semanas" |

Los tres últimos están en el código, así que **los cambio yo** en cuanto me
digas el número real — no hace falta que toques nada ahí.

Nota: los rangos anchos (1-6, 2-6) no están mintiendo, solo son vagos. El que
sí mentía era el de cada producto ("1-2 sem." al lado del cartel que decía
septiembre) — ese ya lo arreglé: ahora la etiqueta se esconde cuando hay
lista de espera activa, y manda el cartel.

Como el checkout es WhatsApp, la clienta tiene que **escribirle a una
desconocida** para averiguar el dato que decide la compra. La que no escribe se
perdió y no queda registro de que existió.

Decidí una franja honesta por tipo de prenda (ejemplo: "accesorios, menos de
una semana; tops, 2 semanas; cardigans y ponchos, 3 semanas") y decime cuál
es — yo la pongo al lado del precio, que es donde se decide.

Bonus: el plazo también justifica el precio. "Tres semanas" explica por qué un
cardigan sale $1.290 mejor que cualquier adjetivo.
