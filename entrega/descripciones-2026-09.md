# Descripciones nuevas para 11 fichas (19/09/2026)

Para Anush. Son borradores: cambiá lo que quieras antes de publicarlos.

## Por qué

Estas fichas tenían una o dos líneas. Eso pasa en tres lugares:

- **La clienta** no tiene con qué decidir sin escribirte: de qué está hecha, cómo es, cómo se usa.
- **Google** tiene muy pocas palabras para mostrarla cuando alguien busca, por ejemplo, "cardigan de crochet con flores".
- **Sweater Cherry, Top Race y Spring no se indexan.** Google no vuelve porque para él no cambiaron desde la última vez que pasó. Al guardar un texto nuevo, la fecha de la ficha cambia y Google la vuelve a mirar.

## De dónde sale cada dato (nada inventado)

- **Material y talles:** lo que ya está cargado en cada ficha.
- **Horas de tejido:** la tabla de precios aprobada, en la pestaña Precios de la estrategia. Solo aparecen donde están medidas.
- **Colores, forma y detalles:** lo que se ve en las fotos.
- **"Podés pedirlo en otros colores":** lo que la tienda ya promete en general.

Spring, Amour, Granny's, Senda y Cherry no tienen horas medidas. Si las cronometrás, sumá una frase como "Lleva unas 20 horas de tejido". Es el dato que más justifica el precio de una prenda hecha a mano.

## Cómo publicarlas

Tenés dos caminos. Elegí uno:

- **Desde el admin:** Productos → editar → pegar la descripción → Guardar. Es lo más simple si querés cambiar algo del texto.
- **Todas juntas:** Mati corre `database/descripciones-2026-09.sql` en Supabase (SQL Editor → pegar → Run). Si ya editaste alguna a mano, el SQL la saltea y no la pisa. La web las muestra dentro de la hora.

Después de publicarlas: en Search Console, "Solicitar indexación" una sola vez para Sweater Cherry, Top Race y Spring.

## Sweater cherry

**Hoy** (176 caracteres):

> Sweater cherry se teje a crochet, a mano, especialmente para vos. Se teje a mano cuando la encargás. No hay dos iguales — es lo que tiene lo hecho a mano. Envío a todo Uruguay.

**Propuesta** (456 caracteres):

> Cherry es un sweater de crochet rojo cereza, con un punto calado que deja ver la trama en todo el cuerpo. Es holgado, de cuello redondo y con mangas anchas. Está tejido en una mezcla de mitad lana natural y mitad acrílico: la lana abriga y el acrílico lo hace más fácil de cuidar. Se lleva con jean y una remera abajo, que se asoma por el calado. Se teje a mano cuando lo encargás, en talle S, M o L, y podés pedirlo en otros colores. Envío a todo Uruguay.

De dónde sale: el material ("Lana 50% natural y 50% acrílica") y los talles cargados en la ficha; sin horas, porque no están medidas (si la cronometrás, sumá "Lleva unas X horas de tejido."); colores y forma, de las fotos.

## Top RACE

**Hoy** (270 caracteres):

> El top RACE tiene un aire deportivo llevado al lenguaje del crochet: líneas limpias y un tejido a mano que le da carácter. Para el día a día con jean o bermuda, o para sumarle textura a un look de noche. Tejido a pedido: vos elegís talle y colores. Envío a todo Uruguay.

**Propuesta** (397 caracteres):

> El top Race tiene un aire deportivo llevado al crochet: negro, con franjas blancas arriba y abajo y breteles finos. Es corto, de líneas rectas, y está tejido en hilo acrílico. Lleva unas 13 horas de tejido. Para el día a día con jean o bermuda, o para sumarle textura a un look de noche. Se teje a mano cuando lo encargás, en talle S, M o L, y podés pedirlo en otros colores. Envío a todo Uruguay.

De dónde sale: el material ("Hilo acrílico") y los talles cargados en la ficha; 13 horas de la tabla de precios aprobada; colores y forma, de las fotos.

## Spring cardigan

**Hoy** (238 caracteres):

