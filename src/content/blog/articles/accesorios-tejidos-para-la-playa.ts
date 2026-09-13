import type { Article } from '../types'

// Temporada de verano. Search Console (13/09/2026) ya muestra búsquedas de
// playa sin una página que las conteste: "bolso playa" (posición 78), "bolso
// para playa" (63), "tote bag playa" (9), "conjunto tejido playa" (1).
export const article: Article = {
  slug: 'accesorios-tejidos-para-la-playa',
  title: 'Accesorios tejidos para la playa: bolsos, sets y bandanas que aguantan el verano',
  metaTitle: 'Bolso de playa tejido a crochet y otros accesorios',
  description:
    'Qué bolso tejido llevar a la playa, cómo usar un set o una bandana con sol y viento, y cómo cuidar el algodón de la sal y la arena para que dure varios veranos.',
  excerpt:
    'El crochet y la playa se llevan bien por una razón práctica: el tejido abierto respira y deja salir la arena. Qué llevar y cómo cuidarlo para que dure.',
  cluster: 'comprar',
  role: 'support',
  funnel: 'MOFU',
  publishedAt: '2026-09-13',
  hero: { src: '/photos/blog/tote-de-playa-arena.jpg', alt: 'Tote de playa tejida a crochet sobre la arena, con protector solar y lentes de sol', position: '50% 55%' },
  relatedCategorySlug: 'accesorios',
  relatedProductSlugs: ['tote-bag-de-playa', 'beach-set', 'set-brisa', 'bandana'],
  relatedArticleSlugs: ['tops-de-crochet-para-verano', 'bolsos-de-crochet-por-que-duran', 'como-lavar-crochet-a-mano'],
  body: [
    {
      type: 'p',
      text: 'Un bolso tejido en la playa no es solo una cuestión de estilo. El tejido abierto deja pasar el aire y deja salir la arena, que es justo lo que no hace un bolso de tela cerrada. Es el truco de siempre de los bolsos de red.',
    },

    { type: 'h2', text: 'El bolso' },
    {
      type: 'p',
      text: 'La [tote de playa](/tienda/tote-bag-de-playa) está pensada para eso: entra la toalla, el mate, el protector y el libro, y el tejido abierto deja salir la arena solo. Está tejida en algodón.',
    },
    {
      type: 'p',
      text: 'Para la tarde en la rambla o para salir después de la playa, la [mini tote](/tienda/mini-tote-bag) alcanza: celular, llaves, billetera y listo.',
    },

    { type: 'h2', text: 'El set' },
    {
      type: 'p',
      text: 'Un set de playa tejido son piezas pensadas juntas, del mismo hilado y el mismo punto. El [BEACH set](/tienda/beach-set) funciona junto o por separado, del balneario al chiringuito sin pasar por casa. El [set BRISA](/tienda/set-brisa) trae gargantilla, bikini y salida de playa en algodón mercerizado.',
    },
    {
      type: 'image',
      src: '/photos/blog/beach-set-en-plano.jpg',
      alt: 'BEACH set tejido a crochet en algodón: top y falda, apoyados en plano',
      width: 1000,
      height: 1361,
      caption: 'El [BEACH set](/tienda/beach-set): piezas que funcionan juntas o por separado.',
      href: '/tienda/beach-set',
    },
    {
      type: 'note',
      text: 'Algo general de cualquier traje de baño tejido, no de un modelo en particular: es para tomar sol y para el agua tranquila más que para nadar mucho. Mojado, el algodón pesa más y el punto cede un poco.',
    },

    { type: 'h2', text: 'La bandana' },
    {
      type: 'p',
      text: 'Con el viento de la costa, una [bandana](/tienda/bandana) sujeta el pelo. Después de la playa pasa al cuello o se ata a la cartera. Son cuatro horas de crochet en algodón.',
    },

    { type: 'h2', text: 'Cómo cuidarlos para que duren varios veranos' },
    {
      type: 'steps',
      items: [
        {
          title: 'Enjuagá con agua dulce',
          text: 'Después de la playa, un enjuague con agua fría y sin jabón saca la sal y la arena. La sal que queda seca en la fibra la vuelve más áspera.',
        },
        {
          title: 'Sacá el agua sin retorcer',
          text: 'Apretá con una toalla, como en el [lavado a mano](/blog/como-lavar-crochet-a-mano). Retorcer deforma el punto.',
        },
        {
          title: 'Secá a la sombra y en plano',
          text: 'El sol directo aclara los colores, y colgado, el peso del agua estira el tejido.',
        },
        {
          title: 'Vaciá la arena antes de guardar',
          text: 'Dale vuelta al bolso y sacudilo: la arena que queda adentro raspa el tejido con el uso.',
        },
      ],
    },
    {
      type: 'note',
      text: 'Lo del sol y la sal vale para cualquier fibra natural. El detalle de cada material está en la [guía de materiales](/blog/materiales-de-una-prenda-tejida).',
    },
    {
      type: 'shopCta',
      title: 'Todo para la playa',
      text: 'Totes, bandanas y bolsos tejidos a mano, con el precio a la vista.',
      href: '/tienda/accesorios',
      label: 'Ver accesorios',
    },

    { type: 'h2', text: 'Preguntas frecuentes' },
    {
      type: 'faq',
      items: [
        {
          q: '¿Un bolso tejido aguanta el peso de las cosas de playa?',
          a: 'Sí, si está bien tejido y el asa está bien unida al cuerpo del bolso. Qué mirar está en la nota sobre [por qué duran los bolsos de crochet](/blog/bolsos-de-crochet-por-que-duran).',
        },
        {
          q: '¿Se puede meter al agua un set tejido?',
          a: 'Sí, pero es para tomar sol y para el agua tranquila más que para nadar mucho. Después, enjuague con agua dulce y secado en plano a la sombra.',
        },
        {
          q: '¿Qué material conviene para la playa?',
          a: 'El algodón, que respira y se lava fácil. Los bolsos del catálogo en trapillo reciclado son más firmes y aguantan más peso.',
        },
        {
          q: '¿Llega antes del verano?',
          a: 'Si lo pedís con tiempo, sí. La mayoría de las piezas se teje cuando la pedís, y el aviso de plazos de la tienda dice cuándo están saliendo los pedidos.',
        },
      ],
    },
  ],
}
