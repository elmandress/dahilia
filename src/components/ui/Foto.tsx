import NextImage, { type ImageProps } from 'next/image'
import { fotoLocal } from '@/lib/media'

/**
 * El `next/image` de la tienda. Úsenlo en vez de importar `next/image` directo
 * (tests/unit/fotos-locales.test.mjs falla si alguien lo hace).
 *
 * Única diferencia: una foto del storage de Supabase se pide a /media/… del
 * propio sitio (lib/media.ts, `fotoLocal`). Sin esto, cada versión de cada
 * foto que Netlify no tuviera en caché bajaba el original de Supabase, y el
 * 12/11/2026 eso agotó la cuota por tercera vez. Las fotos de /public y los
 * imports estáticos pasan sin cambios.
 */
export default function Foto({ src, alt, ...rest }: ImageProps) {
  return <NextImage {...rest} alt={alt} src={typeof src === 'string' ? fotoLocal(src) : src} />
}

export type { ImageProps }