> Spring cardigan es una pieza de abrigo tejida a crochet, punto por punto, especialmente para vos. Al encargarla elegís tu talle, y se teje especialmente para vos. No hay dos iguales — es lo que tiene lo hecho a mano. Envío a todo Uruguay.

**Propuesta** (551 caracteres):

> Spring es un cardigan de crochet color crudo, abierto adelante, con flores tejidas y aplicadas una por una en rosa, fucsia, rojo y celeste, todas con centro amarillo. Las mangas son bien amplias y el cuerpo cae suelto, así que se puede llevar arriba de un buzo o de una remera. Está tejido en acrílico antipilling, que aguanta el uso y los lavados sin formar pelotitas. Queda lindo con jean y algo oscuro abajo, que hace resaltar las flores. Se teje a mano cuando lo encargás, en talle S, M o L, y podés pedirlo en otros colores. Envío a todo Uruguay.

De dónde sale: el material ("Acrílico antipilling") y los talles cargados en la ficha; sin horas, porque no están medidas (si la cronometrás, sumá "Lleva unas X horas de tejido."); colores y forma, de las fotos.

## Cardigan amour

**Hoy** (181 caracteres):

> Cada Cardigan amour nace en el taller: tejido a mano, punto por punto. Se teje a mano cuando la encargás. No hay dos iguales — es lo que tiene lo hecho a mano. Envío a todo Uruguay.

**Propuesta** (454 caracteres):

> Amour es un cardigan de crochet color crudo con corazones rojos tejidos en las mangas y a los costados. Las mangas son anchas y se juntan en el puño, y el frente queda abierto. Está tejido en acrílico antipilling, que mantiene el tejido prolijo lavado tras lavado. Combina con negro, con jean y con cualquier básico que deje lucir los corazones. Se teje a mano cuando lo encargás, en talle S o M/L, y podés pedirlo en otros colores. Envío a todo Uruguay.

De dónde sale: el material ("Acrílico antipilling") y los talles cargados en la ficha; sin horas, porque no están medidas (si la cronometrás, sumá "Lleva unas X horas de tejido."); colores y forma, de las fotos.

## Granny’s cardigan

**Hoy** (179 caracteres):

> Granny’s cardigan se teje a crochet, a mano, especialmente para vos. Se teje a mano cuando la encargás. No hay dos iguales — es lo que tiene lo hecho a mano. Envío a todo Uruguay.

**Propuesta** (441 caracteres):

> Granny's es un cardigan de crochet armado con hexágonos tipo granny en bordó, rosa, fucsia y lila sobre un fondo beige. Se cierra con un lazo tejido adelante y tiene mangas acampanadas. Está tejido en algodón, una fibra fresca que se lleva bien en el entretiempo. Queda lindo sobre un cuello alto claro o una remera básica. Se teje a mano cuando lo encargás, en talle S o M/L, y podés pedir otra combinación de colores. Envío a todo Uruguay.

De dónde sale: el material ("Algodón") y los talles cargados en la ficha; sin horas, porque no están medidas (si la cronometrás, sumá "Lleva unas X horas de tejido."); colores y forma, de las fotos.

## Sweater Senda

**Hoy** (175 caracteres):

> Sweater Senda se teje a crochet, a mano, especialmente para vos. Se teje a mano cuando la encargás. No hay dos iguales — es lo que tiene lo hecho a mano. Envío a todo Uruguay.

**Propuesta** (362 caracteres):

> Senda es un sweater de crochet en bloques de rojo, bordó y negro, con cuello alto y puños negros. Es corto, con mangas anchas y un punto cerrado que abriga. Está tejido en lana acrílica. Queda bien con jean de tiro alto, que acompaña el largo. Se teje a mano cuando lo encargás, en talle S, M o L, y podés pedir otra combinación de colores. Envío a todo Uruguay.

De dónde sale: el material ("Lana acrílica") y los talles cargados en la ficha; sin horas, porque no están medidas (si la cronometrás, sumá "Lleva unas X horas de tejido."); colores y forma, de las fotos.

## Set BRISA

**Hoy** (47 caracteres):

