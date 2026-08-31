import type { Article } from '../types'

export const article: Article = {
  slug: 'como-guardar-prendas-tejidas',
  title: 'Cómo guardar prendas tejidas sin que se deformen',
  metaTitle: 'Cómo guardar prendas tejidas (y que no se estiren)',
  description:
    'Dobladas y no colgadas, con la fibra respirando y sin polillas: cómo guardar prendas de crochet y lana en el placard y entre temporadas.',
  excerpt:
    'La percha es la enemiga silenciosa de una prenda tejida. Cómo guardarla en el día a día y cómo dejarla lista para la próxima temporada.',
  cluster: 'cuidados',
  role: 'support',
  funnel: 'TOFU',
  publishedAt: '2026-08-31',
  hero: {
    src: '/photos/bufanda-verde.png',
    alt: 'Bufanda verde tejida a mano a crochet, doblada',
  },
  relatedCategorySlug: 'accesorios',
  relatedProductSlugs: ['bufanda-sophie', 'calentadores'],
  relatedArticleSlugs: ['como-cuidar-prendas-de-crochet', 'como-lavar-crochet-a-mano'],
  body: [
    {
      type: 'p',
      text: 'Hay un daño que no se ve venir: la prenda no se rompe, no se mancha, no destiñe. Simplemente, después de unos meses, los hombros quedaron caídos y el largo creció. Casi siempre es la percha.',
    },

    { type: 'h2', text: 'Doblada, siempre' },
    {
      type: 'p',
      text: 'Una prenda tejida colgada sostiene todo su peso desde dos puntos: los hombros. El punto de crochet cede de a poco y esa deformación se fija. Doblada en un estante o en un cajón, el peso se reparte y el tejido no trabaja.',
    },
    {
      type: 'ul',
      items: [
        'Doblá por las costuras naturales: mangas hacia adentro y después a la mitad.',
        'No apiles más de tres o cuatro prendas pesadas: el peso de arriba aplasta el relieve del punto de abajo.',
        'Si tenés poco espacio y necesitás colgar algo, que sean las piezas livianas (una bandana, un top finito), nunca un cardigan o un sweater.',
      ],
    },
    {
      type: 'callout',
      title: 'El truco de la percha',
      text: 'Si no te queda otra que colgar un cardigan, doblalo por la mitad a lo ancho y pasá la percha por el pliegue, no por los hombros. El peso queda repartido en la cintura y no estira nada.',
    },

    { type: 'h2', text: 'Guardado entre temporadas' },
    {
      type: 'steps',
      items: [
        {
          title: 'Guardala limpia',
          text: 'Aunque no se vea sucia. Restos de transpiración o comida son lo que atrae a las polillas, y en varios meses guardada tienen tiempo de sobra.',
        },
        {
          title: 'Asegurate de que esté seca del todo',
          text: 'Una prenda apenas húmeda guardada meses termina con olor y manchas de humedad. Si la lavaste, dale un día más de aire antes de guardarla.',
        },
        {
          title: 'Usá tela, no plástico',
          text: 'Una bolsa de algodón o una funda de tela deja respirar la fibra. La bolsa hermética de plástico encierra humedad y le saca el aire al tejido.',
        },
        {
          title: 'Sumá un repelente natural',
          text: 'Lavanda o cedro en el cajón funcionan y no dejan olor químico en la prenda. Renovalos cada temporada, porque pierden efecto.',
        },
      ],
    },

    { type: 'h2', text: 'Cuando la sacás de nuevo' },
    {
      type: 'p',
      text: 'Después de meses guardada, una prenda tejida suele salir con marcas de pliegue y algo aplastada. No la planches. Extendela en plano unas horas y las marcas se van solas; si quedó muy marcada, un poco de vapor a distancia (sin apoyar la plancha) ayuda a que el punto recupere volumen.',
    },
    {
      type: 'note',
      text: 'Los consejos de esta nota son cuidado textil general para tejidos a mano. Las instrucciones específicas que Dahila entrega con cada prenda están en [Información](/info) y en la [guía de cuidado](/blog/como-cuidar-prendas-de-crochet).',
    },

    { type: 'h2', text: 'Preguntas frecuentes' },
    {
      type: 'faq',
      items: [
        {
          q: '¿Se pueden guardar al vacío?',
          a: 'No es lo ideal. La bolsa al vacío comprime el punto y le saca el aire que le da el volumen; algunas prendas no lo recuperan del todo. Si es tu única opción por espacio, no las dejes comprimidas más de una temporada.',
        },
        {
          q: '¿Las naftalinas sirven?',
          a: 'Funcionan pero dejan un olor muy difícil de sacar de la fibra natural. La lavanda y el cedro son más amables con una prenda que después te vas a poner.',
        },
        {
          q: '¿Qué hago si aparecieron agujeritos?',
          a: 'Suele ser polilla. Sacá la prenda del placard, revisá el resto, lavala y ventilá bien el espacio. Un agujero chico en un tejido a mano se puede zurcir con hilo del mismo color sin que se note.',
        },
      ],
    },

    {
      type: 'shopCta',
      title: 'Accesorios tejidos a mano',
      text: 'Bufandas, bandanas, calentadores y bolsos tejidos uno por uno en Montevideo.',
      href: '/tienda/accesorios',
      label: 'Ver accesorios',
    },
  ],
}
