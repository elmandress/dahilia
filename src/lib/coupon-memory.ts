// El cupón ingresado en /carrito, recordado entre recargas (se re-valida
// siempre contra el servidor al montar: nunca se confía en lo guardado). Vive
// aparte desde 04/11/2026 porque el cajón también lo mira: con un cupón
// recordado, pedir desde el cajón lo dejaría afuera, así que manda a /carrito.
const COUPON_STORAGE_KEY = 'dahila_coupon_code'

// Acceso a sessionStorage a prueba de navegadores que lo BLOQUEAN: con "Block
// all cookies" (Safari), "Bloquear todas las cookies y datos de sitios"
// (Firefox) o Brave con los escudos al máximo, el solo hecho de tocar
// `sessionStorage` tira SecurityError. Sin este envoltorio, el getItem del
// efecto de /carrito explotaba dentro del commit de React y, como no hay
// error.tsx en el árbol, /carrito se caía entero a la pantalla de error de
// Next ("Application error…") justo a un toque del checkout. El cupón
// recordado es una comodidad; nunca puede costar la venta.
export const couponMemory = {
  read(): string | null {
    try { return sessionStorage.getItem(COUPON_STORAGE_KEY) } catch { return null }
  },
  write(code: string) {
    try { sessionStorage.setItem(COUPON_STORAGE_KEY, code) } catch { /* storage bloqueado */ }
  },
  clear() {
    try { sessionStorage.removeItem(COUPON_STORAGE_KEY) } catch { /* storage bloqueado */ }
  },
}
