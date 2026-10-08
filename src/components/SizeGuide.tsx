'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { track } from '@/lib/analytics'
import { useScrollLock } from '@/lib/scroll-lock'
import { useFocusTrap } from '@/lib/focus-trap'
import { dahila, Icon } from './ui/Primitives'

// Default measurement chart (cm) for the Uruguayan market. Editable from the
// admin via the `size_guide_note` setting (the rows stay code-defined since they
// rarely change; the note lets the owner add fit guidance per season).
const ROWS: Array<{ size: string; busto: string; cintura: string; cadera: string }> = [
  { size: 'XS', busto: '78–82', cintura: '60–64', cadera: '84–88' },
  { size: 'S',  busto: '83–87', cintura: '65–69', cadera: '89–93' },
  { size: 'M',  busto: '88–92', cintura: '70–74', cadera: '94–98' },
  { size: 'L',  busto: '93–98', cintura: '75–80', cadera: '99–104' },
  { size: 'XL', busto: '99–105', cintura: '81–87', cadera: '105–111' },
]

// ---- "¿Qué talle soy?" (08/10/2026) ----
// La tabla sola obliga a cruzar números a ojo, y sin devoluciones la duda de
// talle frena la compra. Con el busto (y la cadera, si la pone) se marca el
// talle de esta misma tabla; si cae fuera, se ofrece a medida.
function parseRange(r: string): [number, number] {
  const [lo, hi] = r.split(/[–-]/).map((x) => parseFloat(x))
  return [lo, hi]
}

/** Índice de ROWS para una medida; -1 = más chica que XS, ROWS.length = más grande que XL. */
function rowIndexFor(value: number, key: 'busto' | 'cadera'): number {
  for (let i = 0; i < ROWS.length; i++) {
    const [lo, hi] = parseRange(ROWS[i][key])
    // ±0,5 cm: cubre el hueco entre rangos (82 → 83) y medidas con decimales.
    if (value >= lo - 0.5 && value <= hi + 0.5) return i
  }
  return value < parseRange(ROWS[0][key])[0] ? -1 : ROWS.length
}

function parseCm(s: string): number | null {
  const n = parseFloat(s.replace(',', '.'))
  return Number.isFinite(n) && n >= 50 && n <= 160 ? n : null
}

