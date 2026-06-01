'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { dahila, Eyebrow, Field, TextInput, Button } from '@/components/ui/Primitives'

export default function EncargoPage() {
  const router = useRouter()
  const [tipo, setTipo] = useState('Cardigan')
  const [talle, setTalle] = useState('M')
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <main style={{ maxWidth: 560, margin: '0 auto', padding: '120px 24px', textAlign: 'center' }}>
        <Eyebrow>Encargo recibido</Eyebrow>
        <h1 style={{
          fontFamily: dahila.fontDisplay, fontWeight: 300,
          fontSize: 'clamp(32px, 5vw, 48px)', lineHeight: 1.1, letterSpacing: '-0.02em',
          color: dahila.ink900, margin: '14px 0 16px',
        }}>Gracias 🪡</h1>
        <p style={{ fontFamily: dahila.fontSerif, fontStyle: 'italic', fontWeight: 300, fontSize: 18, color: dahila.ink700, marginBottom: 28 }}>
          Te escribo en las próximas 48hs con un boceto y presupuesto.
        </p>
        <Button variant="secondary" onClick={() => router.push('/')}>Volver al inicio</Button>
      </main>
    )
  }

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36 }}>
        <Eyebrow>Encargos a medida</Eyebrow>
        <h1 style={{
          fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 'clamp(32px, 5vw, 48px)',
          lineHeight: 1.05, letterSpacing: '-0.02em', color: dahila.ink900, margin: 0,
        }}>Contame qué tenés en mente</h1>
        <p style={{ fontFamily: dahila.fontSans, fontSize: 15, fontWeight: 300, lineHeight: 1.7, color: dahila.ink700, margin: 0 }}>
          Te respondo por mail en 48hs con un boceto, los materiales que tengo y el presupuesto.
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
            style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

        <Field label="¿Qué querés tejer?">
          <div className="encargo-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 8 }}>
            {['Cardigan', 'Top', 'Set', 'Otro'].map((t) => (
              <button key={t} type="button" onClick={() => setTipo(t)} style={{
                padding: '14px 8px', borderRadius: 8,
                background: tipo === t ? dahila.ink900 : '#fff',
                color: tipo === t ? '#fff' : dahila.ink900,
                border: `1px solid ${tipo === t ? dahila.ink900 : dahila.borderStrong}`,
                cursor: 'pointer',
                fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 400, letterSpacing: '0.04em',
                transition: `all 140ms ${dahila.ease}`,
              }}>{t}</button>
            ))}
          </div>
        </Field>

        <div className="encargo-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <Field label="Tu nombre"><TextInput placeholder="¿Cómo te llamás?"/></Field>
          <Field label="Mail"><TextInput placeholder="vos@correo.uy" type="email"/></Field>
        </div>

        <Field label="Talle aproximado">
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {['XS', 'S', 'M', 'L', 'XL'].map((t) => (
              <button key={t} type="button" onClick={() => setTalle(t)} style={{
                width: 44, height: 40, borderRadius: 8,
                fontFamily: dahila.fontSans, fontSize: 12,
                border: `1px solid ${talle === t ? dahila.ink900 : dahila.borderStrong}`,
                background: talle === t ? dahila.ink900 : '#fff',
                color: talle === t ? '#fff' : dahila.ink900,
                cursor: 'pointer', transition: `all 140ms ${dahila.ease}`,
              }}>{t}</button>
            ))}
          </div>
        </Field>

        <Field label="Contame de tu prenda" helper="Para qué la querés, qué colores te gustan, en qué lana — cuanto más detalles, mejor.">
          <textarea rows={5} style={{
            fontFamily: dahila.fontSans, fontSize: 14, fontWeight: 300, color: dahila.ink900,
            background: 'transparent', border: 'none',
            borderBottom: `1px solid ${dahila.borderStrong}`,
            padding: '10px 0 8px', outline: 'none', resize: 'vertical',
          }}/>
        </Field>

        <Button variant="primary" size="lg" full type="submit">Enviar encargo</Button>
      </form>
      <style>{`
        @media (max-width: 720px) {
          .encargo-grid-4 { grid-template-columns: 1fr 1fr !important; }
          .encargo-grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  )
}
