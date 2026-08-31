import type { Article } from '../types'

export const article: Article = {
  slug: 'como-encargar-prenda-a-medida',
  title: 'Cómo encargar una prenda de crochet a medida',
  metaTitle: 'Cómo encargar una prenda de crochet a medida',
  description:
    'Qué información hace falta, cómo se eligen modelo y colores, cuánto puede demorar y qué preguntar antes de confirmar un encargo de crochet a medida.',
  excerpt:
    'Encargar una prenda tejida para vos es más simple de lo que parece. Lo que sí conviene es llegar con la información ordenada.',
  cluster: 'a-medida',
  role: 'pillar',
  funnel: 'BOFU',
  publishedAt: '2026-08-31',
  hero: {
    src: '/photos/atelier-escritorio.png',
    alt: 'Mesa de trabajo del taller donde se tejen las prendas de Dahila',
  },
  relatedCategorySlug: 'cardigans',
  relatedProductSlugs: ['cardigan-3-4', 'set-brisa', 'top-lagom'],
  relatedArticleSlugs: ['comprar-crochet-en-uruguay', 'cuanto-cuesta-una-prenda-tejida-a-mano'],
  body: [
    {
      type: 'p',
      text: 'Una prenda a medida no es un servicio de lujo ni algo reservado para ocasiones especiales: en un taller que teje a mano, es simplemente la forma natural de trabajar. La prenda se empieza cuando vos la pedís, así que hacerla con tus medidas y tus colores no cambia el proceso.',
    },
    {
      type: 'p',
      text: 'Lo que sí ayuda es llegar con la información ordenada. Con esto alcanza.',
    },

    { type: 'h2', text: 'Qué necesitás tener a mano' },
    {
      type: 'ul',
      items: [
        '**Qué prenda querés.** Un cardigan, un top, un set, o algo distinto. No hace falta que tengas el modelo exacto: alcanza con la idea.',
        '**Una referencia visual.** Una foto de algo parecido, una captura, o una prenda tuya que te guste cómo te queda. Es lo que más rápido pone a las dos en la misma página.',
        '**Tu talle aproximado**, y mejor todavía, medidas reales en centímetros.',
        '**Para cuándo la querés.** Si hay una fecha (un viaje, un cumpleaños), decila desde el principio.',
        '**Colores o clima de color** que te gusten. Después se afina sobre las lanas que haya de verdad.',
      ],
    },
    {
      type: 'callout',
      title: 'La medida que más sirve',
      text: 'No te midas el cuerpo: medí una prenda tuya que te quede como querés, apoyada en plano y sin estirar. Ancho de pecho de costura a costura, largo total y largo de manga. Esos tres números valen más que cualquier talle de etiqueta.',
    },

    { type: 'h2', text: 'Cómo es el proceso' },
    {
      type: 'steps',
      items: [
        {
          title: 'Contás qué tenés en mente',
          text: 'Desde la sección [A medida](/encargo) o directamente por WhatsApp. En el formulario te preguntamos qué querés tejer, tu talle aproximado y los detalles de la prenda: para qué la querés, qué colores te gustan, en qué lana.',
        },
        {
          title: 'Te respondemos con opciones y presupuesto',
          text: 'Modelo, materiales y precio. Sin compromiso: es una propuesta, no una compra. Si algo no cierra, se ajusta.',
        },
        {
          title: 'Elegís los colores sobre lana real',
          text: 'Recién después de confirmar el modelo te mostramos las lanas que hay de verdad. Elegir sobre una pantalla es engañoso: el color de una foto casi nunca es el color del ovillo.',
        },
        {
          title: 'Se teje tu prenda',
          text: 'Cuando confirmás, empezamos. Te avisamos cuando arrancamos y cuando está lista.',
        },
        {
          title: 'Coordinamos entrega y pago',
          text: 'Por WhatsApp, igual que el resto. Hacemos envíos a todo Uruguay; al exterior, bajo consulta.',
        },
      ],
    },

    { type: 'h2', text: 'Cuánto demora' },
    {
      type: 'p',
      text: 'Depende del modelo: no es lo mismo una bufanda que un cardigan de veinte horas de tejido, y también influye cuántos encargos haya en cola en ese momento. Por eso el plazo se acuerda al principio, cuando te pasamos la propuesta, y no después.',
    },
    {
      type: 'p',
      text: 'Si tenés una fecha, decila en el primer mensaje. Es la información que más cambia la respuesta.',
    },

    { type: 'h2', text: 'Lo que conviene saber antes de confirmar' },
    {
      type: 'p',
      text: 'Una prenda a medida se teje para vos, así que **no hacemos cambios por talle**. No es una letra chica: es la consecuencia lógica de que la pieza exista porque vos la pediste. Por eso insistimos tanto con las medidas al principio y por eso te acompañamos durante todo el proceso, para que no haya sorpresas al final. Las condiciones completas están en [Información](/info).',
    },
    {
      type: 'quote',
      text: 'Media hora extra hablando de medidas al principio evita el único problema que no tiene arreglo al final.',
    },

    { type: 'h2', text: '¿Conviene a medida o comprar algo ya tejido?' },
    {
      type: 'p',
      text: 'Si lo que viste en la [tienda](/tienda) te sirve tal cual y hay stock, comprarlo es más rápido y más simple. El encargo a medida tiene sentido cuando:',
    },
    {
      type: 'ul',
      items: [
        'Ninguna medida estándar te queda bien.',
        'Querés un color que no está en la foto.',
        'Tenés en mente un modelo que no está en la tienda.',
        'Es un regalo y querés que sea específicamente para esa persona.',
      ],
    },

    { type: 'h2', text: 'Preguntas frecuentes' },
    {
      type: 'faq',
      items: [
        {
          q: '¿Tengo que pagar algo para pedir el presupuesto?',
          a: 'No. Contás qué tenés en mente y recibís opciones de modelo, materiales y presupuesto sin compromiso. Recién si confirmás, se empieza a tejer.',
        },
        {
          q: '¿Puedo mandar una foto de lo que quiero?',
          a: 'Sí, y es lo más útil que podés hacer. Una imagen de referencia acorta muchísimo la conversación.',
        },
        {
          q: '¿Puedo elegir la lana?',
          a: 'Elegís sobre las lanas que haya disponibles en ese momento, que te mostramos después de confirmar el modelo.',
        },
        {
          q: '¿Hacen encargos para enviar al exterior?',
          a: 'Bajo consulta. Escribinos y vemos costos y plazos según el destino.',
        },
        {
          q: '¿Me avisan cómo va?',
          a: 'Sí. Te avisamos cuando empezamos y cuando está lista. Si dejás tu mail en el formulario, te llegan también los cambios de estado del encargo.',
        },
      ],
    },

    {
      type: 'shopCta',
      title: 'Contanos qué tenés en mente',
      text: 'Sin compromiso: nos contás la idea y te respondemos con opciones, materiales y presupuesto.',
      href: '/encargo',
      label: 'Pedir a medida',
    },
  ],
}
