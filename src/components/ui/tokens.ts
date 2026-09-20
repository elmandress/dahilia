// Tokens de diseño de Dahila: colores, sombras, curva y fuentes.
//
// Viven acá y NO en Primitives.tsx porque ese archivo es 'use client': una
// página de servidor que importa un objeto (no un componente) de un módulo de
// cliente recibe una referencia vacía, y `dahila.ink900` vale undefined. Así
// estuvieron /ig, /info, /atelier, /terminos, /colecciones y el blog hasta el
// 19/09/2026: el botón de WhatsApp de /ig salía blanco sobre blanco y los
// recuadros del blog sin fondo ni borde. Primitives lo re-exporta para los
// componentes de cliente; en componentes de servidor, importar de acá.

export const dahila = {
  white: '#FFFFFF',
  cream50: '#FFFBF2',
  cream100: '#FAF1DF',
  cream200: '#F1E3C8',
  rose50: '#FDF2F4',
  rose100: '#F8DDE3',
  rose200: '#ECC0CB',
  rose300: '#E693A7',
  wine600: '#8F3B53',
  wine700: '#6E2B40',
  tan500: '#A37B53',
  moss500: '#6A8456',
  ink900: '#1F1A1B',
  ink700: '#4A4143',
  // ink500 era #8C8285: 3,7:1 sobre blanco y 3,3:1 sobre crema, por debajo del
  // 4,5:1 de WCAG 1.4.3 en ~200 textos chicos del sitio (axe, 19/09/2026).
  // #756B6E da 5,1:1 y 4,6:1 y sigue siendo el gris cálido secundario.
  ink500: '#756B6E',
  ink300: '#C9C2C4',
  ink100: '#EDE9EA',
  // Botones de WhatsApp. El verde de marca (#25D366) con texto blanco da 2:1
  // (WCAG pide 4,5:1 para texto y 3:1 para el ícono); este verde oscuro da
  // 4,7:1 y, con el logo al lado, sigue leyéndose como WhatsApp (19/09/2026).
  whatsapp: '#1E8449',
  border: 'rgba(31,26,27,0.08)',
  borderStrong: 'rgba(31,26,27,0.18)',
  shadowSm: '0 4px 14px -8px rgba(31,26,27,0.08)',
  shadowMd: '0 14px 30px -18px rgba(31,26,27,0.12)',
  ease: 'cubic-bezier(0.22,0.61,0.36,1)',
  fontDisplay: "var(--font-display)",
  fontSerif: "var(--font-serif)",
  fontSans: "var(--font-sans)",
}
