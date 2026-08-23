# Carrusel 2 — El valor del crochet

**Objetivo**: que se entienda por qué cuesta lo que cuesta, sin sermonear ni sonar defensiva. Datos reales del catálogo de Dahila (Cardigan 3/4: 22 horas, $480 de materiales, $1.290 hoy — fuente: `PRICE_TABLE`, ver `research/repo-audit.md`). Formato **1080×1350px (4:5)** en las 7 diapositivas.

**Copy sugerido para la descripción del post**:

> ¿Cuántas horas tiene un cardigan tejido a mano? Contamos exactamente cuánto trabajo hay detrás de cada pieza — sin vueltas, con los números reales. No competimos con la ropa de máquina: somos otra categoría. Deslizá.
> #crochetamano #tejidoamano #hechoamano #dahilacrochet #uruguay #slowfashion #valorartesanal

---

## Cómo generar este carrusel

Solo 2 de las 7 diapositivas necesitan foto real (2 y 4 — manos tejiendo). Las otras 5 son composiciones tipográficas/de datos, así que **van todas juntas en un solo pedido a ChatGPT Images** (el bloque de estilo fijo + las 5 diapositivas conceptuales numeradas dentro del mismo mensaje). Las diapositivas 2 y 4 se generan aparte, cada una con la foto real adjunta, pegando el mismo bloque de estilo para que no se corten del resto.

---

## 🎨 BLOQUE DE ESTILO FIJO — pegar en todas las diapositivas de este carrusel

```
ESTILO DAHILA — CARRUSEL "EL VALOR DEL TEJIDO" (referencia fija, igual en las 7
diapositivas):

Formato: 1080×1350 px exactos, relación de aspecto 4:5 vertical en las 7, sin
excepción.

Paleta (hex exactos, sin variación):
- Fondo dominante: blanco (#FFFFFF) o crema (#FAF1DF), según se indique por
  diapositiva.
- Texto principal: ink900 (#1F1A1B). Texto secundario: ink700 (#4A4143). Texto
  terciario/labels: ink500 (#8C8285). Líneas divisorias sutiles: #EDE9EA.
- Acento de marca: vino (#8F3B53) — un solo uso puntual por diapositiva (una cifra
  clave, un ícono, una línea, un botón). Nunca fondo completo. Es el único color
  saturado permitido en cada imagen.
- La única diapositiva con fondo oscuro es la última (CTA): ink900 (#1F1A1B) de fondo
  completo — se usa exclusivamente ahí, en ninguna otra.
- Sin degradé violeta, sin paleta pastel genérica, sin glassmorphism, sin íconos
  redondeados de stock.

Tipografía:
- Títulos/cifras grandes: serif liviana estilo Fraunces light (peso 300).
- Labels y datos chicos: sans Inter, mayúscula con tracking ancho (~0.15em) para
  labels; peso 300-400 en texto corrido.

Tratamiento fotográfico (diapositivas 2 y 4, con foto real):
- Luz natural cálida, dirección lateral, nunca flash frontal.
- Encuadre cerrado (close-up documental), profundidad de campo corta, fondo
  desenfocado en tonos neutros cálidos.
- Saturación media-baja, grano sutil, aspecto de fotografía real — nunca render 3D.

Elemento conector (idéntico en las 7):
- Esquina inferior derecha, 40px del borde: sans Inter mayúscula chica, tracking
  ancho, color #8C8285 (o gris claro/blanco sobre fondos oscuros): "DAHILA · EL VALOR
  DEL TEJIDO" + número de diapositiva, ej. "04/07". Posición y tamaño idénticos en
  las 7.
```

---

## Diapositiva 1 — Hook (conceptual, sin foto)

