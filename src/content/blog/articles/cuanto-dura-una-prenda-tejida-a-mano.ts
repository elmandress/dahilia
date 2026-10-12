import type { Article } from '../types'

// 12/10/2026. Pregunta de quien duda por el precio ("¿cuánto dura?", aparece
// en Search Console). Sin prometer años: lo que hace durar o gastar una
// prenda tejida, por fibra, con los cuidados del catálogo y las horas reales.
export const article: Article = {
  slug: 'cuanto-dura-una-prenda-tejida-a-mano',
  title: '¿Cuánto dura una prenda tejida a mano? Lo que la gasta y lo que la cuida',
  metaTitle: 'Cuánto dura una prenda tejida a mano',
  description:
    'Qué hace que una prenda de crochet dure años o se gaste en una temporada: la fibra, el roce, el lavado y cómo se guarda. Y cómo reconocer una bien hecha.',
  excerpt:
    'Una prenda tejida a mano no tiene fecha de vencimiento: la gastan el roce, el lavado y cómo se guarda. Lo que conviene saber antes de comprar y después.',
  cluster: 'comprar',
  role: 'support',
  funnel: 'MOFU',
  publishedAt: '2026-10-12',
  hero: { src: '/photos/blog/chaleco-crochet-etiqueta.jpg', alt: 'Borde de un chaleco tejido a crochet a mano, con la etiqueta de Dahila', position: '50% 50%' },
  relatedCategorySlug: 'cardigans',
  relatedProductSlugs: ['cardigan-amour', 'spring-cardigan', 'bolso-lola', 'chaleco'],
  relatedArticleSlugs: ['cuanto-cuesta-una-prenda-tejida-a-mano', 'pelotitas-en-prendas-tejidas'],
  body: [
    {
      type: 'p',
      text: 'Cuando una prenda lleva horas de tejido a mano, la pregunta es lógica: ¿cuánto me va a durar? No hay un número fijo. Lo que define si dura años o se gasta en una temporada son cuatro cosas, y casi todas dependen de cómo se usa y se cuida.',
    },
    {
      type: 'callout',
      title: 'La versión corta',
      text: 'Una prenda tejida dura según la fibra, el roce, el lavado y cómo se guarda. Bien cuidada (agua fría, sin escurrir, secado en plano y guardada doblada), una pieza de crochet se usa temporada tras temporada.',
    },

    { type: 'h2', text: '1. La fibra' },
    {
      type: 'ul',
      items: [
        '**Algodón:** resistente y fácil de lavar. Con el sol directo y muchos lavados puede perder color; a la sombra, se mantiene.',
        '**Acrílico antipilling:** está hecho para no formar pelotitas con el roce, que es lo primero que "envejece" una prenda. Es el del [Cardigan amour](/tienda/cardigan-amour) y el [Spring cardigan](/tienda/spring-cardigan).',
        '**Lana:** abriga y dura, pero pide más cuidado al lavar: el agua caliente y el roce la apelmazan.',
        '**Trapillo:** el de los bolsos como el [Bolso LOLA](/tienda/bolso-lola). Es grueso y firme, y aguanta peso; está explicado en [por qué duran los bolsos de crochet](/blog/bolsos-de-crochet-por-que-duran).',
      ],
    },

    { type: 'h2', text: '2. El roce' },
    {
      type: 'p',
      text: 'Donde una prenda se gasta primero es donde roza: debajo de los brazos, los puños, y donde apoya la cartera o la mochila. Ahí aparecen las pelotitas. No es un defecto: se sacan, y en [pelotitas en prendas tejidas](/blog/pelotitas-en-prendas-tejidas) está cómo hacerlo sin arruinar el punto.',
    },

    { type: 'h2', text: '3. El lavado' },
    {
      type: 'p',
      text: 'Es lo que más acorta o alarga la vida de una prenda tejida. Agua fría, sin retorcer y secado en plano: así el punto no se estira ni se deforma. El paso a paso está en [cómo lavar crochet a mano](/blog/como-lavar-crochet-a-mano).',
    },

    { type: 'h2', text: '4. Cómo se guarda' },
    {
      type: 'p',
      text: 'Colgada, una prenda tejida se estira con su propio peso, sobre todo los cardigans. Doblada, en un lugar seco, mantiene la forma. Más en [cómo guardar prendas tejidas](/blog/como-guardar-prendas-tejidas).',
    },

    { type: 'h2', text: 'Cómo reconocer una prenda que va a durar' },
    {
      type: 'ul',
      items: [
        '**Tensión pareja:** los puntos tienen todos el mismo tamaño, sin zonas flojas.',
        '**Terminaciones prolijas:** las hebras sueltas van escondidas por dentro, no anudadas a la vista.',
        '**El material dicho:** una prenda bien hecha dice de qué está tejida. En Dahila está en cada ficha.',
      ],
    },
    {
      type: 'p',
      text: 'Detrás de cada pieza hay horas reales de trabajo: el Spring cardigan, por ejemplo, lleva unas 16 horas de tejido, medidas. Ese tiempo es también lo que hace que esté pensada para durar, y no para una sola temporada.',
    },
    {
      type: 'shopCta',
      title: 'Tejidas una por una, para usar muchas veces',
      text: 'Cada ficha dice la fibra y cómo cuidarla.',
      href: '/tienda',
      label: 'Ver la tienda',
    },

    {
      type: 'faq',
      items: [
        { q: '¿Cuánto dura una prenda de crochet?', a: 'No hay un número fijo: depende de la fibra, del roce, del lavado y de cómo se guarda. Bien cuidada, se usa temporada tras temporada.' },
        { q: '¿Qué es lo primero que se gasta?', a: 'Las zonas de roce: debajo de los brazos, los puños y donde apoya la cartera. Ahí salen las pelotitas, que se pueden sacar.' },
        { q: '¿Las prendas de acrílico duran menos?', a: 'No necesariamente: el acrílico antipilling está hecho justamente para no formar pelotitas. Lo que cambia es que transpira menos que el algodón o la lana.' },
      ],
    },
  ],
}
