// Cartel de mantenimiento — HTML autocontenido servido con HTTP 503 desde
// `proxy.ts` cuando la base está caída (ver db-health.ts) y no hay snapshot del
// catálogo para mostrar. Deliberadamente NO depende de React ni de la DB: es un
// string de HTML con CSS inline, para que funcione aunque el resto del sitio no
// pueda renderizar.
//
// Estética alineada al sitio: Fraunces (auto-hosteada desde /fonts, la misma
// familia que usa next/font en el layout) para los títulos, tokens de marca
// (bone/cream/wine/ink), sistema de botones de Primitives e íconos Phosphor
// idénticos a los de components/ui/icons.tsx. Cumple la CSP (next.config.ts):
// estilos inline, fuente e imágenes propias ('self'/data:), sin scripts ni
// recursos externos.
//
// Contactos hardcodeados al fallback del código (wa.me/59899850073 e
// instagram.com/dahila.crochet): en mantenimiento la DB no responde, así que no
// hay site_settings de dónde leerlos.

const WHATSAPP_URL = 'https://wa.me/59899850073?text=' +
  encodeURIComponent('¡Hola Anush! Vi la web y quiero encargar una prenda.')
const INSTAGRAM_URL = 'https://www.instagram.com/dahila.crochet/'

// Íconos Phosphor idénticos a src/components/ui/icons.tsx (viewBox 0 0 256 256).
const WHATSAPP_ICON =
  '<svg viewBox="0 0 256 256" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M128,24A104,104,0,0,0,36.18,176.88L24.83,210.93a16,16,0,0,0,20.24,20.24l34.05-11.35A104,104,0,1,0,128,24Zm0,192a87.87,87.87,0,0,1-44.06-11.81,8,8,0,0,0-6.54-.67L42,215l11.34-34a8,8,0,0,0-.66-6.54A88,88,0,1,1,128,216Zm49.06-52.77c-2.76-1.38-16.3-8-18.83-8.93s-4.36-1.38-6.2,1.38-7.11,8.92-8.72,10.76-3.22,2.07-6,.69a72.08,72.08,0,0,1-21.18-13.07,79.3,79.3,0,0,1-14.65-18.24c-1.53-2.64-.16-4.06,1.21-5.44s2.76-3.22,4.14-4.83a18.53,18.53,0,0,0,2.76-4.6,5.08,5.08,0,0,0-.23-4.83c-.69-1.38-6.2-14.95-8.5-20.46-2.24-5.37-4.51-4.64-6.2-4.73s-3.44-.11-5.28-.11a10.14,10.14,0,0,0-7.36,3.45c-2.53,2.76-9.66,9.43-9.66,23s9.89,26.72,11.27,28.56,19.47,29.73,47.17,41.71a160,160,0,0,0,15.74,5.82c6.61,2.11,12.63,1.81,17.39,1.1,5.31-.79,16.3-6.67,18.6-13.11s2.3-12,1.61-13.11S179.82,164.61,177.06,163.23Z"/></svg>'
const INSTAGRAM_ICON =
  '<svg viewBox="0 0 256 256" width="20" height="20" fill="none" stroke="currentColor" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="36" y="36" width="184" height="184" rx="48"/><circle cx="128" cy="128" r="44"/><circle cx="180" cy="75.5" r="10" fill="currentColor" stroke="none"/></svg>'

