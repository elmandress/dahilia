import React from 'react'

/**
 * Inline SVG icon set (Phosphor "regular", 256×256 viewBox).
 *
 * Why inline instead of the Phosphor web font from a CDN: the font approach
 * loaded FOUR full icon fonts (~400KB) from jsdelivr as render-blocking
 * stylesheets on every page — a major cause of slow first paint. Inlining only
 * the ~20 icons we actually use ships a few KB inside our own JS, with no extra
 * network request, no external domain, and no render-blocking.
 *
 * Each entry is the inner markup of a 0 0 256 256 SVG using `currentColor`.
 */
export type IconName =
  | 'magnifying-glass' | 'magnifying-glass-plus' | 'shopping-bag' | 'x' | 'list'
  | 'minus' | 'plus' | 'caret-left' | 'caret-right' | 'sliders-horizontal'
  | 'ruler' | 'flower' | 'package' | 'arrow-clockwise' | 'truck' | 'leaf'
  | 'hand-heart' | 'heart' | 'chat-circle' | 'check' | 'share-network'
  | 'instagram-logo' | 'whatsapp-logo' | 'envelope-simple'

export const ICON_PATHS: Record<string, React.ReactNode> = {
  'magnifying-glass': (
    <>
      <circle cx="112" cy="112" r="80" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="168.57" y1="168.57" x2="224" y2="224" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  'magnifying-glass-plus': (
    <>
      <circle cx="112" cy="112" r="80" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="168.57" y1="168.57" x2="224" y2="224" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="80" y1="112" x2="144" y2="112" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="112" y1="80" x2="112" y2="144" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  'shopping-bag': (
    <>
      <path d="M216,72H40A8,8,0,0,0,32,80V200a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V80A8,8,0,0,0,216,72Z" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M88,72a40,40,0,0,1,80,0" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  x: (
    <>
      <line x1="200" y1="56" x2="56" y2="200" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="200" y1="200" x2="56" y2="56" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  list: (
    <>
      <line x1="40" y1="128" x2="216" y2="128" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="40" y1="64" x2="216" y2="64" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="40" y1="192" x2="216" y2="192" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  minus: (
    <line x1="40" y1="128" x2="216" y2="128" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
  ),
  plus: (
    <>
      <line x1="40" y1="128" x2="216" y2="128" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="128" y1="40" x2="128" y2="216" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  'caret-left': (
    <polyline points="160 208 80 128 160 48" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
  ),
  'caret-right': (
    <polyline points="96 48 176 128 96 208" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
  ),
  'sliders-horizontal': (
    <>
      <line x1="40" y1="80" x2="120" y2="80" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="168" y1="80" x2="216" y2="80" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="136" y1="176" x2="216" y2="176" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="40" y1="176" x2="88" y2="176" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="144" cy="80" r="24" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="112" cy="176" r="24" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  ruler: (
    <>
      <rect x="-12.69" y="92.69" width="281.37" height="70.63" rx="8" transform="translate(-53.02 128) rotate(-45)" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="84.69" y1="98.34" x2="118.34" y2="64.69" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="118.34" y1="131.31" x2="140.69" y2="108.69" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="153.31" y1="164.69" x2="186.69" y2="131.31" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  flower: (
    <>
      <circle cx="128" cy="128" r="32" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M128,96A36,36,0,1,1,164,60,32,32,0,0,1,128,96Z" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M128,160a36,36,0,1,0,36,36A32,32,0,0,0,128,160Z" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M96,128A36,36,0,1,1,60,92,32,32,0,0,1,96,128Z" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M160,128a36,36,0,1,0,36-36A32,32,0,0,0,160,128Z" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  package: (
    <>
      <polyline points="32.7 76.92 128 129.08 223.3 76.92" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="128" y1="129.09" x2="128" y2="231.97" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M222.49,180.21l-88,48.16a13,13,0,0,1-13,0l-88-48.16a8,8,0,0,1-4.16-7V82.79a8,8,0,0,1,4.16-7l88-48.16a13,13,0,0,1,13,0l88,48.16a8,8,0,0,1,4.16,7v90.42A8,8,0,0,1,222.49,180.21Z" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  'arrow-clockwise': (
    <>
      <polyline points="176.2 99.7 224.2 99.7 224.2 51.7" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M65.8,65.8a88,88,0,1,1,0,124.4" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  truck: (
    <>
      <line x1="16" y1="80" x2="160" y2="80" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M160,80h40l40,40v40a8,8,0,0,1-8,8H216" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16,80V184a8,8,0,0,0,8,8H56" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="160" y1="80" x2="160" y2="192" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="104" y1="192" x2="168" y2="192" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="80" cy="192" r="24" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="192" cy="192" r="24" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  leaf: (
    <>
      <path d="M44,196S28.69,142.31,80,104c40-29.87,80,8,120-32,0,0,16,80-56,128C97.74,228.84,44,196,44,196Z" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="44" y1="220" x2="92" y2="172" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  'hand-heart': (
    <>
      <path d="M169.57,114.49l30.61-31.31a22,22,0,0,0-31.11-31.11L152,68.2l-17.07-16.13a22,22,0,0,0-31.11,31.11l30.61,31.31a16,16,0,0,0,22.6,0Z" transform="translate(-2 -2)" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M71.43,124.69,32,164a24,24,0,0,0,0,34h0a24,24,0,0,0,34,0l25.37-21.41A24,24,0,0,1,106.85,171H152a24,24,0,0,1,0,48H96" transform="translate(-2 -2)" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  heart: (
    <path d="M128,216S28,160,28,92A52,52,0,0,1,128,72h0A52,52,0,0,1,228,92C228,160,128,216,128,216Z" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
  ),
  'chat-circle': (
    <path d="M79.93,211.11a96,96,0,1,0-35-35h0L32.42,213.46a8,8,0,0,0,10.12,10.12l37.39-12.47Z" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
  ),
  check: (
    <polyline points="216 72 104 184 48 128" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
  ),
  'share-network': (
    <>
      <circle cx="64" cy="128" r="32" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="176" cy="200" r="32" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="176" cy="56" r="32" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="149.09" y1="73.61" x2="90.91" y2="110.39" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="90.91" y1="145.61" x2="149.09" y2="182.39" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  'instagram-logo': (
    <>
      <rect x="36" y="36" width="184" height="184" rx="48" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="128" cy="128" r="44" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="180" cy="75.5" r="10" fill="currentColor" />
    </>
  ),
  'whatsapp-logo': (
    <path d="M45.43,221.66l9.18-31.67A88,88,0,1,1,128,216H88l-42.57,5.66A0,0,0,0,1,45.43,221.66Z" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
  ),
  'envelope-simple': (
    <>
      <rect x="32" y="48" width="192" height="160" rx="8" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="224 56 128 144 32 56" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
}

// Filled variants for the few places that need them (currently WhatsApp).
export const ICON_PATHS_FILL: Record<string, React.ReactNode> = {
  'whatsapp-logo': (
    <path d="M128,24A104,104,0,0,0,36.18,176.88L24.83,210.93a16,16,0,0,0,20.24,20.24l34.05-11.35A104,104,0,1,0,128,24Zm0,192a87.87,87.87,0,0,1-44.06-11.81,8,8,0,0,0-6.54-.67L42,215l11.34-34a8,8,0,0,0-.66-6.54A88,88,0,1,1,128,216Zm49.06-52.77c-2.76-1.38-16.3-8-18.83-8.93s-4.36-1.38-6.2,1.38-7.11,8.92-8.72,10.76-3.22,2.07-6,.69a72.08,72.08,0,0,1-21.18-13.07,79.3,79.3,0,0,1-14.65-18.24c-1.53-2.64-.16-4.06,1.21-5.44s2.76-3.22,4.14-4.83a18.53,18.53,0,0,0,2.76-4.6,5.08,5.08,0,0,0-.23-4.83c-.69-1.38-6.2-14.95-8.5-20.46-2.24-5.37-4.51-4.64-6.2-4.73s-3.44-.11-5.28-.11a10.14,10.14,0,0,0-7.36,3.45c-2.53,2.76-9.66,9.43-9.66,23s9.89,26.72,11.27,28.56,19.47,29.73,47.17,41.71a160,160,0,0,0,15.74,5.82c6.61,2.11,12.63,1.81,17.39,1.1,5.31-.79,16.3-6.67,18.6-13.11s2.3-12,1.61-13.11S179.82,164.61,177.06,163.23Z" fill="currentColor" />
  ),
}
