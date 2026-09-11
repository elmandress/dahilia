import type { Article } from '../types'

export const article: Article = {
  slug: 'regalos-tejidos-a-mano',
  title: 'Regalos tejidos a mano: ideas que se usan de verdad',
  metaTitle: 'Regalos tejidos a mano: 8 ideas para acertar',
  description:
    'Ideas de regalos tejidos a mano para acertar sin saber el talle: accesorios, sets y piezas a medida, con el detalle de qué regalar según la ocasión.',
  excerpt:
    'Un regalo tejido a mano se nota. La parte difícil es elegir sin saber el talle: acá van las opciones que casi nunca fallan.',
  cluster: 'regalos',
  role: 'pillar',
  funnel: 'BOFU',
  publishedAt: '2026-08-31',
  hero: {
    src: '/photos/bufanda-verde.png',
    alt: 'Bufanda verde tejida a mano a crochet',
  },
  relatedCategorySlug: 'accesorios',
  relatedProductSlugs: ['box-de-regalo', 'bufanda-sophie', 'bandana', 'mini-tote-bag'],
  relatedArticleSlugs: ['como-encargar-prenda-a-medida', 'como-cuidar-prendas-de-crochet'],
  body: [
    {
      type: 'p',
      text: 'Regalar algo tejido a mano tiene una ventaja rara: se entiende solo. No hace falta explicar por qué vale, se ve. El problema aparece en la práctica, cuando no sabés el talle de la otra persona o no querés preguntar y arruinar la sorpresa.',
    },
    {
      type: 'p',
      text: 'La solución es elegir bien la categoría de regalo. Estas son las que funcionan.',
    },

    { type: 'h2', text: 'Lo que no depende del talle' },
    {
      type: 'p',
      text: 'Si no sabés el talle (o no querés arriesgar), acá está la respuesta. Todo esto le queda bien a cualquiera:',
    },
    {
      type: 'ul',
      items: [
        '**Una bufanda.** El regalo tejido clásico, y clásico por algo: no hay talle que errar y se usa toda la temporada fría.',
        '**Una bandana.** Chica, moderna y de precio accesible. Funciona muy bien como regalo de cumpleaños entre amigas.',
        '**Un bolso tejido.** Sirve todo el año, no pasa de moda y se nota de lejos que está hecho a mano.',
        '**Calentadores.** Un regalo menos obvio y muy usado por quien va a clases de danza, hace deporte o simplemente tiene frío en casa.',
      ],
    },
    {
      type: 'shopCta',
      title: 'Accesorios: la vía rápida para acertar',
      text: 'Bufandas, bandanas, bolsos y calentadores tejidos uno por uno. Sin problema de talle.',
      href: '/tienda/accesorios',
      label: 'Ver accesorios',
    },

    { type: 'h2', text: 'Cuando querés que sea algo más importante' },
    {
      type: 'p',
      text: 'Para un regalo grande (un cumpleaños redondo, un aniversario, el regalo de fin de año a alguien muy cercano) hay dos caminos.',
    },
    {
      type: 'steps',
      items: [
        {
          title: 'Un set',
          text: 'Dos o tres piezas que combinan entre sí. Se siente más completo que una prenda sola y suele quedar mejor presentado.',
        },
        {
          title: 'Una prenda a medida',
          text: 'La opción más personal: la prenda se teje con las medidas y los colores de la persona. Requiere tiempo y saber sus medidas, así que conviene arrancar con anticipación. Cómo funciona está en [cómo encargar una prenda a medida](/blog/como-encargar-prenda-a-medida).',
        },
      ],
    },
    {
      type: 'callout',
      title: 'El truco para regalar algo a medida sin arruinar la sorpresa',
      text: 'Regalá el encargo, no la prenda terminada. Le contás a la persona que su prenda se va a tejer para ella y eligen juntas modelo, colores y medidas. La espera pasa a ser parte del regalo en vez de un problema.',
    },

    { type: 'h2', text: 'Qué regalar según la ocasión' },
    {
      type: 'ul',
      items: [
        '**Cumpleaños de una amiga:** una bandana o un bolso chico. Precio accesible, uso inmediato.',
        '**Día de la madre:** una bufanda o un set. Suma que sea algo hecho a mano, no comprado a último momento.',
        '**Aniversario o regalo de pareja:** una prenda a medida, empezada con tiempo.',
        '**Amigo invisible:** un accesorio chico. Es el rango de precio donde el tejido a mano se destaca más frente a lo que suele tocar.',
        '**Alguien que ya tiene todo:** un bolso tejido. Es la categoría donde menos gente tiene algo hecho a mano.',
      ],
    },

    { type: 'h2', text: 'Tres detalles que hacen la diferencia' },
    {
      type: 'ol',
      items: [
        '**Contá que está hecho a mano.** Parece obvio, pero la persona que lo recibe muchas veces no sabe cuántas horas hay adentro. Es parte del regalo.',
        '**Sumá el cuidado.** Un regalo tejido que se lava mal dura poco. Pasale la [guía de cuidado](/blog/como-cuidar-prendas-de-crochet) junto con la prenda.',
        '**Pedilo con tiempo.** En temporada alta (fin de año, día de la madre) los talleres chicos se llenan. Un mes antes es un buen margen para algo a medida.',
      ],
    },

    { type: 'h2', text: 'Preguntas frecuentes' },
    {
      type: 'faq',
      items: [
        {
          q: '¿Qué regalo si no sé nada del estilo de la persona?',
          a: 'Un accesorio en un color neutro. Una bufanda o un bolso en tonos tierra, crudo o negro combinan con casi todo y no obligan a la otra persona a cambiar su forma de vestirse.',
        },
        {
          q: '¿Se puede pedir en un color específico?',
          a: 'Sí. En Dahila, después de confirmar el modelo te mostramos las lanas reales disponibles y elegís sobre eso.',
        },
        {
          q: '¿Cuánto tiempo antes conviene encargarlo?',
          a: 'Para un accesorio ya tejido, poco. Para una prenda a medida, lo antes posible: el plazo depende del modelo y se acuerda al principio, por WhatsApp.',
        },
        {
          q: '¿Y si no sé su talle?',
          a: 'Andá por algo que no dependa de medidas: un bolso, una bufanda o un set de accesorios. Si igual querés regalar una prenda, un cardigan es lo que más perdona el talle, porque no cierra sobre el cuerpo.',
        },
        {
          q: '¿Hacen envíos a todo el país?',
          a: 'Sí, a todo Uruguay. El costo y el plazo se coordinan por WhatsApp según dónde estés.',
        },
      ],
    },

    {
      type: 'shopCta',
      title: '¿Buscás algo más grande?',
      text: 'Tops, cardigans y sets tejidos a mano, con precios y talles a la vista.',
      href: '/tienda',
      label: 'Ver la tienda',
    },
  ],
}
