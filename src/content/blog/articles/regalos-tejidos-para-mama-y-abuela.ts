import type { Article } from '../types'

// 12/10/2026. Guía de regalos por estilo de persona — el formato que mejor
// rinde del blog (regalos-para-una-amiga-tejidos: el CTR más alto de las
// notas). Pensada para Navidad, que acá es verano: nada de lana gruesa como
// idea principal. Cada pieza es real y lo que se dice sale de su ficha.
export const article: Article = {
  slug: 'regalos-tejidos-para-mama-y-abuela',
  title: 'Regalos tejidos a mano para mamá y para la abuela',
  metaTitle: 'Regalos para mamá y la abuela: ideas tejidas a mano',
  description:
    'Qué regalarle a mamá o a la abuela según cómo es: la que vive en la feria, la coqueta, la del mate en la rambla. Ideas tejidas a mano para Navidad, que acá es verano.',
  excerpt:
    'Para mamá y la abuela, un regalo tejido dice lo que cuesta decir. Ideas según cómo es cada una, pensadas para una Navidad de verano.',
  cluster: 'regalos',
  role: 'support',
  funnel: 'BOFU',
  publishedAt: '2026-10-12',
  hero: { src: '/photos/blog/cardigan-cruzado-camel.jpg', alt: 'Cardigan cruzado tejido a crochet en color camel, puesto', position: '50% 30%' },
  relatedCategorySlug: 'cardigans',
  relatedProductSlugs: ['cardigan-cruzado', 'granny-s-cardigan', 'bolso-a-cuadros', 'set-lueur'],
  relatedArticleSlugs: ['regalos-de-navidad-tejidos-a-mano', 'regalar-ropa-sin-saber-el-talle'],
  body: [
    {
      type: 'p',
      text: 'A mamá y a la abuela es a quienes más cuesta regalarles: "no me compres nada", "ya tengo de todo". Algo tejido a mano corta esa conversación, porque no se compara con nada que ya tengan. Lo que falta es elegir cuál, y eso depende de cómo es cada una.',
    },
    {
      type: 'callout',
      title: 'Ojo: acá Navidad es en verano',
      text: 'Las ideas de abajo están pensadas para diciembre en Uruguay: algodón, hilados frescos y piezas para las noches de verano. Lo de lana queda para el cumpleaños de invierno.',
    },

    { type: 'h2', text: 'Para la que no se pierde una feria' },
    {
      type: 'p',
      text: 'Un bolso que aguante: el [Bolso a cuadros](/tienda/bolso-a-cuadros) en algodón, o el [Bolso LOLA](/tienda/bolso-lola) en trapillo reciclado, que aguanta el peso de las compras. No tienen talle, así que no hay forma de errarle.',
    },

    { type: 'h2', text: 'Para la coqueta' },
    {
      type: 'p',
      text: 'El [Cardigan CRUZADO](/tienda/cardigan-cruzado), en algodón con lurex: tiene un brillo apenas, justo para una cena de fin de año, y se ajusta cruzándolo. Para algo más liviano, el [Set LUEUR](/tienda/set-lueur): un ponchito calado y una bufanda fina, también con lurex.',
    },

    { type: 'h2', text: 'Para la del mate en la rambla al atardecer' },
    {
      type: 'p',
      text: 'Para las noches que refrescan, un cardigan de algodón: el [Granny’s cardigan](/tienda/granny-s-cardigan) o el [Cardigan 3/4](/tienda/cardigan-3-4). Abrigan lo justo sin dar calor, y abiertos adelante perdonan el talle si no estás segura.',
    },

    { type: 'h2', text: 'Para la que vive en la playa' },
    {
      type: 'p',
      text: 'La [Tote de playa](/tienda/tote-bag-de-playa): entra la toalla, el mate y el protector, y el tejido abierto deja salir la arena. Si querés sumarle algo, una [Bandana](/tienda/bandana) de algodón para el pelo.',
    },

    { type: 'h2', text: 'Para la que "ya tiene todo"' },
    {
      type: 'p',
      text: 'El [Box de regalo](/tienda/box-de-regalo), que ya viene armado. O directamente una [tarjeta de regalo](/regalo): elige ella la prenda, el color y el talle, y si quiere la tejo a su medida.',
    },
    {
      type: 'shopCta',
      title: '¿No sabés su talle?',
      text: 'Con la tarjeta de regalo elige ella. Elegís el monto y el mensaje, y te llega por WhatsApp.',
      href: '/regalo',
      label: 'Armar la tarjeta',
    },

    { type: 'h2', text: 'Para que llegue a tiempo' },
    {
      type: 'p',
      text: 'Lo que se teje a pedido tiene su plazo, que está en cada ficha. Si el regalo es para Navidad, encargalo con tiempo o elegí lo que ya está en stock. La tarjeta de regalo no depende de ningún plazo de tejido.',
    },

    {
      type: 'faq',
      items: [
        { q: '¿Qué le regalo a mi mamá para Navidad en Uruguay?', a: 'Algo de algodón para el verano: un cardigan liviano para las noches, un bolso para la feria o una tote para la playa. Si no sabés su talle, un bolso o una [tarjeta de regalo](/regalo).' },
        { q: '¿Qué le regalo a mi abuela que ya tiene todo?', a: 'Algo hecho a mano no se compara con nada que ya tenga: el Box de regalo armado, o una tarjeta para que elija ella su prenda y su color.' },
      ],
    },
  ],
}
