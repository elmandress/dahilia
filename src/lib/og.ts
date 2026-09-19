// Base Open Graph compartida. Gotcha de Next.js: cuando una página define su
// propio `openGraph`, el objeto del layout se REEMPLAZA entero — no hay
// deep-merge. Sin este spread, cada página perdía og:site_name y og:locale
// (detectado con OpenGraph Inspector). Toda página que declare `openGraph`
// debe empezar con `...OG_BASE`.
//
// La imagen por defecto va acá por el mismo motivo (11/09/2026): la del
// layout también se perdía, y /blog, /encargo, /contacto, /tejedoras y
// /colecciones se compartían por WhatsApp SIN foto. Una página con imagen
// propia la pisa poniendo `images` después del spread.
export const OG_DEFAULT_IMAGE = {
  url: '/og',
  width: 1200,
  height: 630,
  alt: 'Dahila Crochet — prendas tejidas a mano en Uruguay',
  type: 'image/jpeg',
}

export const OG_BASE: {
  siteName: string
  locale: string
  type: 'website'
  images: Array<typeof OG_DEFAULT_IMAGE>
} = {
  siteName: 'Dahila Crochet',
  locale: 'es_UY',
  type: 'website',
  images: [OG_DEFAULT_IMAGE],
}

// Para las páginas con un opengraph-image.tsx propio (/atelier, /info,
// /ofertas): sin la imagen por defecto. No sirve dentro de un grupo de rutas
// (carpeta entre paréntesis): ahí Next le pone un sufijo a la ruta de la imagen
// y no la enlaza; /tienda quedó así sin foto hasta el 19/09/2026 y ahora usa
// OG_BASE. Ojo, al revés de lo que uno
// esperaría, `images` escrito en la metadata le GANA al archivo — verificado
// en el build del 11/09/2026: con OG_BASE, /tienda perdía su tarjeta propia.
export const OG_BASE_NO_IMAGE = {
  siteName: OG_BASE.siteName,
  locale: OG_BASE.locale,
  type: OG_BASE.type,
}
