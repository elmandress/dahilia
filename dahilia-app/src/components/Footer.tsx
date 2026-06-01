'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { dahila } from './ui/Primitives'

function FooterCol({ title, items }: { title: string, items: string[] }) {
  return (
    <div>
      <div style={{
        fontFamily: dahila.fontSans, fontSize: 10, letterSpacing: '0.22em',
        textTransform: 'uppercase', color: dahila.ink500, marginBottom: 14,
      }}>{title}</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
        {items.map((it) => (
          <li key={it} style={{ fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 300, color: dahila.ink700 }}>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>{it}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Footer() {
  const pathname = usePathname()
  if (pathname.startsWith('/admin')) return null

  return (
    <footer style={{
      background: '#fff',
      borderTop: `1px solid ${dahila.border}`,
      padding: '64px 24px 28px',
      marginTop: 96,
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="footer-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1.6fr 1fr 1fr 1fr',
          gap: 48, alignItems: 'start',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <img src="/isotype-color.png" alt="" style={{ width: 36, height: 36, objectFit: 'contain' }}/>
              <span style={{ fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 24, letterSpacing: '0.18em', color: dahila.ink900 }}>DAHILA</span>
            </div>
            <p style={{ fontFamily: dahila.fontSerif, fontStyle: 'italic', fontWeight: 300, fontSize: 16, lineHeight: 1.55, color: dahila.ink700, maxWidth: 320, margin: 0 }}>
              Prendas tejidas a mano, a tu medida, desde Montevideo.
            </p>
          </div>

          <FooterCol title="Tienda" items={['Novedades', 'Tops', 'Accesorios', 'A medida']}/>
          <FooterCol title="Info" items={['Cómo encargar', 'Tabla de talles', 'Cuidados', 'Envíos']}/>
          <FooterCol title="Contacto" items={['hola@dahila.uy', '@dahila.crochet', 'Montevideo, UY']}/>
        </div>

        <div style={{
          marginTop: 56, paddingTop: 22,
          borderTop: `1px solid ${dahila.border}`,
          display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          fontFamily: dahila.fontSans, fontSize: 11, fontWeight: 400, color: dahila.ink500,
          letterSpacing: '0.06em',
        }}>
          <span>© {new Date().getFullYear()} Dahila Crochet — hecho a mano en Uruguay 🪡</span>
          <span>Diseño & sistema · DAHILA Atelier</span>
        </div>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </footer>
  )
}
