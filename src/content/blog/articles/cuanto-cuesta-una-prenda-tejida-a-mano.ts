import type { Article } from '../types'

export const article: Article = {
  slug: 'cuanto-cuesta-una-prenda-tejida-a-mano',
  title: 'Por qué una prenda tejida a mano cuesta lo que cuesta',
  metaTitle: 'Cuánto cuesta una prenda tejida a mano (y por qué)',
  description:
    'Horas de trabajo, materiales y por qué no se puede comparar con una prenda de fábrica: cómo se forma el precio de una prenda de crochet hecha a mano.',
  excerpt:
    'No es marketing ni exclusividad: es aritmética. Cuántas horas hay dentro de un cardigan y por qué eso explica el precio mejor que cualquier discurso.',
  cluster: 'comprar',
  role: 'support',
  funnel: 'MOFU',
  publishedAt: '2026-08-31',
  hero: {
    src: '/photos/blog/cardigan-granny-detalle.jpg',
    alt: 'Cuadrados granny de un cardigan tejido a crochet a mano, de cerca',
    position: '50% 45%',
  },
  relatedCategorySlug: 'cardigans',
  relatedProductSlugs: ['cardigan-3-4', 'top-halter', 'mini-bufandas'],
  relatedArticleSlugs: ['comprar-crochet-en-uruguay', 'como-cuidar-prendas-de-crochet'],
  body: [
    {
      type: 'p',
      text: 'Es la pregunta que más aparece, aunque casi nunca se dice en voz alta: por qué un cardigan tejido a mano cuesta varias veces lo que cuesta uno parecido en una cadena de ropa. La respuesta no tiene nada de misteriosa y no hace falta ponerse a la defensiva para darla.',
    },

    { type: 'h2', text: 'El precio es, sobre todo, tiempo' },
    {
      type: 'p',
      text: 'Una prenda de crochet se hace con un ganchillo y una hebra, punto por punto. No hay forma de acelerarlo: no existe una máquina que teja crochet. Un cardigan de adulto puede llevar veinte horas o más de trabajo continuo de una sola persona. Un top liviano, cerca de la mitad. Una bufanda, unas pocas.',
    },
    {
      type: 'p',
      text: 'Poné cualquier valor por hora que te parezca justo para un oficio manual y hacé la cuenta. Vas a llegar, casi siempre, a un número parecido al que ves en la etiqueta. Ese es todo el secreto.',
    },
    {
      type: 'quote',
      text: 'Una prenda industrial no es más barata porque use peor material. Es más barata porque nadie la tejió.',
    },

    { type: 'h2', text: 'Qué hay adentro del precio' },
    {
      type: 'ul',
      items: [
        '**Horas de tejido.** Es la parte más grande, lejos.',
        '**Materiales.** Lana o algodón natural de buena calidad cuesta bastante más que un hilado sintético.',
        '**Prueba y ajuste.** Una pieza a medida implica revisar medidas, a veces destejer y rehacer una parte.',
        '**Terminaciones.** Costuras, remates y bloqueo final, que es lo que hace que una prenda se vea prolija y no casera en el mal sentido.',
      ],
    },
    {
      type: 'p',
      text: 'Lo que **no** hay adentro: intermediarios, local a la calle, producción en serie. Por eso una prenda hecha a mano por un taller chico suele costar menos que una prenda de diseño de marca, aunque lleve muchísimo más trabajo humano.',
    },

    { type: 'h2', text: 'Comparar peras con peras' },
    {
      type: 'p',
      text: 'La comparación honesta no es contra una remera de shopping: es contra otra prenda que también esté hecha por alguien, con material comparable y en cantidades chicas. Ahí el precio del tejido a mano deja de parecer alto.',
    },
    {
      type: 'p',
      text: 'Y hay una segunda parte que casi nunca entra en la cuenta: cuánto dura. Una prenda tejida a mano con fibra natural, [bien cuidada](/blog/como-cuidar-prendas-de-crochet), aguanta años de uso real. Dividí el precio por temporadas y la aritmética cambia bastante.',
    },

    { type: 'h2', text: 'Por qué a veces conviene empezar por una pieza chica' },
    {
      type: 'p',
      text: 'Si nunca compraste tejido a mano y no querés arrancar por lo más caro, tiene todo el sentido empezar por un accesorio: una bufanda, unos calentadores, una bandana. Cuestan mucho menos porque llevan menos horas, y te dejan ver de cerca el punto, la terminación y cómo se comporta la fibra con el uso.',
    },
    {
      type: 'shopCta',
      title: 'Empezar por algo chico',
      text: 'Bufandas, bandanas y bolsos tejidos a mano: la forma más simple de ver el trabajo de cerca antes de ir por una prenda grande.',
      href: '/tienda/accesorios',
      label: 'Ver accesorios',
    },

    { type: 'h2', text: 'Preguntas frecuentes' },
    {
      type: 'faq',
      items: [
        {
          q: '¿Por qué dos prendas parecidas tienen precios tan distintos?',
          a: 'Casi siempre por horas y por material. Un punto más cerrado o un hilado más fino multiplican el tiempo de tejido aunque la prenda se vea igual de lejos. Y la fibra natural cuesta varias veces lo que cuesta un hilado sintético.',
        },
        {
          q: '¿Se puede pedir una versión más económica?',
          a: 'A veces sí, y lo honesto es plantearlo: cambiar el largo, simplificar un detalle o elegir otro material puede bajar las horas. Lo que no se puede es sacar horas sin que se note en la prenda.',
        },
        {
          q: '¿El precio incluye el envío?',
          a: 'El envío se coordina aparte, por WhatsApp, según a dónde vaya. Los detalles están en [Información](/info).',
        },
        {
          q: '¿Sale más caro si lo pido a medida?',
          a: 'No necesariamente. A medida significa que se teje con tus medidas y tus colores, que es como se trabaja igual en un taller chico. Lo podés ver en [cómo encargar una prenda a medida](/blog/como-encargar-prenda-a-medida).',
        },
      ],
    },
    {
      type: 'note',
      text: 'Las horas de trabajo mencionadas son órdenes de magnitud del tejido a mano en general, no una tarifa de Dahila. Los precios reales, por pieza, están siempre a la vista en la tienda.',
    },
  ],
}
