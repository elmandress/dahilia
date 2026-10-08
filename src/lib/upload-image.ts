import { createClient } from '@/lib/supabase/client'
import { mediaPath, prepareImageForUpload, STORAGE_CACHE_SECONDS } from '@/lib/media'

/**
 * Sube una foto al bucket `media` desde el admin: comprimida antes de subir y
 * con caché de 1 año (control de egress, ver lib/media.ts). Devuelve la URL
 * pública. Mismo procedimiento que Configuración y el editor de productos.
 */
export async function uploadAdminImage(file: File, folder: string, hint: string): Promise<string> {
  const supabase = createClient()
  const prepared = await prepareImageForUpload(file)
  const path = mediaPath(folder, hint || folder, `f.${prepared.ext}`)
  const { error } = await supabase.storage
    .from('media')
    .upload(path, prepared.blob, { cacheControl: STORAGE_CACHE_SECONDS, contentType: prepared.contentType, upsert: false })
  if (error) throw error
  return supabase.storage.from('media').getPublicUrl(path).data.publicUrl
}
