import type { Article } from '../types'

export const article: Article = {
  slug: 'holgura-prenda-tejida',
  title: 'La holgura: cuánto más grande que vos tiene que ser una prenda tejida',
  metaTitle: 'Holgura en prendas tejidas: cuánto más grande elegir',
  description:
    'Tenés tus medidas, pero la prenda no mide lo mismo que tu cuerpo. Cuánta holgura conviene para un calce ajustado, cómodo u oversize, y las dos medidas que casi nadie mira.',
  excerpt:
    'Medirte es el primer paso. El segundo, que casi nadie explica, es decidir cuánto más grande que tu cuerpo tiene que ser la prenda para que caiga como querés.',
  cluster: 'comprar',
  role: 'support',
  funnel: 'BOFU',
  publishedAt: '2026-09-04',
  hero: { src: '/photos/top-lace-parque.jpg', alt: 'Top tejido a crochet puesto, con caída suelta' },
  relatedCategorySlug: 'cardigans',
  relatedProductSlugs: ['cardigan-3-4', 'sweater-senda', 'top-summer'],
  relatedArticleSlugs: [
    'que-talle-de-prenda-tejida-me-queda',
    'cardigan-de-crochet-como-elegirlo',
    'materiales-de-una-prenda-tejida',
  ],
  body: [
    {
      type: 'p',
      text: 'Con la cinta métrica sabés cuánto medís. Lo que la cinta no te dice es cuánto tiene que medir la prenda. Ese hueco —entre la medida de tu cuerpo y la de la prenda— se llama holgura, y es lo que decide si algo te queda ajustado, cómodo o suelto.',
    },
    {
      type: 'callout',
      title: 'La versión corta',
      text: 'Unos 5 cm más que tu medida de busto dan un calce cómodo. 10 cm o más, un calce relajado u oversize. Cero, o incluso menos, un calce al cuerpo — y eso solo funciona en puntos que estiran. Y además del busto, mirá el largo total y el contorno de brazo, que son las dos medidas que más fallan.',
    },

    { type: 'h2', text: 'Qué es la holgura' },
    {
      type: 'p',
      text: 'Es la diferencia entre el contorno de tu cuerpo y el contorno de la prenda terminada, medidos en el mismo lugar. Si tu busto mide 90 cm y el top terminado mide 95 cm de contorno, tiene 5 cm de holgura. Si mide 90, tiene cero. Si mide 86, tiene holgura negativa: la prenda estira para entrar.',
    },
    {
      type: 'p',
      text: 'Por eso el nombre del talle dice poco. Dos prendas "M" pueden tener holguras muy distintas según cómo están pensadas: un top al cuerpo y un cardigan oversize parten del mismo cuerpo y terminan con anchos que no se parecen en nada.',
    },

    { type: 'h2', text: 'Cuánta holgura para cada calce' },
    {
      type: 'ul',
      items: [
        '**Al cuerpo (0 cm o negativa):** la prenda mide lo mismo que vos, o menos. Solo funciona con puntos elásticos; en un punto firme o calado, un calce en cero queda tirante y marca.',
        '**Cómodo (alrededor de 5 cm):** el calce de una prenda que se usa todo el día. Se mueve con vos sin quedar suelta.',
        '**Relajado u oversize (10 cm o más):** la caída suelta, a propósito. Es el calce de un cardigan largo o un sweater amplio.',
      ],
    },
    {
      type: 'note',
      text: 'Estos rangos son las referencias que se usan habitualmente en tejido (fuente: I Like Crochet, "Making it fit", consultada el 04/09/2026). Son un punto de partida, no una regla fija: cada modelo tiene su calce pensado.',
    },

    { type: 'h2', text: 'Las dos medidas que casi nadie mira' },
    {
      type: 'p',
      text: 'Todo el mundo se fija en el busto. Pero en la práctica, las prendas que "no quedan bien" suelen fallar por otro lado:',
    },
    {
      type: 'steps',
      items: [
        {
          title: 'El largo total',
          text: 'Desde el hombro hasta el borde de abajo. Un top que te queda perfecto de ancho pero corta justo donde no querés se siente como un talle equivocado, aunque el talle esté bien.',
        },
        {
          title: 'El contorno de brazo',
          text: 'Alrededor de la parte más ancha del brazo, arriba del codo. Una manga angosta es incómoda aunque el cuerpo de la prenda te quede holgado, y es de lo primero que se nota al moverte.',
        },
      ],
    },

    { type: 'h2', text: 'El peso del tejido también cuenta' },
    {
      type: 'p',
      text: 'Una prenda tejida pesa, y ese peso tira hacia abajo. Por eso una pieza guardada en percha se va alargando sola con el tiempo, y por eso las prendas tejidas se guardan dobladas. Cuánto cede depende del hilo y del punto:',
    },
    {
      type: 'ul',
      items: [
        '**La fibra:** la lana es elástica y tiene "memoria" — cede y vuelve. El algodón es poco elástico y no tiene esa memoria: no estira cuando lo tirás, pero con el peso y el uso puede alargarse de a poco y no vuelve solo.',
        '**El punto:** un punto calado o abierto cede más que uno cerrado.',
        '**La técnica:** a igual hilo, el crochet cede menos que el tejido de dos agujas, porque cada punto es un nudo cerrado y no un bucle abierto.',
      ],
    },
    {
      type: 'p',
      text: 'La consecuencia práctica: en una prenda de algodón calado conviene no pasarse de holgura, porque con el uso va a ganar un poco de largo, no a achicarse.',
    },
    {
      type: 'note',
      text: 'El comportamiento de las fibras es información textil general (fuente: The Blue Star Boutique, "Fighting the growth in your crochet garments", consultada el 04/09/2026). El material de cada prenda de Dahila está en su ficha.',
    },

    { type: 'h2', text: 'Cómo usar esto para elegir' },
    {
      type: 'steps',
      items: [
        {
          title: 'Medite',
          text: 'Busto, cintura, cadera — el paso a paso está en [qué talle de prenda tejida me queda](/blog/que-talle-de-prenda-tejida-me-queda).',
        },
        {
          title: 'Decidí el calce',
          text: 'Al cuerpo, cómodo u oversize. Si dudás, cómodo: es el que menos falla.',
        },
        {
          title: 'Sumá la holgura a tu medida',
          text: 'Esa es la medida que tendría que tener la prenda terminada. Si una prenda tuya ya te queda como querés, medila a lo ancho, apoyada y sin estirar: es la referencia más precisa que existe.',
        },
        {
          title: 'Mandá los números',
          text: 'Con las medidas y el calce que buscás, una prenda que se teje después del pedido se puede hacer con exactamente ese ancho y ese largo.',
        },
      ],
    },

    { type: 'h2', text: 'Preguntas frecuentes' },
    {
      type: 'faq',
      items: [
        {
          q: '¿Oversize es lo mismo que pedir un talle más grande?',
          a: 'No. Un talle más grande agranda todo en proporción: hombros que se caen, mangas que sobran. Una prenda pensada oversize tiene holgura en el cuerpo pero hombros y mangas a tu medida. Por eso, si querés ese calce, conviene decirlo al pedir.',
        },
        {
          q: '¿Cuánta holgura tiene un cardigan?',
          a: 'Más que un top, porque va encima de otra ropa y no cierra sobre el cuerpo. Lo habitual es entre cómodo y relajado. En un cardigan, pasarse un poco de holgura casi nunca se nota como error.',
        },
        {
          q: '¿Y si mis medidas no coinciden con la tabla?',
          a: 'Para eso sirve pensar en holgura en vez de en talles: con tu medida y el calce que querés, la prenda se puede tejer con el ancho exacto, sin pasar por la tabla.',
        },
        {
          q: '¿Por qué mi prenda de algodón quedó más larga con el tiempo?',
          a: 'Por el peso: el algodón no tiene la elasticidad de la lana y no recupera solo. Guardala doblada y, al lavarla, dale forma con las manos mientras seca en horizontal.',
        },
      ],
    },

    {
      type: 'shopCta',
      title: 'Con tus medidas, no con una tabla',
      text: 'Contanos tus medidas y el calce que buscás, y la prenda se teje con ese ancho y ese largo.',
      href: '/encargo',
      label: 'Pedir a medida',
    },
  ],
}
