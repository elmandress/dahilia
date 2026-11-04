import type { Article } from '../types'

// Drop Sunset '26 (nov 2026). Cuidado con la canibalización: la nota
// "bolsos-de-crochet-por-que-duran" ya rankea en posición ~5 para bolsos en
// general. Esta se centra en el MATERIAL (trapillo) y enlaza hacia aquella.
export const article: Article = {
  slug: 'bolsos-de-trapillo-como-elegir-y-cuidar',
  title: 'Bolsos de trapillo: qué son, cómo elegir uno y cómo cuidarlo',
  metaTitle: 'Bolso de trapillo: cómo elegirlo y cuidarlo',
  description:
    'Qué es el trapillo, por qué se usa para bolsos tejidos a crochet, qué mirar al elegir uno (asa, flecos, tamaño) y cómo lavarlo sin que pierda la forma.',
  excerpt:
    'El trapillo es un hilo grueso hecho con tiras de tela. Da bolsos firmes y con forma. Qué mirar al elegir uno y cómo lavarlo para que dure.',
  cluster: 'comprar',
  role: 'support',
  funnel: 'MOFU',
  publishedAt: '2026-11-04',
  relatedCategorySlug: 'accesorios',
  relatedProductSlugs: ['bolso-margot-butter', 'bolso-margot-cherry', 'bolso-de-estudiante', 'donut-bag'],
  relatedArticleSlugs: [
    'bolsos-de-crochet-por-que-duran',
    'accesorios-tejidos-para-la-playa',
    'como-lavar-crochet-a-mano',
  ],
  body: [
    {
      type: 'p',
      text: 'Si buscaste un bolso tejido, seguro viste la palabra "trapillo". Es lo que hace que un bolso de crochet se mantenga en pie, cargue peso y no se estire como una prenda. Acá va qué es, cómo elegir un bolso hecho con él y cómo lavarlo.',
    },
    {
      type: 'callout',
      title: 'La versión corta',
      text: 'El trapillo es un hilo grueso y firme: por eso sirve para bolsos y no tanto para ropa. Mirá el asa y el tamaño según el uso, y lavalo a mano con agua fría, secándolo en horizontal y a la sombra.',
    },

    { type: 'h2', text: 'Qué es el trapillo' },
    {
      type: 'p',
      text: 'En general, el trapillo es un hilo grueso que se hace con tiras de tela, a veces de recortes reciclados de la industria textil. Es más ancho y más firme que un hilo común, y eso se nota: el tejido sale compacto, con cuerpo, y el bolso mantiene la forma incluso vacío.',
    },
    {
      type: 'note',
      text: 'Es una descripción general del material. Para un bolso en particular, el material exacto figura en su ficha de producto.',
    },
    {
      type: 'p',
      text: 'En Dahila el trapillo se usa para los bolsos y no para la ropa, y no es casualidad: aguanta el peso sin darse, que es lo que pide un bolso y lo que no querés en una prenda que tiene que caer sobre el cuerpo.',
    },

    { type: 'h2', text: 'Un ejemplo concreto: el Bolso Margot' },
    {
      type: 'p',
      text: "El [Bolso Margot](/tienda/bolso-margot-butter) está tejido a mano en trapillo premium y lleva unas 4 horas de crochet, punto por punto. Está pensado para ir de la ciudad a la playa: tiene flecos que le dan movimiento y un asa ajustable que se puede llevar de varias formas. Es talle único y viene en dos colores, Butter y [Cherry](/tienda/bolso-margot-cherry), de la colección [Sunset '26](/colecciones/sunset-26).",
    },
    {
      type: 'p',
      text: 'Las medidas exactas no figuran en la ficha. Si el tamaño es lo que te importa antes de elegir, consultalo por WhatsApp.',
    },

    { type: 'h2', text: 'Cómo elegir uno' },
    {
      type: 'steps',
      items: [
        {
          title: 'Pensá en qué vas a cargar',
          text: 'Para celular, llaves y billetera alcanza uno chico. Para toalla, mate y botella, uno grande. Si el uso es diario, que el asa sea cómoda para llevar al hombro.',
        },
        {
          title: 'Mirá el asa',
          text: 'Es la parte que más trabaja. Un asa ajustable te deja cambiar el largo y llevarlo cruzado o al hombro. Revisá que esté bien unida al cuerpo del bolso. Los criterios de punto y refuerzos están en [bolsos de crochet: por qué duran tanto](/blog/bolsos-de-crochet-por-que-duran).',
        },
        {
          title: 'Decidí cuánto color querés',
          text: 'Un bolso en un tono vivo es el foco del look. Uno en un tono neutro combina con todo. Si tu ropa ya tiene color, elegí neutro; si es básica, un bolso de color la levanta.',
        },
        {
          title: 'Fijate si lleva flecos',
          text: 'Dan movimiento y carácter. A cambio, se enredan más con la arena y con otros objetos del bolso o de la mochila, así que piden un poco más de cuidado.',
        },
      ],
    },

    { type: 'h2', text: 'Cómo cuidarlo' },
    {
      type: 'p',
      text: 'Lo que más afecta a un bolso tejido es cómo se lava y cómo se seca. Con trapillo, la regla es sostener la forma:',
    },
    {
      type: 'ul',
      items: [
        'Lavalo a mano, con agua fría y jabón neutro, sin frotar ni retorcer.',
        'Enjuagá con agua a la misma temperatura.',
        'Secalo en horizontal, sobre una toalla y a la sombra. Nunca colgado, porque el peso del agua lo estira, y sin secarropas.',
        'Si necesita ayuda para mantener la forma mientras seca, poné una toalla enrollada adentro.',
        'Si volvés de la playa, sacudí la arena y enjuagalo con agua dulce.',
      ],
    },
    {
      type: 'p',
      text: 'Para el paso a paso completo, mirá [cómo lavar crochet a mano](/blog/como-lavar-crochet-a-mano), y para el verano en particular, [cuidar crochet en verano: playa, sol y cloro](/blog/cuidar-crochet-en-verano-playa-sol-cloro).',
    },

    { type: 'h2', text: 'Preguntas frecuentes' },
    {
      type: 'faq',
      items: [
        {
          q: '¿Qué diferencia hay entre un bolso de trapillo y uno de algodón?',
          a: 'El trapillo es más grueso y firme, así que el bolso mantiene la forma. El algodón en hilo fino da un tejido más suelto y liviano, más de prenda. Los bolsos de Margot usan trapillo y la ropa de este verano va en algodón.',
        },
        {
          q: '¿Se puede usar en la playa?',
          a: 'Sí. Se sacude la arena y se enjuaga con agua dulce al volver. Más ideas en [accesorios tejidos para la playa](/blog/accesorios-tejidos-para-la-playa).',
        },
        {
          q: '¿Se lava en lavarropas?',
          a: 'No. Se lava a mano y se seca en horizontal, a la sombra.',
        },
        {
          q: '¿Sirve como regalo?',
          a: 'Mucho: no tiene talle. Hay criterios en [regalos tejidos a mano](/blog/regalos-tejidos-a-mano).',
        },
      ],
    },

    {
      type: 'shopCta',
      title: 'Bolso Margot, en Butter y Cherry',
      text: 'Trapillo premium, flecos y asa ajustable. Parte de la colección de verano, en cantidades chicas.',
      href: '/colecciones/sunset-26',
      label: 'Ver la colección',
    },
  ],
}
