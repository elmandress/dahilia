import type { Article } from '../types'

// Search Console (13/09/2026): "chaleco", "chaleco tejido mujer", "chalecos de
// lana" y variantes le dan impresiones a la ficha del chaleco, pero en
// posición 44 a 66, donde nadie la ve. Una nota que conteste cómo usarlo es lo
// que puede competir por esas búsquedas; la ficha sola, no.
export const article: Article = {
  slug: 'chaleco-tejido-como-combinarlo',
  title: 'Chaleco tejido a crochet: cómo usarlo y con qué combinarlo',
  metaTitle: 'Chaleco tejido: cómo usarlo y con qué combinarlo',
  description:
    'Cómo usar un chaleco tejido a crochet en el entretiempo: arriba de camisas, remeras o vestidos, qué talle elegir y cuándo conviene uno de algodón o de lana.',
  excerpt:
    'Más abrigo que un top y más liviano que un cardigan. El chaleco tejido resuelve esos días de entretiempo en los que no sabés qué ponerte.',
  cluster: 'comprar',
  role: 'support',
  funnel: 'MOFU',
  publishedAt: '2026-09-13',
  hero: { src: '/photos/blog/chaleco-crochet-botones.jpg', alt: 'Chaleco tejido a crochet con botones y borde marrón, puesto sobre una polera blanca', position: '50% 40%' },
  relatedCategorySlug: 'tops',
  relatedProductSlugs: ['chaleco', 'cardigan-3-4', 'cardigan-cruzado', 'poncho'],
  relatedArticleSlugs: ['entretiempo-uruguay-prendas-tejidas', 'cardigan-de-crochet-como-elegirlo', 'holgura-prenda-tejida'],
  body: [
    {
      type: 'p',
      text: 'El chaleco tejido es la prenda del punto medio: más abrigo que un top, más liviano que un cardigan, y le suma textura a cualquier conjunto simple.',
    },
    {
      type: 'p',
      text: 'En Uruguay, donde el entretiempo dura casi medio año (está contado en la nota sobre [el entretiempo en Uruguay](/blog/entretiempo-uruguay-prendas-tejidas)), es una prenda que se usa muchos meses.',
    },

    { type: 'h2', text: 'Tres formas de usarlo' },
    {
      type: 'steps',
      items: [
        {
          title: 'Sobre una polera o una remera de manga larga',
          text: 'La combinación clásica del entretiempo: la manga larga abriga los brazos y el chaleco, el torso. Así aparece en las fotos del [chaleco](/tienda/chaleco) del taller.',
        },
        {
          title: 'Sobre una camisa',
          text: 'Con el cuello y los puños de la camisa a la vista, queda más armado. Sirve para la oficina.',
        },
        {
          title: 'Sobre un vestido',
          text: 'Un vestido liviano con un chaleco arriba se estira a la primavera y al otoño.',
        },
      ],
    },
    {
      type: 'p',
      text: 'Abajo funciona con jean, con pantalón de vestir o con falda. Como el tejido ya tiene textura, lo demás conviene liso.',
    },
    {
      type: 'image',
      src: '/photos/blog/chaleco-en-percha.jpg',
      alt: 'Chaleco tejido a crochet en algodón beige con borde marrón, colgado en una percha',
      width: 1080,
      height: 1440,
      caption: 'El [chaleco](/tienda/chaleco), en algodón, con botones y el borde en contraste.',
      href: '/tienda/chaleco',
    },

    { type: 'h2', text: '¿De algodón o de lana?' },
    {
      type: 'p',
      text: 'Depende de para qué lo quieras. Un chaleco de algodón es para el entretiempo: abriga lo justo, no da calor en un lugar con calefacción y se lava fácil. Uno de lana es para el frío de verdad, y ahí compite con un sweater.',
    },
    {
      type: 'p',
      text: 'El [chaleco](/tienda/chaleco) de Dahila se teje en algodón. Si buscás abrigo para pleno invierno, mirá los [sweaters](/tienda/sweaters), que se tejen en lana y mezclas con lana.',
    },

    { type: 'h2', text: 'Qué talle elegir' },
    {
      type: 'p',
      text: 'Un chaleco se usa arriba de otra prenda, así que necesita un poco más de holgura que un top: tiene que entrar la manga larga o la camisa sin que tire en las sisas. Cuánto más depende del calce que busques, y está explicado en la nota sobre [la holgura](/blog/holgura-prenda-tejida).',
    },
    {
      type: 'p',
      text: 'Como se teje cuando lo encargás, se hace en tu talle exacto y en el tono que prefieras.',
    },

    { type: 'h2', text: 'Cómo cuidarlo' },
    {
      type: 'p',
      text: 'Como cualquier prenda tejida: lavado a mano, secado en plano y guardado doblado, porque la percha lo estira con el tiempo. El paso a paso está en la guía de [cuidado](/blog/como-cuidar-prendas-de-crochet).',
    },

    {
      type: 'shopCta',
      title: 'El chaleco del taller',
      text: 'Tejido a mano, con el precio, los talles y la fibra a la vista.',
      href: '/tienda/chaleco',
      label: 'Ver el chaleco',
    },

    { type: 'h2', text: 'Preguntas frecuentes' },
    {
      type: 'faq',
      items: [
        {
          q: '¿Con qué se combina un chaleco tejido?',
          a: 'Con una polera o una remera de manga larga, con una camisa o con un vestido liviano. Abajo, jean, pantalón de vestir o falda.',
        },
        {
          q: '¿Un chaleco tejido abriga?',
          a: 'Abriga el torso: más que un top y menos que un cardigan. Para el frío de verdad conviene un sweater o un cardigan de lana.',
        },
        {
          q: '¿Se puede usar en verano?',
          a: 'Uno de algodón, sí: sobre un vestido o una musculosa, para las noches frescas.',
        },
        {
          q: '¿Se puede pedir en otro color?',
          a: 'Sí. Se teje cuando lo encargás, en tu talle y en el tono que prefieras.',
        },
      ],
    },
  ],
}
