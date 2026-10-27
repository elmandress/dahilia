// Texto por defecto del aviso del drop a la lista privada. Vive aparte (sin
// 'server-only') porque lo usan el servidor (lib/email/lista-drop.ts) y el
// botón "Volver al texto original" del panel. {nombre}, {cuando} y {adelanto}
// se reemplazan al mandar.
export const DROP_COPY_DEFAULTS = {
  lista_drop_asunto: '«{nombre}»: la ves antes que nadie',
  lista_drop_titulo: '«{nombre}» ya está, para vos',
  lista_drop_texto: 'La tienda la ve {cuando}. Vos, desde ahora: son pocas piezas, y quien entra primero elige.\n\n{adelanto}',
}

export type DropCopyKey = keyof typeof DROP_COPY_DEFAULTS
export type DropCopy = Record<DropCopyKey, string>
