'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { dahila, Eyebrow, Icon } from '@/components/ui/Primitives'
import { formatPrice } from '@/lib/types'
import { parseMoneyUYU } from '@/lib/parse-money'
import { waLink, WHATSAPP_DEFAULT } from '@/lib/whatsapp'
import { track } from '@/lib/analytics'
import { REGALO_FAQ } from './faq'

export interface GiftSuggestion {
  amount: number
  /** Prenda del catálogo que cuesta eso: "alcanza para un Top Lourdes". */
  label: string
}

// Los campos usan .dh-campo (globals.css): la misma caja que /encargo,
// /tejedoras y /encargo/estado, con el mismo foco (VIS-14, 04/11/2026).
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

export function RegaloClient({ whatsappUrl, suggestions, sinTalle }: {
  whatsappUrl: string
  suggestions: GiftSuggestion[]
  /** Grilla de piezas sin talle y en stock (la arma el servidor). */
  sinTalle?: ReactNode
}) {
  const [amount, setAmount] = useState<number | null>(suggestions[1]?.amount ?? suggestions[0]?.amount ?? null)
  const [custom, setCustom] = useState('')
  const [para, setPara] = useState('')
  const [de, setDe] = useState('')
  const [mensaje, setMensaje] = useState('')

  // "Otro monto" como lo escribe una persona (QA-03): con parseInt, "2.000"
  // llegaba a Anush como "Monto: UYU 2". Si hay texto y no se entiende (o es
  // 0), no hay monto: el botón no se habilita y se explica cómo escribirlo.
  const customNum = parseMoneyUYU(custom)
  const customTyped = custom.trim() !== ''
  const customOk = customNum != null && customNum > 0
  const finalAmount = customTyped ? (customOk ? customNum : null) : amount
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
    const text = lines.join('\n')
    return waLink(whatsappUrl, text) ?? waLink(WHATSAPP_DEFAULT, text)!
  })()

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 88px' }}>
      <Eyebrow>Tarjeta de regalo</Eyebrow>
      <h1 style={{
        fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 'clamp(32px, 5vw, 48px)',
        lineHeight: 1.05, letterSpacing: '-0.02em', color: dahila.ink900, margin: '10px 0 12px',
      }}>Regalá algo tejido a mano</h1>
      <p style={{ fontFamily: dahila.fontSans, fontSize: 15, fontWeight: 300, lineHeight: 1.7, color: dahila.ink700, margin: '0 0 16px', maxWidth: 620 }}>
        Sin adivinar el talle ni el color: elegís el monto, le escribís unas palabras y quien la recibe elige
        su prenda. Si es a medida, la tejo con sus medidas exactas.
        {sinTalle && (
          <>
            {' '}
            {/* Subrayado (VIS-16): dentro del párrafo se distinguía solo por el
                color, con 1,37:1 de diferencia (axe: link-in-text-block). */}
            <a href="#regalo-sin-talle" style={{ color: dahila.wine600, whiteSpace: 'nowrap', textDecoration: 'underline', textUnderlineOffset: 3 }}>
              ¿Preferís regalar una pieza ya tejida? ↓
            </a>
          </>
        )}
      </p>
      {/* Lo esencial antes de bajar (12/10/2026): qué es, dónde sirve y cómo
          se paga — Baymard: la mayoría de los sitios no explica sus opciones
          de regalo, y la duda frena la compra. Lista simple y no pastillas
          (VIS-16, 04/11/2026): con fondo y borde parecían botones que no
          hacían nada, y en el celular ocupaban tres renglones de chip. */}
      <ul aria-label="Lo esencial" className="regalo-esencial" style={{
        listStyle: 'none', padding: 0, margin: '0 0 36px',
        display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '6px 24px',
      }}>
        {['Sirve en la tienda o a medida', 'Llega por WhatsApp, lista para reenviar', 'Pagás por transferencia o Mercado Pago'].map((t) => (
          <li key={t} style={{
            display: 'flex', alignItems: 'flex-start', gap: 7,
            fontFamily: dahila.fontSans, fontSize: 13, lineHeight: 1.5, color: dahila.ink700,
          }}>
            {/* El check centrado en el primer renglón, aunque el texto baje a dos. */}
            <span style={{ flexShrink: 0, display: 'inline-flex', marginTop: 3 }}>
              <Icon name="check" size={13} color={dahila.wine600} />
            </span>
            <span>{t}</span>
          </li>
        ))}
      </ul>

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
                {/* Texto y no number: el teclado numérico de Android trae "."
                    y ",", y un input number en es-UY tira lo que no entiende. */}
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  placeholder="$"
                  aria-describedby="regalo-monto"
                  aria-invalid={customTyped && !customOk ? true : undefined}
                  className="dh-campo"
                  style={customTyped && !customOk ? { borderColor: '#B6314A' } : undefined}
                />
              </label>
              {/* Lo que se va a pedir, mientras se escribe: así "2.000" se ve
                  como UYU 2.000 antes de mandarlo. Siempre en el DOM (vacío si
                  no hay nada escrito): una región aria-live que aparece junto
                  con su texto no siempre se anuncia. */}
              <span
                id="regalo-monto"
                aria-live="polite"
                style={{ fontFamily: dahila.fontSans, fontSize: 12.5, color: customOk ? dahila.ink700 : '#B6314A' }}
              >
                {!customTyped ? '' : customOk ? `Monto: ${formatPrice(customNum)}` : 'Escribí el monto en pesos, sin centavos (ej. 2000 o 2.000)'}
              </span>
            </div>
          </fieldset>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={labelText}>Para</span>
              <input value={para} onChange={(e) => setPara(e.target.value)} maxLength={60} placeholder="Su nombre" autoComplete="off" className="dh-campo" />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={labelText}>De parte de</span>
              <input value={de} onChange={(e) => setDe(e.target.value)} maxLength={60} placeholder="Tu nombre" autoComplete="given-name" className="dh-campo" />
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
              className="dh-campo"
              style={{ resize: 'vertical' }}
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

      {sinTalle}

      {/* Preguntas frecuentes: condiciones claras, sin letra chica. */}
      <section aria-labelledby="regalo-faq" style={{ maxWidth: 720, marginTop: 64 }}>
        <h2 id="regalo-faq" style={{ fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 28, color: dahila.ink900, margin: '0 0 12px' }}>
          Preguntas
        </h2>
        {REGALO_FAQ.map(([q, a]) => (
          <details key={q} style={{ borderBottom: `1px solid ${dahila.border}`, padding: '14px 0' }}>
            <summary style={{ cursor: 'pointer', fontFamily: dahila.fontSans, fontSize: 15, fontWeight: 500, color: dahila.ink900, minHeight: 28 }}>
              {q}
            </summary>
            <p style={{ fontFamily: dahila.fontSans, fontSize: 14.5, fontWeight: 300, lineHeight: 1.7, color: dahila.ink700, margin: '8px 0 0' }}>{a}</p>
          </details>
        ))}
      </section>

      <style>{`
        @media (min-width: 720px) {
          .regalo-esencial { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }
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
