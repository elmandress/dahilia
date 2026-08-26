# Tarjetita de agradecimiento con QR — 3 conceptos (frente + dorso)

**v3 — cambio de dirección.** Las dos versiones anteriores iban a los extremos: v1 muy clean/minimalista, v2 con el vino como fondo dominante y bastante ornamentada. Esta va por otro lado: **beige como color principal**, **detalles en rosado** (no vino), y la flor de dahlia como un guiño chico, no como protagonista. El objetivo cambió de "que se note" a "que dé ganas de guardarla" — investigué específicamente qué hace que una tarjeta así funcione para retención, no solo para conversión inmediata, y lo apliqué abajo.

## Research — qué hace que una tarjeta así te den ganas de volver a comprar

- **Reciprocidad (Cialdini)**: cuando alguien te da algo sin pedir nada primero, sentís el impulso de "devolver el gesto" — comprando de nuevo. Esto es más fuerte cuanto más se sienta como un regalo genuino y menos como una promoción calculada. Por eso en esta versión el descuento se presenta como una sorpresa ("tenemos algo para vos"), no como un cartel de "15% OFF" gritado.
- **Sorpresa y deleite > lo esperado**: un gesto que la persona no anticipaba genera bastante más lealtad que un descuento que ya esperaba. Encaja con no anunciar el % como lo primero que se lee.
- **Una nota con toque personal supera a meses de campañas de descuento**: varias fuentes coinciden en que una nota que se siente escrita por una persona (no por "el equipo de marketing") genera más lealtad que el descuento en sí. Por eso las tres versiones de acá suman una firma chica, casi manuscrita, de Anush — coherente con que en el resto del sitio (`/atelier`) ya es una persona real y nombrada, no una marca anónima.
- **Evitar el genérico "gracias por tu compra" repetido sin variación** — una de las fuentes marca puntualmente que frases tipo "gracias por tu negocio" suenan impersonales, y que variantes como "gracias por elegirnos" o "gracias por confiar en nosotras" generan más conexión. Diversifiqué la frase principal entre los 3 conceptos en vez de repetir literalmente lo mismo tres veces.
- **Mensaje corto**: ninguna fuente recomienda un párrafo largo — una frase, no un texto. Ya lo veníamos haciendo, lo mantengo.
- **Conexión emocional > el descuento en sí**: clientas emocionalmente conectadas con una marca vuelven mucho más que las que solo responden al precio. La lectura para el diseño: el beige/rosado suave, la firma personal y el motivo floral discreto pesan tanto como el 15% — no son "decoración", son la parte que genera el vínculo.
- **Una tarjeta física bien pensada se guarda o se expone** — motivo extra para que esta versión sea "linda de tener", no solo funcional.

