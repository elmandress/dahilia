import type { Article } from '../types'

export const article: Article = {
  slug: 'primeros-auxilios-prenda-tejida',
  title: 'Se encogió, se estiró o le salieron bolitas: primeros auxilios para tu prenda tejida',
  metaTitle: 'Prenda tejida encogida, estirada o con bolitas: qué hacer',
  description:
    'Qué hacer si una prenda tejida se encogió, se deformó, hizo bolitas, se enganchó o tiene un agujero. Qué tiene arreglo en casa, qué no, y cómo evitar que vuelva a pasar.',
  excerpt:
    'Casi todo lo que le pasa a una prenda tejida tiene arreglo, y casi todo el daño definitivo viene de intentar arreglarlo mal. Esta es la guía para los momentos de "¿y ahora?".',
  cluster: 'cuidados',
  role: 'support',
  funnel: 'TOFU',
  publishedAt: '2026-09-04',
  updatedAt: '2026-09-13',
  hero: { src: '/photos/blog/top-lagom-punto.jpg', alt: 'Top LAGOM tejido a crochet en crudo, visto de espalda, con el punto de cerca', position: '50% 50%' },
  relatedCategorySlug: 'cardigans',
  relatedProductSlugs: ['cardigan-3-4', 'sweater-senda', 'bufanda-sophie'],
  relatedArticleSlugs: [
    'como-cuidar-prendas-de-crochet',
    'como-lavar-crochet-a-mano',
    'como-guardar-prendas-tejidas',
  ],
  body: [
    {
      type: 'p',
      text: 'Una prenda tejida a mano tiene una ventaja enorme sobre la ropa industrial: se puede arreglar punto por punto. Pero también tiene una trampa: los gestos que uno hace por instinto (tirar del hilo suelto, pasar una cuchilla, colgarla para que "estire") suelen ser justo los que la terminan de arruinar.',
    },
    {
      type: 'callout',
      title: 'Antes de hacer nada',
      text: 'No cortes ni tires ningún hilo, no uses calor para "arreglar" la forma y no la cuelgues mojada. Casi todos los daños definitivos salen de alguna de esas tres cosas.',
    },

    { type: 'h2', text: 'Se encogió' },
    {
      type: 'p',
      text: 'El encogimiento no lo causa el agua: lo causa la combinación de **calor, humedad y fricción**. El agua caliente relaja la fibra, que se contrae al enfriarse, y el movimiento termina de apretarla. En algodón la merma típica es de 2 a 5 %, y puede ser mucho mayor si el hilo no venía preencogido. En un top de 90 cm de busto, un 5 % son 4,5 cm: un talle entero.',
    },
    { type: 'h3', text: 'Si tiene arreglo: relajar y volver a estirar' },
    {
      type: 'steps',
      items: [
        {
          title: 'Remojo en frío',
          text: 'Media hora en agua fría con un par de cucharadas de champú de bebé o un poco de acondicionador de pelo. Eso relaja la fibra.',
        },
        {
          title: 'Sacar el agua sin retorcer',
          text: 'Apretando contra una toalla, nunca retorciendo.',
        },
        {
          title: 'Estirar a mano, zona por zona',
          text: 'Sobre una toalla seca, llevá cada parte a su medida con las manos: mangas, cuerpo, borde de abajo, cuello. Si tenés una prenda parecida que te quede bien, usala de referencia.',
        },
        {
          title: 'Repetir mientras seca',
          text: 'Al aire, sin calor directo, volviendo a estirar con suavidad cada 15 o 20 minutos hasta que esté seca del todo.',
        },
      ],
    },
    {
      type: 'callout',
      title: 'Lo que no tiene vuelta',
      text: 'La lana afieltrada. Cuando la lana se lava con calor y fricción, las escamas de la fibra se traban entre sí y el tejido se vuelve compacto y duro. Ese cambio es irreversible: por eso la regla del agua fría es tan estricta con la lana.',
    },

    { type: 'h2', text: 'Se estiró o se deformó' },
    {
      type: 'p',
      text: 'Es lo más común en crochet, sobre todo en algodón y en puntos calados, y tiene arreglo con una técnica que las tejedoras llaman **bloquear**: humedecer la prenda, extenderla en plano y dejar que seque con la forma correcta.',
    },
    {
      type: 'steps',
      items: [
        {
          title: 'Humedecer',
          text: 'Remojo corto en agua fría, 15 a 20 minutos.',
        },
        {
          title: 'Sacar el agua',
          text: 'Enrollada en una toalla, apretando.',
        },
        {
          title: 'Extender y dar forma',
          text: 'Sobre una superficie plana y mullida (una toalla sobre la cama sirve), acomodala a sus medidas con las manos. Si hace falta, fijá los bordes con alfileres.',
        },
        {
          title: 'Dejar secar sin tocar',
          text: 'En horizontal, a la sombra. Así como la dejes, así queda.',
        },
      ],
    },
    {
      type: 'p',
      text: 'Un dato que casi nadie sabe: las prendas **caladas** se van estirando lavado a lavado si no se les devuelve la forma cada vez. Dedicarle dos minutos a acomodarla mientras seca es lo que hace que dure años sin deformarse.',
    },

    { type: 'h2', text: 'Le salieron bolitas' },
    {
      type: 'p',
      text: 'Las bolitas (el *pilling*) no son un defecto de fabricación: son fibras cortas que el roce saca a la superficie y enrolla. Aparecen donde hay fricción (axilas, costados, donde apoya la correa del bolso) y se aceleran con lavados frecuentes o agresivos.',
    },
    {
      type: 'p',
      text: 'Lo que más importa es **cómo** se sacan. Tirarlas con la mano o pasar una cuchilla sin cuidado rompe fibras que sostienen el tejido y lo desgasta más de lo que lo arregla. Lo seguro:',
    },
    {
      type: 'ul',
      items: [
        'Una **máquina quitapelusas** eléctrica, pasada con suavidad.',
        'Una **piedra pómez** o un peine de cardar, con movimientos suaves siguiendo la dirección de la fibra.',
        'Una **tijerita de uñas**, si son pocas y aisladas.',
      ],
    },

    { type: 'h2', text: 'Se enganchó un hilo' },
    {
      type: 'p',
      text: 'La regla de oro: **no se corta y no se tira**. Cortar un hilo enganchado puede abrir la prenda de forma definitiva. Lo correcto es estirar con suavidad la zona alrededor del enganche, con las dos manos, hasta que la hebra suelta vuelva a su lugar. Si quedó un bucle largo, se pasa hacia el revés con una aguja de coser y listo.',
    },

    { type: 'h2', text: 'Se hizo un agujero' },
    {
      type: 'p',
      text: 'Un agujero chico se zurce con hilo del mismo color, cerrando los puntos sueltos antes de que se agrande. Si es más grande, se puede tapar con un parche tejido: en una prenda hecha a mano, eso se lee como reparación y no como remiendo. Lo importante es actuar rápido: un agujero chico en un tejido crece con el uso.',
    },
    {
      type: 'note',
      text: 'Todo lo de esta nota es cuidado textil general, aplicable a cualquier prenda tejida (fuentes: 5àsec, Mapfre, Modare, Hogarmania, StyloCrochet, We Are Knitters, iFixit; consultadas el 04/09/2026). No es un servicio de arreglo de Dahila.',
    },

    { type: 'h2', text: 'Cómo evitar que vuelva a pasar' },
    {
      type: 'ul',
      items: [
        '**Agua fría siempre**, y a la misma temperatura para lavar y enjuagar.',
        '**Sin fricción:** apretar, no frotar ni retorcer.',
        '**Secado en horizontal y a la sombra**, dándole forma con las manos.',
        '**Guardada doblada**, nunca en percha: el peso propio la estira.',
        '**Lavarla solo cuando hace falta:** cada lavado es desgaste.',
      ],
    },
    {
      type: 'p',
      text: 'El paso a paso del lavado está en [cómo lavar una prenda de crochet a mano](/blog/como-lavar-crochet-a-mano), y cómo guardarla en [cómo guardar prendas tejidas](/blog/como-guardar-prendas-tejidas).',
    },

    { type: 'h2', text: 'Preguntas frecuentes' },
    {
      type: 'faq',
      items: [
        {
          q: '¿Una prenda encogida vuelve a su tamaño?',
          a: 'Si fue por relajación de la fibra, en buena parte sí, con remojo en frío y estirándola a mano mientras seca. Si la lana se afieltró (quedó dura y compacta), no: ese cambio es definitivo.',
        },
        {
          q: '¿Puedo planchar una prenda tejida para devolverle la forma?',
          a: 'Mejor no. El calor directo aplasta el relieve del punto y, en fibras sintéticas, puede derretirlas. Para la forma, humedad y secado en plano.',
        },
        {
          q: '¿Las bolitas son señal de mala calidad?',
          a: 'No necesariamente. Aparecen en casi cualquier tejido donde hay roce, incluidas fibras muy buenas. Lo que sí influye es el tipo de fibra: los hilados de fibra larga y los tratados antipilling hacen menos.',
        },
        {
          q: '¿Qué hago si se me mojó con la lluvia?',
          a: 'Nunca la cuelgues mojada: el peso del agua la estira. Sacale el exceso con una toalla, extendela en plano y dale forma, a la sombra y lejos de estufas.',
        },
      ],
    },

    {
      type: 'shopCta',
      title: 'Tejido pensado para durar',
      text: 'Cada prenda sale con sus instrucciones de cuidado, y con esta guía sabés qué hacer si algo pasa.',
      href: '/tienda',
      label: 'Ver la tienda',
    },
  ],
}
