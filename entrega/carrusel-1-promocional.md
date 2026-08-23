# Carrusel 1 — Promocional / vendedor

**Objetivo**: mostrar piezas reales del catálogo (Cardigan 3/4, Top HALTER, Set BRISA) y llevar a WhatsApp o a la tienda. Formato **1080×1350px (4:5)** en las 7 diapositivas.

**Copy sugerido para la descripción del post** (no es texto en la imagen):

> Tejido con tiempo. 🧶 Tres piezas de la colección, tejidas a mano en Montevideo — tu talle, tus colores. Deslizá para ver el cardigan, el top y el set completo. Escribinos por WhatsApp y lo tejemos para vos.
> #dahilacrochet #crochetamano #tejidoamedida #uruguay #montevideo #slowfashion

---

## Cómo generar este carrusel (leer antes de empezar)

Este carrusel es casi todo producto real — 5 de las 7 diapositivas necesitan una foto tuya subida como referencia (no se puede pedirle a la IA que invente el cardigan o el top exactos, tiene que ser el real). Por eso se genera en **dos tandas**, no en una sola:

- **Tanda A (batch de una sola vez)**: diapositivas 6 y 7 — son 100% conceptuales (tipografía, íconos, sin foto de producto), así que van juntas en un solo prompt a ChatGPT Images para que salgan con exactamente la misma paleta y grid entre sí.
- **Tanda B (una por una, con foto adjunta)**: diapositivas 1 a 5 — cada una necesita que subas la foto real indicada y pegues el prompt de edición/composición correspondiente en un mensaje aparte. **Pegá el BLOQUE DE ESTILO FIJO al principio de cada uno de estos 5 mensajes** (o al menos la primera vez de la conversación, para que ChatGPT lo recuerde en los mensajes siguientes del mismo hilo) — así, aunque se generen en mensajes separados, todas respetan la misma paleta, tipografía y encuadre.

---

## 🎨 BLOQUE DE ESTILO FIJO — pegar en todas las diapositivas de este carrusel

```
ESTILO DAHILA — CARRUSEL PROMOCIONAL (referencia fija, igual en las 7 diapositivas):

Formato: 1080×1350 px exactos, relación de aspecto 4:5 vertical. Nunca cuadrado, nunca
horizontal.

Paleta (usar exactamente estos hex, sin variación entre diapositivas):
- Fondo dominante: blanco (#FFFFFF) o crema (#FAF1DF) — elegir uno de los dos según se
  indique en cada diapositiva, nunca un tercer color de fondo.
- Texto principal: ink900 (#1F1A1B), un negro cálido, nunca negro puro (#000000).
- Texto secundario: ink700 (#4A4143).
- Acento de marca: vino (#8F3B53) — se usa en UN solo elemento puntual por diapositiva
  (un botón, un hilo, un ícono, un borde). Nunca como fondo completo ni como wash de
  color. Es el único color saturado que puede aparecer en cada imagen.
- Nada de degradé violeta, nada de paleta pastel genérica, nada de glassmorphism, nada
  de íconos redondeados de stock — la estética es editorial y fotográfica, no "de IA".

Tipografía:
- Títulos/headlines: fuente serif fina de peso liviano, estilo Fraunces light (peso
  300), sin negrita nunca.
- Labels y textos chicos (precio, categoría, pie de foto): fuente sans neutra estilo
  Inter, peso 400-500, en mayúsculas cuando es un label, con letter-spacing amplio
  (tracking ancho, ~0.08em-0.2em).
- Cuerpo de texto corto (subtítulos): sans Inter peso 300.

Tratamiento fotográfico (para las diapositivas con foto real o fotografía generada):
- Luz natural cálida entrando de un costado (nunca luz de estudio dura ni flash
  frontal).
- Ángulo de cámara: encuadre a la altura del pecho/cintura, ligeramente en picado
  (cámara un poco por encima del sujeto), nunca contrapicado ni gran angular
  distorsionado.
- Saturación baja-media, tonos cálidos naturales, nada de colores sobresaturados ni
  filtro "vintage" con viñeta fuerte.
- Grano fotográfico sutil, casi imperceptible — aspecto de cámara real, no de render
  3D ni de imagen pulida en exceso.
- Fondo de las fotos de producto: siempre liso, blanco o crema, sin props decorativos
  ajenos a la prenda.

Elemento conector (repetir IDÉNTICO en las 7 diapositivas):
- Esquina inferior derecha, siempre a 40px del borde: texto en sans Inter mayúscula,
  tamaño chico (~14px equivalente), tracking ancho (~0.15em), color #8C8285 (o blanco
  con opacidad si el fondo de esa diapositiva es oscuro): "DAHILA · TIENDA" seguido del
  número de diapositiva sobre el total, ej. "03/07". Posición y tamaño idénticos en
  las 7, ninguna excepción.
```

