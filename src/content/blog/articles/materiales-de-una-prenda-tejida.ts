import type { Article } from '../types'

export const article: Article = {
  slug: 'materiales-de-una-prenda-tejida',
  title: 'De qué está hecha una prenda tejida: guía de materiales',
  metaTitle: 'Materiales de una prenda tejida a crochet: guía',
  description:
    'Algodón, trapillo, chenille, lurex, acrílico antipilling y lana: qué es cada material, cómo se comporta con el uso y para qué prenda conviene cada uno.',
  excerpt:
    'Trapillo, mercerizado, chenille, antipilling. Los nombres que aparecen en las fichas y qué significan de verdad para la prenda que vas a usar.',
  cluster: 'comprar',
  role: 'support',
  funnel: 'MOFU',
  publishedAt: '2026-09-04',
  updatedAt: '2026-09-13',
  hero: { src: '/photos/blog/calentadores-chenille-rojos.jpg', alt: 'Calentadores tejidos a crochet en chenille rojo', position: '50% 50%' },
  relatedCategorySlug: 'tops',
  relatedProductSlugs: ['top-summer', 'bolso-lola', 'cardigan-3-4'],
  relatedArticleSlugs: [
    'la-lana-pica-fibras-piel-sensible',
    'como-cuidar-prendas-de-crochet',
    'comprar-crochet-en-uruguay',
  ],
  body: [
    {
      type: 'p',
      text: 'En la ficha de cada prenda hay una línea que dice de qué está hecha, y en general se pasa por alto. Es una lástima, porque es el dato que más define cómo va a ser usar esa prenda: cuánto abriga, si pica, si se estira, cuánto pesa y cómo se lava.',
    },
    {
      type: 'callout',
      title: 'La versión corta',
      text: 'La mayor parte de lo que se teje acá es algodón: fresco, lavable y no pica. La lana abriga mucho más pero pide más cuidado. El trapillo es para bolsos. Y las mezclas con acrílico son las más fáciles de lavar.',
    },

    { type: 'h2', text: 'Algodón' },
    {
      type: 'p',
      text: 'Es la fibra más usada en el tejido a mano de acá, y por buenas razones: absorbe la humedad y la suelta, no pica y aguanta el lavado. Es poco elástico: no estira cuando lo tirás, pero tampoco tiene la "memoria" de la lana: con el peso y el uso puede alargarse de a poco y no vuelve solo. Por eso una prenda de algodón se guarda doblada y se le devuelve la forma al lavarla.',
    },
    {
      type: 'p',
      text: 'Su contra es que abriga menos que la lana para el mismo grosor, y que tarda más en secarse. Para el clima uruguayo, húmedo casi todo el año, esa capacidad de absorber y soltar humedad es justamente lo que la hace cómoda.',
    },
    { type: 'h3', text: 'Algodón mercerizado' },
    {
      type: 'p',
      text: 'Es algodón que pasó por un tratamiento (el mercerizado) que deja la fibra más lisa y brillante, más resistente y con mejor toma del color. En la prenda se nota como un brillo suave y un color más profundo, y aguanta mejor los lavados sin apagarse.',
    },
    { type: 'h3', text: 'Algodón con lurex' },
    {
      type: 'p',
      text: 'Algodón hilado junto a un hilo metálico fino, que le da brillo. Se usa en piezas de salida o de fiesta. El hilo metálico no absorbe humedad y es un poco más rígido, así que la prenda se siente distinta al tacto: menos mullida, con más cuerpo.',
    },

    { type: 'h2', text: 'Trapillo reciclado' },
    {
      type: 'p',
      text: 'Es tela de punto cortada en tiras y enrollada en ovillo: sobrantes reales de la industria textil que en vez de ir a la basura se vuelven hilo. Es grueso, pesado y muy resistente.',
    },
    {
      type: 'p',
      text: 'Por eso se usa casi exclusivamente en bolsos y cestos: aguanta peso sin deformarse y no le importa que lo apoyes en el piso. No sirve para prendas, porque el mismo grosor que lo hace fuerte lo vuelve rígido e incómodo sobre el cuerpo.',
    },

    { type: 'h2', text: 'Chenille' },
    {
      type: 'p',
      text: 'Un hilado con fibras cortas insertadas alrededor de un núcleo, lo que le da esa superficie afelpada, tipo peluche (chenille quiere decir "oruga" en francés, por la forma del hilo). Es suavísimo al tacto y muy abrigado.',
    },
    {
      type: 'p',
      text: 'A cambio, es el material más delicado de la lista: el roce constante puede desprender fibra del núcleo, así que conviene para piezas que no se frotan mucho (mantas, accesorios, prendas de estar) y no para algo que va a rozar contra una mochila todos los días.',
    },

    { type: 'h2', text: 'Acrílico y acrílico antipilling' },
    {
      type: 'p',
      text: 'El acrílico es una fibra sintética: liviana, económica, de colores muy estables y fácil de lavar. Su punto flojo clásico son las pelotitas (pilling) que aparecen con el roce.',
    },
    {
      type: 'p',
      text: 'El acrílico antipilling es acrílico procesado para que eso ocurra mucho menos. Si vas a usar la prenda seguido y querés que se mantenga prolija sin cuidados especiales, es una opción sensata. Lo que ninguna versión de acrílico hace bien es transpirar: en calor húmedo se siente más que el algodón.',
    },

    { type: 'h2', text: 'Lana y mezclas con lana' },
    {
      type: 'p',
      text: 'La lana es la que más abriga por grosor, cede con el uso y recupera la forma al ventilarse. Es también la que más cuidado pide: agua fría siempre, nada de secarropas, y guardarla doblada.',
    },
    {
      type: 'p',
      text: 'Las mezclas de lana con acrílico (por ejemplo mitad y mitad) buscan un punto medio: algo del abrigo y la elasticidad de la lana, con la facilidad de lavado y el precio del acrílico. Abrigan menos que la lana pura y son menos propensas a afieltrarse.',
    },
    {
      type: 'note',
      text: 'Las características de cada fibra son información textil general. Qué material tiene cada pieza está siempre en su ficha de producto, y si una prenda se teje a pedido, el material se puede elegir antes de empezar.',
    },

    { type: 'h2', text: 'Cuál conviene según lo que busques' },
    {
      type: 'ul',
      items: [
        '**Que no pique, para usar sobre la piel:** algodón (en cualquiera de sus versiones).',
        '**Máximo abrigo:** lana, o mezcla con lana.',
        '**Un bolso que aguante:** trapillo.',
        '**Fácil de lavar y que no haga pelotitas:** acrílico antipilling.',
        '**Que brille para una salida:** algodón con lurex.',
        '**Suave y abrigado para estar en casa:** chenille.',
        '**Fresco para el verano húmedo:** algodón, con punto abierto.',
      ],
    },

    { type: 'h2', text: 'Cómo se lava cada uno' },
    {
      type: 'p',
      text: 'La regla es la misma para todos: **agua fría**, jabón neutro, sin frotar ni retorcer, y secado en horizontal sobre una toalla, a la sombra. El agua fría no es un capricho: el salto de temperatura es lo que apelmaza la fibra, sobre todo en lana.',
    },
    {
      type: 'ul',
      items: [
        '**Algodón:** el más tolerante. Aun así, nada de secarropas: el calor lo encoge.',
        '**Lana y mezclas:** el más sensible al calor y al movimiento. Mover poco, enjuagar a la misma temperatura.',
        '**Acrílico:** el más fácil, pero no lo planches: el calor directo derrite la fibra sintética.',
        '**Chenille:** lavarlo lo menos posible y sin fricción.',
        '**Trapillo:** aguanta bastante; secalo relleno para que el bolso conserve la forma.',
      ],
    },
    {
      type: 'p',
      text: 'El paso a paso completo del lavado está en [cómo lavar una prenda de crochet a mano](/blog/como-lavar-crochet-a-mano).',
    },

    { type: 'h2', text: 'Preguntas frecuentes' },
    {
      type: 'faq',
      items: [
        {
          q: '¿Cuál es el material más versátil?',
          a: 'El algodón, sin dudas: no pica, sirve casi todo el año en el clima de acá y aguanta lavados. Es también el más usado en el tejido a mano local.',
        },
        {
          q: '¿El trapillo sirve para ropa?',
          a: 'No. Es demasiado grueso y pesado para una prenda: queda rígido e incómodo. Es un material pensado para bolsos, cestos y deco.',
        },
        {
          q: '¿El acrílico es de peor calidad que la lana?',
          a: 'No es peor, es distinto. Abriga menos y transpira menos, pero es más liviano, más fácil de lavar y no pica. Para una prenda de uso diario que se lava seguido, tiene sentido.',
        },
        {
          q: '¿Puedo pedir la misma prenda en otro material?',
          a: 'En las piezas que se tejen a pedido, sí: el material se define antes de arrancar. Es una de las ventajas concretas de que la prenda se haga después de la compra.',
        },
        {
          q: '¿Cómo sé de qué está hecha una prenda antes de comprar?',
          a: 'Tiene que estar en la ficha del producto. Si no aparece, preguntá antes de comprar: es un dato básico y quien teje lo sabe siempre.',
        },
      ],
    },

    {
      type: 'p',
      text: 'Si lo que te preocupa puntualmente es que pique, hay una nota entera sobre eso: [¿la lana pica? qué fibra elegir si tenés piel sensible](/blog/la-lana-pica-fibras-piel-sensible).',
    },

    {
      type: 'shopCta',
      title: 'Cada ficha dice de qué está hecha',
      text: 'Material, cuidados y plazo, en cada prenda. Y si se teje a pedido, el material lo elegís vos.',
      href: '/tienda',
      label: 'Ver la tienda',
    },
  ],
}
