// Sin este archivo, X/Twitter ignora la tarjeta de opengraph-image.tsx y
// hereda el twitter:image estático del layout raíz (logo genérico) — Next
// solo llena twitter:image automáticamente desde el file-convention si existe
// un twitter-image propio en la misma carpeta.
export { default, alt, size, contentType } from './opengraph-image'
