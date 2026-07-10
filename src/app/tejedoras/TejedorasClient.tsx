'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { dahila, Eyebrow, Field, TextInput, Button } from '@/components/ui/Primitives'
import { submitTejedora } from './actions'

const EXPERIENCIAS = [
  { value: '<1', label: 'Menos de 1 año' },
  { value: '1-3', label: '1 a 3 años' },
  { value: '3-5', label: '3 a 5 años' },
  { value: '5+', label: 'Más de 5 años' },
]

const DISPONIBILIDADES = ['<5 h', '5-10 h', '10-20 h', '20+ h']

const SKILLS = ['Tops', 'Cardigans y abrigo', 'Bolsos y accesorios', 'Bikinis y playa', 'Amigurumi']

const PASOS: Array<[string, string, string]> = [
  ['1', 'Postulás', 'Nos contás tu experiencia y nos mostrás 2 o 3 trabajos tuyos. Las fotos son lo primero que miramos.'],
  ['2', 'Charlamos', 'Si tu estilo encaja, te escribimos por WhatsApp para conocerte y contarte cómo trabajamos.'],
  ['3', 'Muestra pagada', 'Tejés una pieza de prueba contra una ficha técnica (lana, aguja, medidas). La pagamos siempre, quede o no.'],
  ['4', 'Primeros encargos', 'Arrancás con piezas simples, con precio pactado antes de empezar, y vas subiendo a tu ritmo.'],
]

const VALORAMOS = [
  'Tensión pareja y puntos prolijos',
  'Medidas exactas según la ficha de cada modelo',
  'Terminaciones y costuras cuidadas',
  'Cumplir los tiempos que acordamos juntas',
]