```
[Pegar el BLOQUE DE ESTILO FIJO — esta diapositiva va en el batch de conceptuales
junto con 3, 5, 6 y 7]

Fondo crema liso (#FAF1DF). Al centro, una sola madeja de lana natural color crudo,
vista desde arriba, ligeramente desenrollada con el hilo extendiéndose hacia un
costado. Luz natural suave, sombra sutil debajo. Un único acento de color: la punta del
hilo extendido está atada con un lazo chico en tono vino (#8F3B53) — único color
saturado de la imagen. Texto superpuesto en la mitad superior, serif liviana (Fraunces
light) color ink900, tamaño grande, centrado, texto exacto: "¿Cuántas horas tiene un
cardigan tejido a mano?" — tono curioso, sin signos de exclamación, sin acusación.
Elemento conector esquina inferior derecha: "DAHILA · EL VALOR DEL TEJIDO   01/07".
```

## Diapositiva 2 — Reveal: 22 horas

🔸 **REQUIERE FOTO DE REFERENCIA**: subí una foto real de manos tejiendo a crochet (de Anush o de quien esté tejiendo la pieza) — es la diapositiva que más depende de que se vea un proceso genuino, no generado.

```
[Pegar el BLOQUE DE ESTILO FIJO antes de este prompt]

Usá la foto adjunta de manos tejiendo como base real — no inventes las manos ni la
aguja, partí de la foto real. Recortá a formato 4:5 vertical exacto (1080×1350px),
plano cerrado sobre las manos y el punto en proceso, fondo del taller desenfocado
detrás si aparece en la foto original. Ajustá el color grading a luz cálida natural
lateral, siguiendo el tratamiento fotográfico del bloque de estilo, sin alterar el
contenido de la foto. Agregá texto superpuesto en la parte inferior sobre una franja
semitransparente ink900 al 80% de opacidad, serif liviana (Fraunces light) color
blanco, tamaño grande: "22 horas." Debajo, sans Inter blanco, tamaño mediano: "Una por
una, a mano, sin máquina." Elemento conector esquina inferior derecha (blanco con
opacidad reducida): "DAHILA · EL VALOR DEL TEJIDO   02/07".
```

## Diapositiva 3 — Desglose del precio (conceptual, sin foto)

```
[Pegar el BLOQUE DE ESTILO FIJO — batch de conceptuales junto con 1, 5, 6, 7]

Fondo blanco liso (#FFFFFF). Al centro, una ecuación visual simple horizontal, serif
liviana (Fraunces light) color ink900, tamaño grande, texto exacto: "$480 en
materiales  +  22 horas de trabajo  =  $1.290". Cada término dentro de un recuadro muy
sutil con borde fino #EDE9EA, sin relleno de color. El signo "=" y el resultado final
"$1.290" están en tono vino (#8F3B53) en vez de ink900 — único color saturado, para que
el ojo vaya directo al resultado. Debajo, sans Inter chica color ink700, centrado: "Así
se arma el precio de un Cardigan 3/4 — sin vueltas." Elemento conector esquina inferior
derecha: "DAHILA · EL VALOR DEL TEJIDO   03/07".
```

## Diapositiva 4 — Máquina vs. mano

🔸 **REQUIERE FOTO DE REFERENCIA (mitad derecha únicamente)**: subí una foto real de una mano sosteniendo una aguja de crochet con lana — se compone junto a una ilustración generada de una máquina industrial en la mitad izquierda.

```
[Pegar el BLOQUE DE ESTILO FIJO antes de este prompt]

Composición dividida en dos mitades verticales, formato 4:5 vertical exacto
(1080×1350px). Mitad izquierda: generá un dibujo lineal simple y fino (no ícono de
stock) de una máquina de tejer industrial, sobre fondo gris muy claro (#EDE9EA), con
texto en sans Inter color ink700 debajo: "Fábrica — minutos, a escala." Mitad derecha:
usá la foto adjunta de la mano con la aguja de crochet como base real — no la
reemplaces por una ilustración, es la única mitad que debe ser fotografía real —
recortada y compuesta sobre fondo crema (#FAF1DF), con texto en sans Inter color
ink900 debajo: "Dahila — horas, una prenda a la vez." Una línea vertical fina en tono
vino (#8F3B53) divide exactamente al medio las dos mitades — único acento de color
saturado. Encabezado centrado arriba, serif liviana (Fraunces light) color ink900,
tamaño mediano: "No competimos. Somos otra categoría." Elemento conector esquina
inferior derecha: "DAHILA · EL VALOR DEL TEJIDO   04/07".
```

