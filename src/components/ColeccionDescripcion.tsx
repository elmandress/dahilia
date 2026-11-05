'use client'

import { useId, useState } from 'react'
import { dahila } from './ui/tokens'

/** A partir de este largo, en un celular de 360 a 430 px el texto pasa de 2
 *  renglones (Inter 15: unas 40 a 50 letras por renglón, medido) y se recorta.
 *  Más corto va entero y sin botón: un recorte sin "Leer más" escondería texto. */
const RECORTAR_DESDE = 100

/**
 * Descripción de una colección (VIS-13, 04/11/2026). La colección es donde
 * aterriza el anuncio del drop, y en un iPhone la descripción en itálica
 * ocupaba 4 renglones antes de la primera prenda. En el celular se ve en 2
 * renglones con "Leer más" encima del final (no suma alto); en escritorio va
 * entera. El texto completo está siempre en el HTML, para buscadores y
 * lectores de pantalla: el recorte es solo visual (globals.css,
 * .coleccion-desc).
 */
export function ColeccionDescripcion({ texto, className }: { texto: string; className?: string }) {
  const [abierta, setAbierta] = useState(false)
  const id = useId()
  const recortable = texto.trim().length > RECORTAR_DESDE
  const clases = ['coleccion-desc', recortable && 'coleccion-desc--recortable', abierta && 'is-abierta'].filter(Boolean).join(' ')
  return (
    <div className={['coleccion-desc-wrap', className].filter(Boolean).join(' ')} style={{ position: 'relative', maxWidth: 640, margin: '0 0 28px' }}>
      <p id={id} className={clases} style={{
        fontFamily: dahila.fontSans, fontSize: 15, fontWeight: 400, lineHeight: 1.6,
        color: dahila.ink700, margin: 0,
      }}>
        {texto}
      </p>
      {recortable && (
        <button
          type="button"
          className="coleccion-desc-mas"
          aria-expanded={abierta}
          aria-controls={id}
          onClick={() => setAbierta((v) => !v)}
        >
          {abierta ? 'Leer menos' : 'Leer más'}
        </button>
      )}
    </div>
  )
}