Fuentes: [The Reciprocity Principle — Ecommerce Psychology](https://ecommercepsychology.com/the-reciprocity-principle-free-gifts-that-actually-drive-purchases/), [Unboxing Psychology — Elite Printing & Packaging](https://www.eliteprintingandpackaging.com/blog/unboxing-psychology-the-science-behind-branded-packaging-collateral/), [15 Handwritten Thank You Card Examples — Simply Noted](https://simplynoted.com/blogs/news/15-handwritten-thank-you-card-examples-for-ecommerce), [44 Best Thank You for Your Purchase Messages — Shopify](https://www.shopify.com/blog/thank-your-customers), [The Psychology of Unboxing — OC3PL](https://oc3pl.com/psychology-of-unboxing-packaging-retention/)

## Sobre "todas sus redes" (sigue igual que la v2)

**Dahila Crochet** (nombre), **dahila.uy** (sitio) y **@dahila.crochet** (Instagram) — los tres confirmados en el código. Pinterest está en plan pero sin handle activo confirmado, así que no lo imprimo todavía. Pasame el @ exacto si ya lo tenés y lo agrego.

## Contexto — lo que ya está funcionando en el sitio (sigue vigente)

1. **`/gracias`** — página exclusiva a la que apunta el QR. Muestra el agradecimiento, el 15% y el código, con botón de copiar.
2. **Cupón real `GRACIAS15`** — 15% en todo el catálogo, una vez por clienta.
3. Todo el texto de `/gracias` es editable desde `/admin/configuracion` → "Tarjeta QR".
4. **Falta un solo paso tuyo**: correr `database/tarjeta-qr-agradecimiento-2026-08.sql` en el SQL Editor de Supabase. `lint` y `build` ya pasaron limpio.

## Antes de generar — 3 cosas importantes

- 🔸 **El logo lo subís vos.** Ningún prompt lo describe — todos le piden al modelo que use el archivo que subas, tal cual, sin redibujarlo ni recolorearlo. Con fondo beige claro, el logo (`isotype-color.png`, que es oscuro/a color) va a leerse bien directo sobre el fondo, sin necesitar una placa clara como en la v2 — lo indico en cada prompt.
- 🔸 **El QR sigue siendo un placeholder visual** — reemplazalo por uno real (apuntando a `https://dahila.uy/gracias`) antes de imprimir.
- Estos prompts dan una **vista previa de dirección de diseño**, no un archivo listo para imprenta — para el archivo final con sangrado y marcas de corte, lo mejor es pasar el concepto elegido a Canva/Illustrator o a un diseñador una vez que definas cuál te convence.

---

## 🎨 IDENTIDAD FIJA — pegar como base en los 6 prompts

```
IDENTIDAD DAHILA — tarjeta física impresa, versión "beige suave":

Paleta exacta (hex, real de la marca, sin inventar ningún color nuevo):
- Fondo dominante: beige (#F1E3C8) o beige claro (#FAF1DF) — la parte más
  cálida de la paleta cream de Dahila, usada como protagonista.
- Texto principal: ink900 (#1F1A1B), un negro cálido, nunca negro puro.
- Texto secundario: ink700 (#4A4143).
- Detalles y acentos: rosado — claro (#F8DDE3), medio (#ECC0CB) o saturado
  (#E693A7) — para el motivo floral, líneas, cintas finas y el sello del
  descuento. Es el color de detalle de esta versión, no el vino.
- Vino (#8F3B53): reservado a un solo uso mínimo por tarjeta — el número
  del descuento o un detalle puntual muy chico (un hilo, un punto) — nunca
  como color dominante ni de fondo. Sigue siendo el acento de marca, pero
  acá casi susurrado, no protagonista.
- Sin degradé violeta, sin paleta pastel genérica de IA, sin glassmorphism
  — la calidez viene de la textura de papel y el motivo floral discreto,
  no de mezclar colores fuera de esta paleta.

Motivo floral — MUY discreto: una flor de dahlia chica (el nombre "Dahila"
viene de "dahlia"), en trazo fino tipo ilustración botánica o flor
prensada, en rosado claro o medio, usada como UN detalle pequeño en una
esquina o junto a la firma — nunca grande, nunca centrada, nunca como
fondo repetido. Si en algún momento el motivo se siente protagonista, es
demasiado — tiene que notarse solo cuando alguien mira de cerca.

Tipografía (igual que siempre, sin reemplazos):
- Títulos: serif liviana estilo Fraunces light (peso 300), color ink900
  sobre el fondo beige.
- Firma personal (toque manuscrito): la misma familia Fraunces, en
  itálica, tamaño chico, como si fuera una firma — nunca una fuente script
  distinta. Texto de firma: "— Anush, Dahila Crochet".
- Texto chico / firma de marca: sans Inter, mayúscula, tracking amplio
  (~0.15-0.2em), color ink700.

Firma de marca — repetir en frente Y dorso, mismo formato en las 6 caras:
"DAHILA CROCHET  ·  DAHILA.UY  ·  @DAHILA.CROCHET", en sans Inter
mayúscula chica, tracking amplio, color ink700.

Logo: usá el archivo de logo que se sube en la conversación, exactamente
como es, sin redibujarlo ni cambiarle el color — sobre el fondo beige claro
se lee bien directo, sin necesitar una placa.

QR (en los dorsos): placeholder — un cuadrado blanco liso con esquinas
redondeadas suaves y 4 marcas de esquina finas tipo visor de cámara, sin
patrón de QR real adentro, con espacio en blanco alrededor. Nunca generar
un patrón de QR real o inventado.

Tono del mensaje: el descuento se presenta como una sorpresa/regalo, nunca
como un cartel de oferta — la palabra "15%" no es lo primero ni lo más
grande de la composición.

Formato: tarjeta física para imprimir — proporción y tamaño exacto se
especifican en cada prompt individual.
```

---

## Concepto 1 — Papel natural

El más simple de los tres: textura de papel/lino natural, un trazo de dahlia muy chico en la esquina, firma personal debajo del mensaje. La idea es que se sienta escrita a mano sobre papel lindo, no diseñada.

### 1a — Frente

🔸 **REQUIERE LOGO SUBIDO**: usá el archivo tal cual (recomendado: `isotype-color.png`).

```
[Pegar la IDENTIDAD FIJA de arriba antes de este prompt]

Tarjeta física horizontal, formato postal exacto 6×4 pulgadas (15,2×10,2
cm). Fondo liso en beige claro (#FAF1DF) con una textura sutil de papel de
lino natural (fibras finas apenas visibles, nada de brillo). En la esquina
superior derecha, un trazo de flor de dahlia muy chico y fino, en rosado
claro (#F8DDE3), como si fuera un sello discreto — ocupando no más del 8%
del ancho de la tarjeta. Usá el logo subido, chico, en la esquina superior
izquierda (~12% del ancho) — no lo redibujes. Centrado en el resto de la
tarjeta, el texto principal en serif liviana (Fraunces light) color ink900
(#1F1A1B), tamaño grande: "Gracias por elegirnos." Debajo, una línea muy
fina en rosado medio (#ECC0CB) de unos 2 cm. Debajo de la línea, en serif
itálica liviana (Fraunces light italic) color ink700 (#4A4143), tamaño
chico, como una firma: "— Anush, Dahila Crochet". Al pie, en sans Inter
mayúscula muy chica, tracking amplio, color ink700: "DAHILA CROCHET  ·
DAHILA.UY  ·  @DAHILA.CROCHET". Composición cálida y con mucho aire, nada
recargado.
```

### 1b — Dorso

```
[Pegar la IDENTIDAD FIJA de arriba antes de este prompt]

Tarjeta física horizontal, mismo formato postal exacto 6×4 pulgadas
(15,2×10,2 cm) — dorso del concepto 1, misma textura de papel de lino
sobre el mismo beige (#FAF1DF), sin el trazo de dahlia esta vez (ya
apareció en el frente). Arriba, centrado, en serif liviana (Fraunces
light) color ink900, tamaño mediano: "Tenemos una sorpresa para vos."
Debajo, el placeholder de QR (cuadrado blanco liso, esquinas redondeadas,
4 marcas de esquina finas, sin patrón adentro), centrado, tamaño generoso
(~32% del ancho), con espacio en blanco alrededor. Debajo del QR, en sans
Inter chica color ink700: "Escaneá para verla." Debajo, en serif liviana
(Fraunces light) color ink900, tamaño mediano, centrado: "Un 15% en tu
próxima pieza, con cariño" — con "15%" en tono vino (#8F3B53), el único
punto de vino en toda la tarjeta. Debajo, en sans Inter muy chica color
ink700: "Código GRACIAS15 · dahila.uy/gracias". Al pie, la firma de marca:
"DAHILA CROCHET  ·  DAHILA.UY  ·  @DAHILA.CROCHET" en sans Inter mayúscula
chica, tracking amplio, color ink700.
```

---

## Concepto 2 — Flor prensada

El más "de guardar" de los tres: una ilustración botánica chica, estilo flor prensada de herbario, como si la tarjeta fuera parte de una colección de papelería linda. El descuento va dentro de un óvalo suave, como una etiqueta de vidriera antigua.

### 2a — Frente

🔸 **REQUIERE LOGO SUBIDO**: usá el archivo tal cual (recomendado: `isotype-color.png`).

```
[Pegar la IDENTIDAD FIJA de arriba antes de este prompt]

Tarjeta física horizontal, formato postal exacto 6×4 pulgadas (15,2×10,2
cm). Fondo liso en beige (#F1E3C8). En el costado derecho, ocupando una
franja vertical angosta (~20% del ancho), una ilustración botánica de una
flor de dahlia estilo "flor prensada de herbario" — trazo fino, detallado
pero delicado, en rosado medio (#ECC0CB) con algunas venas en rosado
saturado (#E693A7), como una lámina antigua de jardín, chica y contenida
en su franja, sin invadir el resto de la tarjeta. En el resto del espacio
(izquierda y centro), usá el logo subido arriba, chico (~12% del ancho) —
no lo redibujes. Debajo, el texto principal en serif liviana (Fraunces
light) color ink900, tamaño grande: "Gracias por confiar en nosotras."
Debajo, en serif itálica liviana (Fraunces light italic) color ink700,
tamaño chico: "— Anush, Dahila Crochet". Al pie, en sans Inter mayúscula
muy chica, tracking amplio, color ink700: "DAHILA CROCHET  ·  DAHILA.UY  ·
@DAHILA.CROCHET".
```

### 2b — Dorso

```
[Pegar la IDENTIDAD FIJA de arriba antes de este prompt]

Tarjeta física horizontal, mismo formato postal exacto 6×4 pulgadas
(15,2×10,2 cm) — dorso del concepto 2, misma franja vertical angosta a la
derecha con la misma ilustración de flor de dahlia prensada en rosado
medio (#ECC0CB) y saturado (#E693A7), para que se sienta la misma tarjeta.
Fondo beige (#F1E3C8) en el resto. Arriba, centrado en el espacio
izquierdo, en serif liviana (Fraunces light) color ink900: "Un gesto de
nuestra parte." Debajo, un óvalo suave de borde fino en rosado claro
(#F8DDE3), sin relleno sólido, conteniendo: el placeholder de QR (cuadrado
blanco liso, esquinas redondeadas, 4 marcas de esquina finas, sin patrón
adentro) arriba, y debajo, en serif liviana (Fraunces light) color ink900,
"15% de descuento" con "15%" en tono vino (#8F3B53) — único punto de vino
de la tarjeta. Debajo del óvalo, en sans Inter chica color ink700: "Código
GRACIAS15 — válido en dahila.uy/gracias". Al pie, la firma de marca: "DAHILA
CROCHET  ·  DAHILA.UY  ·  @DAHILA.CROCHET" en sans Inter mayúscula chica,
tracking amplio, color ink700.
```

---

## Concepto 3 — Cinta y puntada

El más ligado al oficio de los tres: un borde fino tipo puntada de crochet (delicado, no festoneado grueso como en la v2) y un pequeño detalle de aguja/hilo en vez de la flor — el motivo floral aparece solo minúsculo, junto a la firma.

### 3a — Frente

🔸 **REQUIERE LOGO SUBIDO**: usá el archivo tal cual (recomendado: `isotype-color.png`).

```
[Pegar la IDENTIDAD FIJA de arriba antes de este prompt]

Tarjeta física vertical tipo etiqueta colgante (swing tag), formato
2,5×4 pulgadas (6,4×10,2 cm), esquinas superiores redondeadas. Fondo liso
en beige claro (#FAF1DF). Todo el borde exterior tiene una línea fina
punteada en rosado medio (#ECC0CB), simulando una puntada de crochet
delicada (no un festón grueso, solo una línea de puntaditas parejas). En
la parte superior central, un agujero circular pequeño (~4mm) atravesado
por un cordón de hilo de algodón crudo/natural anudado. Debajo del
agujero, usá el logo subido, centrado, chico (~15% del ancho) — no lo
redibujes. Debajo, el texto principal en serif liviana (Fraunces light)
color ink900, tamaño mediano, centrado: "Gracias por tu confianza."
Debajo, en serif itálica liviana (Fraunces light italic) color ink700,
tamaño muy chico: "— Anush". Junto a la firma, un trazo minúsculo de flor
de dahlia en rosado claro (#F8DDE3), del tamaño de una letra, casi un
detalle que hay que buscar. Al pie, en sans Inter muy chica, mayúscula,
tracking amplio, color ink700, en dos líneas centradas: "DAHILA CROCHET" /
"DAHILA.UY · @DAHILA.CROCHET".
```

### 3b — Dorso

```
[Pegar la IDENTIDAD FIJA de arriba antes de este prompt]

Misma tarjeta vertical tipo etiqueta colgante, mismo formato exacto
2,5×4 pulgadas (6,4×10,2 cm), mismas esquinas superiores redondeadas,
mismo agujero con cordón, y misma línea punteada rosada (#ECC0CB) bordeando
toda la tarjeta — dorso de la misma etiqueta física del concepto 3. Fondo
beige claro (#FAF1DF). Debajo del agujero, en serif liviana (Fraunces
light) color ink900, centrado, tamaño mediano: "Una sorpresa para vos."
Debajo, el placeholder de QR (cuadrado blanco liso, esquinas redondeadas, 4
marcas de esquina finas, sin patrón adentro), centrado, tamaño generoso.
Debajo del QR, en serif liviana (Fraunces light) color ink900, centrado:
"15% en tu próxima pieza" — con "15%" en tono vino (#8F3B53), único punto
de vino de la tarjeta. Debajo, en sans Inter chica color ink700, centrado:
"Código GRACIAS15". Al pie, en sans Inter muy chica mayúscula tracking
amplio color ink700, en dos líneas centradas: "DAHILA CROCHET" /
"DAHILA.UY · @DAHILA.CROCHET".
```

---

## Resumen — qué generar y en qué orden

| Concepto | Frente | Dorso | Formato | Motivo principal |
|---|---|---|---|---|
| 1 — Papel natural | 1a 🔸 logo | 1b — QR + sorpresa | Postal horizontal 6×4" | Textura de lino, trazo de dahlia mínimo en la esquina |
| 2 — Flor prensada | 2a 🔸 logo | 2b — QR en óvalo | Postal horizontal 6×4" | Franja de flor de dahlia estilo herbario, contenida a un costado |
| 3 — Cinta y puntada | 3a 🔸 logo | 3b — QR + cordón | Tag vertical 2,5×4" | Borde de puntada delicado, dahlia minúscula junto a la firma |

Los 6 usan la misma IDENTIDAD FIJA (beige como fondo, rosado como color de detalle, vino solo en el número del descuento, firma personal de Anush) — pegala al principio de cada prompt para que las 6 caras se sientan una sola tarjeta.
