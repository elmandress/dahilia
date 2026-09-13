import type { Article } from '../types'

export const article: Article = {
  slug: 'tops-de-crochet-para-verano',
  title: 'Tops de crochet para verano: qué mirar antes de elegir',
  metaTitle: 'Tops de crochet para verano: guía para elegir',
  description:
    'Qué fibra, qué punto y qué forma conviene en un top de crochet para el verano uruguayo, cómo evitar que transparente y con qué combinarlo en la playa y en la ciudad.',
  excerpt:
    'El crochet es tejido, pero no todos los tejidos dan calor. Qué hace que un top sea fresco de verdad y qué mirar para que no termine guardado en el cajón.',
  cluster: 'comprar',
  role: 'support',
  funnel: 'MOFU',
  publishedAt: '2026-09-04',
  hero: { src: '/photos/blog/top-summer-rosa.jpg', alt: 'Top SUMMER tejido a crochet en rosa, puesto junto a una ventana', position: '50% 35%' },
  relatedCategorySlug: 'tops',
  relatedProductSlugs: ['top-summer', 'top-cherry', 'beach-set'],
  relatedArticleSlugs: [
    'que-talle-de-prenda-tejida-me-queda',
    'la-lana-pica-fibras-piel-sensible',
    'como-cuidar-prendas-de-crochet',
  ],
  body: [
    {
      type: 'p',
      text: 'La primera reacción de mucha gente ante un top tejido en verano es "¿no da calor?". La respuesta corta es que depende de dos cosas que se pueden mirar antes de comprar: de qué fibra está hecho y qué tan abierto es el punto. Un top de algodón con punto calado es de las prendas más frescas que existen; uno de lana con punto cerrado, no.',
    },
    {
      type: 'callout',
      title: 'La versión corta',
      text: 'Para verano: fibra vegetal (algodón o mezcla de algodón), punto con calado o espacios, y una forma que no apriete. Esa combinación deja circular el aire, que es exactamente lo que hace que una prenda sea fresca.',
    },

    { type: 'h2', text: 'Por qué un tejido puede ser fresco' },
    {
      type: 'p',
      text: 'Lo que abriga no es la tela, es el aire quieto que la tela atrapa contra el cuerpo. Un punto cerrado de lana atrapa mucho aire y no lo deja salir: abriga. Un punto calado de algodón hace lo contrario, deja pasar el aire y evapora la humedad de la piel.',
    },
    {
      type: 'p',
      text: 'Por eso el crochet funciona tan bien en verano: es una técnica que naturalmente genera espacios entre puntos. La misma característica que lo hace liviano en invierno (necesita algo debajo para abrigar) es la que lo vuelve ideal cuando hace calor.',
    },

    { type: 'h2', text: 'Qué mirar antes de elegir' },
    {
      type: 'steps',
      items: [
        {
          title: 'La fibra',
          text: 'Algodón, o mezcla con predominio de algodón. Absorbe la humedad y se seca rápido. La lana, aun fina, retiene más calor del que querés en enero.',
        },
        {
          title: 'La densidad del punto',
          text: 'Miralo a contraluz en las fotos: si se ve la trama y hay espacios, es fresco. Si es una superficie compacta, va a dar más calor aunque sea de algodón.',
        },
        {
          title: 'Qué tanto transparenta',
          text: 'Todo punto calado deja pasar algo de luz, y eso es parte del diseño. La pregunta no es si transparenta sino si vos querés usarlo así, con top debajo, o sobre la malla.',
        },
        {
          title: 'La forma',
          text: 'Los tirantes anchos y las espaldas abiertas son los más frescos. Un top con manga, por más calado que sea, siempre va a ser más abrigado.',
        },
      ],
    },
    {
      type: 'note',
      text: 'La relación entre punto abierto, fibra vegetal y sensación de frescura es información textil general. Qué fibra usa cada top de Dahila está en su ficha de producto.',
    },

    {
      type: 'image',
      src: '/photos/blog/top-higgie-turquesa.jpg',
      alt: 'Top HIGGIE tejido a crochet en algodón turquesa, con la parte de abajo calada',
      width: 926,
      height: 946,
      caption: 'El [top HIGGIE](/tienda/top-higgie), en algodón: calado abajo y más cerrado arriba.',
      href: '/tienda/top-higgie',
    },

    { type: 'h2', text: 'Los tres usos típicos, y qué conviene en cada uno' },
    {
      type: 'ul',
      items: [
        '**Playa, sobre la malla.** Acá el calado es una ventaja y no hace falta nada debajo. Buscá algo que se seque rápido y que no se manche con protector solar: el algodón claro mancha más que un tono medio.',
        '**Ciudad de día.** Un top de punto medio con un short o un jean, o con un top liso debajo si el calado es grande. Es el uso donde más importa que la forma sea prolija.',
        '**Salida de noche.** Punto más cerrado o hilado con brillo. Acá el tejido a mano se nota, y esa es justamente la gracia.',
      ],
    },

    { type: 'h2', text: 'Verano uruguayo: qué esperar' },
    {
      type: 'p',
      text: 'El verano acá es húmedo, y la humedad cambia las prioridades: una fibra que no absorbe se te pega al cuerpo. El algodón absorbe y suelta, que es lo que hace que se sienta fresco incluso con humedad alta.',
    },
    {
      type: 'p',
      text: 'Y como la temporada fuerte va de noviembre a febrero, conviene pensarlo con tiempo: una prenda tejida a mano se teje después del pedido, así que pedirla en diciembre para usarla en diciembre suele no llegar. Los plazos reales están en [cuánto demora una prenda tejida a mano](/blog/cuanto-demora-una-prenda-tejida-a-mano).',
    },

    { type: 'h2', text: 'Cómo cuidarlo para que aguante la temporada' },
    {
      type: 'ul',
      items: [
        '**Enjuagalo después de la playa.** La sal y el cloro resecan la fibra; un enjuague con agua dulce alcanza.',
        '**Nunca lo dejes hecho un bollo mojado en el bolso.** Es la forma más rápida de que agarre olor y de que se deforme.',
        '**Secalo en horizontal y a la sombra.** Colgado y mojado, el peso del agua estira los tirantes.',
        '**Guardalo doblado, no colgado.** Vale para todo el tejido, y en un top de tirantes finos se nota el doble.',
      ],
    },

    { type: 'h2', text: 'Preguntas frecuentes' },
    {
      type: 'faq',
      items: [
        {
          q: '¿Un top de crochet transparenta?',
          a: 'Los de punto calado sí dejan pasar luz, es parte del diseño. Si querés uno para usar sin nada debajo, buscá punto cerrado o preguntá antes de comprar: es un dato que se sabe con mirar la prenda.',
        },
        {
          q: '¿Se puede usar de malla o sobre la malla?',
          a: 'Sobre la malla, sí, es uno de los usos más comunes. Como prenda de baño en sí no: el tejido absorbe agua, pesa y se deforma mientras está mojado.',
        },
        {
          q: '¿El algodón se achica?',
          a: 'Si lo lavás con agua caliente o lo pasás por secarropas, sí. Lavado a mano en frío y secado horizontal, no.',
        },
        {
          q: '¿Cuál me queda mejor si tengo mucho busto?',
          a: 'Los de tirante ancho y punto más cerrado sostienen mejor que los de tirante fino y calado grande. Y como se tejen a pedido, se puede ajustar el largo y el ancho del escote a tus medidas.',
        },
        {
          q: '¿Cuándo conviene pedirlo para tenerlo en verano?',
          a: 'Con varias semanas de anticipación: el plazo depende de la cola de pedidos, y noviembre y diciembre son los meses de más demanda del año.',
        },
      ],
    },

    {
      type: 'p',
      text: 'Si además tenés dudas de talle, el paso a paso para medirte está en [qué talle de prenda tejida me queda](/blog/que-talle-de-prenda-tejida-me-queda).',
    },

    {
      type: 'shopCta',
      title: 'Tops tejidos a mano',
      text: 'En algodón, con el punto y el talle que elijas, tejidos en Montevideo.',
      href: '/tienda/tops',
      label: 'Ver los tops',
    },
  ],
}
