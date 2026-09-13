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
 * La navegación interna del App Router no dispara `beforeunload`. Para ese
 * caso (tocar otra sección en el menú del admin, lo más probable), el hook
 * deja una marca en <html> y el menú pregunta antes de salir con
 * `confirmLeaveWithUnsaved()`. Sin interceptar el router.
 */
const FLAG = 'unsavedChanges'

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
    document.documentElement.dataset[FLAG] = 'true'
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      delete document.documentElement.dataset[FLAG]
    }
  }, [hasUnsavedChanges])
}

/**
 * Para los links del menú del admin: devuelve true si se puede salir de la
 * página actual (no hay cambios sin guardar, o la persona confirmó que los
 * descarta).
 */
export function confirmLeaveWithUnsaved(): boolean {
  if (document.documentElement.dataset[FLAG] !== 'true') return true
  return window.confirm('Tenés cambios sin guardar. Si salís ahora, se pierden. ¿Salir igual?')
}
