import type { Article } from '../types'

export const article: Article = {
  slug: 'como-cuidar-prendas-de-crochet',
  title: 'Cómo cuidar una prenda de crochet para que dure años',
  // 13/09/2026: con "(guía completa)" tuvo 90 impresiones y 0 clics en
  // posición 5,8 (Search Console, 28 días). Prueba: el título promete el
  // resultado ("que dure años") en vez de un formato. Medir a los 28 días.
  metaTitle: 'Cómo cuidar una prenda de crochet para que dure años',
  description:
    'Lavado, secado, guardado y arreglos: la guía completa para cuidar una prenda tejida a mano a crochet y que siga como el primer día.',
  excerpt:
    'Una prenda tejida a mano no se cuida como una remera de fábrica. Con tres o cuatro cosas simples dura años sin deformarse ni perder el punto.',
  cluster: 'cuidados',
  role: 'pillar',
  funnel: 'TOFU',
  publishedAt: '2026-08-31',
  updatedAt: '2026-09-13',
  hero: {
    src: '/photos/blog/bufanda-y-guantes-crochet-crudo.jpg',
    alt: 'Bufanda y guantes tejidos a crochet en crudo, con la etiqueta de Dahila',
    position: '50% 50%',
  },
  relatedCategorySlug: 'cardigans',
  relatedProductSlugs: ['cardigan-3-4', 'top-flower', 'bufanda-sophie'],
  body: [
    {
      type: 'p',
      text: 'Una prenda de crochet está hecha de una sola hebra continua, enlazada punto por punto. Eso es lo que le da la caída y la textura que no tiene una prenda de máquina, y también lo que explica por qué se cuida distinto: el tejido tiene aire adentro, y ese aire se puede aplastar, estirar o encoger si la tratás como al resto de la ropa.',
    },
    {
      type: 'p',
      text: 'La buena noticia es que no hay que hacer nada complicado. Son cuatro momentos (lavar, secar, guardar y arreglar) y en cada uno alcanza con evitar dos o tres errores. Si respetás eso, una prenda tejida a mano te dura años, y de hecho suele mejorar con el uso.',
    },

    { type: 'h2', text: 'Las tres reglas que resuelven el 90%' },
    {
      type: 'callout',
      title: 'Cuidado de las prendas Dahila',
      text: 'Lavá a mano con agua fría y jabón neutro. Secá en horizontal, a la sombra, sin colgar. No uses secarropas. Así tu prenda dura años.',
    },
    {
      type: 'p',
      text: 'Esa es la instrucción que damos con cada pieza, y no es una fórmula: cada una de las tres partes evita un daño concreto. El agua caliente y el movimiento fuerte apelmazan la fibra (el famoso "se afieltró"). El peso del agua estira el tejido si lo colgás. Y el calor del secarropas encoge y endurece. Todo lo demás son detalles.',
    },

    { type: 'h2', text: 'Por qué el crochet se cuida distinto a una prenda industrial' },
    {
      type: 'p',
      text: 'Una prenda de fábrica está tejida con hilos finos y muy ajustados, muchas veces con mezcla sintética que aguanta el maltrato del lavarropas. Una prenda de crochet hecha a mano tiene puntos más grandes, más espacio entre hebra y hebra y, si es de fibra natural, una estructura que reacciona al calor y a la fricción.',
    },
    {
      type: 'ul',
      items: [
        '**El punto tiene memoria.** Se adapta a tu cuerpo con el uso, pero también se queda con la forma que le des mojada. Por eso el secado importa tanto como el lavado.',
        '**La fibra natural respira.** Lana y algodón se ventilan solos: casi nunca hace falta lavar tan seguido como creemos.',
        '**No hay costuras industriales.** Las uniones son a mano, así que conviene evitar tirones fuertes al ponerla y sacarla.',
      ],
    },
    {
      type: 'quote',
      text: 'Casi todo el daño que vemos en una prenda tejida no pasa mientras se usa. Pasa en el lavado y en el placard.',
    },

    { type: 'h2', text: 'Lavado: a mano, agua fría, sin retorcer' },
    {
      type: 'p',
      text: 'Lavá solo cuando haga falta de verdad. Una prenda tejida que usaste dos o tres veces normalmente se recupera con una noche al aire, colgada del respaldo de una silla (no en percha) o extendida sobre la cama.',
    },
    {
      type: 'ol',
      items: [
        'Llená una palangana con agua fría y disolvé bien el jabón neutro antes de meter la prenda.',
        'Sumergila y movela con suavidad, apretando sin frotar. Nunca la restriegues contra sí misma.',
        'Enjuagá con agua de la misma temperatura, hasta que salga limpia.',
        'Sacá el exceso de agua apretando entre las manos o entre dos toallas. Nunca retuerzas.',
      ],
    },
    {
      type: 'p',
      text: 'El detalle que más importa es el cuarto: **retorcer es lo que rompe el punto**. Si la prenda queda muy pesada de agua, envolvela en una toalla seca y presioná sobre el rollo. El paso a paso completo, con los errores más comunes, está en [cómo lavar una prenda de crochet a mano](/blog/como-lavar-crochet-a-mano).',
    },

    { type: 'h2', text: 'Secado: horizontal y a la sombra' },
    {
      type: 'p',
      text: 'Extendé la prenda sobre una toalla, en plano, y acomodala con las manos hasta que recupere su forma: los hombros derechos, los puños a la misma altura, el largo parejo. Esa forma es la que va a quedar cuando seque, así que vale el minuto que lleva.',
    },
    {
      type: 'ul',
      items: [
        'Nunca al sol directo: descolora y reseca la fibra.',
        'Nunca colgada mojada: el peso del agua estira el tejido y el largo no vuelve.',
        'Nunca sobre una fuente de calor (estufa, radiador, secarropas).',
        'Dala vuelta a mitad del secado para que ventile de los dos lados.',
      ],
    },

    { type: 'h2', text: 'Guardado: doblada, nunca colgada' },
    {
      type: 'p',
      text: 'En el placard, una prenda tejida va doblada en un estante o en un cajón. Colgada de una percha, su propio peso le estira los hombros con el paso de los meses y ese deformado sí es difícil de revertir. Si guardás por temporada, sumá una bolsa de tela (no de plástico) para que la fibra respire.',
    },
    {
      type: 'p',
      text: 'Todo el detalle de guardado por temporada, incluida la parte de las polillas, está en [cómo guardar prendas tejidas sin que se deformen](/blog/como-guardar-prendas-tejidas).',
    },

    { type: 'h2', text: 'Manchas, enganches y pelusas' },
    {
      type: 'steps',
      items: [
        {
          title: 'Una mancha fresca',
          text: 'Actuá rápido y en frío. Absorbé con un paño limpio hacia afuera de la mancha, sin frotar en círculos: frotar la mete más adentro del punto.',
        },
        {
          title: 'Un enganche (un hilo que sobresale)',
          text: 'No lo cortes. Pasalo hacia el revés de la prenda con una aguja de lana o un ganchillo fino y estirá suavemente el tejido alrededor para repartir la hebra.',
        },
        {
          title: 'Pelotitas o pelusa',
          text: 'Aparecen por roce y son normales en fibra natural. Se sacan con una maquinita quita-pelusas a baja potencia o, con más paciencia, con una piedra pómez suave apoyada en plano.',
        },
      ],
    },
    {
      type: 'note',
      text: 'Las instrucciones de lavado, secado y secarropas son las que damos con cada prenda Dahila. Los consejos de manchas, enganches y pelusas son cuidado textil general, aplicable a cualquier tejido a mano.',
    },

    { type: 'h2', text: 'Preguntas frecuentes' },
    {
      type: 'faq',
      items: [
        {
          q: '¿Puedo lavar una prenda de crochet en el lavarropas?',
          a: 'No lo recomendamos, ni siquiera en programa delicado. El tambor combina agua, calor y fricción, que es exactamente lo que apelmaza el punto. El lavado a mano lleva diez minutos y es la diferencia entre una prenda que dura una temporada y una que dura años.',
        },
        {
          q: '¿Cada cuánto hay que lavarla?',
          a: 'Mucho menos de lo que uno cree. Las fibras naturales se ventilan solas: salvo mancha o transpiración, con airear la prenda entre usos alcanza. Cuanto menos la lavás, más dura.',
        },
        {
          q: '¿Se puede planchar?',
          a: 'Directamente sobre el tejido, no: la plancha aplasta el punto y le saca el relieve. Si necesitás acomodar una parte, usá vapor a distancia o un paño fino entre la plancha y la prenda, con la plancha tibia.',
        },
        {
          q: '¿Qué hago si igual se me deformó?',
          a: 'Muchas veces se recupera: lavala a mano en frío otra vez y, al extenderla mojada, acomodala con las manos a la forma correcta y dejala secar así. El tejido tiende a fijar la última forma en la que secó.',
        },
        {
          q: '¿Y si la prenda es de algodón en vez de lana?',
          a: 'Las reglas son las mismas, con una ventaja: el algodón es menos sensible al afieltrado. Igual conviene el agua fría y el secado horizontal, porque el punto de crochet se estira con el peso sin importar la fibra.',
        },
      ],
    },

    {
      type: 'shopCta',
      title: 'Prendas pensadas para durar',
      text: 'Cada pieza de Dahila se teje a mano en Montevideo, en tu talle y tus colores. Si la cuidás así, te acompaña muchas temporadas.',
      href: '/tienda',
      label: 'Ver la tienda',
    },
  ],
}
