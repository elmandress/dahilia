import type { Article } from '../types'

// 12/10/2026. Guía de temporada con producto adentro (el formato que mejor
// rinde): fiestas de fin de año en Uruguay = noches de verano. Las tres piezas
// con lurex del catálogo, descritas con lo que dice cada ficha.
export const article: Article = {
  slug: 'looks-tejidos-fiestas-fin-de-ano',
  title: 'Qué ponerte en las fiestas de fin de año: looks tejidos con brillo',
  metaTitle: 'Looks para fin de año: crochet con brillo',
  description:
    'Ideas para Nochebuena, Fin de Año y las despedidas con prendas tejidas a mano en algodón con lurex: frescas para las noches de verano y con un brillo justo.',
  excerpt:
    'Acá las fiestas son en verano: hace calor, se cena afuera y la noche se estira. Tres looks tejidos con un brillo sutil, frescos y nada disfrazados.',
  cluster: 'comprar',
  role: 'support',
  funnel: 'MOFU',
  publishedAt: '2026-10-12',
  hero: { src: '/photos/blog/set-lueur-lurex.jpg', alt: 'Set LUEUR tejido a crochet en hilado con lurex: ponchito calado y bufanda fina, puestos', position: '50% 30%' },
  relatedCategorySlug: 'sets',
  relatedProductSlugs: ['set-lurex', 'set-lueur', 'cardigan-cruzado', 'top-flower'],
  relatedArticleSlugs: ['set-tejido-vs-piezas-sueltas', 'regalos-tejidos-para-mama-y-abuela'],
  body: [
    {
      type: 'p',
      text: 'En Uruguay, las fiestas de fin de año son en verano: cena afuera, calor hasta tarde y una noche que se estira. Lo que funciona es algo fresco, que se vea especial sin parecer un disfraz. El algodón con lurex resuelve justo eso: es liviano y tiene un brillo apenas, que se nota cuando le da la luz.',
    },
    {
      type: 'callout',
      title: 'La versión corta',
      text: 'Para la noche: un set con lurex (todo junto o una pieza sola). Para algo más tranquilo: un cardigan con brillo sobre lo que ya tenés. Y si es para regalar, ojo con los plazos: se teje a pedido.',
    },

    { type: 'h2', text: 'Para la noche de Fin de Año: el Set LUREX' },
    {
      type: 'p',
      text: 'El [Set LUREX](/tienda/set-lurex) trae tres piezas en marrón con brillo: un top halter que se cruza en el cuello, una minifalda con cordón para ajustar en la cintura y un gorro de red. Todo junto es el look completo; el top solo, con un pantalón claro, ya alcanza para la cena.',
    },

    { type: 'h2', text: 'Para algo más suelto: el Set LUEUR' },
    {
      type: 'p',
      text: 'El [Set LUEUR](/tienda/set-lueur), en tono caramelo, trae un short mini con cinturón tejido, una bufanda finita y un ponchito de red para llevar encima. El ponchito sobre un vestido liso es la forma más fácil de sumar brillo sin cambiar todo el look.',
    },

    { type: 'h2', text: 'Para sumar brillo a lo que ya tenés' },
    {
      type: 'p',
      text: 'El [Cardigan CRUZADO](/tienda/cardigan-cruzado), en algodón con lurex, se cruza adelante. Sobre un vestido o un top básico, sirve para la cena de Nochebuena y para la noche que refresca en la rambla.',
    },
    {
      type: 'shopCta',
      title: 'Sets tejidos a mano',
      text: 'De playa, de salida y con brillo. Cada pieza se teje en tu talle.',
      href: '/tienda/sets',
      label: 'Ver los sets',
    },

    { type: 'h2', text: 'Cómo combinarlo sin que sea demasiado' },
    {
      type: 'ul',
      items: [
        '**Una sola pieza con brillo por look.** El lurex luce más cuando el resto es liso.',
        '**Colores tierra con blanco o negro.** El marrón y el caramelo quedan bien con un pantalón claro o un jean.',
        '**Abajo, algo que no se vea.** El punto calado deja ver lo que va debajo: en [qué ponerse debajo de un top de crochet](/blog/que-ponerse-debajo-de-un-top-de-crochet) están las opciones.',
      ],
    },

    { type: 'h2', text: 'Para que llegue a tiempo' },
    {
      type: 'p',
      text: 'Los sets se tejen a pedido y cada ficha dice cuánto lleva (el LUREX, unas 17 horas de tejido; el LUEUR, unas 18). Si lo querés para una fecha, encargalo con margen. Si es para regalar y no sabés el talle, hay [tarjeta de regalo](/regalo).',
    },

    {
      type: 'faq',
      items: [
        { q: '¿El lurex pica?', a: 'La base es algodón; el brillo viene de un hilo metalizado finito mezclado. A las pieles muy sensibles a veces les roza: si es tu caso, usalo sobre otra prenda.' },
        { q: '¿Se puede pedir el set en otro color?', a: 'Se teje a pedido, así que el talle y la paleta se definen antes de empezar. Consultá por WhatsApp qué colores hay en hilado con brillo.' },
        { q: '¿Se pueden comprar las piezas por separado?', a: 'Están pensadas para usarse juntas o por separado. Para pedir una sola pieza, escribime y lo vemos.' },
      ],
    },
  ],
}
