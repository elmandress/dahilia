import type { Article } from '../types'

export const article: Article = {
  slug: 'entretiempo-uruguay-prendas-tejidas',
  title: 'En Uruguay hay más entretiempo que invierno: qué prenda tejida usar en cada época',
  metaTitle: 'Prendas tejidas para el entretiempo en Uruguay',
  description:
    'Con datos del clima de Montevideo: cuánto dura de verdad cada estación, por qué el entretiempo ocupa casi medio año y qué prenda tejida conviene en cada momento.',
  excerpt:
    'El invierno de verdad dura unos tres meses. El entretiempo, casi seis. Y eso cambia bastante qué prenda tejida tiene sentido comprar y cuánto la vas a usar.',
  cluster: 'comprar',
  role: 'support',
  funnel: 'MOFU',
  publishedAt: '2026-09-04',
  hero: { src: '/photos/blog/cardigan-cruzado-camel.jpg', alt: 'Cardigan cruzado tejido a crochet en color camel, puesto', position: '50% 35%' },
  relatedCategorySlug: 'cardigans',
  relatedProductSlugs: ['cardigan-3-4', 'poncho', 'chaleco'],
  relatedArticleSlugs: [
    'cardigan-de-crochet-como-elegirlo',
    'tops-de-crochet-para-verano',
    'materiales-de-una-prenda-tejida',
  ],
  body: [
    {
      type: 'p',
      text: 'Pensamos la ropa en dos temporadas: verano e invierno. Pero si mirás los datos del clima de Montevideo, el año se parte distinto, y la mayor parte del tiempo no es ni una cosa ni la otra.',
    },
    {
      type: 'callout',
      title: 'La versión corta',
      text: 'El frío de verdad va de fines de mayo a fines de agosto, unos tres meses. El calor, de principios de diciembre a mediados de marzo. El resto, casi seis meses, es entretiempo. Y el tejido calado, que abriga por capas y no por espesor, es justamente ropa de entretiempo.',
    },

    { type: 'h2', text: 'Cuánto dura cada estación en Montevideo' },
    {
      type: 'ul',
      items: [
        '**Estación cálida:** del 3 de diciembre al 19 de marzo, con máximas por encima de 24 °C. En enero, la máxima media ronda los 27 °C y la mínima los 18 °C.',
        '**Estación fría:** del 27 de mayo al 26 de agosto, con máximas por debajo de 17 °C. En julio, la máxima media ronda los 14 °C y la mínima los 7 °C.',
        '**Entretiempo:** todo lo demás. Del 20 de marzo al 26 de mayo, y del 27 de agosto al 2 de diciembre. Casi seis meses del año.',
      ],
    },
    {
      type: 'note',
      text: 'Datos climáticos promedio de Montevideo (fuentes: Weather Spark y las tablas estadísticas de INUMET, consultadas el 04/09/2026). Son promedios: un año puntual puede correrse de fechas.',
    },

    { type: 'h2', text: 'Por qué el tejido es ropa de entretiempo' },
    {
      type: 'p',
      text: 'Lo que abriga no es la tela: es el aire quieto que la tela atrapa contra el cuerpo. Un tejido cerrado y grueso atrapa mucho aire y abriga como un abrigo. Un tejido calado deja pasar parte del aire: abriga poco solo, pero mucho sobre otra prenda.',
    },
    {
      type: 'p',
      text: 'Esa es la clave del entretiempo: días que arrancan frescos, se calientan al mediodía y vuelven a refrescar a la tarde. Una prenda que se pone y se saca, que abriga en capas y no te cocina al sol, es exactamente lo que ese clima pide. Por eso un cardigan o un chaleco tejido se usan medio año, no una temporada.',
    },

    { type: 'h2', text: 'Qué prenda conviene en cada época' },
    { type: 'h3', text: 'Verano (diciembre a marzo)' },
    {
      type: 'p',
      text: 'Tops y sets de algodón con punto abierto, bolsos de playa. El algodón absorbe la humedad y la suelta, que es lo que importa en un verano húmedo: en enero hay más de doce días bochornosos en promedio. El detalle está en [tops de crochet para verano](/blog/tops-de-crochet-para-verano).',
    },
    { type: 'h3', text: 'Entretiempo (marzo a mayo y septiembre a noviembre)' },
    {
      type: 'p',
      text: 'La época del cardigan, el chaleco y el poncho. Sobre una remera o una camisa a la mañana, en la mano al mediodía, otra vez puesto a la tarde. Es donde el tejido a mano rinde más usos por prenda.',
    },
    { type: 'h3', text: 'Invierno (junio a agosto)' },
    {
      type: 'p',
      text: 'Sweaters de lana o mezclas con lana, bufandas y calentadores. Acá sí importa el espesor y la fibra: la lana abriga mucho más que el algodón para el mismo grosor.',
    },

    {
      type: 'image',
      src: '/photos/blog/poncho-azul.jpg',
      alt: 'Poncho tejido a crochet en azul marino, sobre una musculosa blanca',
      width: 1080,
      height: 1440,
      caption: 'El [poncho](/tienda/poncho), tejido en algodón, sobre una musculosa.',
      href: '/tienda/poncho',
    },

    { type: 'h2', text: 'Cuántas veces vas a usar una prenda de entretiempo' },
    {
      type: 'p',
      text: 'Es la cuenta que conviene hacer antes de comprar cualquier prenda: no cuánto cuesta, sino cuánto cuesta cada vez que la usás. Una prenda que sirve para casi seis meses del año se usa muchas más veces que una que solo sirve para las pocas semanas más frías o más calurosas.',
    },
    {
      type: 'p',
      text: 'Por eso, si vas a elegir una sola prenda tejida, conviene que sea de entretiempo: un cardigan liviano o un chaleco. Es la que más se va a usar en este clima.',
    },

    { type: 'h2', text: 'Llueve todos los meses' },
    {
      type: 'p',
      text: 'El otro dato que ordena todo: en Montevideo no hay estación seca. Llueve todos los meses del año, entre unos 70 mm en julio y más de 100 mm en abril. Que una prenda tejida se moje no es un accidente raro: es parte del uso normal.',
    },
    {
      type: 'ul',
      items: [
        '**Nunca la cuelgues mojada:** el peso del agua la estira y deforma hombros y mangas.',
        '**Sacale el agua con una toalla**, sin retorcer, y secala en plano.',
        '**Siempre a la sombra:** el sol destiñe las fibras naturales. Si no queda otra, dala vuelta del revés.',
        '**Si quedó olor a humedad**, media hora en agua con un chorro de vinagre blanco y un enjuague lo neutralizan.',
      ],
    },
    {
      type: 'note',
      text: 'Los consejos de secado y olor son cuidado textil general (fuentes: Ohlalá, Para Ti y Ámbito, consultadas el 04/09/2026). Si algo más le pasó a la prenda, está todo en [primeros auxilios para tu prenda tejida](/blog/primeros-auxilios-prenda-tejida).',
    },

    { type: 'h2', text: 'Preguntas frecuentes' },
    {
      type: 'faq',
      items: [
        {
          q: '¿Un cardigan de crochet sirve para el invierno?',
          a: 'Solo, en los días más fríos, un cardigan calado se queda corto. Sobre un buzo o una remera térmica, sí. Donde de verdad rinde es en el entretiempo, que en Uruguay es casi medio año.',
        },
        {
          q: '¿Qué fibra conviene para entretiempo?',
          a: 'Algodón para los días templados, porque ventila; lana o mezcla con lana para las mañanas y noches más frescas. Si tenés que elegir una sola, algodón en un punto no demasiado abierto.',
        },
        {
          q: '¿Cuándo conviene encargar una prenda para una estación?',
          a: 'Con anticipación: se teje después del pedido y el plazo depende de la cola. Pedir el cardigan cuando ya empezó el frío suele significar recibirlo con el frío avanzado.',
        },
        {
          q: '¿Puedo tender una prenda tejida al sol?',
          a: 'Mejor no. El sol destiñe las fibras naturales y, combinado con el peso del agua si está colgada, la deforma. A la sombra y en plano.',
        },
      ],
    },

    {
      type: 'shopCta',
      title: 'Para medio año de uso',
      text: 'Cardigans, chalecos y ponchos tejidos a mano: las prendas que más se usan en el clima de acá.',
      href: '/tienda/cardigans',
      label: 'Ver los cardigans',
    },
  ],
}