export const MAINTENANCE_HTML = `<!doctype html>
<html lang="es-UY">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Estamos afinando la tienda — Dahila Crochet</title>
<style>
  @font-face{
    font-family:'Fraunces';
    font-style:normal;
    font-weight:100 900;
    font-display:swap;
    src:url('/fonts/fraunces-latin.woff2') format('woff2');
  }
  :root{
    --bone:#FCFAF6; --white:#FFFFFF; --cream-50:#FFFBF2; --cream-100:#FAF1DF; --cream-200:#F1E3C8;
    --ink-900:#1F1A1B; --ink-700:#4A4143; --ink-500:#8C8285;
    --wine-600:#8F3B53; --wine-700:#6E2B40;
    --border:rgba(31,26,27,.10);
    --serif:'Fraunces','Cormorant Garamond',Georgia,serif;
    --sans:'Inter',ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;
    --ease:cubic-bezier(.22,.61,.36,1);
  }
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{height:100%}
  body{
    background:var(--bone);
    background-image:
      radial-gradient(120% 90% at 50% -10%, var(--cream-50) 0%, rgba(252,250,246,0) 55%),
      radial-gradient(70% 55% at 85% 8%, rgba(143,59,83,.05) 0%, rgba(252,250,246,0) 60%);
    color:var(--ink-900); font-family:var(--sans); font-weight:300; line-height:1.6;
    -webkit-font-smoothing:antialiased; text-rendering:optimizeLegibility;
    display:flex; align-items:center; justify-content:center;
    padding:28px 22px; min-height:100dvh;
  }
  .card{
    width:100%; max-width:540px; text-align:center;
    background:var(--white); border:1px solid var(--border);
    border-radius:22px; box-shadow:0 30px 70px -40px rgba(31,26,27,.28);
    padding:52px 34px 38px; position:relative; overflow:hidden;
  }
  /* hairline superior en wine — mismo gesto de detalle que las fichas del sitio */
  .card::before{
    content:''; position:absolute; inset:0 0 auto 0; height:3px;
    background:linear-gradient(90deg, transparent, var(--wine-600), transparent);
    opacity:.55;
  }
  .logo{width:74px;height:74px;margin:0 auto 24px;display:block;
    animation:floaty 5.5s var(--ease) infinite}
  .eyebrow{
    font-size:11px; letter-spacing:.22em; text-transform:uppercase;
    color:var(--wine-600); font-weight:500; margin-bottom:18px;
  }
  h1{
    font-family:var(--serif); font-weight:300; letter-spacing:-.02em;
    font-size:clamp(30px,6.2vw,44px); line-height:1.08; color:var(--ink-900);
    margin-bottom:20px;
  }
  p{color:var(--ink-700); font-size:16.5px; margin:0 auto 12px; max-width:42ch}
  p.small{color:var(--ink-500); font-size:13px; letter-spacing:.01em; margin-top:4px}
  .actions{display:flex; flex-direction:column; gap:12px; margin:30px 0 6px}
  a.btn{
    display:inline-flex; align-items:center; justify-content:center; gap:10px;
    min-height:54px; padding:15px 24px; border-radius:999px;
    font-family:var(--sans); font-size:16px; font-weight:400; letter-spacing:.01em;
    text-decoration:none; cursor:pointer;
    transition:transform .18s var(--ease), background .22s var(--ease), box-shadow .22s var(--ease);
  }
  /* Sistema de botones del sitio (Primitives): primario ink, hover wine */
  a.primary{background:var(--ink-900); color:#fff; box-shadow:0 10px 24px -14px rgba(31,26,27,.5)}
  a.primary:hover{background:var(--wine-700); transform:translateY(-2px); box-shadow:0 16px 30px -14px rgba(110,43,64,.55)}
  a.secondary{background:var(--cream-100); color:var(--ink-900); border:1px solid var(--border)}
  a.secondary:hover{background:var(--cream-200); transform:translateY(-2px)}
  a.btn:active{transform:translateY(0)}
  .btn svg{flex:none}
  .divider{width:40px;height:1px;background:var(--border);margin:26px auto 0}
  /* entrada escalonada */
  .reveal{opacity:0; animation:fadeUp .7s var(--ease) forwards}
  .d1{animation-delay:.05s}.d2{animation-delay:.15s}.d3{animation-delay:.25s}
  .d4{animation-delay:.35s}.d5{animation-delay:.45s}.d6{animation-delay:.55s}.d7{animation-delay:.65s}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
  @keyframes floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
  @media (max-width:420px){ .card{padding:42px 22px 30px} }
  @media (prefers-reduced-motion:reduce){
    .logo{animation:none}
    .reveal{opacity:1;animation:none}
    a.btn{transition:none}
    a.primary:hover,a.secondary:hover{transform:none}
  }
</style>
</head>
<body>
  <main class="card">
    <img class="logo reveal d1" src="/isotype-color.png" width="74" height="74" alt="Dahila Crochet">
    <div class="eyebrow reveal d2">Dahila Crochet</div>
    <h1 class="reveal d3">Estamos afinando<br>la tienda unos días</h1>
    <p class="reveal d4">La tienda online está en pausa por unos días, pero seguimos
       tejiendo y tomando pedidos como siempre.</p>
    <p class="reveal d5">Escribinos y coordinamos tu prenda a medida — tu talle,
       tus colores, sin apuro.</p>
    <div class="actions reveal d6">
      <a class="btn primary" href="${WHATSAPP_URL}" rel="noopener">${WHATSAPP_ICON}Pedir por WhatsApp</a>
      <a class="btn secondary" href="${INSTAGRAM_URL}" rel="noopener">${INSTAGRAM_ICON}Escribinos por Instagram</a>
    </div>
    <div class="divider reveal d7"></div>
    <p class="small reveal d7">Volvemos muy pronto — gracias por tu paciencia.</p>
  </main>
</body>
</html>`