---

## Diapositiva 1 — Hook

🔸 **REQUIERE FOTO DE REFERENCIA**: subí una foto real del Cardigan 3/4 puesto (la que mejor luz tenga del catálogo). Esta es la diapositiva de portada — tiene que ser la mejor foto que tengan de esa prenda.

```
[Pegar el BLOQUE DE ESTILO FIJO de arriba antes de este prompt]

Usá la foto adjunta del Cardigan 3/4 como base — es la prenda y la persona reales, no
inventes ni modifiques el diseño de la prenda ni el rostro/cuerpo de quien la usa.
Recortá y componé la foto a formato 4:5 vertical exacto (1080×1350px), encuadre de
cuerpo entero o tres cuartos, dejando espacio limpio en la parte inferior izquierda para
texto. Si el fondo original de la foto es ruidoso, reemplazalo por un fondo liso blanco
(#FFFFFF) o crema muy suave (#FAF1DF), manteniendo intacta la prenda y la persona.
Ajustá el color grading a luz cálida natural, saturación media-baja, siguiendo el
tratamiento fotográfico del bloque de estilo. Agregá tipografía superpuesta abajo a la
izquierda, serif liviana (Fraunces light) color ink900 (#1F1A1B), tamaño grande, texto
exacto: "Tejido con tiempo." — sin comillas visibles, sin signos de exclamación. Sumá el
elemento conector en la esquina inferior derecha como se especifica en el bloque de
estilo: "DAHILA · TIENDA   01/07".
```

## Diapositiva 2 — Cardigan 3/4

🔸 **REQUIERE FOTO DE REFERENCIA**: subí una foto de producto del Cardigan 3/4 (puede ser la misma de la diapositiva 1 en otro ángulo, o una foto de detalle/plano medio).

```
[Pegar el BLOQUE DE ESTILO FIJO antes de este prompt]

Usá la foto adjunta del Cardigan 3/4 como base real — no inventes la prenda. Recortá a
formato 4:5 vertical exacto (1080×1350px), plano medio o de tres cuartos, con la prenda
como protagonista centrada u ocupando dos tercios del encuadre. Reemplazá el fondo por
blanco liso (#FFFFFF) si el original tiene distracciones, manteniendo intacta la
prenda. Aplicá el mismo color grading cálido y la misma dirección de luz del bloque de
estilo para que combine con el resto del carrusel. Agregá texto superpuesto en la parte
inferior, serif liviana (Fraunces light) color ink900, alineado a la izquierda, texto
exacto: "Cardigan 3/4 — $1.290". Debajo, en sans Inter chica: "Tu talle, tus colores."
Elemento conector esquina inferior derecha: "DAHILA · TIENDA   02/07".
```

## Diapositiva 3 — Top HALTER

🔸 **REQUIERE FOTO DE REFERENCIA**: subí una foto de producto del Top HALTER.

```
[Pegar el BLOQUE DE ESTILO FIJO antes de este prompt]

Usá la foto adjunta del Top HALTER como base real — no inventes ni modifiques el
diseño. Recortá a formato 4:5 vertical exacto (1080×1350px), plano medio (de hombros a
cintura aproximadamente). Reemplazá el fondo por crema liso (#FAF1DF) si hace falta,
manteniendo intacta la prenda. Aplicá el mismo color grading cálido y dirección de luz
del bloque de estilo. Agregá texto superpuesto en la parte inferior, serif liviana
(Fraunces light) color ink900, alineado a la izquierda, texto exacto: "Top HALTER —
$890". Debajo, en sans Inter chica: "Liviano, para todos los días." Elemento conector
esquina inferior derecha: "DAHILA · TIENDA   03/07".
```

## Diapositiva 4 — Set BRISA (3 piezas)

🔸 **REQUIERE FOTO DE REFERENCIA**: subí una foto de producto del Set BRISA (las 3 piezas juntas o puestas).

