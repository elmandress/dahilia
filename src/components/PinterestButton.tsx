'use client'

import { dahila, Icon } from './ui/Primitives'

/**
 * Abre el diálogo de "crear pin" de Pinterest con la foto y el link del
 * producto ya cargados — no requiere el script/widget oficial de Pinterest
 * (que sumaría un dominio más a la CSP): es un link plano a su endpoint
 * público, mismo patrón que los enlaces de wa.me del resto del sitio.
 */
export function PinterestButton({ imageUrl, description }: { imageUrl: string; description: string }) {
  const handlePin = () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const pinUrl = `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(description)}`
    window.open(pinUrl, '_blank', 'noopener,noreferrer,width=750,height=650')
  }

  return (
    <button
      type="button"
      onClick={handlePin}
      aria-label="Guardar en Pinterest"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'transparent', border: `1px solid ${dahila.borderStrong}`,
        borderRadius: 999, padding: '7px 14px', cursor: 'pointer',
        fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink900,
        transition: `background 140ms ${dahila.ease}`,
      }}
    >
      <Icon name="pinterest-logo" weight="fill" size={15} color="#E60023" />
      Guardar
    </button>
  )
}
