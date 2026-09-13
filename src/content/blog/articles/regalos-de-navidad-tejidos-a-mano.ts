import type { Article } from '../types'

// Guía de regalos de temporada. El ángulo es local y verdadero: en Uruguay la
// Navidad cae en verano, así que el regalo tejido que más se usa es el que se
// estrena en enero. Publicada en septiembre para que Google la tenga indexada
// antes de noviembre, cuando empiezan estas búsquedas.
export const article: Article = {
  slug: 'regalos-de-navidad-tejidos-a-mano',
  title: 'Regalos de Navidad tejidos a mano: qué regalar en una Navidad de verano',
  metaTitle: 'Regalos de Navidad tejidos a mano en Uruguay',
  description:
    'En Uruguay la Navidad cae en verano: qué regalo tejido a mano se usa en enero (bolsos, tops, bandanas), cuándo tiene sentido regalar abrigo y cuándo pedirlo.',
  excerpt:
    'Acá la Navidad es con calor. Eso cambia qué regalo tejido tiene sentido: el que se estrena en la playa en enero, no el que espera guardado hasta junio.',
  cluster: 'regalos',
  role: 'support',
  funnel: 'BOFU',
  publishedAt: '2026-09-13',
  hero: { src: '/photos/blog/box-de-regalo-mesa.jpg', alt: 'Box de regalo con piezas tejidas a crochet, abierto sobre una mesa de café', position: '50% 50%' },
  relatedCategorySlug: 'accesorios',
  relatedProductSlugs: ['tote-bag-de-playa', 'top-summer', 'bandana', 'box-de-regalo'],
  relatedArticleSlugs: ['regalos-tejidos-a-mano', 'regalos-amigo-invisible-tejidos', 'accesorios-tejidos-para-la-playa'],
  body: [
    {
      type: 'p',
      text: 'Casi todas las guías de regalos tejidos piensan en un diciembre con nieve. En Uruguay, el 24 de diciembre es pleno verano, y el regalo que más se disfruta es el que se puede estrenar esa misma semana.',
    },
    {
      type: 'p',
      text: 'Eso no deja afuera al tejido: lo cambia de lugar. Estas son las ideas que funcionan en una Navidad con calor.',
    },

    { type: 'h2', text: 'Lo que se estrena en enero' },
    {
      type: 'ul',
      items: [
        '**Una tote de playa.** Entra la toalla, el mate, el protector y el libro, y el tejido abierto deja salir la arena solo. Se usa todo el verano.',
        '**Un top de algodón.** Liviano, con caída y fresco, para la playa o la ciudad. Depende del talle, así que es para alguien de quien lo sepas.',
        '**Una bandana.** En el pelo, al cuello o atada a la cartera. Con el viento de la costa, sirve para sujetar el pelo.',
        '**Un set de playa.** Piezas que funcionan juntas o por separado. Para alguien muy cercano, porque también depende del talle.',
      ],
    },
    {
      type: 'shopCta',
      title: 'Para el verano',
      text: 'Totes, bandanas y tops tejidos a mano en algodón, con el precio a la vista.',
      href: '/tienda/accesorios',
      label: 'Ver accesorios',
    },

    { type: 'h2', text: 'Para regalarle a la familia' },
    {
      type: 'p',
      text: 'Cuando el regalo es para la casa o para varias personas, el [box de regalo](/tienda/box-de-regalo) resuelve: se arma con piezas del catálogo, llega presentado y la combinación de colores y piezas se decide según el presupuesto.',
    },
    {
      type: 'image',
      src: '/photos/blog/box-de-regalo-violeta.jpg',
      alt: 'Piezas tejidas a crochet en trapillo violeta sobre una mesa: canasta, posavasos y un llavero con forma de corazón',
      width: 917,
      height: 1600,
      caption: 'Una combinación posible del [box de regalo](/tienda/box-de-regalo), en trapillo violeta.',
      href: '/tienda/box-de-regalo',
    },

    { type: 'h2', text: 'Si igual querés regalar abrigo' },
    {
      type: 'p',
      text: 'Una bufanda o un set de bufanda y guantes también son buen regalo en diciembre, con una condición: contalo como "para el próximo invierno". Mientras tanto, se guarda doblado y sin percha, como explica la guía de [cómo guardar prendas tejidas](/blog/como-guardar-prendas-tejidas).',
    },

    { type: 'h2', text: 'Para alguien muy cercano: regalar el encargo' },
    {
      type: 'p',
      text: 'La opción más personal es una prenda a medida. El truco es regalar el encargo y no la prenda: le contás a esa persona que se va a tejer una prenda para ella, y el modelo y los colores se eligen con ella. Así la espera pasa a ser parte del regalo. Cómo funciona está en [cómo encargar una prenda a medida](/blog/como-encargar-prenda-a-medida).',
    },

    { type: 'h2', text: 'Cuándo pedirlo para que llegue' },
    {
      type: 'p',
      text: 'En fin de año los talleres chicos se llenan de pedidos. La mayoría de las piezas se teje cuando la pedís (las que ya están hechas dicen "En stock" y salen sin espera), así que para Navidad conviene escribir en noviembre. El aviso de plazos de la tienda dice cuándo están saliendo los pedidos.',
    },
    {
      type: 'callout',
      title: 'Envíos',
      text: 'Hacemos envíos a todo Uruguay. El costo y el plazo se coordinan por WhatsApp según tu zona.',
    },

    { type: 'h2', text: 'Preguntas frecuentes' },
    {
      type: 'faq',
      items: [
        {
          q: '¿Qué regalo tejido sirve para una Navidad de verano?',
          a: 'Algo que se use en enero: una tote de playa, un top de algodón, una bandana o una mini tote. Si preferís abrigo, regalalo como "para el próximo invierno".',
        },
        {
          q: '¿Hasta cuándo puedo pedir para que llegue antes del 24?',
          a: 'Depende de cuánto trabajo tenga el taller en ese momento. Mirá el aviso de plazos en la tienda y escribinos por WhatsApp: te confirmamos la fecha antes de que pagues nada.',
        },
        {
          q: '¿Puedo regalar algo tejido sin saber el talle?',
          a: 'Sí: bolsos, bandanas, mini bufandas y calentadores no dependen del talle. Si querés regalar una prenda, el cardigan es la que más perdona.',
        },
        {
          q: '¿Puedo mandar una nota de regalo?',
          a: 'Sí. En el carrito está la opción "Es un regalo: agregar nota", y la nota le llega a Anush junto con tu pedido.',
        },
      ],
    },
  ],
}