```
[Pegar el BLOQUE DE ESTILO FIJO antes de este prompt]

Usá la foto adjunta del Set BRISA como base real — no inventes las piezas. Recortá a
formato 4:5 vertical exacto (1080×1350px), encuadre que muestre el conjunto completo.
Reemplazá el fondo por blanco o crema liso según lo que combine mejor con la foto
original, manteniendo intactas las prendas. Aplicá el mismo color grading y dirección
de luz del bloque de estilo. Agregá texto superpuesto abajo a la izquierda, serif
liviana (Fraunces light) color ink900, texto exacto: "Set BRISA (3 piezas) — $890".
Debajo, en sans Inter chica: "El conjunto más elegido." Elemento conector esquina
inferior derecha: "DAHILA · TIENDA   04/07".
```

## Diapositiva 5 — Detalle macro de textura

🔸 **REQUIERE FOTO DE REFERENCIA**: subí una foto real de primer plano de la textura del tejido (de cualquiera de las tres piezas) o de manos tejiendo — la que tengan con mejor definición de la puntada.

```
[Pegar el BLOQUE DE ESTILO FIJO antes de este prompt]

Usá la foto adjunta como base real — no generes una textura de crochet inventada,
partí de la foto real de la puntada o de las manos tejiendo. Recortá a formato 4:5
vertical exacto (1080×1350px), encuadre extremo cerrado sobre la textura, que ocupe
prácticamente todo el cuadro. Ajustá el color grading a luz cálida rasante que resalte
el relieve del punto, siguiendo el tratamiento fotográfico del bloque de estilo — no
cambies la fibra ni el color real de la lana. Sin texto principal — solo el elemento
conector en la esquina inferior derecha, en blanco con leve sombra para legibilidad si
el fondo es oscuro: "DAHILA · TIENDA   05/07".
```

## Diapositiva 6 — Trust bar (los 4 pilares) — conceptual, sin foto

```
[Pegar el BLOQUE DE ESTILO FIJO antes de este prompt — esta diapositiva va en la misma
tanda que la diapositiva 7, generadas juntas en un solo pedido a ChatGPT Images]

Composición tipográfica, sin fotografía de producto, fondo crema liso (#FAF1DF) según
el bloque de estilo. Cuatro líneas de texto apiladas verticalmente y centradas, cada
una con un ícono lineal simple y fino (trazo delgado, estilo dibujado a mano, nunca
ícono redondeado de stock) a la izquierda: un corazón con una mano (hecho a mano), una
cinta métrica (a tu medida), una hoja (lana natural), un camión de una sola línea
(envío a todo el país). Los cuatro íconos dibujados en tono vino (#8F3B53) — único
acento de color de la imagen. Texto de cada línea en sans Inter peso medio, color
ink900: "Hecho a mano" / "A tu medida" / "Lana natural" / "Envío a todo el país".
Elemento conector esquina inferior derecha: "DAHILA · TIENDA   06/07".
```

## Diapositiva 7 — CTA de cierre — conceptual, sin foto

```
[Pegar el BLOQUE DE ESTILO FIJO antes de este prompt — generar junto con la diapositiva
6 en el mismo pedido]

Composición tipográfica, fondo ink900 (#1F1A1B) — única diapositiva del carrusel con
fondo oscuro, para marcar el cierre. Centrado, serif liviana (Fraunces light) color
blanco, tamaño grande: "¿Te gustó lo que viste?" Debajo, sans Inter blanco con opacidad
reducida, tamaño mediano: "Escribinos por WhatsApp y lo tejemos para vos." Un botón
rectangular de esquinas suavemente redondeadas en tono vino (#8F3B53) con texto sans
mayúscula blanco: "ESCRIBINOS POR WHATSAPP" — único acento de color saturado sobre el
fondo oscuro. Debajo del botón, sans muy chica gris claro: "dahila.uy". Elemento
conector esquina inferior derecha (en gris medio sobre el fondo oscuro): "DAHILA ·
TIENDA   07/07".
```

---

## Secuencia (verificar antes de generar)

1. Hook — "Tejido con tiempo." 🔸 foto
2. Cardigan 3/4 — $1.290 🔸 foto
3. Top HALTER — $890 🔸 foto
4. Set BRISA (3 piezas) — $890 🔸 foto
5. Detalle macro de textura 🔸 foto
6. Trust bar — 4 pilares (conceptual)
7. CTA — WhatsApp (conceptual)
