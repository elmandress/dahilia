/**
 * Preguntas frecuentes del encargo a medida.
 *
 * Fuente única: las renderiza `EncargoForm` debajo del formulario y las publica
 * `page.tsx` como `FAQPage` JSON-LD. Si se edita acá, cambian las dos cosas —
 * que es justamente lo que evita que el texto visible y el structured data se
 * contradigan (Google penaliza el marcado que no coincide con lo que se ve).
 *
 * Por qué existe (auditoría SEO 04/09/2026): "tejidos a medida montevideo" es
 * la única consulta del rubro sin competencia real en Uruguay — devuelve
 * clasificados y un directorio. Esta página era title + H1 + formulario.
 *
 * REGLA AL EDITAR: nada de precios ni plazos inventados. Los plazos concretos
 * viven en la ficha de cada producto y cambian con la cola de pedidos; acá se
 * explica cómo se calculan, no un número fijo.
 */
export const ENCARGO_FAQ: { q: string; a: string }[] = [
  {
    q: '¿Qué puedo pedir a medida?',
    a: 'Cualquier pieza del catálogo en tu talle y tus colores, o algo que traigas vos como idea: una foto de referencia, una prenda que te gusta, o un modelo que viste y querés en otro color. Lo que se ajusta es el talle, el color, el largo y el material; lo que no se puede es garantizar una copia exacta de un diseño ajeno.',
  },
  {
    q: '¿Cómo se toman las medidas si no nos vemos?',
    a: 'Por WhatsApp, con una cinta métrica de costura. Se piden tres medidas de cuerpo —busto, cintura y cadera— y, según la prenda, el largo total y el largo de manga. Otra opción que funciona muy bien: medir a lo ancho una prenda tuya que te quede bien, apoyada y sin estirar, y mandar esos números.',
  },
  {
    q: '¿Cuánto demora?',
    a: 'Depende de dos cosas: las horas que lleva la pieza (un accesorio son unas pocas, un cardigan pasa las veinte) y cuántos pedidos hay antes del tuyo. El plazo vigente de cada modelo está en su ficha de producto. Si tenés una fecha límite, decila en el primer mensaje: así se sabe de entrada si entra o si conviene otra pieza.',
  },
  {
    q: '¿Cuánto sale?',
    a: 'Se cotiza antes de empezar, sin compromiso: contás qué querés y recibís el precio y el plazo por escrito. El precio depende del modelo, del talle, del material y de las horas de tejido. Nunca se arranca a tejer sin que el precio esté confirmado por las dos partes.',
  },
  {
    q: '¿Puedo elegir el material?',
    a: 'Sí, y conviene decidirlo antes de arrancar porque cambia cómo queda la prenda: el algodón es fresco y sostiene la forma, la lana abriga mucho más y cede con el uso, y las mezclas con acrílico son las más fáciles de lavar. Si el color que querés no está en el taller, se consigue —y eso puede sumar algunos días al plazo.',
  },
  {
    q: '¿Y si mis medidas no coinciden con ningún talle?',
    a: 'Es el caso para el que existe el encargo a medida. Al tejerse punto por punto después del pedido, las medidas no son un molde cerrado: si el busto da un talle y la cadera otro, o si necesitás el largo distinto, se teje con tus números y no con los de una tabla.',
  },
  {
    q: '¿Me avisan mientras se teje?',
    a: 'Sí. Cada encargo tiene un código de seguimiento y se avisa en cada cambio de estado. Además podés escribir por WhatsApp en cualquier momento y preguntar cómo viene.',
  },
  {
    q: '¿Hacen envíos al interior?',
    a: 'Sí, a todo Uruguay. El costo y el plazo del envío se coordinan por WhatsApp según a dónde va, cuando la pieza está terminada.',
  },
]
