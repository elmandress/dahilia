import type { Article } from '../types'

// Cluster de cuidados: después de regalos, es el estilo de nota con más
// impresiones (cómo cuidar prendas de crochet, 90 en 28 días). "Pelotitas" es
// como se dice en Uruguay; los primeros auxilios las nombran de pasada y esta
// nota las contesta a fondo.
export const article: Article = {
  slug: 'pelotitas-en-prendas-tejidas',
  title: 'Por qué las prendas tejidas hacen pelotitas (y cómo sacarlas sin arruinarlas)',
  metaTitle: 'Pelotitas en la ropa tejida: por qué salen y cómo sacarlas',
  description:
    'Por qué un tejido hace pelotitas, qué fibras las hacen más, cómo sacarlas sin cortar el punto y qué hacer para que no vuelvan a salir tan rápido.',
  excerpt:
    'Las pelotitas no son un defecto de fábrica: son fibra que se soltó con el roce. Cómo sacarlas bien, y por qué algunas prendas casi no las hacen.',
  cluster: 'cuidados',
  role: 'support',
  funnel: 'TOFU',
  publishedAt: '2026-09-13',
  hero: { src: '/photos/blog/cardigan-amour-corazones.jpg', alt: 'Cardigan amour tejido a crochet en crudo con corazones rojos, puesto con jean', position: '50% 40%' },
  relatedCategorySlug: 'cardigans',
  relatedProductSlugs: ['cardigan-amour', 'spring-cardigan', 'sweater-senda'],
  relatedArticleSlugs: ['primeros-auxilios-prenda-tejida', 'como-cuidar-prendas-de-crochet', 'como-lavar-crochet-a-mano'],
  body: [
    {
      type: 'p',
      text: 'Te pusiste tu prenda tejida favorita diez veces y aparecieron: bolitas chiquitas en las axilas, en los costados, donde roza la cartera. No quiere decir que la prenda sea mala. Es la fibra.',
    },

    { type: 'h2', text: 'Qué son las pelotitas' },
    {
      type: 'p',
      text: 'Cada hilado está hecho de fibras retorcidas. Con el roce, algunas puntas se sueltan de la hebra, se enredan entre sí y forman una bolita que queda agarrada al tejido. Por eso salen siempre en los mismos lugares: donde la prenda roza con algo.',
    },
    {
      type: 'note',
      text: 'Esto es general de cualquier tejido, a mano o de fábrica: pasa en lana, en algodón y en sintéticos.',
    },

    { type: 'h2', text: 'Qué fibras las hacen más' },
    {
      type: 'ul',
      items: [
        '**Fibras cortas y muy suaves.** Cuanto más corta la fibra, más puntas tiene para soltarse. Por eso algunas lanas muy suaves son las que más pelotitas hacen.',
        '**Acrílico común.** Hace pelotitas y, como la fibra sintética es muy resistente, no se caen solas: quedan pegadas al tejido.',
        '**Algodón.** Hace menos, sobre todo si el hilado es firme o mercerizado.',
        '**Acrílico antipilling.** Es acrílico tratado para soltar menos fibra con el roce. El [Cardigan amour](/tienda/cardigan-amour) y el [Spring cardigan](/tienda/spring-cardigan) están tejidos en este material.',
      ],
    },
    {
      type: 'note',
      text: 'Lo de las fibras es conocimiento general del textil. El material de cada prenda de Dahila está en su ficha.',
    },

    { type: 'h2', text: 'Cómo sacarlas sin arruinar la prenda' },
    {
      type: 'steps',
      items: [
        {
          title: 'Apoyá la prenda en plano',
          text: 'Sobre una mesa, sin estirarla. Si el tejido está tenso, cualquier herramienta agarra el punto en vez de la bolita.',
        },
        {
          title: 'Usá un quitapelusas',
          text: 'El quitapelusas eléctrico corta solo lo que sobresale. Pasalo suave y sin apretar, y con cuidado extra en los tejidos calados: el punto abierto se puede enganchar.',
        },
        {
          title: 'Si son pocas, a mano',
          text: 'Con una tijerita, cortando la bolita al ras. Nunca tirando: al tirar sacás fibra de adentro y la zona queda más finita.',
        },
        {
          title: 'Nada de máquina de afeitar',
          text: 'En un tejido con relieve, la hoja corta el punto. En crochet, mejor el quitapelusas o la tijera.',
        },
      ],
    },
    {
      type: 'callout',
      title: 'Lo que no hay que hacer',
      text: 'Tirar de la bolita. Parece lo más rápido, pero arrastra fibra sana y deja la zona más finita, que en la próxima puesta vuelve a hacer pelotitas.',
    },
    {
      type: 'image',
      src: '/photos/blog/spring-cardigan-mangas.jpg',
      alt: 'Spring cardigan tejido a crochet en crudo, con flores tejidas en las mangas',
      width: 1080,
      height: 1440,
      caption: 'El [Spring cardigan](/tienda/spring-cardigan), en acrílico antipilling.',
      href: '/tienda/spring-cardigan',
    },

    { type: 'h2', text: 'Cómo hacer que salgan menos' },
    {
      type: 'ul',
      items: [
        '**Lavá a mano y del revés.** El lavarropas es roce puro. El paso a paso está en [cómo lavar crochet a mano](/blog/como-lavar-crochet-a-mano).',
        '**Ojo con la cartera y la mochila.** La correa que roza siempre en el mismo lugar es la que más pelotitas hace aparecer.',
        '**Alterná.** Una prenda que se usa todos los días junta el roce el doble de rápido.',
        '**Guardala doblada.** Sin apretarla entre prendas ásperas. Más en [cómo guardar prendas tejidas](/blog/como-guardar-prendas-tejidas).',
      ],
    },
    {
      type: 'p',
      text: 'Si pasó algo más grave (se encogió, se estiró o tiene un enganche), está todo en los [primeros auxilios para tu prenda tejida](/blog/primeros-auxilios-prenda-tejida).',
    },

    { type: 'h2', text: 'Preguntas frecuentes' },
    {
      type: 'faq',
      items: [
        {
          q: '¿Las pelotitas quieren decir que la prenda es de mala calidad?',
          a: 'No. Salen en cualquier tejido con el roce. Lo que cambia es cuánto y dónde: depende de la fibra y del uso.',
        },
        {
          q: '¿Se pueden sacar sin dañar el tejido?',
          a: 'Sí, con un quitapelusas pasado suave o cortando las bolitas con tijera, con la prenda apoyada en plano. Nunca tirando.',
        },
        {
          q: '¿Qué material hace menos pelotitas?',
          a: 'El algodón firme o mercerizado y el acrílico antipilling. Las lanas muy suaves son las que más hacen.',
        },
        {
          q: '¿Vuelven a salir?',
          a: 'En las zonas de roce, sí, con el tiempo. Lavado a mano, menos roce y guardado doblado hacen que salgan mucho más despacio.',
        },
      ],
    },
  ],
}
