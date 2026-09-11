import Link from 'next/link'
import type { Block } from '@/content/blog/types'
import { dahila } from '@/components/ui/Primitives'
import { RichText } from './RichText'
import { headingId } from '@/content/blog/toc'

/**
 * Renderiza los bloques de un artículo con los tokens de Dahila. Un solo lugar
 * decide la tipografía del blog: si mañana cambia el ritmo de lectura, cambia
 * acá y no en cada nota.
 *
 * Server Component puro (sin estado, sin efectos): el artículo entero llega al
 * navegador como HTML, sin JS de hidratación propio. Es lo que hace que una
 * nota larga siga siendo liviana en un celular de gama media.
 */
export function ArticleBody({ blocks }: { blocks: Block[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {blocks.map((block, i) => (
        <BlockView key={i} block={block} />
      ))}
    </div>
  )
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case 'p':
      return <p style={bodyText}><RichText text={block.text} /></p>

    case 'h2':
      // El h2 abre sección: además del espacio, lleva una regla corta arriba.
      // Antes la única señal de "acá empieza otra sección" era el margen, y en
      // una nota con listas y callouts seguidos las secciones se pisaban
      // visualmente (reporte de Mati, 04/09/2026).
      return (
        <h2 id={headingId(block.text)} style={h2Style}>
          <span aria-hidden style={h2Rule} />
          {block.text}
        </h2>
      )

    case 'h3':
      return <h3 style={h3Style}>{block.text}</h3>

    case 'ul':
      return (
        <ul style={listStyle}>
          {block.items.map((item, i) => (
            <li key={i} style={listItem}>
              <span aria-hidden style={bullet} />
              <span><RichText text={item} /></span>
            </li>
          ))}
        </ul>
      )

    case 'ol':
      return (
        <ol style={{ ...listStyle, counterReset: 'dahila-ol' }}>
          {block.items.map((item, i) => (
            <li key={i} style={listItem}>
              <span aria-hidden style={numberMark}>{i + 1}</span>
              <span><RichText text={item} /></span>
            </li>
          ))}
        </ol>
      )

    case 'callout':
      return (
        <aside style={calloutStyle}>
          {block.title && (
            <div style={{
              fontFamily: dahila.fontSans, fontSize: 11, fontWeight: 500,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              color: dahila.wine600, marginBottom: 8,
            }}>
              {block.title}
            </div>
          )}
          <p style={{ ...bodyText, margin: 0, fontSize: 15 }}>
            <RichText text={block.text} />
          </p>
        </aside>
      )

    case 'quote':
      return (
        <blockquote style={quoteStyle}>{block.text}</blockquote>
      )

    case 'steps':
      return (
        <ol style={{ ...stepsWrap }}>
          {block.items.map((step, i) => (
            <li key={i} style={stepItem}>
              <span aria-hidden style={stepNumber}>{i + 1}</span>
              <div>
                <div style={{
                  fontFamily: dahila.fontDisplay, fontWeight: 400, fontSize: 18,
                  color: dahila.ink900, lineHeight: 1.25, marginBottom: 4,
                }}>
                  {step.title}
                </div>
                <p style={{ ...bodyText, margin: 0, fontSize: 15 }}>
                  <RichText text={step.text} />
                </p>
              </div>
            </li>
          ))}
        </ol>
      )

    case 'note':
      return (
        <p style={noteStyle}><RichText text={block.text} /></p>
      )

    case 'shopCta':
      return (
        <div style={ctaStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{
              fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 22,
              color: dahila.ink900, lineHeight: 1.2,
            }}>
              {block.title}
            </div>
            <p style={{ ...bodyText, margin: 0, fontSize: 14.5 }}>
              <RichText text={block.text} />
            </p>
          </div>
          <Link href={block.href} style={ctaButton}>{block.label}</Link>
        </div>
      )

    case 'faq':
      return (
        <div style={{ margin: '4px 0 28px' }}>
          {block.items.map((item, i) => (
            <div key={i} style={faqItem}>
              {/* h3 y no un <details>: el contenido queda siempre visible para
                  el lector y para el crawler, que es lo que hace elegible el
                  rich result de FAQ. */}
              <h3 style={faqQuestion}>{item.q}</h3>
              <p style={{ ...bodyText, margin: 0, fontSize: 15.5 }}>
                <RichText text={item.a} />
              </p>
            </div>
          ))}
        </div>
      )
  }
}

// ── Estilos ─────────────────────────────────────────────────────────────
// Ritmo de lectura: cuerpo 16.5px / 1.8. Más grande que la UI del sitio
// (15px) a propósito — una nota larga se lee, no se escanea.

const bodyText: React.CSSProperties = {
  fontFamily: dahila.fontSans, fontSize: 16.5, fontWeight: 300,
  lineHeight: 1.8, color: dahila.ink700, margin: '0 0 20px',
  textWrap: 'pretty',
}

