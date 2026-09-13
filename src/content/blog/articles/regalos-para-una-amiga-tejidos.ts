import type { Article } from '../types'

// Guía de regalos por estilo de persona. Cada idea es una pieza real del
// catálogo y lo que se dice de ella sale de su ficha (materiales, horas, usos).
export const article: Article = {
  slug: 'regalos-para-una-amiga-tejidos',
  title: 'Regalos para una amiga tejidos a mano: uno para cada estilo',
  metaTitle: 'Regalos para una amiga: ideas tejidas a mano',
  description:
    'Qué regalarle a una amiga según cómo es: la que vive en la playa, la friolenta, la que va a facultad, la que tiene todo. Ideas tejidas a mano que se usan.',
  excerpt:
    'No hay un regalo para "una amiga": hay uno para la que vive en la playa, otro para la que siempre tiene frío y otro para la que ya tiene todo.',
  cluster: 'regalos',
  role: 'support',
  funnel: 'BOFU',
  publishedAt: '2026-09-13',
  hero: { src: '/photos/blog/bandana-crochet-pelo.jpg', alt: 'Bandana tejida a crochet con flecos, usada en el pelo', position: '50% 30%' },
  relatedCategorySlug: 'accesorios',
  relatedProductSlugs: ['donut-bag', 'bolso-de-estudiante', 'bufanda-sophie', 'mini-tote-bag'],
  relatedArticleSlugs: ['regalos-tejidos-a-mano', 'regalos-amigo-invisible-tejidos'],
  body: [
    {
      type: 'p',
      text: 'Regalarle algo a una amiga es fácil cuando la conocés bien, y justo por eso cuesta: querés que se note que pensaste en ella. Un regalo tejido a mano ya dice eso solo. Lo que falta es elegir cuál.',
    },

    { type: 'h2', text: 'Para la que vive en la playa' },
    {
      type: 'p',
      text: 'La [tote de playa](/tienda/tote-bag-de-playa): entra la toalla, el mate, el protector y el libro, y el tejido abierto deja salir la arena solo. Si querés sumarle algo, una [bandana](/tienda/bandana) para el pelo.',
    },

    { type: 'h2', text: 'Para la que siempre tiene frío' },
    {
      type: 'p',
      text: 'La bufanda [SOPHIE](/tienda/bufanda-sophie), de lana, tiene el largo justo para dar dos vueltas. Para completar, los [calentadores](/tienda/calentadores) en chenille abrigan el tobillo sin sumar bulto adentro de la bota.',
    },

    { type: 'h2', text: 'Para la que va a facultad o al trabajo con todo encima' },
    {
      type: 'p',
      text: 'El [bolso de estudiante](/tienda/bolso-de-estudiante) está tejido en trapillo reciclado: entra el cuaderno, la notebook chica y todo lo que se arrastra en el día, y el trapillo aguanta el peso sin darse.',
    },

    { type: 'h2', text: 'Para la que sale con lo justo' },
    {
      type: 'p',
      text: 'La [mini tote](/tienda/mini-tote-bag) es el bolso chico de todos los días: celular, llaves, billetera y listo. La [DONUT bag](/tienda/donut-bag), la bolsa dona, cumple lo mismo con otra personalidad: es redonda y justa para lo esencial.',
    },
    {
      type: 'image',
      src: '/photos/blog/mini-tote-rosa.jpg',
      alt: 'Mini tote tejida a crochet en rosa, colgada del hombro',
      width: 988,
      height: 1037,
      caption: 'La [mini tote](/tienda/mini-tote-bag): celular, llaves, billetera y listo.',
      href: '/tienda/mini-tote-bag',
    },

    { type: 'h2', text: 'Para la que ya tiene todo' },
    {
      type: 'p',
      text: 'Un bolso tejido es la categoría donde menos gente tiene algo hecho a mano. El [bolso a cuadros](/tienda/bolso-a-cuadros) es el de más trabajo de color del catálogo, y se teje en la combinación de tonos que elijas.',
    },
    {
      type: 'callout',
      title: 'Un detalle que suma',
      text: 'Contale que está tejido a mano y cuánto lleva. La bandana, por ejemplo, son cuatro horas de crochet; el bolso de estudiante, siete. Lo que no se ve también es parte del regalo.',
    },
    {
      type: 'shopCta',
      title: 'Todas las ideas, en un lugar',
      text: 'Bolsos, bufandas, bandanas y calentadores tejidos a mano, con el precio a la vista.',
      href: '/tienda/accesorios',
      label: 'Ver accesorios',
    },

    { type: 'h2', text: 'Preguntas frecuentes' },
    {
      type: 'faq',
      items: [
        {
          q: '¿Qué le regalo a una amiga si no sé su talle?',
          a: 'Un bolso, una bandana o una bufanda: no dependen del talle. Si querés regalar una prenda, el cardigan es la que más perdona.',
        },
        {
          q: '¿Se puede pedir en su color favorito?',
          a: 'Sí. Cada pieza se teje en el color que elijas.',
        },
        {
          q: '¿Puedo agregar una nota de regalo?',
          a: 'Sí. En el carrito está la opción "Es un regalo: agregar nota", y la nota le llega a Anush junto con tu pedido.',
        },
        {
          q: '¿Hacen envíos?',
          a: 'Sí, a todo Uruguay. El costo y el plazo se coordinan por WhatsApp según la zona.',
        },
      ],
    },
  ],
}
