import type { Article } from '../types'

// Drop Sunset '26 (nov 2026). Search Console ya muestra "poncho de verano" y
// "conjunto tejido playa"; las manguitas no tenían ninguna página que las
// explicara (qué son, cómo se usan, cómo se cuidan).
export const article: Article = {
  slug: 'manguitas-tejidas-como-combinarlas',
  title: 'Manguitas tejidas: cómo combinarlas en verano (y con qué)',
  metaTitle: 'Manguitas tejidas de crochet: cómo combinarlas en verano',
  description:
    'Qué son las manguitas tejidas, con qué ropa se combinan en verano y cómo cuidarlas. Una pieza de algodón que cambia un outfit básico sin sumar calor.',
  excerpt:
    'Unas mangas sueltas, de algodón, que se ponen sobre una remera o una musculosa. Cómo usarlas para que levanten un look básico sin dar calor.',
  cluster: 'comprar',
  role: 'support',
  funnel: 'MOFU',
  publishedAt: '2026-11-04',
  relatedCategorySlug: 'accesorios',
  relatedProductSlugs: ['manguitas-tramonto', 'bolso-margot-butter', 'bolso-margot-cherry', 'bandana'],
  relatedArticleSlugs: [
    'accesorios-tejidos-para-la-playa',
    'que-ponerse-debajo-de-un-top-de-crochet',
    'como-lavar-crochet-a-mano',
  ],
  body: [
    {
      type: 'p',
      text: 'Las manguitas son una de esas piezas que parecen un detalle y terminan siendo lo que más se usa del placard. Son mangas tejidas, sueltas, que se ponen sobre una remera, una musculosa o un vestido liso. No abrigan como un buzo: cambian el outfit, cubren un poco los brazos con el sol de la tarde y le dan un toque tejido a algo que ya tenías puesto.',
    },
    {
      type: 'callout',
      title: 'La versión corta',
      text: 'Ponelas sobre una base lisa y de un solo color, dejá que sean la pieza protagonista y sumá como mucho un accesorio más. Al ser de algodón y de trama suelta, no dan calor y se pueden llevar de día y de noche.',
    },

    { type: 'h2', text: 'Qué son y qué las hace distintas de una prenda entera' },
    {
      type: 'p',
      text: 'Una prenda tejida entera (un top, un cardigan) te obliga a pensar talle, largo y qué ponerte debajo. Las manguitas no: son una sola pieza de talle único, no dependen del busto ni de la cintura y se llevan igual sobre casi cualquier base. Por eso son de las piezas más fáciles de combinar y de regalar.',
    },
    {
      type: 'p',
      text: "Las [Manguitas Tramonto](/tienda/manguitas-tramonto), de la colección [Sunset '26](/colecciones/sunset-26), están tejidas a mano en algodón 100%, con una trama suelta, liviana y con caída. Llevan unas 8 horas de crochet, punto por punto. Son talle único y, si querés otra medida, se pueden encargar a medida.",
    },

    { type: 'h2', text: 'Cinco formas de combinarlas' },
    {
      type: 'steps',
      items: [
        {
          title: 'Con remera blanca y jean',
          text: 'La más simple y la que menos falla. Una base blanca o cruda deja que el tejido se vea y el jean la baja a tierra. Sirve para el trabajo, la facultad o una salida de tarde.',
        },
        {
          title: 'Con una musculosa de color liso',
          text: 'Si la musculosa es de un tono que ya está en las manguitas, el conjunto parece pensado. Si es de otro tono, que sea neutro: negro, blanco, arena.',
        },
        {
          title: 'Sobre un vestido liso de verano',
          text: 'Un vestido recto o de lino pasa de playero a "salimos a comer" con unas manguitas. Es el uso que mejor aprovecha que no abrigan de más.',
        },
        {
          title: 'Con un top tejido, si querés ir con todo',
          text: 'Mezclar crochet con crochet funciona cuando una de las dos piezas es calada y la otra más cerrada, o cuando una es lisa. Mejor que una sola sea la protagonista. Hay más en la nota sobre [qué ponerse debajo de un top de crochet](/blog/que-ponerse-debajo-de-un-top-de-crochet).',
        },
        {
          title: 'Con la bandana o el bolso en el mismo tono',
          text: 'Un solo accesorio que repita el color de las manguitas ordena todo el look. Más de uno empieza a pesar.',
        },
      ],
    },
    {
      type: 'note',
      text: 'Las combinaciones son sugerencias de estilo, no reglas. Lo que sí vale para cualquier tejido protagonista: base lisa, un solo foco de atención y colores que se repitan.',
    },

    { type: 'h2', text: 'Para la playa y para la ciudad' },
    {
      type: 'p',
      text: 'En la playa sirven para cubrir los brazos cuando baja el sol y sobre el traje de baño, sin sumar el peso de una prenda mojada. Para la ciudad, lo que cambia es la base: de remera y jean a un vestido liso. Si vas a combinarlas con un bolso, el [Bolso Margot](/tienda/bolso-margot-butter) está pensado para ir de la ciudad a la playa, con flecos y un asa ajustable que se lleva de varias formas. Más ideas para la costa en [accesorios tejidos para la playa](/blog/accesorios-tejidos-para-la-playa).',
    },

    { type: 'h2', text: 'Cómo cuidarlas para que duren' },
    {
      type: 'p',
      text: 'Con el calor se transpira y con la playa se llenan de arena y protector, así que se lavan seguido. La forma de lavarlas es la de cualquier prenda de algodón tejida a mano:',
    },
    {
      type: 'ul',
      items: [
        'A mano, con agua fría y jabón neutro, sin frotar ni retorcer.',
        'Enjuagá con agua a la misma temperatura, para que el tejido no se tense.',
        'Secalas en horizontal sobre una toalla, a la sombra. Nunca colgadas, porque el peso del agua las estira.',
        'Nada de secarropas.',
      ],
    },
    {
      type: 'p',
      text: 'La guía completa, con el paso a paso, está en [cómo lavar crochet a mano](/blog/como-lavar-crochet-a-mano).',
    },

    { type: 'h2', text: 'Preguntas frecuentes' },
    {
      type: 'faq',
      items: [
        {
          q: '¿Dan calor en verano?',
          a: 'Las de algodón con trama suelta, como las Manguitas Tramonto, son livianas. No se sienten como una manga de buzo.',
        },
        {
          q: '¿Qué talle son?',
          a: 'Las Tramonto son talle único. Si necesitás otra medida, se pueden encargar a medida.',
        },
        {
          q: '¿Se pueden usar sin nada abajo?',
          a: 'Son mangas sueltas, así que van sobre otra prenda: una remera, una musculosa, un vestido o un traje de baño.',
        },
        {
          q: '¿Sirven de regalo?',
          a: 'Sí, y no hace falta saber el talle. Si te interesa la idea, mirá [regalar ropa sin saber el talle](/blog/regalar-ropa-sin-saber-el-talle).',
        },
      ],
    },

    {
      type: 'shopCta',
      title: "Sunset '26",
      text: 'La colección de verano: manguitas, poncho y bolsos, tejidos a mano en Montevideo. Salen en cantidades chicas.',
      href: '/colecciones/sunset-26',
      label: 'Ver la colección',
    },
  ],
}
