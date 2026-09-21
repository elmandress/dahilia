'use client'

import { useState } from 'react'
import Image, { type ImageProps } from 'next/image'
import { fotoRespaldo } from '@/lib/fotos-respaldo'
import { PHOTO_PLACEHOLDER } from '@/lib/types'

/**
 * `next/image` que no deja un hueco roto si la foto no carga.
 *
 * Por qué existe: las fotos viven en Supabase Storage y el 20/09/2026 el
 * proyecto quedó restringido por cuota (402). El inicio mostró 13 de 15 fotos
 * rotas, con el texto alternativo suelto sobre el fondo. Ahora, si la foto
 * remota falla, entra la copia local de esa prenda (public/fotos-respaldo) y,
 * si no hay copia, el marcador de la marca. Todo del lado del navegador: sin
 * consultar nada y sin cambiar nada cuando el servicio está sano.
 */
export function ImagenConRespaldo({ slug, src, alt, respaldo: respaldoFijo, ...rest }: ImageProps & {
  slug?: string | null
  /** Ruta local a usar si falla, cuando la foto no es de una prenda (el hero). */
  respaldo?: string
}) {
  const [actual, setActual] = useState(src)
  return (
    <Image
      {...rest}
      alt={alt}
      src={actual}
      onError={() => {
        const respaldo = respaldoFijo ?? fotoRespaldo(slug) ?? PHOTO_PLACEHOLDER
        // Si el respaldo también falla, no volver a intentar (evita el bucle).
        setActual((previa) => (previa === respaldo ? previa : respaldo))
      }}
    />
  )
}