export default function TejedorasClient({ whatsappUrl }: { whatsappUrl: string }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [experience, setExperience] = useState('1-3')
  const [skills, setSkills] = useState<string[]>([])
  const [availability, setAvailability] = useState('5-10 h')
  const [hasMaterials, setHasMaterials] = useState(true)
  const [portfolio, setPortfolio] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const toggleSkill = (s: string) =>
    setSkills((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))

  if (submitted) {
    const waText = encodeURIComponent(
      `Hola! Acabo de postularme como tejedora desde la web${name ? ` (soy ${name})` : ''}.`
    )
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '96px 24px', textAlign: 'center' }}>
        <Eyebrow>Postulación recibida</Eyebrow>
        <h1 style={{
          fontFamily: dahila.fontDisplay, fontWeight: 300,
          fontSize: 'clamp(32px, 5vw, 48px)', lineHeight: 1.1, letterSpacing: '-0.02em',
          color: dahila.ink900, margin: '14px 0 16px',
        }}>¡Gracias por querer tejer con nosotras!</h1>
        <p style={{ fontFamily: dahila.fontSerif, fontStyle: 'italic', fontWeight: 300, fontSize: 18, color: dahila.ink700, marginBottom: 28, lineHeight: 1.6 }}>
          Vamos a mirar tus trabajos con calma. Si tu estilo encaja con lo que buscamos,
          te escribimos para coordinar una muestra pagada.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href={`${whatsappUrl.replace(/\/+$/, '')}?text=${waText}`}
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
            Escribinos por WhatsApp
          </a>
          <Button variant="secondary" onClick={() => router.push('/tienda')}>Conocer la tienda</Button>
        </div>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) { setError('Contanos cómo te llamás.'); return }
    if (!whatsapp.trim() && !email.trim()) { setError('Dejá tu WhatsApp o email para poder responderte.'); return }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('El email no parece válido.'); return }
    if (skills.length === 0) { setError('Marcá al menos una cosa que sepas tejer.'); return }
    if (!portfolio.trim() && !message.trim()) { setError('Dejanos links o una descripción de tus trabajos — es lo primero que miramos.'); return }

    const fd = new FormData()
    fd.set('name', name)
    fd.set('location', location)
    fd.set('whatsapp', whatsapp)
    fd.set('email', email)
    fd.set('experience', experience)
    fd.set('skills', skills.join(', '))
    fd.set('availability', availability)
    fd.set('has_materials', hasMaterials ? 'true' : 'false')
    fd.set('portfolio', portfolio)
    fd.set('message', message)
    startTransition(async () => {
      const res = await submitTejedora(fd)
      if (res.ok) {
        setSubmitted(true)
      } else {
        setError(res.error || 'No se pudo enviar la postulación.')
      }
    })
  }

  const optionBtn = (on: boolean): React.CSSProperties => ({
    padding: '12px 14px', minHeight: 44, borderRadius: 8,
    background: on ? dahila.ink900 : '#fff',
    color: on ? '#fff' : dahila.ink900,
    border: `1px solid ${on ? dahila.ink900 : dahila.borderStrong}`,
    cursor: 'pointer',
    fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 400, letterSpacing: '0.02em',
    transition: `all 140ms ${dahila.ease}`,
  })

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 0' }}>
      {/* Hero */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 40 }}>
        <Eyebrow>Tejé con Dahila</Eyebrow>
        <h1 style={{
          fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 'clamp(32px, 5vw, 48px)',
          lineHeight: 1.05, letterSpacing: '-0.02em', color: dahila.ink900, margin: 0,
        }}>¿Tejés a crochet? Trabajemos juntas</h1>
        <p style={{ fontFamily: dahila.fontSans, fontSize: 15, fontWeight: 300, lineHeight: 1.7, color: dahila.ink700, margin: 0 }}>
          Estamos armando una red de tejedoras uruguayas para crecer sin perder lo artesanal.
          Trabajás desde tu casa, a tu ritmo, con <strong style={{ fontWeight: 500 }}>pago por pieza aprobada</strong> y
          la lana la ponemos nosotras.
        </p>
      </div>

      {/* Cómo funciona */}
      <section aria-labelledby="tejedoras-pasos" style={{ marginBottom: 40 }}>
        <h2 id="tejedoras-pasos" style={{
          fontFamily: dahila.fontSans, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
          color: dahila.ink500, fontWeight: 400, margin: '0 0 18px',
        }}>Cómo funciona</h2>
        <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {PASOS.map(([n, t, b]) => (
            <li key={n} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{
                flexShrink: 0, width: 28, height: 28, borderRadius: 999,
                background: dahila.cream100, color: dahila.wine700,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: dahila.fontSans, fontSize: 12, fontWeight: 600,
              }}>{n}</span>
              <div>
                <div style={{ fontFamily: dahila.fontSans, fontSize: 15, fontWeight: 500, color: dahila.ink900 }}>{t}</div>
                <div style={{ fontFamily: dahila.fontSans, fontSize: 14, fontWeight: 300, color: dahila.ink700, lineHeight: 1.6 }}>{b}</div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Qué valoramos */}
      <section aria-labelledby="tejedoras-valoramos" style={{
        background: dahila.cream50, border: `1px solid ${dahila.border}`,
        borderRadius: 14, padding: '22px 24px', marginBottom: 48,
      }}>
        <h2 id="tejedoras-valoramos" style={{
          fontFamily: dahila.fontSans, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
          color: dahila.ink500, fontWeight: 400, margin: '0 0 12px',
        }}>Qué valoramos</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {VALORAMOS.map((v) => (
            <li key={v} style={{
              fontFamily: dahila.fontSans, fontSize: 14, fontWeight: 300, color: dahila.ink700,
              display: 'flex', gap: 10, alignItems: 'baseline',
            }}>
              <span aria-hidden="true" style={{ color: dahila.wine600 }}>·</span>{v}
            </li>
          ))}
        </ul>
      </section>

      {/* Formulario */}
      <h2 style={{
        fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 28,
        letterSpacing: '-0.01em', color: dahila.ink900, margin: '0 0 24px',
      }}>Postulate</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }} noValidate>
        <div className="encargo-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <Field label="Tu nombre">
            <TextInput placeholder="¿Cómo te llamás?" value={name} onChange={setName} />
          </Field>
          <Field label="¿De dónde sos?">
            <TextInput placeholder="Montevideo, Canelones…" value={location} onChange={setLocation} />
          </Field>
        </div>

        <div className="encargo-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <Field label="WhatsApp" helper="Te respondemos más rápido por acá.">
            <TextInput placeholder="+598 ..." value={whatsapp} onChange={setWhatsapp} />
          </Field>
          <Field label="Mail">
            <TextInput placeholder="vos@correo.uy" type="email" value={email} onChange={setEmail} />
          </Field>
        </div>
        <p style={{ fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink500, margin: '-14px 0 0' }}>
          Con uno de los dos alcanza.
        </p>

        <Field label="¿Hace cuánto tejés?">
          <div className="encargo-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 8 }}>
            {EXPERIENCIAS.map((e2) => (
              <button key={e2.value} type="button" onClick={() => setExperience(e2.value)}
                aria-pressed={experience === e2.value} style={optionBtn(experience === e2.value)}>
                {e2.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="¿Qué sabés tejer?" helper="Marcá todo lo que aplique.">
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            {SKILLS.map((s) => (
              <button key={s} type="button" onClick={() => toggleSkill(s)}
                aria-pressed={skills.includes(s)} style={optionBtn(skills.includes(s))}>
                {s}
              </button>
            ))}
          </div>
        </Field>

        <Field label="¿Cuántas horas por semana tenés?">
          <div className="encargo-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 8 }}>
            {DISPONIBILIDADES.map((d) => (
              <button key={d} type="button" onClick={() => setAvailability(d)}
                aria-pressed={availability === d} style={optionBtn(availability === d)}>
                {d}
              </button>
            ))}
          </div>
        </Field>

        <Field label="¿Tenés agujas y lana propias?" helper="Para los encargos la lana la ponemos nosotras — esto es solo para la muestra.">
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {[['Sí', true], ['No', false]].map(([label, val]) => (
              <button key={String(label)} type="button" onClick={() => setHasMaterials(val as boolean)}
                aria-pressed={hasMaterials === val} style={{ ...optionBtn(hasMaterials === val), minWidth: 72 }}>
                {label as string}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Mostranos tus trabajos" helper="Links a tu Instagram, fotos en Drive o donde tengas trabajos para ver.">
          <TextInput placeholder="https://instagram.com/…" value={portfolio} onChange={setPortfolio} />
        </Field>

        <Field label="Contanos de vos" helper="Qué te gusta tejer, con qué lanas trabajaste, si tejiste por encargo antes.">
          <textarea
            rows={5}
            maxLength={1500}
            value={message}
            onChange={(e2) => setMessage(e2.target.value)}
            style={{
              fontFamily: dahila.fontSans, fontSize: 14, fontWeight: 300, color: dahila.ink900,
              background: 'transparent', border: 'none',
              borderBottom: `1px solid ${dahila.borderStrong}`,
              padding: '10px 0 8px', resize: 'vertical',
              width: '100%', boxSizing: 'border-box',
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
          {isPending ? 'Enviando...' : 'Enviar postulación'}
        </Button>
      </form>
    </div>
  )
}
