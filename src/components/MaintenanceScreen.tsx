import Image from 'next/image'
import { Icon } from '@/components/ui/Primitives'

/**
 * Cartel de mantenimiento a pantalla completa, renderizado por las páginas del
 * storefront cuando la base está caída (402 de cuota de Supabase) y no hay
 * snapshot para mostrar catálogo.
 *
 * Por qué es un componente RSC y no solo el gate del proxy: en Next 16 el
 * `proxy.ts` (ex-middleware) NO se activa en el build de producción de este
 * proyecto — funciona en `next dev` pero el middleware-manifest queda vacío en
 * `next build`, así que en Netlify nunca disparaba y el visitante veía la tienda
 * vacía. Este componente corre en el render del servidor (que SÍ se ejecuta en
 * prod), garantizando que el cartel aparezca. Se pinta como overlay fijo sobre
 * el header/footer del layout, sin depender de ellos.
 *
 * Usa la Fraunces real del sitio (var(--font-display), cargada por next/font en
 * el layout) y los íconos Phosphor de components/ui/icons.tsx. Sin emojis.
 */
export function MaintenanceScreen({
  waUrl = 'https://wa.me/59899850073',
  igUrl = 'https://www.instagram.com/dahila.crochet/',
}: {
  waUrl?: string
  igUrl?: string
}) {
  const waHref =
    waUrl +
    (waUrl.includes('?') ? '&' : '?') +
    'text=' +
    encodeURIComponent('¡Hola Anush! Vi la web y quiero encargar una prenda.')

  return (
    <div className="mnt-root">
      <style>{MNT_CSS}</style>
      <main className="mnt-card">
        <Image
          className="mnt-logo mnt-reveal mnt-d1"
          src="/isotype-color.png"
          width={74}
          height={74}
          alt="Dahila Crochet"
          fetchPriority="high"
          loading="eager"
        />
        <div className="mnt-eyebrow mnt-reveal mnt-d2">Dahila Crochet</div>
        <h1 className="mnt-title mnt-reveal mnt-d3">
          Estamos afinando
          <br />
          la tienda unos días
        </h1>
        <p className="mnt-p mnt-reveal mnt-d4">
          La tienda online está en pausa por unos días, pero seguimos tejiendo y
          tomando pedidos como siempre.
        </p>
        <p className="mnt-p mnt-reveal mnt-d5">
          Escribinos y coordinamos tu prenda a medida — tu talle, tus colores,
          sin apuro.
        </p>
        <div className="mnt-actions mnt-reveal mnt-d6">
          <a className="mnt-btn mnt-primary" href={waHref} rel="noopener">
            <Icon name="whatsapp-logo" size={20} weight="fill" />
            Pedir por WhatsApp
          </a>
          <a className="mnt-btn mnt-secondary" href={igUrl} rel="noopener">
            <Icon name="instagram-logo" size={20} />
            Escribinos por Instagram
          </a>
        </div>
        <div className="mnt-divider mnt-reveal mnt-d7" />
        <p className="mnt-small mnt-reveal mnt-d7">
          Volvemos muy pronto — gracias por tu paciencia.
        </p>
      </main>
    </div>
  )
}

const MNT_CSS = `
  .mnt-root{
    position:fixed; inset:0; z-index:2147483000;
    display:flex; align-items:center; justify-content:center;
    padding:28px 22px; overflow:auto;
    background:#FCFAF6;
    background-image:
      radial-gradient(120% 90% at 50% -10%, #FFFBF2 0%, rgba(252,250,246,0) 55%),
      radial-gradient(70% 55% at 85% 8%, rgba(143,59,83,.05) 0%, rgba(252,250,246,0) 60%);
    font-family:var(--font-sans,'Inter',ui-sans-serif,system-ui,sans-serif);
    color:#1F1A1B; -webkit-font-smoothing:antialiased;
  }
  .mnt-card{
    width:100%; max-width:540px; text-align:center;
    background:#fff; border:1px solid rgba(31,26,27,.10);
    border-radius:22px; box-shadow:0 30px 70px -40px rgba(31,26,27,.28);
    padding:52px 34px 38px; position:relative; overflow:hidden;
  }
  .mnt-card::before{
    content:''; position:absolute; inset:0 0 auto 0; height:3px;
    background:linear-gradient(90deg, transparent, #8F3B53, transparent); opacity:.55;
  }
  .mnt-logo{width:74px;height:74px;margin:0 auto 24px;display:block;
    animation:mntFloaty 5.5s cubic-bezier(.22,.61,.36,1) infinite}
  .mnt-eyebrow{font-size:11px; letter-spacing:.22em; text-transform:uppercase;
    color:#8F3B53; font-weight:500; margin-bottom:18px}
  .mnt-title{font-family:var(--font-display,'Fraunces',Georgia,serif); font-weight:300;
    letter-spacing:-.02em; font-size:clamp(30px,6.2vw,44px); line-height:1.08;
    color:#1F1A1B; margin-bottom:20px}
  .mnt-p{color:#4A4143; font-size:16.5px; line-height:1.6; margin:0 auto 12px; max-width:42ch}
  .mnt-small{color:#8C8285; font-size:13px; margin-top:4px}
  .mnt-actions{display:flex; flex-direction:column; gap:12px; margin:30px 0 6px}
  .mnt-btn{display:inline-flex; align-items:center; justify-content:center; gap:10px;
    min-height:54px; padding:15px 24px; border-radius:999px; font-size:16px; font-weight:400;
    text-decoration:none; cursor:pointer;
    transition:transform .18s cubic-bezier(.22,.61,.36,1), background .22s ease, box-shadow .22s ease}
  .mnt-primary{background:#1F1A1B; color:#fff; box-shadow:0 10px 24px -14px rgba(31,26,27,.5)}
  .mnt-primary:hover{background:#6E2B40; transform:translateY(-2px); box-shadow:0 16px 30px -14px rgba(110,43,64,.55)}
  .mnt-secondary{background:#FAF1DF; color:#1F1A1B; border:1px solid rgba(31,26,27,.10)}
  .mnt-secondary:hover{background:#F1E3C8; transform:translateY(-2px)}
  .mnt-btn:active{transform:translateY(0)}
  .mnt-divider{width:40px;height:1px;background:rgba(31,26,27,.10);margin:26px auto 0}
  .mnt-reveal{opacity:0; animation:mntFadeUp .7s cubic-bezier(.22,.61,.36,1) forwards}
  .mnt-d1{animation-delay:.05s}.mnt-d2{animation-delay:.15s}.mnt-d3{animation-delay:.25s}
  .mnt-d4{animation-delay:.35s}.mnt-d5{animation-delay:.45s}.mnt-d6{animation-delay:.55s}.mnt-d7{animation-delay:.65s}
  @keyframes mntFadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
  @keyframes mntFloaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
  @media (max-width:420px){ .mnt-card{padding:42px 22px 30px} }
  @media (prefers-reduced-motion:reduce){
    .mnt-logo{animation:none} .mnt-reveal{opacity:1;animation:none}
    .mnt-btn{transition:none} .mnt-primary:hover,.mnt-secondary:hover{transform:none}
  }
`
