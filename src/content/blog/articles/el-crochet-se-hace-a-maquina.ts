import type { Article } from '../types'

export const article: Article = {
  slug: 'el-crochet-se-hace-a-maquina',
  title: '¿El crochet se hace a máquina? Cómo saber si es hecho a mano',
  metaTitle: '¿El crochet se hace a máquina? Cómo distinguirlo',
  description:
    'Por qué el crochet no se mecaniza como el tejido de punto, qué es la tela raschel que se vende como "crochet" barato y cómo distinguir una prenda hecha a mano.',
  excerpt:
    'Hay una diferencia técnica concreta entre una prenda tejida a mano y una que solo imita el calado. Se puede ver a ojo, y explica de una la diferencia de precio.',
  cluster: 'comprar',
  role: 'support',
  funnel: 'MOFU',
  publishedAt: '2026-09-04',
  hero: { src: '/photos/blog/chaleco-crochet-etiqueta.jpg', alt: 'Borde de un chaleco tejido a crochet a mano, con la etiqueta de Dahila', position: '50% 60%' },
  relatedCategorySlug: 'tops',
  relatedProductSlugs: ['cardigan-amour', 'top-summer', 'bolso-lola'],
  relatedArticleSlugs: [
    'cuanto-cuesta-una-prenda-tejida-a-mano',
    'crochet-o-dos-agujas-diferencias',
    'comprar-crochet-en-uruguay',
  ],
  body: [
    {
      type: 'p',
      text: 'Si viste un top "de crochet" a precio de cadena y otro parecido que cuesta varias veces más, no estás comparando dos versiones de lo mismo. En la mayoría de esos casos ni siquiera son la misma técnica: uno es tejido a mano y el otro es una tela que imita el calado.',
    },
    {
      type: 'callout',
      title: 'La versión corta',
      text: 'El tejido de punto se mecanizó hace siglos. El crochet no: exige meter un ganchillo dentro de un punto ya formado y sacar el hilo en tres dimensiones, y eso no se reproduce industrialmente a escala. Lo que se vende barato con aspecto de crochet suele ser tela raschel, hecha en telar.',
    },

    { type: 'h2', text: 'Por qué el crochet no se mecanizó' },
    {
      type: 'p',
      text: 'En el tejido de punto (dos agujas) los puntos viven en una aguja y avanzan en fila: eso se pudo automatizar, y por eso existen máquinas de tejer desde hace siglos. El crochet funciona distinto: hay un solo punto activo por vez, y para hacer el siguiente el ganchillo tiene que entrar dentro de un punto ya cerrado, tomar el hilo y sacarlo por ahí.',
    },
    {
      type: 'p',
      text: 'Ese movimiento (entrar, tomar, salir, en tres dimensiones y decidiendo dónde entrar cada vez) es el que no se logró llevar a una máquina industrial para producir prendas en volumen. No es una cuestión de que no se haya intentado: es que la estructura del punto no se presta.',
    },
    {
      type: 'note',
      text: 'Esta es información técnica general sobre la técnica, no un dato de Dahila. Existen máquinas industriales que producen tejidos con patrones preprogramados y se comercializan bajo el nombre de "crochet", pero lo que sale de ellas no es el punto de crochet hecho a mano.',
    },

    { type: 'h2', text: 'Qué es la tela raschel (lo que se vende como "crochet" barato)' },
    {
      type: 'p',
      text: 'La mayoría de las prendas de fast fashion con aspecto de crochet son de tela raschel: un tejido de urdimbre hecho en telar, diseñado justamente para imitar el calado del tejido a mano. Es una tela legítima y tiene sus usos. El punto es que no es crochet, y por eso puede costar lo que cuesta.',
    },

    { type: 'h2', text: 'Cómo distinguirlas a ojo' },
    {
      type: 'steps',
      items: [
        {
          title: 'Mirá el revés',
          text: 'La tela raschel muestra bucles verticales en el derecho y hebras que van en horizontal por el revés. Un tejido a crochet tiene la misma lógica de puntos de los dos lados: se ve construido, no "impreso".',
        },
        {
          title: 'Buscá la perfección',
          text: 'Si todos los motivos son exactamente iguales, con la misma tensión milimétrica y sin una sola variación, es máquina. Una prenda hecha a mano tiene mínimas irregularidades: no son errores, son variación humana.',
        },
        {
          title: 'Estirá un poco',
          text: 'El tejido a mano cede y vuelve; la tela raschel estira bastante menos, porque su estructura es otra.',
        },
        {
          title: 'Mirá dónde terminan las piezas',
          text: 'Una prenda tejida a mano se teje con su forma: los bordes están rematados, no cortados. En una tela hay que cortar el molde y coser, así que vas a encontrar costuras y bordes terminados con máquina.',
        },
      ],
    },

    { type: 'h2', text: 'Qué tiene que ver esto con el precio' },
    {
      type: 'p',
      text: 'Si una prenda de crochet real cuesta muy poco, la cuenta no cierra por algún lado, y en general el lado que no cierra es cuánto cobró quien la tejió. Una prenda tejida a mano lleva horas de trabajo humano que no se pueden comprimir: no hay una máquina que las haga más rápido.',
    },
    {
      type: 'p',
      text: 'Por eso la comparación honesta no es "este top de crochet cuesta más que aquel". Es: uno es una tela producida en serie y el otro son horas de alguien tejiendo punto por punto. En [cuánto cuesta una prenda tejida a mano](/blog/cuanto-cuesta-una-prenda-tejida-a-mano) está la cuenta desde el lado de quien teje.',
    },
    {
      type: 'quote',
      text: 'No hay una máquina que teja crochet más rápido. Por eso el precio de una prenda tejida a mano es, sobre todo, tiempo de alguien.',
    },

    { type: 'h2', text: 'Y si igual quiero algo barato, ¿está mal?' },
    {
      type: 'p',
      text: 'No. Una prenda de raschel puede resolverte una temporada, y saber lo que estás comprando es justamente lo que te deja decidir bien. Lo que no conviene es pagar precio de tejido a mano por algo industrial: ahí sí estás pagando de más, y esta nota existe para que puedas notar la diferencia antes de comprar.',
    },

    { type: 'h2', text: 'Preguntas frecuentes' },
    {
      type: 'faq',
      items: [
        {
          q: '¿Entonces no existen máquinas de crochet?',
          a: 'Existen máquinas industriales que se venden bajo ese nombre y producen tejidos con patrones preprogramados, pero no reproducen el punto de crochet hecho a mano. La estructura del crochet (entrar con el ganchillo dentro de un punto ya formado) es la que no se logró industrializar para prendas en volumen.',
        },
        {
          q: '¿Cómo lo distingo en una foto de internet?',
          a: 'Buscá una foto de detalle y otra del revés. Si no hay foto de detalle, pedila: quien teje a mano la tiene o la saca en el momento, y quien vende tela producida en serie rara vez la ofrece.',
        },
        {
          q: '¿El crochet a mano es mejor que el tejido a máquina?',
          a: 'Son cosas distintas, no una mejor que la otra. El tejido a mano permite ajustar a medida, elegir color y punto, y repararse punto por punto. La producción industrial permite precio bajo y volumen. Elegís según lo que buscás.',
        },
        {
          q: '¿Cómo sé que lo que compro acá es realmente hecho a mano?',
          a: 'Pedí fotos de detalle y del proceso. En una prenda tejida a pedido, además, hay algo que ninguna producción en serie puede ofrecer: se empieza a tejer después de que la encargaste, con tu talle y tu color.',
        },
      ],
    },

    {
      type: 'shopCta',
      title: 'Tejido a mano, punto por punto',
      text: 'Cada pieza se teje después de tu pedido, en Montevideo, en tu talle y tus colores.',
      href: '/tienda',
      label: 'Ver la tienda',
    },
  ],
}
