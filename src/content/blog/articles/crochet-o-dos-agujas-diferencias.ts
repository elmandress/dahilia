import type { Article } from '../types'

export const article: Article = {
  slug: 'crochet-o-dos-agujas-diferencias',
  title: 'Crochet o dos agujas: en qué se diferencian (y cómo se nota en la prenda)',
  metaTitle: 'Crochet o dos agujas: diferencias en la prenda',
  description:
    'Crochet y tejido de punto no son lo mismo: cambian la textura, la caída, la elasticidad y hasta el abrigo. Cómo reconocerlos y cuál conviene para cada prenda.',
  excerpt:
    'Un ganchillo contra dos agujas. La diferencia no es solo cómo se teje: se nota en la caída, en el peso y en cómo te queda puesta.',
  cluster: 'comprar',
  role: 'support',
  funnel: 'TOFU',
  publishedAt: '2026-08-31',
  hero: {
    src: '/photos/detalle-tejido.jpg',
    alt: 'Detalle de la textura de un tejido a crochet hecho a mano',
  },
  relatedCategorySlug: 'tops',
  relatedProductSlugs: ['top-flower', 'bolso-lola', 'cardigan-cruzado'],
  relatedArticleSlugs: ['comprar-crochet-en-uruguay', 'como-cuidar-prendas-de-crochet'],
  body: [
    {
      type: 'p',
      text: 'Se usan como sinónimos todo el tiempo, pero son dos técnicas distintas que dan telas distintas. Si estás por comprar una prenda tejida, saber cuál es cuál te ayuda a entender por qué una cae de una manera y la otra de otra.',
    },

    { type: 'h2', text: 'La diferencia técnica, en una línea' },
    {
      type: 'p',
      text: 'El **crochet** se hace con un solo ganchillo y trabaja un punto por vez: cada punto se cierra antes de empezar el siguiente. El **tejido de punto** (dos agujas) mantiene toda una hilera de puntos abiertos sobre las agujas al mismo tiempo.',
    },
    {
      type: 'p',
      text: 'Esa diferencia, que parece de proceso, es la que después se siente en la prenda.',
    },

    { type: 'h2', text: 'Cómo se nota en la tela' },
    {
      type: 'ul',
      items: [
        '**Textura.** El crochet arma una tela con más relieve y más cuerpo, con espacios visibles entre punto y punto. El punto de dos agujas es más liso y parejo.',
        '**Elasticidad.** El tejido de punto estira más y vuelve. El crochet es más firme y estable: cede menos.',
        '**Caída.** El punto cae más suelto y se pega más al cuerpo. El crochet mantiene mejor la forma que le diste.',
        '**Peso.** A igual hilado, el crochet suele usar más material y pesar algo más.',
        '**Aire.** El crochet deja pasar más aire, por eso funciona tan bien en prendas de entretiempo y verano.',
      ],
    },
    {
      type: 'callout',
      title: 'Cómo reconocerlo mirando',
      text: 'Buscá los puntos: si ves pequeñas "V" alineadas en columnas prolijas, es tejido de punto. Si ves nudos con relieve, calados y una textura más tridimensional, es crochet.',
    },

    { type: 'h2', text: 'Para qué sirve mejor cada uno' },
    {
      type: 'p',
      text: 'Ninguna técnica es superior: son buenas para cosas distintas.',
    },
    {
      type: 'ul',
      items: [
        '**El crochet brilla** en piezas que necesitan estructura y textura: bolsos que tienen que sostener su forma, tops calados, cardigans con cuerpo, bandanas, accesorios.',
        '**El punto brilla** en prendas que tienen que abrazar el cuerpo y estirar: medias, gorros ajustados, sweaters muy elásticos.',
      ],
    },
    {
      type: 'p',
      text: 'Por eso, cuando ves un bolso tejido que se sostiene solo o un top con un calado que dibuja una figura, casi siempre estás viendo crochet.',
    },

    { type: 'h2', text: 'Una consecuencia práctica: el precio' },
    {
      type: 'p',
      text: 'Hay una diferencia importante para quien compra. El tejido de punto se puede hacer a máquina a escala industrial; el crochet, no. No existe una máquina que reproduzca el punto de crochet, así que **toda prenda de crochet real fue tejida por una persona**. Eso explica buena parte de la diferencia de precio entre una y otra, algo que desarrollamos en [por qué una prenda tejida a mano cuesta lo que cuesta](/blog/cuanto-cuesta-una-prenda-tejida-a-mano).',
    },

    { type: 'h2', text: 'Se cuidan igual' },
    {
      type: 'p',
      text: 'La buena noticia: las dos técnicas piden lo mismo en el cuidado. Agua fría, jabón neutro, sin retorcer, secado horizontal a la sombra y guardado doblado. Está todo en la [guía de cuidado de prendas tejidas](/blog/como-cuidar-prendas-de-crochet).',
    },
    {
      type: 'note',
      text: 'Esta nota describe las dos técnicas en general. Las prendas de Dahila se tejen a crochet, a mano, en Montevideo.',
    },

    { type: 'h2', text: 'Preguntas frecuentes' },
    {
      type: 'faq',
      items: [
        {
          q: '¿El crochet abriga menos que el tejido de punto?',
          a: 'Depende del punto y del hilado más que de la técnica. Un crochet cerrado con lana gruesa abriga muchísimo; uno calado con algodón es fresco a propósito. Justamente por eso el crochet funciona todo el año.',
        },
        {
          q: '¿Cuál dura más?',
          a: 'Las dos duran años si están bien hechas y bien cuidadas. El crochet, al ser más firme, tiende a deformarse menos con el uso; el punto se recupera mejor de un estirón porque es más elástico.',
        },
        {
          q: '¿Se pueden combinar en una misma prenda?',
          a: 'Sí, y se hace bastante: por ejemplo cuerpo a crochet con puños o cuello de punto elástico, para ganar ajuste donde hace falta.',
        },
      ],
    },

    {
      type: 'shopCta',
      title: 'Ver el punto de cerca',
      text: 'En cada ficha de la tienda hay fotos de detalle donde se ve la textura real del tejido.',
      href: '/tienda',
      label: 'Ver la tienda',
    },
  ],
}
