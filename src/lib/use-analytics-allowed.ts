'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { usePathname } from 'next/navigation'
import { isInternalVisitor, markInternalVisitor } from './analytics'

const noSubscribe = () => () => {}

/**
 * ¿Se cargan los scripts de medición en esta página? No en /admin, ni en un
 * navegador interno: el que entra al admin queda marcado acá mismo, y desde
 * ahí sus visitas a la tienda tampoco cuentan.
 *
 * En el servidor y al hidratar devuelve false: los scripts se agregan recién
 * en el cliente, cuando ya se sabe quién mira. (Si se decidiera en el primer
 * render, el HTML del servidor y el del cliente no coincidirían.)
 */
export function useAnalyticsAllowed(): boolean {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')
  useEffect(() => {
    if (isAdmin) markInternalVisitor()
  }, [isAdmin])
  const internal = useSyncExternalStore(noSubscribe, isInternalVisitor, () => true)
  return !isAdmin && !internal
}
