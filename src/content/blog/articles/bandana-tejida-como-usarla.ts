import type { Article } from '../types'

// 12/10/2026. "bandana" y "bandanas" suman ~190 impresiones por mes y la ficha
// está en la posición ~10 (borde de la primera página). Una nota que responde
// "cómo se usa" y linkea a la ficha es la forma de empujarla. Todo lo que se
// dice de la pieza sale de su ficha (algodón, ~4 h de tejido, tres usos).
export const article: Article = {
  slug: 'bandana-tejida-como-usarla',
  title: 'Bandana tejida a crochet: 3 formas de usarla (y cómo elegir el color)',
  metaTitle: 'Bandana tejida a crochet: 3 formas de usarla',
  description:
    'Cómo usar una bandana tejida a crochet en el pelo, al cuello o atada a la cartera, con qué combinarla y cómo cuidarla. Algodón, tejida a mano en Uruguay.',
  excerpt:
    'La bandana es el accesorio más chico del taller y el que más usos tiene: en el pelo, al cuello o atada a la cartera. Cómo llevarla en cada caso.',
  cluster: 'comprar',
  role: 'support',
  funnel: 'BOFU',
  publishedAt: '2026-10-12',
  hero: { src: '/photos/blog/bandana-crochet-pelo.jpg', alt: 'Bandana tejida a crochet con flecos, usada en el pelo', position: '50% 30%' },
  relatedCategorySlug: 'accesorios',
  relatedProductSlugs: ['bandana', 'mini-bufandas', 'tote-bag-de-playa', 'top-summer'],
  relatedArticleSlugs: ['accesorios-tejidos-para-la-playa', 'regalos-para-una-amiga-tejidos'],
  body: [
    {
      type: 'p',
      text: 'Una bandana tejida a crochet es el accesorio más chico del taller y, a la vez, el de más usos. La de Dahila es de algodón, lleva unas cuatro horas de tejido a mano y se puede llevar de tres formas distintas. Acá va cada una.',
    },
    {
      type: 'callout',
      title: 'La versión corta',
      text: 'En el pelo (atada atrás o como vincha), al cuello (en triángulo, con el nudo al costado) o atada a la manija de la cartera. Es de algodón: fresca para el verano y fácil de lavar.',
    },

    { type: 'h2', text: '1. En el pelo' },
    {
      type: 'p',
      text: 'La forma clásica: el triángulo sobre la cabeza y las puntas anudadas atrás, debajo del pelo suelto o de una cola. Si la doblás en tira, funciona como vincha y saca el pelo de la cara. Es la que más se ve en la playa y en los días de viento.',
    },

    { type: 'h2', text: '2. Al cuello' },
    {
      type: 'p',
      text: 'Con el triángulo adelante y el nudo al costado, le da el detalle a una remera lisa o a una camisa abierta. Al ser de algodón, no da calor: sirve igual en primavera y en las noches de verano.',
    },

    { type: 'h2', text: '3. Atada a la cartera' },
    {
      type: 'p',
      text: 'Anudada a la manija de un bolso, le cambia la cara a uno que ya tenés. Queda especialmente bien con una [tote de playa](/tienda/tote-bag-de-playa) o un bolso liso.',
    },
    {
      type: 'shopCta',
      title: 'La bandana de Dahila',
      text: 'Algodón, tejida a mano en el color que elijas. Envío a todo Uruguay.',
      href: '/tienda/bandana',
      label: 'Ver la bandana',
    },

    { type: 'h2', text: 'Cómo elegir el color' },
    {
      type: 'ul',
      items: [
        '**Si la vas a usar con todo:** un neutro (crudo, beige, negro) combina con cualquier ropa.',
        '**Si es para el verano:** los colores vivos se lucen con la piel bronceada y la ropa blanca.',
        '**Si es para regalar:** un color que la persona ya use mucho es apuesta segura. Como no tiene talle, es de los regalos más fáciles.',
      ],
    },

    { type: 'h2', text: 'Cómo cuidarla' },
    {
      type: 'p',
      text: 'A mano, con agua fría y jabón neutro; sin retorcer y secada en plano, a la sombra. Si la usaste en la playa, enjuagala ese mismo día: la sal y el sol apagan el color. Está todo en [cómo cuidar el crochet en verano](/blog/cuidar-crochet-en-verano-playa-sol-cloro).',
    },

    {
      type: 'faq',
      items: [
        { q: '¿De qué material es la bandana?', a: 'De algodón: no pica, es fresca y se lava fácil.' },
        { q: '¿Cuánto tarda en estar lista?', a: 'Lleva unas cuatro horas de tejido. El plazo de entrega actualizado está en su ficha.' },
        { q: '¿Se puede pedir en otro color?', a: 'Sí: se teje cuando la encargás, así que el color lo elegís vos.' },
      ],
    },
  ],
}
