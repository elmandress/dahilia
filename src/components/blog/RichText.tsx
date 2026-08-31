import Link from 'next/link'
import { dahila } from '@/components/ui/Primitives'

// Parser mínimo de texto en línea para los artículos: `[texto](/url)` y
// `**negrita**`. Devuelve nodos de React, nunca HTML crudo — no hay
// dangerouslySetInnerHTML en ningún punto del blog, así que no hay superficie
// de inyección aunque un artículo futuro copie y pegue texto de cualquier lado.
//
// Deliberadamente NO es un markdown completo: con estas dos marcas alcanza para
// escribir notas con enlaces internos (que es lo que el SEO necesita) y el
// resto de la estructura ya la dan los bloques tipados.

const TOKEN = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g

export function RichText({ text }: { text: string }) {
  const parts = text.split(TOKEN).filter((p) => p !== '')

  return (
    <>
      {parts.map((part, i) => {
        const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part)
        if (link) {
          const [, label, href] = link
          const external = href.startsWith('http')
          return external ? (
            <a
              key={i}
              href={href}
              rel="noopener noreferrer"
              target="_blank"
              style={linkStyle}
            >
              {label}
            </a>
          ) : (
            <Link key={i} href={href} style={linkStyle}>
              {label}
            </Link>
          )
        }
        const bold = /^\*\*([^*]+)\*\*$/.exec(part)
        if (bold) {
          return <strong key={i} style={{ fontWeight: 500, color: dahila.ink900 }}>{bold[1]}</strong>
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

// Subrayado con offset en vez de color distinto: el texto sigue leyéndose como
// texto (contraste de cuerpo) y el enlace se nota igual. El wine queda para el
// hover, como en el resto del sitio.
const linkStyle: React.CSSProperties = {
  color: dahila.ink900,
  textDecoration: 'underline',
  textDecorationColor: dahila.wine600,
  textUnderlineOffset: 3,
  textDecorationThickness: 1,
}