## Diapositiva 5 — Testimonio genérico, sin atribución falsa (conceptual, sin foto)

```
[Pegar el BLOQUE DE ESTILO FIJO — batch de conceptuales junto con 1, 3, 6, 7]

Fondo crema liso (#FAF1DF). Comillas grandes decorativas muy sutiles en gris claro
(#EDE9EA) detrás del texto principal. Texto principal en serif itálica liviana
(Fraunces light italic) color ink900, tamaño grande, centrado, texto exacto: "Se nota
la diferencia cuando te la ponés." — SIN nombre de clienta, SIN atribución a ninguna
persona real, es una frase de marca genérica, no un testimonio firmado. Dejar un
espacio en blanco debajo, sin texto adicional, reservado para pegar una reseña real más
adelante si se desea. Un único acento de color: una línea fina horizontal en tono vino
(#8F3B53) debajo del texto, ~60px de ancho, centrada. Elemento conector esquina
inferior derecha: "DAHILA · EL VALOR DEL TEJIDO   05/07".

NOTA (no incluir en la imagen): esta diapositiva quedó movida a la posición 5, justo
antes del cierre — la prueba/contexto rinde mejor pegada al final del carrusel que en
medio del contenido de datos (ver research/context-research.md § 3b).
```

## Diapositiva 6 — Resumen guardable (cheat sheet, conceptual, sin foto)

```
[Pegar el BLOQUE DE ESTILO FIJO — batch de conceptuales junto con 1, 3, 5, 7]

Fondo blanco liso (#FFFFFF). Encabezado arriba, serif liviana (Fraunces light) color
ink900, centrado: "Lo que pagás cuando comprás crochet hecho a mano." Debajo, tres
filas con un ícono lineal fino a la izquierda y texto en sans Inter color ink700 a la
derecha: un reloj simple con "Tiempo — horas reales de trabajo, no minutos de máquina",
un ovillo de lana con "Material — lana y algodón natural, elegidos a mano", una aguja
de crochet con "Oficio — años de práctica en cada puntada". Los tres íconos en tono
vino (#8F3B53) — único acento de color saturado. Etiqueta chica en la esquina superior
derecha, fondo cream100 (#FAF1DF), texto sans mayúscula ink900: "GUARDÁ ESTO". Elemento
conector esquina inferior derecha: "DAHILA · EL VALOR DEL TEJIDO   06/07".
```

## Diapositiva 7 — CTA de cierre (conceptual, sin foto)

```
[Pegar el BLOQUE DE ESTILO FIJO — batch de conceptuales junto con 1, 3, 5, 6]

Fondo ink900 (#1F1A1B) — única diapositiva del carrusel con fondo oscuro. Centrado,
serif liviana (Fraunces light) color blanco, tamaño grande: "Ahora ya sabés qué estás
pagando." Debajo, sans Inter blanco con opacidad reducida, tamaño mediano: "Conocé la
tienda o encargá tu pieza a medida." Un botón rectangular de esquinas suavemente
redondeadas en tono vino (#8F3B53), texto sans mayúscula blanco: "VER LA TIENDA" —
único acento de color saturado sobre el fondo oscuro. Debajo del botón, sans muy chica
gris claro: "dahila.uy". Elemento conector esquina inferior derecha (gris medio):
"DAHILA · EL VALOR DEL TEJIDO   07/07".
```

---

## Secuencia (verificar antes de generar)

1. Hook — "¿Cuántas horas tiene un cardigan tejido a mano?" (conceptual)
2. Reveal — "22 horas." 🔸 foto (manos tejiendo)
3. Desglose del precio ($480 + 22h = $1.290) (conceptual)
4. Máquina vs. mano — categorías distintas 🔸 foto (mitad derecha)
5. Testimonio genérico sin atribución (conceptual) — movido antes del cierre
6. Resumen guardable (cheat sheet) (conceptual)
7. CTA — Ver la tienda (conceptual)
