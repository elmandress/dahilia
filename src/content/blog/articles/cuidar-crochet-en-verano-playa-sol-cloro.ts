import type { Article } from '../types'

// 12/10/2026. Cuidados (el cluster que más impresiones junta: "cómo lavar",
// "la lana pica") cruzado con la temporada: en verano las prendas tejidas van
// a la playa y a la piscina. Coherente con el cuidado estándar del catálogo
// (agua fría, sin escurrir, secado en plano y a la sombra).
export const article: Article = {
  slug: 'cuidar-crochet-en-verano-playa-sol-cloro',
  title: 'Crochet en verano: cómo cuidarlo de la sal, el cloro y el sol',
  metaTitle: 'Cómo cuidar el crochet de la sal, el cloro y el sol',
  description:
    'Qué hacer con un top, un set o un bolso tejido después de la playa o la piscina: enjuague, secado a la sombra y los errores que lo amarillean o lo deforman.',
  excerpt:
    'La sal, el cloro y el sol no rompen una prenda tejida de un día para el otro, pero la apagan de a poco. Con dos minutos después de la playa, dura años.',
  cluster: 'cuidados',
  role: 'support',
  funnel: 'TOFU',
  publishedAt: '2026-10-12',
  hero: { src: '/photos/blog/tote-de-playa-arena.jpg', alt: 'Tote de playa tejida a crochet sobre la arena, con protector solar y lentes de sol', position: '50% 50%' },
  relatedCategorySlug: 'tops',
  relatedProductSlugs: ['beach-set', 'top-summer', 'tote-bag-de-playa', 'top-duna'],
  relatedArticleSlugs: ['como-lavar-crochet-a-mano', 'primeros-auxilios-prenda-tejida'],
  body: [
    {
      type: 'p',
      text: 'En verano, una prenda tejida va a la playa, a la piscina y pasa horas al sol. Nada de eso la rompe de un día para el otro: lo que hace es apagar el color y endurecer la fibra de a poco. La buena noticia es que cuidarla lleva dos minutos.',
    },
    {
      type: 'callout',
      title: 'La versión corta',
      text: 'Después de la playa o la piscina, enjuagá con agua fría y sin jabón, apretá sin retorcer y secá en plano a la sombra. Nunca al sol directo, nunca colgada mojada.',
    },

    { type: 'h2', text: 'Por qué la sal y el cloro la apagan' },
    {
      type: 'p',
      text: 'La sal que queda en la fibra al secarse la vuelve áspera y la endurece. El cloro de la piscina es todavía más agresivo: va comiendo el color, sobre todo en los tonos vivos. En ninguno de los dos casos el daño es de una vez, sino de dejarlos secar adentro una y otra vez.',
    },

    { type: 'h2', text: 'Qué hacer al volver' },
    {
      type: 'steps',
      items: [
        { title: 'Sacudí la arena en seco', text: 'Antes de mojarla. La arena mojada se mete entre los puntos y cuesta más sacarla.' },
        { title: 'Enjuagá con agua fría', text: 'Agua de la canilla, fría, sin jabón. Alcanza con sumergirla y moverla un poco. Si fue a la piscina, no lo dejes para el otro día.' },
        { title: 'Apretá, no retuerzas', text: 'Sacale el agua apretándola entre las manos o envuelta en una toalla. Retorcerla estira los puntos y la deforma.' },
        { title: 'Secá en plano y a la sombra', text: 'Estirada sobre una toalla, dándole la forma. Colgada mojada, el peso del agua la estira; al sol, el blanco y el crudo amarillean y los colores se apagan.' },
      ],
    },

    { type: 'h2', text: 'El protector solar y los aceites' },
    {
      type: 'p',
      text: 'El protector y los aceites bronceadores son la mancha más común del verano en prendas claras. Dejá que el protector se absorba antes de ponerte un top tejido encima, y si se manchó, tratalo apenas puedas con agua fría y jabón neutro. Si ya se secó, en [primeros auxilios para una prenda tejida](/blog/primeros-auxilios-prenda-tejida) está qué hacer.',
    },

    { type: 'h2', text: 'Y los bolsos de playa' },
    {
      type: 'p',
      text: 'Una tote tejida está hecha para la arena: el tejido abierto la deja salir. Igual, de vez en cuando, dala vuelta, sacudila y enjuagala como una prenda. Que seque bien abierta, a la sombra, antes de guardarla: guardada húmeda agarra olor.',
    },

    { type: 'h2', text: 'Al final del verano' },
    {
      type: 'p',
      text: 'Antes de guardarla hasta el año que viene, dale un lavado completo a mano (está paso a paso en [cómo lavar crochet a mano](/blog/como-lavar-crochet-a-mano)) y guardala bien seca, doblada y no colgada.',
    },
    {
      type: 'shopCta',
      title: 'Hechas para el verano',
      text: 'Tops, sets y bolsos en algodón, tejidos a mano en Montevideo.',
      href: '/tienda/tops',
      label: 'Ver los tops',
    },

    {
      type: 'faq',
      items: [
        { q: '¿Puedo meterme al mar con una prenda de crochet?', a: 'Sí, pero enjuagala con agua fría apenas puedas y secala en plano a la sombra. La sal que se seca adentro es la que la endurece.' },
        { q: '¿El cloro arruina el crochet?', a: 'Con el tiempo apaga el color, sobre todo los tonos vivos. Enjuagar con agua fría el mismo día evita casi todo el daño.' },
        { q: '¿Se puede secar al sol?', a: 'Mejor no: el sol directo amarillea el blanco y el crudo y apaga los colores. Secá en plano y a la sombra.' },
      ],
    },
  ],
}
