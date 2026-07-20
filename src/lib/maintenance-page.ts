// Cartel de mantenimiento — HTML autocontenido servido con HTTP 503 desde
// `proxy.ts` cuando la base está caída (ver db-health.ts) y no hay snapshot del
// catálogo para mostrar. Deliberadamente NO depende de React, de next/font ni de
// la DB: es un string de HTML con CSS inline, para que funcione aunque el resto
// del sitio no pueda renderizar.
//
// Cumple la CSP del sitio (next.config.ts): estilos inline (style-src
// 'unsafe-inline'), imágenes propias (img-src 'self'), sin scripts ni recursos
// externos. La tipografía usa la cadena de fallback de la marca —Fraunces no se
// puede cargar acá sin next/font, así que cae a Cormorant/Georgia—.
//
// Contactos hardcodeados al fallback del código (wa.me/59899850073 e
// instagram.com/dahila.crochet): en mantenimiento la DB no responde, así que no
// hay site_settings de dónde leerlos.

const WHATSAPP_URL = 'https://wa.me/59899850073?text=' +
  encodeURIComponent('¡Hola Anush! Vi la web y quiero hacer un pedido 🧶')
const INSTAGRAM_URL = 'https://www.instagram.com/dahila.crochet/'

export const MAINTENANCE_HTML = `<!doctype html>
<html lang="es-UY">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Estamos afinando la tienda — Dahila Crochet</title>
<style>
  :root{
    --bone:#FCFAF6; --white:#FFFFFF; --cream-50:#FFFBF2; --cream-100:#FAF1DF;
    --ink-900:#1F1A1B; --ink-700:#4A4143; --ink-500:#8C8285;
    --wine-600:#8F3B53; --wine-700:#6E2B40;
    --border:rgba(31,26,27,.10);
    --serif:'Fraunces','Cormorant Garamond',Georgia,serif;
    --sans:'Inter',ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{height:100%}
  body{
    background:var(--bone); color:var(--ink-900);
    font-family:var(--sans); font-weight:300;
    line-height:1.6; -webkit-font-smoothing:antialiased;
    display:flex; align-items:center; justify-content:center;
    padding:24px; min-height:100dvh;
  }
  .card{
    width:100%; max-width:520px; text-align:center;
    background:var(--white); border:1px solid var(--border);
    border-radius:16px; box-shadow:0 14px 40px -22px rgba(31,26,27,.18);
    padding:44px 28px 36px;
  }
  .logo{width:64px;height:64px;margin:0 auto 22px;display:block}
  .eyebrow{
    font-size:11px; letter-spacing:.20em; text-transform:uppercase;
    color:var(--wine-600); font-weight:400; margin-bottom:18px;
  }
  h1{
    font-family:var(--serif); font-weight:300; letter-spacing:-.01em;
    font-size:29px; line-height:1.12; color:var(--ink-900); margin-bottom:16px;
  }
  p{color:var(--ink-700); font-size:16px; margin:0 auto 12px; max-width:40ch}
  p.small{color:var(--ink-500); font-size:13px; margin-top:6px}
  .actions{display:flex; flex-direction:column; gap:12px; margin:28px 0 4px}
  a.btn{
    display:inline-flex; align-items:center; justify-content:center; gap:10px;
    min-height:52px; padding:14px 22px; border-radius:999px;
    font-family:var(--sans); font-size:16px; font-weight:400;
    text-decoration:none; transition:transform .14s ease, background .2s ease;
  }
  a.btn:active{transform:translateY(1px)}
  a.primary{background:var(--wine-600); color:#fff}
  a.primary:hover{background:var(--wine-700)}
  a.secondary{background:var(--cream-50); color:var(--ink-900); border:1px solid var(--border)}
  a.secondary:hover{background:var(--cream-100)}
  .btn svg{width:20px;height:20px;flex:none}
  .divider{width:36px;height:1px;background:var(--border);margin:24px auto 0}
  @media (max-width:400px){ .card{padding:36px 20px 28px} h1{font-size:25px} }
  @media (prefers-reduced-motion:reduce){ a.btn{transition:none} }
</style>
</head>
<body>
  <main class="card">
    <img class="logo" src="/isotype-color.png" width="64" height="64" alt="Dahila Crochet">
    <div class="eyebrow">Dahila Crochet</div>
    <h1>Estamos afinando la tienda unos días</h1>
    <p>La tienda online está en pausa por un mantenimiento breve, pero seguimos
       tejiendo y tomando pedidos como siempre.</p>
    <p>Escribinos por WhatsApp o Instagram y coordinamos tu prenda a medida —
       tu talle, tus colores.</p>
    <div class="actions">
      <a class="btn primary" href="${WHATSAPP_URL}" rel="noopener">
        <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M128 24a104 104 0 0 0-91 154l-11 39a8 8 0 0 0 10 10l39-11A104 104 0 1 0 128 24Zm50 141c-4 11-22 21-31 22-8 1-18 1-52-14-37-16-60-53-62-56s-14-19-14-36 9-25 12-28 6-4 8-4h6c2 0 5-1 7 5l10 24c1 2 1 4 0 6l-4 6-4 4c-2 2-3 4-1 7a70 70 0 0 0 13 16 63 63 0 0 0 19 12c3 1 5 1 6-1l7-9c2-3 4-2 7-1l22 11c3 1 5 2 6 3s1 8-3 18Z"/></svg>
        Pedir por WhatsApp
      </a>
      <a class="btn secondary" href="${INSTAGRAM_URL}" rel="noopener">
        <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M128 82a46 46 0 1 0 46 46 46 46 0 0 0-46-46Zm0 76a30 30 0 1 1 30-30 30 30 0 0 1-30 30Zm52-88a12 12 0 1 1-12-12 12 12 0 0 1 12 12Zm34 13c-1-16-4-30-16-42S162 26 146 25c-16-1-64-1-80 0-16 1-30 4-42 16S26 62 25 78c-1 16-1 64 0 80 1 16 4 30 16 42s26 15 42 16c16 1 64 1 80 0 16-1 30-4 42-16s15-26 16-42c1-16 1-64 0-80Zm-19 97a30 30 0 0 1-17 17c-12 5-40 4-53 4s-41 1-53-4a30 30 0 0 1-17-17c-5-12-4-40-4-53s-1-41 4-53a30 30 0 0 1 17-17c12-5 40-4 53-4s41-1 53 4a30 30 0 0 1 17 17c5 12 4 40 4 53s1 41-4 53Z"/></svg>
        Ver en Instagram
      </a>
    </div>
    <div class="divider"></div>
    <p class="small">Volvemos muy pronto. Gracias por la paciencia 🧶</p>
  </main>
</body>
</html>`