> Incluye: gargantilla, bikini, y salida de playa

**Propuesta** (402 caracteres):

> El set Brisa trae tres piezas de crochet en color crudo para la playa: un bikini de triángulo, una gargantilla y una salida de playa de malla calada. Las tres se tejen juntas, así el tono y el punto coinciden. Está tejido en algodón mercerizado, un hilo con brillo suave y más resistente al uso. Lleva unas 16 horas de tejido. Se hace a mano cuando lo encargás, en talle S, M o L. Envío a todo Uruguay.

De dónde sale: el material ("Algodón mercerizado") y los talles cargados en la ficha; 16 horas de la tabla de precios aprobada; colores y forma, de las fotos.

## Set LUEUR

**Hoy** (44 caracteres):

> Incluye: short mini, skinny scarf y ponchito

**Propuesta** (402 caracteres):

> El set Lueur trae tres piezas de crochet en tono caramelo con brillo: un short mini con cinturón tejido, una bufanda finita y un ponchito de red para llevar encima. Está tejido en algodón con lurex, que le da un brillo sutil a la luz. Lleva unas 18 horas de tejido. Se puede usar todo junto o combinar cada pieza por separado. Se hace a mano cuando lo encargás, en talle S, M o L. Envío a todo Uruguay.

De dónde sale: el material ("Algodón con lurex") y los talles cargados en la ficha; 18 horas de la tabla de precios aprobada; colores y forma, de las fotos.

## Set LUREX

**Hoy** (245 caracteres):

> El set LUREX reúne piezas tejidas a crochet pensadas para combinarse entre sí — comprar el conjunto asegura que los tonos y el punto conversen. Se teje a mano cuando lo pedís, a tu medida y con los colores elegidos con vos. Envío a todo Uruguay.

**Propuesta** (405 caracteres):

> El set Lurex trae tres piezas de crochet en marrón con brillo: un top halter que se cruza en el cuello, con una abertura adelante; una minifalda con cordón para ajustar en la cintura, y un gorro de red. Los bordes llevan un piquito tejido que le da la terminación. Está tejido en algodón con lurex. Lleva unas 17 horas de tejido. Se hace a mano cuando lo encargás, en talle S, M o L. Envío a todo Uruguay.

De dónde sale: el material ("Algodón con lurex") y los talles cargados en la ficha; 17 horas de la tabla de precios aprobada; colores y forma, de las fotos.

## Bufanda SOPHIE

**Hoy** (220 caracteres):

> SOPHIE es una bufanda tejida a crochet, suave y con el largo justo para dar dos vueltas. El accesorio de invierno que más se regala — y el que más se agradece. Se teje a mano en el color que elijas. Envío a todo Uruguay.

**Propuesta** (281 caracteres):

> Sophie es una bufanda finita tejida a crochet en lana, suave y con el largo justo para dar dos vueltas o atarla adelante como un pañuelo. Lleva unas 5 horas de tejido. Es de los regalos más fáciles: no depende del talle. Se teje a mano en el color que elijas. Envío a todo Uruguay.

De dónde sale: el material ("Lana") y los talles cargados en la ficha; 5 horas de la tabla de precios aprobada; colores y forma, de las fotos.

## Box de regalo

**Hoy** (236 caracteres):

> Un box para regalar tejido a mano sin errarle: se arma con piezas del catálogo y llega presentado para sorprender. Contanos para quién es y armamos juntas la combinación — colores, piezas y presupuesto a tu medida. Envío a todo Uruguay.

**Propuesta** (292 caracteres):

> Una caja para regalar algo tejido a mano sin errarle. Se arma con piezas del catálogo, de trapillo reciclado, y llega en una caja kraft con la etiqueta de Dahila, lista para entregar. Contanos para quién es y armamos juntas la combinación: piezas, colores y presupuesto. Envío a todo Uruguay.

De dónde sale: el material ("Trapillo reciclado") y los talles cargados en la ficha; sin horas, porque no están medidas (si la cronometrás, sumá "Lleva unas X horas de tejido."); colores y forma, de las fotos.

