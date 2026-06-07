import { ImageResponse } from 'next/og'

export const alt = 'Tienda — Dahila Crochet'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center', textAlign: 'center',
          background: '#FFFBF2', fontFamily: 'serif', padding: 80,
        }}
      >
        <div style={{ fontSize: 22, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#8C8285', marginBottom: 18 }}>
          Dahila Crochet
        </div>
        <div style={{ fontSize: 92, color: '#1F1A1B', fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1 }}>
          Tienda
        </div>
        <div style={{ fontSize: 26, color: '#4A4143', marginTop: 22, fontWeight: 300 }}>
          Prendas tejidas a mano · Uruguay
        </div>
      </div>
    ),
    size
  )
}
