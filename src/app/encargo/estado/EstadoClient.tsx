'use client'

import { useState, useTransition, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { dahila, Eyebrow, Button, Icon, Field, TextInput } from '@/components/ui/Primitives'
import { lookupEncargo, type EncargoStatusResult, type EncargoStatus } from '../actions'

// Each status mapped to a friendly label, blurb and how far along it is (1-4).
const STEPS: { key: EncargoStatus; label: string; blurb: string; step: number }[] = [
  { key: 'new',         label: 'Recibido',     blurb: 'Tu pedido nos llegó. Lo estamos mirando.', step: 1 },
  { key: 'replied',     label: 'Te escribimos', blurb: 'Te enviamos opciones y presupuesto. Revisá tu WhatsApp o mail.', step: 2 },
  { key: 'in_progress', label: 'En proceso',    blurb: '¡Manos a la obra! Estamos tejiendo tu pieza.', step: 3 },
  { key: 'done',        label: 'Listo',         blurb: 'Tu pieza está terminada. Coordinamos la entrega.', step: 4 },
]

function StatusView({ result }: { result: EncargoStatusResult }) {
  if (result.status === 'cancelled') {
    return (
      <div style={{ background: dahila.cream100, borderRadius: 14, padding: '28px 24px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 24, color: dahila.ink900, margin: 0 }}>Encargo cancelado</h2>
        <p style={{ fontFamily: dahila.fontSans, fontSize: 14, color: dahila.ink700, margin: '8px 0 0' }}>
          Si creés que es un error, escribinos por WhatsApp y lo vemos.
        </p>
      </div>
    )
  }

  const current = STEPS.find((s) => s.key === result.status) ?? STEPS[0]

  return (
    <div>
      <p style={{ fontFamily: dahila.fontSans, fontSize: 14, color: dahila.ink700, margin: '0 0 24px' }}>
        {result.name ? `Hola ${result.name}, ` : ''}este es el estado de tu encargo:
      </p>

      {/* Progress steps */}
      <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>
        {STEPS.map((s, i) => {
          const reached = s.step <= current.step
          const isCurrent = s.key === current.key
          return (
            <li key={s.key} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', alignSelf: 'stretch' }}>
                <span style={{
                  flexShrink: 0, width: 28, height: 28, borderRadius: 999,
                  background: reached ? dahila.ink900 : dahila.cream200,
                  color: reached ? '#fff' : dahila.ink500,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: dahila.fontSans, fontSize: 12, fontWeight: 600,
                }}>
                  {reached ? <Icon name="check" size={14} color="#fff" /> : s.step}
                </span>
                {i < STEPS.length - 1 && (
                  <span style={{ width: 2, flex: 1, minHeight: 28, background: s.step < current.step ? dahila.ink900 : dahila.border }} />
                )}
              </div>
              <div style={{ paddingBottom: 22 }}>
                <div style={{
                  fontFamily: dahila.fontSans, fontSize: 15,
                  fontWeight: isCurrent ? 600 : 400,
                  color: reached ? dahila.ink900 : dahila.ink500,
                }}>{s.label}</div>
                {isCurrent && (
                  <div style={{ fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 300, color: dahila.ink700, lineHeight: 1.5, marginTop: 2 }}>
                    {s.blurb}
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ol>

      <p style={{ fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink500, marginTop: 8 }}>
        ¿Dudas? Escribinos por WhatsApp y te respondemos.
      </p>
    </div>
  )
}

export function EstadoClient() {
  const params = useSearchParams()
  const [code, setCode] = useState('')
  const [result, setResult] = useState<EncargoStatusResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const run = (value: string) => {
    setError(null)
    setResult(null)
    startTransition(async () => {
      const res = await lookupEncargo(value)
      if (res.error) setError(res.error)
      else setResult(res)
    })
  }

  // Deep link: /encargo/estado?codigo=DAH-XXXXXX auto-looks-up.
  useEffect(() => {
    const c = params.get('codigo')
    if (c) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCode(c)
      run(c)
    }
    // run is stable (refs startTransition which is stable); omitting to avoid loop.
  }, [params])

  return (
    <main style={{ maxWidth: 520, margin: '0 auto', padding: '48px 24px 80px' }}>
      <Eyebrow>Seguimiento</Eyebrow>
      <h1 style={{
        fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 'clamp(28px, 5vw, 40px)',
        lineHeight: 1.05, letterSpacing: '-0.02em', color: dahila.ink900, margin: '10px 0 8px',
      }}>Estado de tu encargo</h1>
      <p style={{ fontFamily: dahila.fontSans, fontSize: 14, fontWeight: 300, color: dahila.ink700, margin: '0 0 28px' }}>
        Ingresá el código que te dimos al hacer el encargo (ej. DAH-AB2CDE).
      </p>

      <form onSubmit={(e) => { e.preventDefault(); run(code) }} style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginBottom: 28 }}>
        <div style={{ flex: 1 }}>
          <Field label="Código">
            <TextInput value={code} onChange={setCode} placeholder="DAH-AB2CDE" />
          </Field>
        </div>
        <Button variant="primary" type="submit" disabled={isPending}>
          {isPending ? 'Buscando…' : 'Buscar'}
        </Button>
      </form>

      {error && (
        <div role="alert" style={{ background: 'rgba(182,49,74,0.06)', border: '1px solid rgba(182,49,74,0.24)', color: '#7a1e2f', padding: '12px 14px', borderRadius: 8, fontFamily: dahila.fontSans, fontSize: 13 }}>
          {error}
        </div>
      )}

      {result && !result.found && !error && (
        <div style={{ background: dahila.cream100, borderRadius: 12, padding: '20px', fontFamily: dahila.fontSans, fontSize: 14, color: dahila.ink700 }}>
          No encontramos ningún encargo con ese código. Revisá que esté bien escrito.
        </div>
      )}

      {result && result.found && <StatusView result={result} />}
    </main>
  )
}
