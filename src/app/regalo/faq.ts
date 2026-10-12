/** También alimenta el FAQPage del JSON-LD (page.tsx). Solo lo que es cierto
 *  hoy: el código es un cupón de monto fijo de /admin/cupones, que nunca
 *  descuenta más que el total de la compra. */
export const REGALO_FAQ: Array<[string, string]> = [
  ['¿Cómo llega la tarjeta?', 'Después de coordinar el pago te la mando por WhatsApp, con su código y el mensaje que escribiste, lista para reenviar o imprimir.'],
  ['¿Cómo la usa quien la recibe?', 'Elige su prenda en la tienda, la agrega al carrito y pone el código. Si prefiere algo a medida, me escribe con el código y lo coordinamos.'],
  ['¿Y si elige algo más caro o más barato?', 'Si cuesta más, paga la diferencia. El código se usa de una vez, en una sola compra: conviene elegir algo de ese valor o más, porque el saldo que sobra no queda guardado.'],
  ['¿Hasta cuándo vale?', 'Te confirmo la fecha cuando coordinamos el pago, y queda escrita en la tarjeta.'],
  ['¿Sirve si no sé su talle?', 'Para eso existe: el talle lo elige quien la recibe, o la tejo con sus medidas exactas.'],
]
