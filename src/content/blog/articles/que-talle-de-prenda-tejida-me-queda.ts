import type { Article } from '../types'

export const article: Article = {
  slug: 'que-talle-de-prenda-tejida-me-queda',
  title: 'Qué talle de prenda tejida me queda: cómo medirte en 5 minutos',
  metaTitle: 'Cómo saber qué talle de prenda tejida te queda',
  description:
    'Cómo medirte busto, cintura y cadera para acertar el talle de una prenda de crochet, qué hacer si estás entre dos talles y por qué el tejido a mano se mide distinto.',
  excerpt:
    'La duda que frena la mayoría de las compras de ropa online. Con una cinta métrica y cinco minutos se resuelve, y en el tejido a mano hay un margen que la ropa de máquina no te da.',
  cluster: 'comprar',
  role: 'support',
  funnel: 'BOFU',
  publishedAt: '2026-09-04',
  updatedAt: '2026-09-13',
  hero: { src: '/photos/blog/sweater-crochet-rojo-cereza.jpg', alt: 'Sweater cherry tejido a crochet en rojo, puesto', position: '50% 40%' },
  relatedCategorySlug: 'tops',
  relatedProductSlugs: ['top-summer', 'cardigan-3-4', 'set-brisa'],
  relatedArticleSlugs: ['comprar-crochet-en-uruguay', 'como-encargar-prenda-a-medida'],
  body: [
    {
      type: 'p',
      text: 'Elegir talle es el momento en que la mayoría de la gente cierra la pestaña. Y tiene sentido: en ropa tejida, "M" no quiere decir lo mismo en dos marcas distintas, ni siquiera en dos prendas de la misma marca. La forma de sacarse la duda no es adivinar entre S y M, es medirse una vez y comparar centímetros con centímetros.',
    },
    {
      type: 'callout',
      title: 'La versión corta',
      text: 'Medite busto, cintura y cadera con una cinta métrica, sin apretar, con ropa liviana. Después comparás esos tres números con la tabla de talles en cm. Si quedás entre dos talles, mandá tus medidas por WhatsApp antes de comprar: la prenda se teje después del pedido, así que se ajusta.',
    },

    { type: 'h2', text: 'Qué necesitás para medirte' },
    {
      type: 'ul',
      items: [
        'Una cinta métrica de costura (la de modista, flexible). Si no tenés, sirve un cordón o un cable de cargador que después medís con una regla.',
        'Ropa liviana o ropa interior. Medirse arriba de un buzo suma centímetros que no existen.',
        'Un espejo, o alguien que te dé una mano con la espalda.',
      ],
    },

    { type: 'h2', text: 'Las tres medidas que importan' },
    {
      type: 'steps',
      items: [
        {
          title: 'Busto',
          text: 'Pasás la cinta por la parte más ancha del busto, alrededor de toda la espalda, manteniendo la cinta paralela al piso. Los brazos relajados a los costados: si los levantás, la medida sale más grande de lo real.',
        },
        {
          title: 'Cintura',
          text: 'La parte más angosta del torso, que suele estar un poco arriba del ombligo. Un truco para encontrarla sin pensar: inclinate hacia un costado: el pliegue que se forma es tu cintura natural.',
        },
        {
          title: 'Cadera',
          text: 'La parte más ancha de la cadera, generalmente unos 20 cm debajo de la cintura. Pies juntos, cinta paralela al piso.',
        },
      ],
    },
    {
      type: 'callout',
      title: 'El error más común',
      text: 'Apretar la cinta para que dé un número más chico. La cinta tiene que apoyar sobre el cuerpo sin hundirse: si te deja marca, está apretada. Esa diferencia de dos centímetros es exactamente la que después hace que una prenda quede incómoda.',
    },

    { type: 'h2', text: 'La tabla de talles de Dahila, en centímetros' },
    {
      type: 'p',
      text: 'Estas son las medidas de referencia del cuerpo (no de la prenda) que usamos para cada talle. Es la misma tabla que aparece en cada ficha de producto, en el enlace "Tabla de talles":',
    },
    {
      type: 'ul',
      items: [
        '**XS** — busto 78–82 · cintura 60–64 · cadera 84–88',
        '**S** — busto 83–87 · cintura 65–69 · cadera 89–93',
        '**M** — busto 88–92 · cintura 70–74 · cadera 94–98',
        '**L** — busto 93–98 · cintura 75–80 · cadera 99–104',
        '**XL** — busto 99–105 · cintura 81–87 · cadera 105–111',
      ],
    },
    {
      type: 'note',
      text: 'Son medidas de cuerpo, no de la prenda terminada. Una prenda siempre lleva algo de holgura sobre esas medidas, y cuánta depende del modelo: un top ajustado y un cardigan oversize parten del mismo cuerpo y terminan con anchos muy distintos.',
    },

    { type: 'h2', text: 'Qué hacer si quedás entre dos talles' },
    {
      type: 'p',
      text: 'Pasa seguido, sobre todo cuando el busto da un talle y la cadera otro. La regla práctica según el tipo de prenda:',
    },
    {
      type: 'ul',
      items: [
        '**Tops y prendas de arriba:** manda la medida de busto. Es donde la prenda tiene que entrar bien; el resto acompaña.',
        '**Cardigans y prendas abiertas:** podés ir al talle más grande sin problema. Al no cerrar sobre el cuerpo, el talle de más se lee como caída, no como que te queda grande.',
        '**Prendas de abajo:** manda la cadera, que es la medida que tiene que pasar.',
        '**Sets:** si las dos piezas no dan el mismo talle, avisalo al hacer el pedido. Se puede tejer cada pieza en su talle.',
      ],
    },

    { type: 'h2', text: 'Por qué el tejido a mano se mide distinto que la ropa de máquina' },
    {
      type: 'p',
      text: 'Una prenda de máquina se corta de un molde fijo: existe antes de que vos la compres, y por eso el talle es lo que es. Una prenda tejida a mano se teje después del pedido, punto por punto, así que las medidas no son un molde cerrado sino un punto de partida.',
    },
    {
      type: 'p',
      text: 'En la práctica eso significa dos cosas. La primera, que si estás justo en el borde entre dos talles, se puede tejer en el medio. La segunda, que si tenés una medida que se sale de la tabla (brazos más largos, torso más corto, un busto que no acompaña al resto), eso se resuelve tejiendo, no eligiendo otro talle.',
    },
    {
      type: 'quote',
      text: 'En el tejido a mano, el talle no es una caja a la que hay que entrar: es un punto de partida que se ajusta.',
    },

    { type: 'h2', text: 'El tejido también da de sí (y cuánto)' },
    {
      type: 'p',
      text: 'El crochet tiene elasticidad propia: el punto es una estructura de nudos con aire entre medio, así que la prenda cede un poco al usarse y vuelve al ventilarse. Cuánto cede depende de la fibra: la lana es elástica y tiene memoria (cede y vuelve), mientras que el algodón es poco elástico y no tiene esa memoria: no estira al tirarlo, pero con el peso y el uso puede alargarse de a poco y no vuelve solo. Las mezclas quedan en el medio.',
    },
    {
      type: 'p',
      text: 'Por eso una prenda tejida que al principio parece justa suele acomodarse al cuerpo con el uso, mientras que una que queda grande de entrada no se achica sola. Ante la duda entre justo y holgado, en tejido conviene el justo.',
    },
    {
      type: 'note',
      text: 'La tabla de talles y el ajuste a medida son de Dahila. Lo del comportamiento de las fibras (algodón sostiene, lana cede y recupera) es cuidado textil general, aplicable a cualquier prenda tejida.',
    },

    { type: 'h2', text: 'Preguntas frecuentes' },
    {
      type: 'faq',
      items: [
        {
          q: '¿Cómo me mido si estoy sola?',
          a: 'Se puede con las tres medidas. Para el busto y la cadera, poné la cinta y cerrala adelante mirándote al espejo, sin girar el cuerpo. Si la cinta se te escapa por la espalda, apoyala primero contra una pared y después rodeá el cuerpo.',
        },
        {
          q: '¿Qué pasa si mis medidas no coinciden con ningún talle?',
          a: 'Es más común de lo que parece y no es un problema: las prendas se tejen después del pedido, así que se ajustan a tus medidas reales. Escribinos con los tres números y te decimos cómo queda.',
        },
        {
          q: '¿Conviene pedir un talle más grande para estar cómoda?',
          a: 'En tejido, no como regla. El punto ya tiene elasticidad propia, así que un talle de más suele leerse como prenda que se cae de los hombros. Si querés un efecto oversize, mejor decilo al pedir: se teje con esa holgura a propósito, que no es lo mismo que un talle grande.',
        },
        {
          q: '¿La medida es del cuerpo o de la prenda?',
          a: 'Del cuerpo. La tabla te dice qué talle corresponde a tus medidas; la prenda terminada siempre tiene algo más de ancho, que varía según el modelo.',
        },
        {
          q: '¿Puedo mandar las medidas de una prenda que ya tengo y me queda bien?',
          a: 'Sí, y es una de las formas más precisas de acertar. Medí a lo ancho (de costura a costura, con la prenda apoyada y sin estirar) el busto, el largo total y el largo de manga, y mandá esos números.',
        },
      ],
    },

    {
      type: 'p',
      text: 'Si querés que la prenda salga directamente con tus medidas en vez de elegir un talle de tabla, eso es un [encargo a medida](/blog/como-encargar-prenda-a-medida). El proceso completo está explicado ahí.',
    },

    {
      type: 'shopCta',
      title: '¿Dudas con el talle?',
      text: 'Mandá tus medidas antes de comprar y te decimos qué talle corresponde, o lo tejemos con las tuyas.',
      href: '/encargo',
      label: 'Consultar por mi talle',
    },
  ],
}
