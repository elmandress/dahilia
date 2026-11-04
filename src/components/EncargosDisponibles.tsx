import { dahila } from './ui/tokens'
import { parseCount } from '@/lib/parse-money'

export interface EncargosCuposState {
  enabled: boolean
  total: number
  taken: number
  label: string
}

/**
 * Shows how many custom order slots are open this week.
 * Completely optional — if `encargos_cupos_enabled` is false or the number
 * is 0, nothing renders. Honest scarcity, not fake urgency.
 *
 * `state` is fetched server-side by the page (same site_settings round-trip
 * that already loads shipping/queue copy) and passed down — no client fetch
 * here, so this doesn't add its own Supabase round-trip on mount.
 *
 * CMS keys:
 *   encargos_cupos_enabled  — 'true' | 'false'
 *   encargos_cupos_total    — e.g. '4'
 *   encargos_cupos_taken    — e.g. '2'
 *   encargos_cupos_label    — optional override text
 */
export function EncargosDisponibles({ state }: { state: EncargosCuposState }) {
  if (!state.enabled || state.total <= 0) return null

  const available = Math.max(0, state.total - state.taken)

  if (available === 0) {
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: dahila.cream100, borderRadius: 10,
        padding: '10px 14px', marginBottom: 4,
        fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 300, color: dahila.ink700,
        border: `1px solid ${dahila.border}`,
      }}>
        <span aria-hidden style={{ width: 7, height: 7, borderRadius: 999, background: '#8C8285', flexShrink: 0 }} />
        Encargos cerrados esta semana — anotate igual y te aviso cuando abra
      </div>
    )
  }

  const defaultLabel = available === 1
    ? 'Queda 1 lugar disponible esta semana'
    : `Quedan ${available} lugares disponibles esta semana`

  const text = state.label.trim() || defaultLabel

  // Color scale: calm green when many, warm amber when few
  const dotColor = available <= 2 ? '#C2703A' : '#4E9A5A'

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: available <= 2 ? '#FDF6EE' : '#EFF7F1',
      borderRadius: 10, padding: '10px 14px', marginBottom: 4,
      fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 300,
      color: dahila.ink700, border: `1px solid ${available <= 2 ? '#E8C9A0' : '#A8D5B0'}`,
    }}>
      <span aria-hidden style={{
        width: 7, height: 7, borderRadius: 999,
        background: dotColor, flexShrink: 0,
        boxShadow: `0 0 0 3px ${available <= 2 ? '#F5DDB8' : '#C2E8C8'}`,
      }} />
      {text}
    </div>
  )
}

export function getEncargosCuposState(settings: Record<string, string>): EncargosCuposState {
  // Un número limpio o nada (QA-14): sacar lo que no es dígito leía "2 de 4"
  // como 24 tomados y mostraba "Encargos cerrados" con lugares libres. Si el
  // total o los tomados no se entienden, el aviso no sale: la escasez se
  // muestra solo si es verdad. Vacío = 0, como dice el campo.
  const count = (raw: string | undefined) => ((raw ?? '').trim() === '' ? 0 : parseCount(raw))
  const total = count(settings.encargos_cupos_total)
  const taken = count(settings.encargos_cupos_taken)
  return {
    enabled: settings.encargos_cupos_enabled === 'true' && total != null && taken != null,
    total: total ?? 0,
    taken: taken ?? 0,
    label: settings.encargos_cupos_label || '',
  }
}
