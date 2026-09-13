// Cookie que identifica el carrito de un visitante. La comparten /api/cart
// (que la crea) y /api/orders (que la guarda en cada pedido, así el admin
// puede saber qué carritos terminaron en un pedido por WhatsApp).
export const CART_COOKIE = 'dahila_cart_id'
