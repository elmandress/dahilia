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
 *
 * compact (VIS-14, 04/11/2026): en el celular, una fila numerada de 12 px sin
 * los íconos en círculo (globals.css, .process-stepper--compacto). En /encargo
 * los tres pasos con ícono ocupaban 290 px y el primer campo del formulario
 * quedaba abajo del corte. El texto de cada paso sigue para los lectores de
 * pantalla. En escritorio se ve igual que siempre.
 */
export function ProcessStepper({ steps, title = 'Cómo funciona', compact = false }: { steps: ProcessStep[]; title?: string; compact?: boolean }) {
  if (steps.length === 0) return null
  return (
    <div className={compact ? 'process-stepper process-stepper--compacto' : 'process-stepper'} style={{
      background: dahila.cream50, borderRadius: 14,
      padding: '18px 20px', border: `1px solid ${dahila.border}`,
    }}>
      <div className="process-stepper-titulo" style={{
        fontFamily: dahila.fontSans, fontSize: 11, letterSpacing: '0.18em',
        textTransform: 'uppercase', color: dahila.ink500, marginBottom: 14,
      }}>
        {title}
      </div>
      <ol className="process-stepper-pasos" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {steps.map((step, i) => (
          <li key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div className="process-stepper-icono" aria-hidden="true" style={{
              flexShrink: 0, width: 32, height: 32, borderRadius: 999,
              background: dahila.cream200, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name={step.icon} size={15} color={dahila.wine600} />
            </div>
            <div className="process-stepper-texto" style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 6 }}>
              <span className="process-stepper-label" style={{
                fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 500,
                color: dahila.ink900,
              }}><span className="process-stepper-num" style={{ color: dahila.wine600 }}>{i + 1}. </span>{step.label}</span>
              <span className="process-stepper-cuerpo" style={{
                fontFamily: dahila.fontSans, fontSize: 12, fontWeight: 300,
                color: dahila.ink700, lineHeight: 1.55,
              }}>{step.body}</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
