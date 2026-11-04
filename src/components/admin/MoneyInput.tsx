'use client'

// Campo de plata del admin (QA-02, 04/11/2026). Con <input type="number">,
// Chromium en es-UY convierte "1.600,50" en "1.60050" antes de que el código lo
// vea, y parseInt("1.600") daba 1: una prenda podía quedar publicada a UYU 1 en
// la tienda, el feed y el píxel. Acá el campo es de texto, se lee con
// parseMoneyUYU (lib/parse-money.ts) y debajo se ve lo que se va a guardar
// antes de tocar Guardar. El valor sigue siendo el texto: cada pantalla lo lee
// al guardar y frena si no se entiende.

import { parseMoneyUYU } from '@/lib/parse-money'
import { formatPrice } from '@/lib/types'

/** El mismo aviso en todas las pantallas que guardan plata. */
export const MONTO_ILEGIBLE = 'No se entiende el monto: escribilo en pesos, sin centavos (ej. 1600 o 1.600)'

export function MoneyInput({
  id,
  value,
  onChange,
  label,
  placeholder,
  ariaLabel,
  disabled,
  style,
  inputStyle,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  /** Nombre accesible cuando no hay label visible (filas de talles). */
  ariaLabel?: string
  disabled?: boolean
  /** Del contenedor, p. ej. flex: 1 dentro de una fila de talles. */
  style?: React.CSSProperties
  /** Sin el atajo `border`: el monto que no se entiende pinta borderColor, y
   *  mezclar las dos formas hace que React se queje y pinte mal. */
  inputStyle?: React.CSSProperties
}) {
  const typed = value.trim() !== ''
  const amount = typed ? parseMoneyUYU(value) : null
  const unreadable = typed && amount == null
  const readingId = `${id}-lectura`
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, ...style }}>
      {label && <label htmlFor={id}>{label}</label>}
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label ? undefined : ariaLabel}
        aria-invalid={unreadable || undefined}
        aria-describedby={typed ? readingId : undefined}
        disabled={disabled}
        style={{ ...inputStyle, ...(unreadable ? { borderColor: '#c62828' } : {}) }}
      />
      {typed && (
        // Estilo propio y no .field-hint: esa clase solo pinta dentro de
        // .admin-field, y en las filas de talles el campo va suelto.
        <span id={readingId} style={{ fontSize: '0.75rem', lineHeight: 1.35, color: unreadable ? '#c62828' : '#756B6E' }}>
          {unreadable ? MONTO_ILEGIBLE : `Se guarda: ${formatPrice(amount as number)}`}
        </span>
      )}
    </div>
  )
}
