import type { Article } from '../types'

export const article: Article = {
  slug: 'cuanto-demora-una-prenda-tejida-a-mano',
  title: 'Cuánto demora una prenda tejida a mano (y por qué)',
  metaTitle: 'Cuánto demora tejer una prenda a mano a crochet',
  description:
    'Cuántas horas lleva tejer a crochet un top, un cardigan o un bolso, cuánto se tarda desde que hacés el pedido hasta que llega, y qué hace que una pieza demore más que otra.',
  excerpt:
    'Un bolso chico son unas cinco horas de trabajo. Un cardigan pasa las veinte. Acá está el detalle de por qué una prenda tejida a mano tarda lo que tarda.',
  cluster: 'a-medida',
  role: 'support',
  funnel: 'BOFU',
  publishedAt: '2026-09-04',
  hero: { src: '/photos/atelier-tejiendo.jpg', alt: 'Manos tejiendo a crochet en el taller' },
  relatedCategorySlug: 'cardigans',
  relatedProductSlugs: ['cardigan-3-4', 'bolso-lola', 'top-summer'],
  relatedArticleSlugs: ['como-encargar-prenda-a-medida', 'cuanto-cuesta-una-prenda-tejida-a-mano'],
  body: [
    {
      type: 'p',
      text: 'Cuando alguien pregunta "¿para cuándo lo tenés?", en general está preguntando dos cosas distintas: cuántas horas de trabajo lleva la pieza, y en cuánto tiempo le va a llegar. No son lo mismo, y conviene separarlas.',
    },
    {
      type: 'callout',
      title: 'La versión corta',
      text: 'Las horas de tejido de una pieza van de unas 3 para un accesorio chico a más de 20 para un cardigan. El plazo de entrega es otra cosa: depende de cuántos pedidos hay antes del tuyo. El plazo actualizado de cada pieza está siempre en su ficha de producto.',
    },

    { type: 'h2', text: 'Las horas de tejido, por tipo de pieza' },
    {
      type: 'p',
      text: 'Estos son los tiempos aproximados de trabajo real que lleva cada familia de prenda. Son horas de tejido efectivo: no incluyen el diseño, las pruebas de punto ni el armado final.',
    },
    {
      type: 'ul',
      items: [
        '**Accesorios chicos** (bandana, mini bufanda): entre 3 y 5 horas.',
        '**Bufandas y calentadores:** alrededor de 5 horas.',
        '**Bolsos:** de 5 a 10 horas según el tamaño y el punto.',
        '**Tops:** entre 11 y 16 horas, según el largo y el calado.',
        '**Sets de varias piezas:** entre 16 y 20 horas.',
        '**Poncho:** cerca de 19 horas.',
        '**Cardigans:** más de 20 horas.',
      ],
    },
    {
      type: 'note',
      text: 'Son los tiempos estimados que usa el taller para planificar la producción, no una medición cronometrada pieza por pieza. Varían con el punto, el grosor de la lana y el talle: un mismo modelo en XL lleva más horas que en S.',
    },

    { type: 'h2', text: 'Por qué un cardigan lleva cuatro veces más que un bolso' },
    {
      type: 'p',
      text: 'No es solo tamaño. En un bolso, el tejido es parejo y repetitivo: una vez que arrancó, avanza. Una prenda que se usa sobre el cuerpo tiene que resolver además la forma — sisas, escote, hombros, mangas — y cada una de esas partes se teje contando puntos, se prueba, y a veces se destejé y se rehace.',
    },
    {
      type: 'p',
      text: 'A eso se suma que en una prenda grande cualquier error se paga caro: un aumento de más en la línea 40 se nota recién en la 60, y para arreglarlo hay que volver. Por eso las piezas de más horas no son las más grandes, sino las que más forma tienen.',
    },

    { type: 'h2', text: 'Horas de trabajo no es lo mismo que plazo de entrega' },
    {
      type: 'p',
      text: 'Veinte horas de tejido no son veinte horas de reloj. Nadie teje veinte horas seguidas: se teje en tandas, y además hay otras piezas en producción antes que la tuya. El plazo real de entrega es entonces la suma de tres cosas:',
    },
    {
      type: 'steps',
      items: [
        {
          title: 'La cola de pedidos',
          text: 'Cuántas piezas hay pedidas antes de la tuya. Es lo que más varía a lo largo del año: en temporada de regalos se estira, en meses tranquilos casi no existe.',
        },
        {
          title: 'Las horas de la pieza',
          text: 'Las de la lista de más arriba. Un accesorio entra en un hueco de la semana; un cardigan necesita que se le reserve tiempo.',
        },
        {
          title: 'El envío',
          text: 'Una vez terminada y revisada, se despacha. Ese tramo se coordina por WhatsApp según a dónde va.',
        },
      ],
    },
    {
      type: 'callout',
      title: 'Dónde ver el plazo real',
      text: 'Cada ficha de producto muestra el plazo vigente de esa pieza, y se actualiza según cómo viene la producción. Es el número que manda: esta nota explica de dónde sale, la ficha te dice cuánto es hoy.',
    },

    { type: 'h2', text: 'Qué hace que una pieza demore más de lo previsto' },
    {
      type: 'ul',
      items: [
        '**Un color que hay que conseguir.** Si la lana del color que elegiste no está en el taller, primero hay que comprarla.',
        '**Medidas fuera de tabla.** Un ajuste a medida puede sumar una prueba intermedia antes de seguir.',
        '**Punto calado o multicolor.** Los puntos que cambian de color o llevan calados avanzan bastante más lento que un punto parejo.',
        '**Temporada.** Noviembre y diciembre son los meses de más pedidos del año; mayo también, por el Día de la Madre.',
      ],
    },

    { type: 'h2', text: 'Si tenés una fecha límite' },
    {
      type: 'p',
      text: 'Decila desde el primer mensaje, no al final. Con la fecha sobre la mesa se puede saber de entrada si entra o no, y si no entra, proponer algo que sí: otra pieza de menos horas, o el mismo modelo en una versión más simple.',
    },
    {
      type: 'p',
      text: 'Es la diferencia entre una expectativa acordada y una decepción evitable: casi todos los problemas de plazo salen de una fecha que nunca se dijo en voz alta.',
    },

    { type: 'h2', text: 'Preguntas frecuentes' },
    {
      type: 'faq',
      items: [
        {
          q: '¿Puedo apurar un pedido?',
          a: 'A veces sí, dependiendo de cómo venga la cola y de qué pieza sea. Preguntá con la fecha concreta que necesitás y te decimos si entra.',
        },
        {
          q: '¿Me avisan mientras se teje?',
          a: 'Sí. Los encargos tienen un código de seguimiento y se avisa en cada cambio de estado; además siempre podés escribir por WhatsApp y preguntar cómo viene.',
        },
        {
          q: '¿Por qué dos prendas parecidas tienen plazos distintos?',
          a: 'Porque el plazo depende de la cola del momento y del punto de cada modelo. Un top de punto parejo y otro con calado se ven parecidos y llevan horas muy distintas.',
        },
        {
          q: '¿El plazo cuenta desde que pago o desde que escribo?',
          a: 'Desde que el pedido queda confirmado con todos los detalles definidos (modelo, talle, color). Mientras se están definiendo cosas, la pieza todavía no entró a la cola.',
        },
        {
          q: '¿Tienen algo listo para llevar ya?',
          a: 'A veces sí. Las piezas que ya están tejidas aparecen marcadas como disponibles sin espera en la tienda — son las que salen más rápido porque no hay que tejerlas.',
        },
      ],
    },

    {
      type: 'p',
      text: 'Si lo que querés es una pieza hecha con tus medidas y tus colores, el paso a paso está en [cómo encargar una prenda a medida](/blog/como-encargar-prenda-a-medida). Y si te interesa entender de dónde sale el precio de algo que lleva estas horas, está explicado en [cuánto cuesta una prenda tejida a mano](/blog/cuanto-cuesta-una-prenda-tejida-a-mano).',
    },

    {
      type: 'shopCta',
      title: '¿Tenés una fecha en mente?',
      text: 'Contanos qué querés y para cuándo, y te decimos si llegamos antes de que encargues.',
      href: '/encargo',
      label: 'Consultar un encargo',
    },
  ],
}