const h2Style: React.CSSProperties = {
  fontFamily: dahila.fontDisplay, fontWeight: 300,
  fontSize: 'clamp(24px, 3.4vw, 30px)', lineHeight: 1.2,
  letterSpacing: '-0.01em', color: dahila.ink900,
  // 52px arriba (antes 40): con la regla de acento, el aire de arriba tiene
  // que ser claramente mayor al de abajo para que la sección "abra".
  margin: '52px 0 16px', scrollMarginTop: 90,
  display: 'flex', flexDirection: 'column', gap: 14,
}

/** Regla corta de acento arriba de cada h2 — marca el inicio de sección. */
const h2Rule: React.CSSProperties = {
  display: 'block', width: 34, height: 2, borderRadius: 2,
  background: dahila.wine600,
}

const h3Style: React.CSSProperties = {
  fontFamily: dahila.fontDisplay, fontWeight: 400, fontSize: 19,
  lineHeight: 1.3, color: dahila.ink900, margin: '30px 0 8px',
}

/** Pregunta de FAQ: es un h3 semántico, pero no tiene que leerse como una
 *  subsección del artículo — por eso va en sans, más chica y sin el aire de
 *  arriba que separa subsecciones de verdad. */
const faqQuestion: React.CSSProperties = {
  fontFamily: dahila.fontSans, fontWeight: 500, fontSize: 15.5,
  lineHeight: 1.45, color: dahila.ink900, margin: '0 0 8px',
}

const listStyle: React.CSSProperties = {
  listStyle: 'none', padding: 0, margin: '0 0 20px',
  display: 'flex', flexDirection: 'column', gap: 10,
}

const listItem: React.CSSProperties = {
  display: 'flex', gap: 12, alignItems: 'baseline',
  fontFamily: dahila.fontSans, fontSize: 16.5, fontWeight: 300,
  lineHeight: 1.75, color: dahila.ink700,
}

const bullet: React.CSSProperties = {
  width: 5, height: 5, borderRadius: 999, background: dahila.wine600,
  flexShrink: 0, transform: 'translateY(-3px)',
}

const numberMark: React.CSSProperties = {
  fontFamily: dahila.fontSans, fontSize: 12, fontWeight: 500,
  color: dahila.wine600, flexShrink: 0, minWidth: 14,
}

const calloutStyle: React.CSSProperties = {
  background: dahila.cream100, borderRadius: 16,
  padding: '22px 24px', margin: '8px 0 28px',
}

const quoteStyle: React.CSSProperties = {
  fontFamily: dahila.fontDisplay, fontWeight: 300, fontStyle: 'italic',
  fontSize: 'clamp(20px, 2.6vw, 24px)', lineHeight: 1.45,
  color: dahila.ink900, margin: '20px 0 30px', padding: '4px 0 4px 22px',
  borderLeft: `2px solid ${dahila.wine600}`,
}

const stepsWrap: React.CSSProperties = {
  listStyle: 'none', padding: 0, margin: '4px 0 28px',
  display: 'flex', flexDirection: 'column', gap: 20,
}

const stepItem: React.CSSProperties = {
  display: 'flex', gap: 16, alignItems: 'flex-start',
}

const stepNumber: React.CSSProperties = {
  flexShrink: 0,
  width: 28, height: 28, borderRadius: 999,
  background: dahila.cream100, color: dahila.wine600,
  fontFamily: dahila.fontSans, fontSize: 12, fontWeight: 500,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  marginTop: 2,
}

// Antes usaba `borderTop` de ancho completo: una línea horizontal en medio
// del texto se lee como "acá termina la sección", que es justo lo que NO es.
// Con la barra a la izquierda queda claro que es una aclaración al margen.
const noteStyle: React.CSSProperties = {
  fontFamily: dahila.fontSans, fontSize: 13.5, fontWeight: 300,
  lineHeight: 1.7, color: dahila.ink500,
  margin: '4px 0 28px', padding: '2px 0 2px 16px',
  borderLeft: `2px solid ${dahila.border}`,
}

// Las preguntas van como tarjetas y no como filas separadas por hairlines:
// esas líneas de ancho completo competían con la separación real de secciones.
const faqItem: React.CSSProperties = {
  background: dahila.cream50,
  border: `1px solid ${dahila.border}`,
  borderRadius: 14,
  padding: '18px 20px',
  marginBottom: 10,
}

const ctaStyle: React.CSSProperties = {
  background: dahila.cream50,
  border: `1px solid ${dahila.border}`,
  borderRadius: 16,
  padding: '24px 26px',
  margin: '12px 0 30px',
  display: 'flex', flexDirection: 'column', gap: 16,
  alignItems: 'flex-start',
}

const ctaButton: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  minHeight: 44, padding: '12px 22px', borderRadius: 999,
  background: dahila.ink900, color: '#fff', textDecoration: 'none',
  fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 400,
  letterSpacing: '0.06em',
}
