'use client'

import { useEffect } from 'react'

/**
 * Avisa antes de cerrar/recargar la pestaña si hay cambios sin guardar.
 *
 * Los formularios del admin (Configuración, editor de producto) tienen decenas
 * de campos y ningún autoguardado: cerrar la pestaña por accidente después de
 * media hora de escribir descripciones perdía todo, en silencio y sin forma de
 * recuperarlo. El navegador solo permite el diálogo nativo — el texto lo pone
 * él, no nosotros — pero alcanza para frenar el accidente.
 *
 * Ojo con el alcance: esto cubre cerrar pestaña, recargar y navegar fuera del
 * sitio. La navegación interna del App Router no dispara `beforeunload`; para
 * eso haría falta interceptar el router, que es bastante más invasivo.
 */
export function useUnsavedWarning(hasUnsavedChanges: boolean): void {
  useEffect(() => {
    if (!hasUnsavedChanges) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      // Los navegadores modernos ignoran el mensaje propio, pero setear
      // returnValue sigue siendo lo que dispara el diálogo.
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [hasUnsavedChanges])
}