function SizeFinder({ productSizes, onPick, encargoHref }: {
  productSizes?: string[]
  onPick?: (size: string) => void
  encargoHref: string
}) {
  const [busto, setBusto] = useState('')
  const [cadera, setCadera] = useState('')
  const b = parseCm(busto)
  const c = parseCm(cadera)
  const ib = b != null ? rowIndexFor(b, 'busto') : null
  const ic = c != null ? rowIndexFor(c, 'cadera') : null
  const idx = ib == null ? null : ic == null ? ib : Math.max(ib, ic)
  const outOfChart = idx != null && (idx < 0 || idx >= ROWS.length)
  const size = idx != null && !outOfChart ? ROWS[idx].size : null
  const mixed = ib != null && ic != null && ib !== ic && !outOfChart
  const inProduct = !productSizes || productSizes.length === 0
    || (size != null && productSizes.some((p) => p.trim().toUpperCase() === size))

  const lastTracked = useRef<string | null>(null)
  useEffect(() => {
    const key = size ?? (outOfChart ? 'a-medida' : null)
    if (key && key !== lastTracked.current) {
      lastTracked.current = key
      track('size_finder', { size: key })
    }
  }, [size, outOfChart])

  const input = (id: string, label: string, value: string, set: (v: string) => void) => (
    <label htmlFor={id} style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '1 1 120px' }}>
      <span style={{ fontFamily: dahila.fontSans, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: dahila.ink500 }}>{label}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={50}
          max={160}
          value={value}
          onChange={(e) => set(e.target.value)}
          placeholder="cm"
          style={{
            width: '100%', minHeight: 44, padding: '8px 12px', borderRadius: 8,
            border: `1px solid ${dahila.borderStrong}`, fontFamily: dahila.fontSans, fontSize: 16,
            color: dahila.ink900, background: '#fff',
          }}
        />
        <span style={{ fontFamily: dahila.fontSans, fontSize: 13, color: dahila.ink500 }}>cm</span>
      </span>
    </label>
  )

  return (
    <div style={{ background: dahila.cream50, borderRadius: 12, padding: '16px 16px 14px', marginBottom: 20 }}>
      <div style={{ fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 18, color: dahila.ink900, marginBottom: 2 }}>¿Qué talle soy?</div>
      <p style={{ fontFamily: dahila.fontSans, fontSize: 12.5, fontWeight: 300, color: dahila.ink500, margin: '0 0 12px' }}>
        Medite con un centímetro, por la parte más ancha y sin apretar.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {input('sf-busto', 'Busto', busto, setBusto)}
        {input('sf-cadera', 'Cadera (opcional)', cadera, setCadera)}
      </div>

      {idx != null && (
        <div role="status" style={{ marginTop: 14, fontFamily: dahila.fontSans, fontSize: 14, lineHeight: 1.55, color: dahila.ink700 }}>
          {outOfChart ? (
            <>
              Tu medida queda fuera de la tabla: <strong style={{ fontWeight: 500, color: dahila.ink900 }}>te la tejo a tu medida exacta</strong>.{' '}
              <Link href={encargoHref} style={{ color: dahila.wine600 }}>Pedirla a medida →</Link>
            </>
          ) : (
            <>
              Tu talle es <strong style={{ fontWeight: 500, fontSize: 18, color: dahila.ink900 }}>{size}</strong>.
              {mixed && ' Tu busto y tu cadera caen en talles distintos: te marco el más grande para que no ajuste, o la tejo a tu medida.'}
              {!inProduct && (
                <> Esta prenda no viene en {size}, pero la puedo tejer a tu medida. <Link href={encargoHref} style={{ color: dahila.wine600 }}>Pedirla a medida →</Link></>
              )}
              {inProduct && onPick && size && (
                <div style={{ marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => onPick(size)}
                    style={{
                      minHeight: 44, padding: '0 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: dahila.ink900, color: '#fff', fontFamily: dahila.fontSans, fontSize: 12,
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                    }}
                  >
                    Elegir talle {size}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export function SizeGuide({ note, productSizes, onPick, encargoHref = '/encargo' }: {
  note?: string
  /** Talles en los que viene esta prenda: el buscador avisa si el suyo no está. */
  productSizes?: string[]
  /** Si se pasa, el resultado ofrece elegir ese talle en la ficha. */
  onPick?: (size: string) => void
  encargoHref?: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
          fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink700,
          textDecoration: 'underline',
        }}
      >
        <Icon name="ruler" size={14} color={dahila.ink500} /> ¿Qué talle soy?
      </button>
      {open && (
        <SizeGuideModal
          note={note}
          onClose={() => setOpen(false)}
          finder={<SizeFinder productSizes={productSizes} encargoHref={encargoHref} onPick={onPick ? (sz) => { onPick(sz); setOpen(false) } : undefined} />}
        />
      )}
    </>
  )
}

function SizeGuideModal({ note, onClose, finder }: { note?: string; onClose: () => void; finder: React.ReactNode }) {
  useScrollLock(true)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Trap Tab inside the card so keyboard users can't fall through into the
  // product page sitting behind the scrim.
  const cardRef = useRef<HTMLDivElement>(null)
  useFocusTrap(cardRef, true)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tabla de talles"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 130,
        background: 'rgba(20,16,17,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
    >
      <div
        ref={cardRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520,
          maxHeight: '90vh', overflowY: 'auto', padding: '24px 26px',
          boxShadow: dahila.shadowMd, position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          style={{
            position: 'absolute', top: 14, right: 14,
            width: 34, height: 34, borderRadius: 999, border: 'none',
            background: dahila.cream100, cursor: 'pointer', color: dahila.ink900,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Icon name="x" size={16} />
        </button>

        <h2 style={{
          fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 24,
          color: dahila.ink900, margin: '0 0 4px',
        }}>Tabla de talles</h2>
        <p style={{ fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 300, color: dahila.ink500, margin: '0 0 18px' }}>
          Medidas del cuerpo, en centímetros.
        </p>

        {finder}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: dahila.fontSans, fontSize: 14 }}>
            <thead>
              <tr>
                {['Talle', 'Busto', 'Cintura', 'Cadera'].map((h) => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '10px 12px',
                    borderBottom: `1px solid ${dahila.borderStrong}`,
                    fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
                    color: dahila.ink500, fontWeight: 500,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.size}>
                  <td style={{ padding: '11px 12px', borderBottom: `1px solid ${dahila.border}`, fontWeight: 500, color: dahila.ink900 }}>{r.size}</td>
                  <td style={{ padding: '11px 12px', borderBottom: `1px solid ${dahila.border}`, color: dahila.ink700 }}>{r.busto}</td>
                  <td style={{ padding: '11px 12px', borderBottom: `1px solid ${dahila.border}`, color: dahila.ink700 }}>{r.cintura}</td>
                  <td style={{ padding: '11px 12px', borderBottom: `1px solid ${dahila.border}`, color: dahila.ink700 }}>{r.cadera}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{
          marginTop: 18, padding: '14px 16px', background: dahila.cream50,
          borderRadius: 10, fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 300,
          lineHeight: 1.6, color: dahila.ink700, whiteSpace: 'pre-line',
        }}>
          {note?.trim()
            ? note
            : '¿Estás entre dos talles o querés un calce especial? Cada prenda se puede hacer a tu medida exacta — escribinos y lo coordinamos.'}
        </div>
      </div>
    </div>
  )
}
