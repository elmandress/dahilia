import type { Article } from '../types'

// 12/10/2026. Nota de intención de compra para la temporada de regalos: la
// duda que más frena regalar ropa es el talle. Une las tres salidas que el
// sitio ya tiene (piezas sin talle, prendas que perdonan, tarjeta de regalo)
// con el "¿Qué talle soy?" de las fichas. Todo lo que se dice de cada pieza
// sale de su ficha.
export const article: Article = {
  slug: 'regalar-ropa-sin-saber-el-talle',
  title: 'Cómo regalar ropa sin saber el talle (y acertar)',
  metaTitle: 'Regalar ropa sin saber el talle: cómo acertar',
  description:
    'Tres caminos para regalar una prenda sin saber el talle: piezas sin talle, prendas que perdonan y tarjeta de regalo. Y cómo averiguarlo sin que se dé cuenta.',
  excerpt:
    'El talle es lo que más frena regalar ropa. Hay tres caminos seguros, y una forma de averiguarlo sin arruinar la sorpresa.',
  cluster: 'regalos',
  role: 'support',
  funnel: 'BOFU',
  publishedAt: '2026-10-12',
  hero: { src: '/photos/blog/box-de-regalo-mesa.jpg', alt: 'Box de regalo con piezas tejidas a crochet, abierto sobre una mesa de café', position: '50% 50%' },
  relatedCategorySlug: 'accesorios',
  relatedProductSlugs: ['box-de-regalo', 'bufanda-sophie', 'cardigan-cruzado', 'tote-bag-de-playa'],
  relatedArticleSlugs: ['que-talle-de-prenda-tejida-me-queda', 'regalos-tejidos-a-mano'],
  body: [
    {
      type: 'p',
      text: 'Querés regalarle una prenda, la viste y sabés que le va a encantar. Y ahí aparece la pregunta que frena todo: ¿qué talle usa? Preguntarle arruina la sorpresa, y adivinar es arriesgado con algo que se teje a pedido.',
    },
    {
      type: 'callout',
      title: 'La versión corta',
      text: 'Hay tres caminos seguros: una pieza que no tiene talle, una prenda que perdona el talle, o una [tarjeta de regalo](/regalo) para que elija ella. Y si querés acertar con una prenda puntual, se puede averiguar la medida sin que se dé cuenta.',
    },

    { type: 'h2', text: '1. Piezas que no tienen talle' },
    {
      type: 'p',
      text: 'Es la forma más simple de no errarle: si no hay talle, no hay forma de equivocarse.',
    },
    {
      type: 'ul',
      items: [
        '**Bolsos:** el [Bolso LOLA](/tienda/bolso-lola) y el [DONUT bag](/tienda/donut-bag) en trapillo reciclado, o la [Tote de playa](/tienda/tote-bag-de-playa) en algodón para el verano.',
        '**Bufandas:** la [Bufanda SOPHIE](/tienda/bufanda-sophie) en lana, o las [Mini bufandas](/tienda/mini-bufandas) en algodón.',
        '**Para el pelo:** la [Bandana](/tienda/bandana) en algodón.',
        '**Todo junto:** el [Box de regalo](/tienda/box-de-regalo), que ya viene armado para regalar.',
      ],
    },

    { type: 'h2', text: '2. Prendas que perdonan el talle' },
    {
      type: 'p',
      text: 'Algunas prendas no dependen de calzar justo. Un cardigan abierto adelante cae suelto: entre dos talles vecinos la diferencia se nota poco. El [Spring cardigan](/tienda/spring-cardigan), por ejemplo, tiene mangas bien amplias y el cuerpo suelto; el [Cardigan CRUZADO](/tienda/cardigan-cruzado) se ajusta cruzándolo. El [Poncho](/tienda/poncho) directamente es de talle único.',
    },
    {
      type: 'p',
      text: 'Donde sí importa el talle es en las prendas al cuerpo: tops, sets y sweaters. Ahí conviene averiguar la medida (el punto 3) o dejar que elija ella (el 4).',
    },

    { type: 'h2', text: '3. Averiguar el talle sin que se dé cuenta' },
    {
      type: 'steps',
      items: [
        { title: 'Buscá una prenda que use mucho', text: 'Un buzo o una remera que le quede como le gusta. La etiqueta sirve de pista, pero los talles cambian entre marcas: lo que sirve de verdad es la medida.' },
        { title: 'Medila en plano', text: 'Apoyala estirada sin tirar, y medí de axila a axila. Ese número por dos es el contorno de la prenda, que incluye la holgura con la que le gusta usarla.' },
        { title: 'Compará con la tabla', text: 'Cada ficha tiene "¿Qué talle soy?": con el busto te marca el talle. Si quedó entre dos, mandame la medida por WhatsApp y te digo cuál conviene, o la tejo a esa medida.' },
      ],
    },
    {
      type: 'note',
      text: 'Más sobre cómo calza una prenda tejida en [qué talle de prenda tejida me queda](/blog/que-talle-de-prenda-tejida-me-queda) y en [la holgura de una prenda tejida](/blog/holgura-prenda-tejida).',
    },

    { type: 'h2', text: '4. Si igual no estás segura: que elija ella' },
    {
      type: 'p',
      text: 'La tarjeta de regalo resuelve el talle, el color y el modelo de una vez: elegís el monto, le escribís un mensaje, y quien la recibe elige su prenda en la tienda o la pide a medida. Te llega por WhatsApp, lista para reenviar o imprimir.',
    },
    {
      type: 'shopCta',
      title: 'Tarjeta de regalo Dahila',
      text: 'Elegís el monto y el mensaje; el talle lo elige ella.',
      href: '/regalo',
      label: 'Armar la tarjeta',
    },

    { type: 'h2', text: 'Ojo con los tiempos' },
    {
      type: 'p',
      text: 'Lo que se teje a pedido lleva su tiempo (el plazo de cada pieza está en su ficha). Si el regalo tiene fecha, mirá primero lo que está en stock, que sale sin espera, o elegí la tarjeta, que no depende de ningún plazo de tejido.',
    },

    {
      type: 'faq',
      items: [
        { q: '¿Qué le regalo si no sé su talle?', a: 'Una pieza sin talle (bolso, bufanda, bandana), una prenda que perdona el talle (un cardigan abierto o un poncho) o una [tarjeta de regalo](/regalo) para que elija ella.' },
        { q: '¿Cómo averiguo el talle de alguien sin preguntarle?', a: 'Medí en plano una prenda que use mucho, de axila a axila, y multiplicá por dos. Con ese número, el "¿Qué talle soy?" de cada ficha te marca el talle.' },
        { q: '¿Y si queda entre dos talles?', a: 'Mandame la medida por WhatsApp y te digo cuál conviene, o la tejo directamente a esa medida.' },
      ],
    },
  ],
}
