// Texto por defecto del aviso del drop a la lista privada. Vive aparte (sin
// 'server-only') porque lo usan el servidor (lib/email/lista-drop.ts) y el
// botón "Volver al texto original" del panel. {nombre}, {cuando} y {adelanto}
// se reemplazan al mandar.
//
// 27/10/2026: reescrito como un mail personal de Anush (la prueba con el texto
// de promoción cayó dos veces en Spam). Asunto corto y de persona a persona,
// sin "gratis", "limitadas", "antes que nadie", mayúsculas ni signos de más.
// El contacto es WhatsApp (número sin link): hola@dahila.uy todavía no recibe
// mails, y el Reply-To a Gmail era el mayor castigo de spam (ver lista.ts).
// {adelanto} ya no va por defecto: el texto de expectativa de
// Configuración está escrito para gente que todavía no se anotó.
export const DROP_COPY_DEFAULTS = {
  lista_drop_asunto: 'Te abrí {nombre} un día antes',
  lista_drop_titulo: 'Hola, ¿cómo estás?',
  lista_drop_texto:
    'Como estás en la lista, te escribo antes de abrirla para todos: {nombre} llega a la tienda {cuando}, y vos ya la podés ver desde hoy.\n\n' +
    'Son pocas piezas y cada una está tejida a mano.\n\n' +
    'Si tenés alguna duda de talle o de color, escribime por WhatsApp al 099 850 073 y te contesto yo.',
}

export type DropCopyKey = keyof typeof DROP_COPY_DEFAULTS
export type DropCopy = Record<DropCopyKey, string>
