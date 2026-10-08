'use client'

import { useState } from 'react'
import Link from 'next/link'
import { dahila, Eyebrow, Icon } from '@/components/ui/Primitives'
import { formatPrice } from '@/lib/types'
import { track } from '@/lib/analytics'

export interface GiftSuggestion {
  amount: number
  /** Prenda del catálogo que cuesta eso: "alcanza para un Top Lourdes". */
  label: string
}

const field: React.CSSProperties = {
  width: '100%', minHeight: 44, padding: '10px 12px', borderRadius: 10,
  border: `1px solid ${dahila.borderStrong}`, background: '#fff',
  fontFamily: dahila.fontSans, fontSize: 16, color: dahila.ink900,
}
const ctaStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
  width: '100%', minHeight: 52, borderRadius: 12, textDecoration: 'none',
  fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase',
}
const stepLink: React.CSSProperties = { color: dahila.wine600, textDecoration: 'underline', textUnderlineOffset: 3 }
const labelText: React.CSSProperties = {
  fontFamily: dahila.fontSans, fontSize: 11, letterSpacing: '0.12em',
  textTransform: 'uppercase', color: dahila.ink500,
}

export function RegaloClient({ whatsappUrl, suggestions }: { whatsappUrl: string; suggestions: GiftSuggestion[] }) {
  const [amount, setAmount] = useState<number | null>(suggestions[1]?.amount ?? suggestions[0]?.amount ?? null)
  const [custom, setCustom] = useState('')
  const [para, setPara] = useState('')
  const [de, setDe] = useState('')
  const [mensaje, setMensaje] = useState('')

  const customNum = parseInt(custom)
  const finalAmount = custom.trim() ? (Number.isFinite(customNum) && customNum > 0 ? customNum : null) : amount
  const ready = finalAmount != null && para.trim() !== '' && de.trim() !== ''

  const waHref = (() => {
    const lines = [
      'Hola! Quiero regalar una tarjeta de regalo de Dahila 🎁',
      '',
      `• Monto: ${finalAmount != null ? formatPrice(finalAmount) : '—'}`,
      `• Para: ${para.trim() || '—'}`,
      `• De parte de: ${de.trim() || '—'}`,
      ...(mensaje.trim() ? [`• Mensaje: "${mensaje.trim()}"`] : []),
      '',
      '¿Cómo seguimos con el pago?',
    ]
    const base = whatsappUrl.replace(/\/+$/, '')
    return `${base}${base.includes('?') ? '&' : '?'}text=${encodeURIComponent(lines.join('\n'))}`
  })()

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 88px' }}>
      <Eyebrow>Tarjeta de regalo</Eyebrow>
      <h1 style={{
        fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 'clamp(32px, 5vw, 48px)',
        lineHeight: 1.05, letterSpacing: '-0.02em', color: dahila.ink900, margin: '10px 0 12px',
      }}>Regalá algo tejido a mano</h1>
      <p style={{ fontFamily: dahila.fontSans, fontSize: 15, fontWeight: 300, lineHeight: 1.7, color: dahila.ink700, margin: '0 0 36px', maxWidth: 620 }}>
        Sin adivinar el talle ni el color: elegís el monto, le escribís unas palabras y quien la recibe elige
        su prenda. Si es a medida, la tejo con sus medidas exactas.
      </p>

      <div className="regalo-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 40, alignItems: 'start' }}>
        {/* Formulario */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
            <legend style={{ ...labelText, marginBottom: 10 }}>Monto</legend>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {suggestions.map((s) => {
                const active = !custom.trim() && amount === s.amount
                return (
                  <button
                    key={s.amount}
                    type="button"
                    aria-pressed={active}
                    onClick={() => { setAmount(s.amount); setCustom('') }}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
                      minHeight: 52, padding: '10px 16px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                      background: active ? dahila.ink900 : '#fff', color: active ? '#fff' : dahila.ink900,
                      border: `1px solid ${active ? dahila.ink900 : dahila.borderStrong}`,
                      fontFamily: dahila.fontSans,
                    }}
                  >
                    <span style={{ fontSize: 16, fontWeight: 500 }}>{formatPrice(s.amount)}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 300, opacity: 0.85 }}>alcanza para {s.label}</span>
                  </button>
                )
              })}
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                <span style={{ fontFamily: dahila.fontSans, fontSize: 13, color: dahila.ink700 }}>Otro monto</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  placeholder="$"
                  style={field}
                />
              </label>
            </div>
          </fieldset>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={labelText}>Para</span>
              <input value={para} onChange={(e) => setPara(e.target.value)} maxLength={60} placeholder="Su nombre" autoComplete="off" style={field} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={labelText}>De parte de</span>
              <input value={de} onChange={(e) => setDe(e.target.value)} maxLength={60} placeholder="Tu nombre" autoComplete="given-name" style={field} />
            </label>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={labelText}>Mensaje (opcional)</span>
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              maxLength={200}
              rows={3}
              placeholder="Feliz cumple, para que elijas algo hecho para vos."
              style={{ ...field, resize: 'vertical', fontFamily: dahila.fontSans }}
            />
            <span style={{ fontFamily: dahila.fontSans, fontSize: 11.5, color: dahila.ink500, alignSelf: 'flex-end' }}>{mensaje.length}/200</span>
          </label>

          {/* Un <a> sin href no es nada para un lector de pantalla: mientras
              falten datos es un botón deshabilitado que dice qué falta. */}
          {ready ? (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('gift_card_request', { amount: finalAmount })}
              style={{ ...ctaStyle, background: dahila.whatsapp, color: '#fff', cursor: 'pointer' }}
            >
              <Icon name="whatsapp-logo" size={18} /> Pedir la tarjeta por WhatsApp
            </a>
          ) : (
            <button
              type="button"
              disabled
              aria-describedby="regalo-falta"
              style={{ ...ctaStyle, background: dahila.cream200, color: dahila.ink500, cursor: 'not-allowed', border: 'none' }}
            >
              <Icon name="whatsapp-logo" size={18} /> Pedir la tarjeta por WhatsApp
            </button>
          )}
          {!ready && (
            <span id="regalo-falta" style={{ fontFamily: dahila.fontSans, fontSize: 12.5, color: dahila.ink700, marginTop: -12 }}>
              Completá el monto, para quién y de parte de quién.
            </span>
          )}
        </div>

        {/* Vista previa de la tarjeta */}
        <div style={{ position: 'sticky', top: 96, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div aria-label="Vista previa de la tarjeta" style={{
            aspectRatio: '1.6 / 1', borderRadius: 18, padding: 'clamp(20px, 4vw, 32px)',
            background: `linear-gradient(135deg, ${dahila.cream100} 0%, #F3E3DF 100%)`,
            border: `1px solid ${dahila.border}`, boxShadow: dahila.shadowMd,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 22, color: dahila.ink900 }}>Dahila</span>
              <Icon name="gift" size={22} color={dahila.wine600} />
            </div>
            <div>
              <div style={{ fontFamily: dahila.fontSans, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: dahila.ink500 }}>
                Para {para.trim() || '…'}
              </div>
              {mensaje.trim() && (
                <p style={{
                  margin: '6px 0 0', fontFamily: dahila.fontSerif, fontStyle: 'italic', fontWeight: 300,
                  fontSize: 15, lineHeight: 1.45, color: dahila.ink700,
                  display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>“{mensaje.trim()}”</p>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
              <span style={{ fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink700 }}>De {de.trim() || '…'}</span>
              <span style={{ fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 30, color: dahila.ink900 }}>
                {finalAmount != null ? formatPrice(finalAmount) : '—'}
              </span>
            </div>
          </div>

          <ol style={{ margin: 0, paddingLeft: 20, fontFamily: dahila.fontSans, fontSize: 13.5, lineHeight: 1.7, color: dahila.ink700 }}>
            <li>Me escribís por WhatsApp con este pedido.</li>
            <li>Pagás por transferencia o Mercado Pago.</li>
            <li>Te mando la tarjeta con un código para que se la regales.</li>
            <li>Quien la recibe elige su prenda en la <Link href="/tienda" style={stepLink}>tienda</Link> o <Link href="/encargo" style={stepLink}>a medida</Link> y usa el código.</li>
          </ol>
        </div>
      </div>

      <style>{`
        @media (max-width: 760px) {
          .regalo-grid { grid-template-columns: minmax(0, 1fr) !important; }
          /* En el celular primero el formulario (lo que hay que hacer) y la
             tarjeta debajo, como confirmación: arriba ocupaba toda la pantalla. */
          .regalo-grid > div:last-child { position: static !important; }
        }
      `}</style>
    </div>
  )
}
