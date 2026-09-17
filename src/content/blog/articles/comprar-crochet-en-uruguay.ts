import type { Article } from '../types'

export const article: Article = {
  slug: 'comprar-crochet-en-uruguay',
  title: 'Comprar crochet en Uruguay: cómo elegir bien (y qué mirar antes)',
  // 13/09/2026: 46 impresiones, 4,3% de CTR, posición 7,2. La búsqueda que la
  // trae es "crochet uruguay": el título ahora arranca con esas palabras.
  // Medir el 11/10.
  metaTitle: 'Crochet en Uruguay: dónde comprar y qué mirar antes',
  description:
    'Dónde y cómo comprar prendas de crochet hechas a mano en Uruguay: qué mirar antes de pagar, cómo reconocer trabajo bien hecho y qué preguntar sobre talles y plazos.',
  excerpt:
    'Entre marketplaces, ferias y talleres chicos, comprar tejido a mano en Uruguay tiene sus reglas. Qué mirar en una foto, qué preguntar y cómo no equivocarte con el talle.',
  cluster: 'comprar',
  role: 'pillar',
  funnel: 'BOFU',
  publishedAt: '2026-08-31',
  updatedAt: '2026-09-13',
  hero: {
    src: '/photos/blog/cardigan-granny-crochet.jpg',
    alt: 'Granny’s cardigan tejido a crochet con cuadrados en rosa, bordó y crudo',
    position: '50% 30%',
  },
  relatedCategorySlug: 'tops',
  // Las piezas que más se agregan al carrito (base, 12/09/2026). Esta nota
  // entra por "crochet uruguay", la búsqueda genérica más valiosa en la que ya
  // estamos en la primera página de Google.
  relatedProductSlugs: ['cardigan-amour', 'set-de-bufanda-y-guantes', 'sweater-senda', 'bandana'],
  relatedArticleSlugs: [
    'cuanto-cuesta-una-prenda-tejida-a-mano',
    'crochet-o-dos-agujas-diferencias',
    'como-encargar-prenda-a-medida',
  ],
  body: [
    {
      type: 'p',
      text: 'Buscar "crochet" en Uruguay te deja casi siempre en el mismo lugar: listados de marketplace, avisos clasificados y alguna cuenta de Instagram sin precios a la vista. Se puede comprar muy bien en cualquiera de esos lugares, pero conviene saber qué estás mirando, porque bajo la misma palabra conviven cosas muy distintas.',
    },
    {
      type: 'p',
      text: 'Esta guía es lo que le contestaríamos a alguien que nos escribe por primera vez: en qué se diferencia una prenda hecha a mano de una que solo lo parece, qué preguntar antes de pagar y cómo acertarle al talle cuando comprás por internet.',
    },

    { type: 'h2', text: 'Hecho a mano, hecho a máquina y "estilo crochet"' },
    {
      type: 'p',
      text: 'La confusión más común. Hay tres cosas distintas dando vueltas:',
    },
    {
      type: 'ul',
      items: [
        '**Crochet real, hecho a mano.** Una sola hebra enlazada punto por punto con un ganchillo. No existe una máquina industrial que reproduzca el punto de crochet: si es crochet de verdad, alguien lo tejió.',
        '**Tejido de punto industrial (dos agujas o máquina).** Es otra técnica, con otra caída. No es peor, es distinto: la diferencia está explicada en [crochet o dos agujas](/blog/crochet-o-dos-agujas-diferencias).',
        '**"Estilo crochet".** Tela estampada o encaje industrial que imita la textura. Se reconoce porque el dibujo se repite exactamente igual y no tiene relieve real.',
      ],
    },
    {
      type: 'callout',
      title: 'Cómo mirarlo en una foto',
      text: 'Buscá el relieve y la sombra entre punto y punto, y fijate si hay pequeñas variaciones entre una zona y otra. Un tejido a mano es regular, pero nunca matemáticamente idéntico. Esa mínima irregularidad es la firma de que lo hizo una persona.',
    },

    {
      type: 'image',
      src: '/photos/blog/cardigan-granny-lazo.jpg',
      alt: 'Granny’s cardigan tejido a crochet, atado adelante con un lazo tejido',
      width: 1080,
      height: 1439,
      caption: 'El punto hecho a mano, de cerca: el [Granny’s cardigan](/tienda/granny-s-cardigan).',
      href: '/tienda/granny-s-cardigan',
    },

    { type: 'h2', text: 'Uruguay y la lana: una ventaja de contexto' },
    {
      type: 'p',
      text: 'Uruguay tiene una tradición textil larga y lana de muy buena calidad, y eso se nota en la escena de tejido local: hay lanerías con material serio en Montevideo y una cantidad enorme de gente que teje. Comprar tejido acá no es comprar una curiosidad importada, es comprar algo que se hace bien en el país desde hace generaciones.',
    },
    {
      type: 'p',
      text: 'Para vos como compradora, la parte práctica es simple: preguntá siempre de qué material está hecha la prenda. Fibra natural (lana, algodón) respira, dura y envejece bien. Una mezcla con mucho sintético abriga distinto y hace pelotitas más rápido.',
    },

    { type: 'h2', text: 'Las cinco preguntas antes de pagar' },
    {
      type: 'ol',
      items: [
        '**¿De qué material es?** Debería poder respondértelo sin dudar.',
        '**¿Qué talles hay, y con qué medidas reales?** Un talle "M" no significa lo mismo en dos talleres distintos. Pedí medidas en centímetros.',
        '**¿Es una pieza ya tejida o se teje al pedido?** Cambia el plazo por completo.',
        '**¿Cuánto demora y cómo llega?** Que el plazo y el envío queden dichos antes, no después.',
        '**¿Qué pasa si no me queda?** En piezas hechas a medida lo normal es que no haya cambio de talle, justamente porque se tejió para vos. Mejor saberlo antes.',
      ],
    },
    {
      type: 'quote',
      text: 'Si la respuesta a "¿qué medidas tiene?" es un emoji, seguí buscando.',
    },

    { type: 'h2', text: 'Cómo acertarle al talle comprando por internet' },
    {
      type: 'p',
      text: 'Es lo que más frena a la hora de comprar tejido online, y tiene una solución bastante simple: no compres por etiqueta, comprá por centímetros.',
    },
    {
      type: 'steps',
      items: [
        {
          title: 'Buscá una prenda tuya que te quede como querés',
          text: 'No te midas el cuerpo: medí una prenda que ya tengas y que te guste cómo te calza. Es mucho más fiable.',
        },
        {
          title: 'Medila en plano',
          text: 'Apoyada sobre la mesa, sin estirar: ancho de pecho de costura a costura, largo total y largo de manga.',
        },
        {
          title: 'Compará esos números con los de la prenda que querés',
          text: 'Y si no están publicados, pedilos. Un taller que teje a mano los tiene.',
        },
      ],
    },
    {
      type: 'p',
      text: 'Y si ninguna medida estándar te cierra, existe la opción de que la prenda se teja con tus medidas. Cómo funciona eso está en [cómo encargar una prenda de crochet a medida](/blog/como-encargar-prenda-a-medida).',
    },

    { type: 'h2', text: 'Sobre el precio' },
    {
      type: 'p',
      text: 'Una prenda tejida a mano cuesta bastante más que una industrial, y hay una razón concreta detrás: horas de trabajo. Un cardigan puede llevar veinte horas o más de tejido de una sola persona. Si un precio te parece sospechosamente bajo para algo "hecho a mano", probablemente no lo sea. Lo desarrollamos en [por qué una prenda tejida a mano cuesta lo que cuesta](/blog/cuanto-cuesta-una-prenda-tejida-a-mano).',
    },

    { type: 'h2', text: 'Cómo es comprar en Dahila' },
    {
      type: 'p',
      text: 'Para que sirva de referencia concreta, así funciona acá: los precios están a la vista en la [tienda](/tienda), elegís talle y colores, y la compra se coordina por WhatsApp, que es también donde se acuerda el pago y el envío. Hacemos envíos a todo Uruguay; al exterior, bajo consulta. Cada pieza se teje a mano en Montevideo.',
    },
    {
      type: 'p',
      text: 'Muchas prendas se hacen a medida, y por eso insistimos tanto con las medidas antes de empezar: con los centímetros correctos, la prenda sale bien de entrada. Los detalles de envíos y pagos están en [Información](/info).',
    },

    { type: 'h2', text: 'Preguntas frecuentes' },
    {
      type: 'faq',
      items: [
        {
          q: '¿Conviene comprar crochet por Instagram o en una tienda online?',
          a: 'Instagram sirve para descubrir y para ver el trabajo real de quien teje. Para comprar, ayuda que haya una tienda con precios, talles y condiciones visibles: no porque Instagram sea inseguro, sino porque tener la información escrita evita malentendidos sobre plazos y medidas.',
        },
        {
          q: '¿Cuánto demora una prenda tejida a mano?',
          a: 'Depende de la pieza y de si está tejida o se teje al pedido. Una bufanda no es un cardigan. Lo importante es que el plazo te lo digan antes de que pagues.',
        },
        {
          q: '¿Se puede pedir en un color distinto al de la foto?',
          a: 'En un taller que teje a mano, casi siempre sí. En Dahila, después de confirmar el modelo te mostramos las lanas reales que hay y elegís sobre eso, que es más honesto que elegir sobre una pantalla.',
        },
        {
          q: '¿Hacen envíos al interior?',
          a: 'Sí, hacemos envíos a todo Uruguay. El costo y el plazo se coordinan por WhatsApp según dónde estés.',
        },
      ],
    },

    {
      type: 'shopCta',
      title: 'Ver lo que hay tejido ahora',
      text: 'Tops, cardigans, sets y accesorios, con precio y talles a la vista.',
      href: '/tienda',
      label: 'Ir a la tienda',
    },
  ],
}
