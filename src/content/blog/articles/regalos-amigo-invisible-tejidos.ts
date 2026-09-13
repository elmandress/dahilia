import type { Article } from '../types'

// Guía de regalos: el estilo de nota que más impresiones trae (regalos tejidos
// a mano, 117 en 28 días, Search Console 13/09/2026). "Amigo invisible" es una
// búsqueda muy uruguaya de fin de año, con un problema concreto que el tejido
// resuelve: no saber el talle. Lo que se dice de cada pieza sale de su ficha.
export const article: Article = {
  slug: 'regalos-amigo-invisible-tejidos',
  title: 'Amigo invisible: regalos tejidos a mano que no dependen del talle',
  metaTitle: 'Regalos para el amigo invisible tejidos a mano',
  description:
    'Ideas de regalo tejido a mano para el amigo invisible: accesorios que no dependen del talle, cómo elegir sin conocer a la persona y cuándo pedirlo para que llegue.',
  excerpt:
    'Presupuesto acotado, una persona que capaz no conocés tanto y ni idea de su talle. Para eso, lo tejido tiene una ventaja: los accesorios le quedan a cualquiera.',
  cluster: 'regalos',
  role: 'support',
  funnel: 'BOFU',
  publishedAt: '2026-09-13',
  hero: { src: '/photos/blog/mini-bufandas-colores.jpg', alt: 'Mini bufandas tejidas a crochet en colores, colgadas en una percha', position: '50% 45%' },
  relatedCategorySlug: 'accesorios',
  relatedProductSlugs: ['mini-bufandas', 'bandana', 'mini-tote-bag', 'calentadores'],
  relatedArticleSlugs: ['regalos-tejidos-a-mano', 'regalos-de-navidad-tejidos-a-mano', 'como-cuidar-prendas-de-crochet'],
  body: [
    {
      type: 'p',
      text: 'El amigo invisible junta tres problemas: un presupuesto que fijó otra persona, alguien que capaz conocés poco y cero información sobre su talle. Por eso tanta gente termina regalando lo mismo de siempre.',
    },
    {
      type: 'p',
      text: 'Un accesorio tejido a mano resuelve los tres. Le queda a cualquiera, se nota que no salió de una góndola y está entre las piezas más accesibles del taller.',
    },

    { type: 'h2', text: 'Qué regalar cuando no sabés el talle' },
    {
      type: 'ul',
      items: [
        '**Una mini bufanda.** Corta y anudada al cuello: da el detalle sin el bulto de una bufanda entera. Es de las piezas más chicas del catálogo.',
        '**Una bandana.** Un mismo accesorio con tres usos: en el pelo, al cuello o atada a la cartera. Si no sabés nada del estilo de la persona, es la que menos arriesga.',
        '**Una mini tote.** El bolso chico de todos los días: celular, llaves, billetera y listo. Sirve igual para una compañera de trabajo que para tu prima.',
        '**Unos calentadores.** Tejidos en chenille, un hilado muy suave. Un regalo menos obvio para quien siempre tiene frío.',
      ],
    },
    {
      type: 'shopCta',
      title: 'Todo lo que no depende del talle',
      text: 'Bufandas, bandanas, bolsos y calentadores tejidos a mano, con el precio a la vista.',
      href: '/tienda/accesorios',
      label: 'Ver accesorios',
    },
    {
      type: 'image',
      src: '/photos/blog/calentadores-con-botas.jpg',
      alt: 'Calentadores tejidos a crochet en chenille rojo, puestos con botas',
      width: 1080,
      height: 1440,
      caption: 'Los [calentadores](/tienda/calentadores) van con calzas, con jean o por encima de las botas.',
      href: '/tienda/calentadores',
    },

    { type: 'h2', text: 'Cómo elegir si no conocés a la persona' },
    {
      type: 'steps',
      items: [
        {
          title: 'Andá por un color neutro',
          text: 'Crudo, negro, camel o gris combinan con casi todo. Un color fuerte es una apuesta; un neutro, un regalo seguro.',
        },
        {
          title: 'Elegí algo que se use seguido',
          text: 'Un bolso chico o una bandana se usan todas las semanas. Un regalo que queda en un cajón no suma, por lindo que sea.',
        },
        {
          title: 'Contá que está tejido a mano',
          text: 'Una tarjeta chica que diga cuántas horas lleva cambia cómo se recibe. La bandana, por ejemplo, son cuatro horas de crochet.',
        },
      ],
    },

    { type: 'h2', text: 'Si el presupuesto da para un poco más' },
    {
      type: 'p',
      text: 'El [box de regalo](/tienda/box-de-regalo) se arma con piezas del catálogo y llega presentado. Nos contás para quién es y armamos la combinación de colores y piezas según el presupuesto que tengas. Es la opción cuando te tocó alguien cercano o cuando se juntan varios para un regalo en grupo.',
    },

    { type: 'h2', text: 'Cuándo pedirlo' },
    {
      type: 'p',
      text: 'Los accesorios son las piezas de plazo más corto del taller. Igual, la mayoría se teje cuando la pedís (las que ya están hechas dicen "En stock" y salen sin espera), y en fin de año los talleres chicos se llenan. Conviene escribir apenas sepas a quién te tocó. El aviso de plazos de la tienda dice cuándo están saliendo los pedidos.',
    },
    {
      type: 'callout',
      title: 'Envíos',
      text: 'Hacemos envíos a todo Uruguay. El costo y el plazo se coordinan por WhatsApp según la zona.',
    },
    {
      type: 'p',
      text: 'Para otras ocasiones (cumpleaños, día de la madre, aniversarios), la guía completa está en [regalos tejidos a mano](/blog/regalos-tejidos-a-mano).',
    },

    { type: 'h2', text: 'Preguntas frecuentes' },
    {
      type: 'faq',
      items: [
        {
          q: '¿Qué le regalo al amigo invisible si no conozco a la persona?',
          a: 'Un accesorio en un color neutro: una mini bufanda, una bandana o una mini tote. No dependen del talle y combinan con casi todo.',
        },
        {
          q: '¿Llega a tiempo para fin de año?',
          a: 'Depende de cuándo lo pidas. Los accesorios son lo que menos demora en el taller, y las piezas marcadas "En stock" salen sin la espera de los encargos. Escribí apenas sepas a quién te tocó y te confirmamos la fecha por WhatsApp.',
        },
        {
          q: '¿Se puede elegir el color?',
          a: 'Sí. Cada pieza se teje en el color que elijas.',
        },
        {
          q: '¿Y si mi presupuesto es más alto?',
          a: 'Mirá el [box de regalo](/tienda/box-de-regalo): se arma con varias piezas del catálogo según lo que quieras gastar.',
        },
      ],
    },
  ],
}
