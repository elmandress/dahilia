'use client'

import { useState, useEffect } from 'react'
import { useScrollLock } from '@/lib/scroll-lock'
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

export function SizeGuide({ note }: { note?: string }) {
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
        <Icon name="ruler" size={14} color={dahila.ink500} /> Tabla de talles
      </button>
      {open && <SizeGuideModal note={note} onClose={() => setOpen(false)} />}
    </>
  )
}

function SizeGuideModal({ note, onClose }: { note?: string; onClose: () => void }) {
  useScrollLock(true)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

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
