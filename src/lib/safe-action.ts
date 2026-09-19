// Llamada a una acción del servidor desde un formulario, a prueba de red.
//
// Por qué existe (19/09/2026): los seis formularios públicos (encargo, estado
// del encargo, tejedoras y las tres altas a la lista VIP) llamaban a su acción
// dentro de startTransition sin try/catch. Si la conexión se cortaba al enviar,
// el servidor respondía 500 o la respuesta llegaba rota, la llamada lanzaba; en
// React 19 un error dentro de una transición sube al error boundary más
// cercano. Resultado, medido con Playwright: la página entera pasaba a "Esta
// página no cargó" y la persona perdía todo lo que había escrito. El de la
// lista VIP del pie vive en el layout raíz, así que caía todavía más arriba.
//
// Devuelve null si la llamada no llegó a responder; cada formulario muestra su
// propio aviso y deja los campos como estaban.
export async function safeAction<T>(call: () => Promise<T>): Promise<T | null> {
  try {
    return await call()
  } catch (error) {
    console.error('La acción del servidor no respondió', error)
    return null
  }
}
