// Esqueleto SOLO del listado /tienda (el grupo "(listado)" no cambia la URL).
// /tienda se arma en cada visita (lee los filtros de la URL), y acá el
// esqueleto sí sirve: sale al instante mientras el servidor termina.
//
// Antes vivía en app/tienda/ y envolvía también a las fichas (/tienda/[slug]),
// que son estáticas. Un loading.tsx envuelve la página en un Suspense, y en
// una página estática eso hace que el HTML traiga primero el esqueleto y la
// página real escondida en un <div hidden>, que React revela después con un
// script (y un freno de ~300 ms a propósito). La foto principal ya descargada
// tardaba 1,3-1,5 s en pintarse (Lighthouse, 13/09/2026). Por lo mismo se
// sacaron el loading.tsx de la raíz y el de las fichas.
export default function TiendaLoading() {
  return (
    <div role="status" aria-live="polite" style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 0' }}>
      <span className="sr-only">Cargando la tienda…</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
        <div className="sk-shimmer" style={{ width: 60, height: 11, borderRadius: 4 }} />
        <div className="sk-shimmer" style={{ width: 320, height: 44, borderRadius: 6 }} />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid rgba(31,26,27,0.08)' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="sk-shimmer" style={{ width: 80, height: 32, borderRadius: 999 }} />
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: 22,
          rowGap: 44,
        }}
        className="tienda-skeleton-grid"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="sk-shimmer" style={{ width: '100%', aspectRatio: '3 / 4', borderRadius: 12 }} />
            <div className="sk-shimmer" style={{ width: '70%', height: 14, borderRadius: 4 }} />
            <div className="sk-shimmer" style={{ width: '40%', height: 12, borderRadius: 4 }} />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes sk-shimmer-anim {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .sk-shimmer {
          background: linear-gradient(90deg,
            rgba(31,26,27,0.05) 0%,
            rgba(31,26,27,0.10) 40%,
            rgba(31,26,27,0.05) 80%);
          background-size: 200% 100%;
          animation: sk-shimmer-anim 1.6s linear infinite;
        }
        @media (max-width: 720px) {
          .tienda-skeleton-grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important; gap: 14px !important; row-gap: 32px !important; }
        }
      `}</style>
    </div>
  )
}
