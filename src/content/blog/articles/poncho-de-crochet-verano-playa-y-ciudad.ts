import type { Article } from '../types'

// Drop Sunset '26 (nov 2026). Search Console: "poncho de verano" ya trae un
// clic en posición 4 y /tienda/poncho tiene impresiones sin nota que lo apoye.
export const article: Article = {
  slug: 'poncho-de-crochet-verano-playa-y-ciudad',
  title: 'Poncho de crochet para el verano: cómo usarlo en la playa y en la ciudad',
  metaTitle: 'Poncho de crochet de verano: cómo usarlo (playa y ciudad)',
  description:
    'Un poncho de algodón tejido a mano para las tardes de verano: cómo usarlo en la playa y de noche en la ciudad, qué ponerte debajo y cómo lavarlo para que dure.',
  excerpt:
    'Un poncho de verano no es de abrigo: es la capa liviana para cuando baja el sol. Cómo llevarlo del balneario a la rambla y cómo cuidarlo.',
  cluster: 'comprar',
  role: 'support',
  funnel: 'MOFU',
  publishedAt: '2026-11-04',
  relatedCategorySlug: 'tops',
  relatedProductSlugs: ['poncho-ete', 'manguitas-tramonto', 'bolso-margot-butter', 'poncho'],
  relatedArticleSlugs: [
    'accesorios-tejidos-para-la-playa',
    'entretiempo-uruguay-prendas-tejidas',
    'cuidar-crochet-en-verano-playa-sol-cloro',
  ],
  body: [
    {
      type: 'p',
      text: 'En Uruguay el verano tiene una trampa conocida: a la tarde el sol pega fuerte y cuando baja, con el viento del río o del mar, se siente fresco. No alcanza para un buzo, pero una remera sola se queda corta. Ahí es donde un poncho liviano hace su trabajo: una capa que se pone y se saca en un segundo, sin pensar en mangas.',
    },
    {
      type: 'callout',
      title: 'La versión corta',
      text: 'Un poncho de verano tiene que ser de algodón y liviano. Se pone sobre el traje de baño en la playa y sobre una base lisa a la noche. Se lava a mano y se seca en horizontal.',
    },

    { type: 'h2', text: 'Qué lo hace un poncho "de verano"' },
    {
      type: 'p',
      text: "La diferencia con uno de invierno está en la fibra y en el punto. El [Poncho Été](/tienda/poncho-ete), de la colección [Sunset '26](/colecciones/sunset-26), está tejido a mano en algodón 100%: es liviano, fresco y con brillo. Está pensado para las tardes de playa y las noches de verano, no para abrigar de verdad.",
    },
    {
      type: 'note',
      text: 'Algo general, no de un modelo en particular: el algodón es una fibra fresca que no retiene el calor como la lana. Por eso se elige para ropa de verano.',
    },

    { type: 'h2', text: 'En la playa' },
    {
      type: 'ul',
      items: [
        '**Sobre el traje de baño**, al salir del agua o cuando baja el sol. Cubre hombros y espalda sin la sensación de ropa pegada.',
        '**Como cubre-todo de emergencia**: se pone y se resuelve el camino hasta el bar o el auto.',
        '**Con una bandana en el pelo** si hay viento. Hay más en [accesorios tejidos para la playa](/blog/accesorios-tejidos-para-la-playa).',
      ],
    },
    {
      type: 'p',
      text: 'Una precaución simple: antes de sentarte en la arena o en el pasto, doblalo y apoyalo sobre el bolso. La arena fina se mete en cualquier tejido y después cuesta sacarla.',
    },

    { type: 'h2', text: 'En la ciudad, de tarde y de noche' },
    {
      type: 'p',
      text: 'Para la rambla o una cena en terraza, el poncho funciona como el abrigo que no parece abrigo. La regla es la misma que con cualquier pieza tejida protagonista: base lisa debajo.',
    },
    {
      type: 'steps',
      items: [
        {
          title: 'Con musculosa o remera lisa y jean',
          text: 'El look más fácil. El poncho es lo único con textura y se lee enseguida.',
        },
        {
          title: 'Sobre un vestido recto',
          text: 'Cae sobre los hombros y alarga la silueta. Un vestido liso, sin estampado, deja que el tejido se luzca.',
        },
        {
          title: 'Con un solo accesorio',
          text: 'Un bolso que repita uno de los tonos alcanza. Las [Manguitas Tramonto](/tienda/manguitas-tramonto) y el [Bolso Margot](/tienda/bolso-margot-butter) son de la misma colección, así que los colores ya se llevan bien entre sí.',
        },
      ],
    },

    { type: 'h2', text: 'Qué mirar antes de elegir uno' },
    {
      type: 'ul',
      items: [
        '**La fibra:** para verano, algodón. Una mezcla con lana o acrílico se siente más caliente y te va a pesar en una tarde de calor.',
        '**La caída:** un buen poncho cae solo y no se queda tieso. Si podés, levantalo y soltalo: el tejido tiene que moverse.',
        '**El largo:** más corto queda mejor sobre el traje de baño y sobre un top; más largo funciona como vestido de salida de playa.',
        '**El color:** uno claro o cálido combina con casi todo lo que ya tenés y se lee bien con el sol bajo del atardecer.',
      ],
    },
    {
      type: 'note',
      text: 'Son criterios generales para cualquier poncho tejido, no una descripción de un modelo en particular. Las medidas y el talle de cada pieza figuran en su ficha.',
    },

    { type: 'h2', text: 'Cómo cuidarlo' },
    {
      type: 'p',
      text: 'Un poncho es una pieza grande y de tejido suelto: lo que más lo daña es el peso del agua cuando se cuelga. El cuidado es el de cualquier prenda de algodón hecha a mano:',
    },
    {
      type: 'ul',
      items: [
        'Lavalo a mano, con agua fría y jabón neutro, sin frotar ni retorcer.',
        'Enjuagá con agua a la misma temperatura.',
        'Secalo en horizontal, sobre una toalla y a la sombra. Nunca colgado ni en secarropas.',
        'Si estuvo en la playa, sacudí la arena y enjuagalo con agua dulce antes de guardarlo. Hay más en [cuidar crochet en verano: playa, sol y cloro](/blog/cuidar-crochet-en-verano-playa-sol-cloro).',
      ],
    },

    { type: 'h2', text: 'Un regalo que perdona el talle' },
    {
      type: 'p',
      text: 'Una capa suelta perdona mucho el talle, y eso la vuelve un regalo más seguro que un top o un cardigan. Si estás eligiendo para alguien, la nota [regalar ropa sin saber el talle](/blog/regalar-ropa-sin-saber-el-talle) tiene los criterios.',
    },

    { type: 'h2', text: 'Preguntas frecuentes' },
    {
      type: 'faq',
      items: [
        {
          q: '¿Abriga lo suficiente para una noche de verano?',
          a: 'Es una capa liviana de algodón: corta la brisa de la tarde y de la noche, pero no es una prenda de invierno.',
        },
        {
          q: '¿Se puede usar en otra época del año?',
          a: 'Sí, en el entretiempo, sobre una remera de manga larga. La nota sobre [prendas tejidas en el entretiempo uruguayo](/blog/entretiempo-uruguay-prendas-tejidas) tiene más ideas.',
        },
        {
          q: '¿Se puede encargar en otro color o medida?',
          a: 'Las prendas de Dahila también se tejen a pedido. En [cómo encargar una prenda a medida](/blog/como-encargar-prenda-a-medida) está cómo funciona.',
        },
        {
          q: '¿Cómo se lava?',
          a: 'A mano, con agua fría y jabón neutro, y se seca en horizontal a la sombra.',
        },
      ],
    },

    {
      type: 'shopCta',
      title: "Poncho Été y la colección Sunset '26",
      text: 'Poncho, manguitas y bolsos de verano, tejidos a mano en Montevideo. Salen en cantidades chicas.',
      href: '/colecciones/sunset-26',
      label: 'Ver la colección',
    },
  ],
}
