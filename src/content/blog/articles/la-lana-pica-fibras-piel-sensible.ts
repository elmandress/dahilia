import type { Article } from '../types'

export const article: Article = {
  slug: 'la-lana-pica-fibras-piel-sensible',
  title: '¿La lana pica? Qué fibra elegir si tenés piel sensible',
  metaTitle: '¿La lana pica? Qué fibra elegir según tu piel',
  description:
    'Por qué algunas lanas pican y otras no, qué tiene que ver el grosor de la fibra, y qué material conviene si tenés piel sensible o alergia declarada a la lana.',
  excerpt:
    'No es la lana: es el grosor del pelo. La misma fibra puede picar o no según cuántas micras mida, y eso cambia por completo qué prenda te conviene.',
  cluster: 'comprar',
  role: 'support',
  funnel: 'TOFU',
  publishedAt: '2026-09-04',
  hero: { src: '/photos/detalle-tejido.jpg', alt: 'Detalle del punto y la fibra de una prenda tejida' },
  relatedCategorySlug: 'tops',
  relatedProductSlugs: ['top-summer', 'cardigan-3-4', 'bufanda-sophie'],
  relatedArticleSlugs: [
    'comprar-crochet-en-uruguay',
    'como-cuidar-prendas-de-crochet',
    'cardigan-de-crochet-como-elegirlo',
  ],
  body: [
    {
      type: 'p',
      text: 'Casi todo el mundo tiene una prenda de lana que no se puede poner sobre la piel. De ahí sale la idea de que "la lana pica" — pero la lana no pica toda igual, y entender por qué cambia bastante lo que conviene elegir.',
    },
    {
      type: 'callout',
      title: 'La versión corta',
      text: 'Lo que pica no es el tipo de animal ni la calidad: es el grosor de cada pelo. Las fibras finas se doblan al tocar la piel; las gruesas no se doblan y empujan las terminaciones nerviosas. Por eso una lana merino no pica y una lana gruesa sí, aunque las dos sean lana.',
    },

    { type: 'h2', text: 'Por qué pica: el grosor de la fibra' },
    {
      type: 'p',
      text: 'El grosor de un pelo de lana se mide en micras (milésimas de milímetro). Cuando una fibra es lo bastante fina, al apoyarse contra la piel simplemente se dobla y no se siente. Cuando es gruesa, es demasiado rígida para doblarse: se queda apoyada, presiona las terminaciones nerviosas y el cuerpo lo interpreta como picazón.',
    },
    {
      type: 'p',
      text: 'El umbral está alrededor de las 30 micras. Debajo de eso, la mayoría de la gente no siente nada; arriba, la mayoría siente la prenda "áspera". Por eso el mismo tipo de lana, según de qué parte del animal salga y cómo se procese, puede resultar suave o picar.',
    },
    {
      type: 'ul',
      items: [
        '**Merino:** entre 17 y 24 micras aproximadamente. Es la lana que no pica, incluso en contacto directo con la piel.',
        '**Alpaca:** fibra fina y sin lanolina, suele tolerarse bien; la sensación depende del grado.',
        '**Lana común / criolla:** puede pasar largamente las 30 micras. Es la que da la fama de "pica".',
        '**Algodón:** no pica: la fibra es corta, blanda y no tiene la rigidez de la lana gruesa.',
        '**Acrílico:** tampoco pica, aunque transpira menos y con el uso puede hacer pelotitas.',
      ],
    },
    {
      type: 'note',
      text: 'Los rangos de micras y el umbral de percepción son información textil general, no un dato de Dahila. El material concreto de cada prenda está siempre en su ficha de producto.',
    },

    { type: 'h2', text: 'Picazón no es lo mismo que alergia' },
    {
      type: 'p',
      text: 'Vale distinguirlas porque tienen soluciones distintas. La picazón por fibra gruesa es una irritación mecánica: molesta mientras la prenda está apoyada y se va cuando te la sacás. La alergia real a la lana es poco frecuente y suele dar una reacción de piel más marcada y persistente.',
    },
    {
      type: 'p',
      text: 'Si lo tuyo es irritación mecánica, tenés salida: una fibra más fina, o la misma prenda usada sobre una remera. Si tenés una alergia diagnosticada, lo prudente es ir directo a algodón o a mezclas sin lana.',
    },
    {
      type: 'callout',
      title: 'Una prueba de 30 segundos',
      text: 'Antes de comprar, apoyá la prenda (o una foto no sirve acá — pedí probarla o consultá el material) en la cara interna del antebrazo o el cuello, que son las zonas más sensibles. Si ahí no molesta, no va a molestar en ningún lado.',
    },

    { type: 'h2', text: 'Qué elegir según tu caso' },
    {
      type: 'steps',
      items: [
        {
          title: 'Si te pica todo lo de lana',
          text: 'Andá a algodón para prendas que van sobre la piel (tops, remeras tejidas) y dejá la lana para lo que va por encima de otra ropa: un cardigan abierto, un poncho, una bufanda sobre el cuello del abrigo.',
        },
        {
          title: 'Si te pica solo algunas prendas',
          text: 'Es cuestión de grosor de fibra, no de lana en general. Preguntá qué material es antes de comprar y buscá fibras finas — vas a poder usar lana sin problema.',
        },
        {
          title: 'Si es para un regalo y no sabés',
          text: 'Algodón es la apuesta segura: no pica, no da calor de más y sirve todo el año. Un accesorio de algodón difícilmente falle.',
        },
        {
          title: 'Si es para bebés o piel muy delicada',
          text: 'Algodón, y prendas que se laven fácil. La piel fina siente el roce mucho antes que la de un adulto.',
        },
      ],
    },

    { type: 'h2', text: 'Cosas que hacen que pique más (y que se pueden evitar)' },
    {
      type: 'ul',
      items: [
        '**Lavar con agua caliente.** Endurece la fibra y aumenta la aspereza. Siempre agua fría.',
        '**Secar al sol directo.** Reseca la fibra natural y la vuelve más rígida. A la sombra y en horizontal.',
        '**Suavizante.** Suena a solución y es lo contrario: deja una película que apelmaza la fibra y le quita el aire al punto.',
        '**Guardarla comprimida.** Una prenda aplastada meses pierde soltura; queda más dura al ponerla.',
      ],
    },

    { type: 'h2', text: 'Preguntas frecuentes' },
    {
      type: 'faq',
      items: [
        {
          q: '¿La lana deja de picar con los lavados?',
          a: 'Un poco, porque se ablanda con el uso, pero no cambia el grosor de la fibra. Si pica bastante de entrada, va a seguir picando: no esperes que el lavado lo resuelva.',
        },
        {
          q: '¿El crochet pica más que el tejido a dos agujas?',
          a: 'No. La picazón viene de la fibra, no de la técnica. Lo que sí cambia es la sensación: el punto de crochet suele ser más abierto y toca menos superficie de piel.',
        },
        {
          q: '¿El algodón da calor en invierno?',
          a: 'Abriga menos que la lana para el mismo grosor, pero en un punto cerrado y con algo debajo funciona bien para el invierno uruguayo, que rara vez es extremo.',
        },
        {
          q: '¿Cómo sé de qué material es una prenda antes de comprarla?',
          a: 'Tiene que estar dicho en la ficha del producto. Si no está, preguntá: es un dato básico, y quien teje lo sabe siempre.',
        },
        {
          q: '¿Se puede pedir la misma prenda en otra fibra?',
          a: 'En prendas tejidas a pedido, sí: la fibra se elige antes de empezar a tejer. Es de las ventajas concretas de que la prenda se haga después de la compra.',
        },
      ],
    },

    {
      type: 'p',
      text: 'Si estás por elegir tu primera prenda tejida y querés el panorama completo (qué mirar, cómo comparar, qué preguntar), está en [comprar crochet en Uruguay](/blog/comprar-crochet-en-uruguay).',
    },

    {
      type: 'shopCta',
      title: 'Elegí la fibra, no solo el modelo',
      text: 'Cada prenda dice de qué está hecha, y las que se tejen a pedido se pueden hacer en la fibra que te sirva.',
      href: '/tienda',
      label: 'Ver la tienda',
    },
  ],
}
