'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { dahila, Eyebrow, Field, TextInput, Button } from '@/components/ui/Primitives'
import { EncargosDisponibles } from '@/components/EncargosDisponibles'
import { submitEncargo } from './actions'

export default function EncargoForm() {
  const router = useRouter()
  const [tipo, setTipo] = useState('Cardigan')
  const [talle, setTalle] = useState('M')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [trackingCode, setTrackingCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (submitted) {
    const waText = encodeURIComponent(
      `Hola! Acabo de mandar un encargo desde la web${name ? ` (soy ${name})` : ''}. Quería sumar algo más.`
    )
    return (
      <main style={{ maxWidth: 560, margin: '0 auto', padding: '96px 24px', textAlign: 'center' }}>
        <Eyebrow>Encargo recibido</Eyebrow>
        <h1 style={{
          fontFamily: dahila.fontDisplay, fontWeight: 300,
          fontSize: 'clamp(32px, 5vw, 48px)', lineHeight: 1.1, letterSpacing: '-0.02em',
          color: dahila.ink900, margin: '14px 0 16px',
        }}>Gracias.</h1>
        <p style={{ fontFamily: dahila.fontSerif, fontStyle: 'italic', fontWeight: 300, fontSize: 18, color: dahila.ink700, marginBottom: 24 }}>
          Te escribimos cuanto antes con opciones y presupuesto.
        </p>

        {/* What happens next — sets expectations, calms anxiety */}
        <ol style={{
          listStyle: 'none', padding: 0, margin: '0 auto 32px', maxWidth: 420,
          display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left',
        }}>
          {[
            ['1', 'Leemos tu pedido', 'Vemos el modelo, los colores y la medida que nos contaste.'],
            ['2', 'Te respondemos', 'Con opciones, materiales y el presupuesto.'],
            ['3', 'Tejemos tu pieza', 'Cuando confirmás, empezamos. Te avisamos cuando está lista.'],
          ].map(([n, t, b]) => (
            <li key={n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{
                flexShrink: 0, width: 26, height: 26, borderRadius: 999,
                background: dahila.cream100, color: dahila.wine700,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: dahila.fontSans, fontSize: 12, fontWeight: 600,
              }}>{n}</span>
              <div>
                <div style={{ fontFamily: dahila.fontSans, fontSize: 14, fontWeight: 500, color: dahila.ink900 }}>{t}</div>
                <div style={{ fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 300, color: dahila.ink700, lineHeight: 1.5 }}>{b}</div>
              </div>
            </li>
          ))}
        </ol>

        {/* Tracking code — so the customer can check the status later. */}
        {trackingCode && (
          <div style={{
            background: dahila.cream100, borderRadius: 12, padding: '18px 20px',
            margin: '0 auto 28px', maxWidth: 420,
          }}>
            <div style={{ fontFamily: dahila.fontSans, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: dahila.ink500, marginBottom: 6 }}>
              Tu código de seguimiento
            </div>
            <div style={{ fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 26, letterSpacing: '0.08em', color: dahila.ink900 }}>
              {trackingCode}
            </div>
            <p style={{ fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink700, margin: '8px 0 0', lineHeight: 1.5 }}>
              Guardalo. Con este código podés ver el estado de tu encargo cuando quieras.
            </p>
            <button
              type="button"
              onClick={() => router.push(`/encargo/estado?codigo=${encodeURIComponent(trackingCode)}`)}
              style={{
                marginTop: 12, background: 'transparent', border: 'none', cursor: 'pointer',
                fontFamily: dahila.fontSans, fontSize: 13, color: dahila.wine600, textDecoration: 'underline', padding: 0,
              }}
            >
              Ver el estado de mi encargo →
            </button>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href={`https://wa.me/59894605015?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#25D366', color: '#fff', textDecoration: 'none',
              borderRadius: 10, padding: '13px 22px',
              fontFamily: dahila.fontSans, fontSize: 12, fontWeight: 500,
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}
          >
            Seguir por WhatsApp
          </a>
          <Button variant="secondary" onClick={() => router.push('/tienda')}>Ver la tienda</Button>
        </div>
      </main>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const fd = new FormData()
    fd.set('name', name)
    fd.set('email', email)
    fd.set('whatsapp', whatsapp)
    fd.set('tipo', tipo)
    fd.set('talle', talle)
    fd.set('message', message)
    startTransition(async () => {
      const res = await submitEncargo(fd)
      if (res.ok) {
        setTrackingCode(res.code ?? null)
        setSubmitted(true)
      } else {
        setError(res.error || 'No se pudo enviar el encargo.')
      }
    })
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
          Te respondo cuanto antes con un boceto, los materiales que tengo y el presupuesto.
        </p>
        <button type="button" onClick={() => router.push('/encargo/estado')} style={{
          alignSelf: 'flex-start', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
          fontFamily: dahila.fontSans, fontSize: 13, color: dahila.wine600, textDecoration: 'underline',
        }}>
          ¿Ya hiciste un encargo? Seguí su estado con tu código →
        </button>
        <EncargosDisponibles />
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }} noValidate>

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

        <Field label="Tu nombre">
          <TextInput placeholder="¿Cómo te llamás?" value={name} onChange={setName} />
        </Field>

        <div className="encargo-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <Field label="WhatsApp" helper="Te respondo más rápido por acá.">
            <TextInput placeholder="+598 ..." value={whatsapp} onChange={setWhatsapp} />
          </Field>
          <Field label="Mail" helper="Si preferís, dejá tu mail.">
            <TextInput placeholder="vos@correo.uy" type="email" value={email} onChange={setEmail} />
          </Field>
        </div>
        <p style={{ fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink500, margin: '-14px 0 0' }}>
          Con uno de los dos alcanza.
        </p>

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
          <textarea
            rows={5}
            maxLength={1500}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{
              fontFamily: dahila.fontSans, fontSize: 14, fontWeight: 300, color: dahila.ink900,
              background: 'transparent', border: 'none',
              borderBottom: `1px solid ${dahila.borderStrong}`,
              padding: '10px 0 8px', outline: 'none', resize: 'vertical',
            }}
          />
        </Field>

        {error && (
          <div role="alert" style={{
            background: 'rgba(182,49,74,0.06)',
            border: '1px solid rgba(182,49,74,0.24)',
            color: '#7a1e2f',
            padding: '12px 14px',
            borderRadius: 8,
            fontFamily: dahila.fontSans, fontSize: 13,
          }}>
            {error}
          </div>
        )}

        <Button variant="primary" size="lg" full type="submit" disabled={isPending}>
          {isPending ? 'Enviando...' : 'Enviar encargo'}
        </Button>
      </form>
    </main>
  )
}
