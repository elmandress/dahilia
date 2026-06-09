'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { dahila } from './ui/Primitives'

/**
 * Shows how many custom order slots are open this week.
 * Completely optional — if `encargos_cupos_enabled` is false or the number
 * is 0, nothing renders. Honest scarcity, not fake urgency.
 *
 * CMS keys:
 *   encargos_cupos_enabled  — 'true' | 'false'
 *   encargos_cupos_total    — e.g. '4'
 *   encargos_cupos_taken    — e.g. '2'
 *   encargos_cupos_label    — optional override text
 */
export function EncargosDisponibles() {
  const [state, setState] = useState<{
    enabled: boolean
    total: number
    taken: number
    label: string
  } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('site_settings')
      .select('key, value')
      .in('key', [
        'encargos_cupos_enabled',
        'encargos_cupos_total',
        'encargos_cupos_taken',
        'encargos_cupos_label',
      ])
      .then(({ data }) => {
        const s = (data ?? []).reduce<Record<string, string>>(
          (acc, r) => ({ ...acc, [r.key]: String(r.value ?? '') }), {}
        )
        const enabled = s.encargos_cupos_enabled === 'true'
        const total = parseInt(s.encargos_cupos_total || '0', 10)
        const taken = parseInt(s.encargos_cupos_taken || '0', 10)
        setState({ enabled, total, taken, label: s.encargos_cupos_label || '' })
      })
  }, [])

  if (!state || !state.enabled || state.total <= 0) return null

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
