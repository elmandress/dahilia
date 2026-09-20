import { Icon } from './ui/Primitives'
import { dahila } from './ui/tokens'

export interface ProcessStep {
  icon: string
  label: string
  body: string
}

/**
 * "Cómo funciona" — 3 pasos editables desde el admin (pdp_process_step_*).
 * Compartido entre la ficha de un producto a medida y /encargo: antes solo
 * vivía en la ficha, así que quien entraba a /encargo directo desde el nav
 * ("A medida") arrancaba el formulario sin ver qué pasa después de enviarlo.
 */
export function ProcessStepper({ steps, title = 'Cómo funciona' }: { steps: ProcessStep[]; title?: string }) {
  if (steps.length === 0) return null
  return (
    <div style={{
      background: dahila.cream50, borderRadius: 14,
      padding: '18px 20px', border: `1px solid ${dahila.border}`,
    }}>
      <div style={{
        fontFamily: dahila.fontSans, fontSize: 10, letterSpacing: '0.18em',
        textTransform: 'uppercase', color: dahila.ink500, marginBottom: 14,
      }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{
              flexShrink: 0, width: 32, height: 32, borderRadius: 999,
              background: dahila.cream200, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name={step.icon} size={15} color={dahila.wine600} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 6 }}>
              <span style={{
                fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 500,
                color: dahila.ink900,
              }}>{step.label}</span>
              <span style={{
                fontFamily: dahila.fontSans, fontSize: 12, fontWeight: 300,
                color: dahila.ink700, lineHeight: 1.55,
              }}>{step.body}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
