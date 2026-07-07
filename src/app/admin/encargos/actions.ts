'use server'

import { createClient } from '@/lib/supabase/server'
import { notifyEncargoStatusChange } from '@/lib/email'
import type { CustomOrder } from '@/lib/types'

export interface UpdateStatusResult {
  ok: boolean
  error?: string
}

/**
 * Update a custom order's status server-side and email the customer the matching
 * state change. Runs as the logged-in admin (RLS enforces it via the session
 * cookie), which keeps the Resend key on the server — the browser never sees it.
 */
export async function updateEncargoStatus(
  id: string,
  newStatus: CustomOrder['status']
): Promise<UpdateStatusResult> {
  const VALID: CustomOrder['status'][] = ['new', 'replied', 'in_progress', 'done', 'cancelled']
  if (!id || !VALID.includes(newStatus)) return { ok: false, error: 'Datos inválidos.' }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No autorizado.' }

  const { data, error } = await supabase
    .from('custom_orders')
    .update({ status: newStatus })
    .eq('id', id)
    .select('customer_name, customer_email, garment_type, size, tracking_code, status')
    .maybeSingle()

  if (error) return { ok: false, error: error.message }

  // Email the customer (only fires when they left an email and email is configured).
  if (data?.customer_email) {
    try {
      await notifyEncargoStatusChange(
        {
          name: data.customer_name,
          email: data.customer_email,
          garmentType: data.garment_type,
          size: data.size,
          trackingCode: data.tracking_code,
        },
        newStatus
      )
    } catch (e) {
      // Never fail the status change because of an email problem.
      console.error('status-change email failed (status updated OK)', e)
    }
  }

  return { ok: true }
}
