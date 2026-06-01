// White sticky header — clean, minimal, kaiastudios-feeling.
function Header({ route, onNavigate, cartCount = 0 }) {
  const items = [
    { id: 'tienda',  label: 'Tienda' },
    { id: 'encargo', label: 'Encargos' },
    { id: 'atelier', label: 'Atelier' },
    { id: 'contacto', label: 'Contacto' },
  ];
  const [open, setOpen] = React.useState(false);

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      borderBottom: `1px solid ${dahila.border}`,
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        padding: '14px 24px',
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center', gap: 24,
      }}>
        {/* Left: nav (desktop) / hamburger (mobile) */}
        <nav className="nav-desktop" style={{ display: 'flex', gap: 28 }}>
          {items.map((it) => {
            const on = route === it.id || (route === 'producto' && it.id === 'tienda');
            return (
              <button key={it.id} onClick={() => onNavigate(it.id)} style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                fontFamily: dahila.fontSans, fontSize: 12, fontWeight: 400,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                color: on ? dahila.ink900 : dahila.ink700, padding: 0,
              }}>{it.label}</button>
            );
          })}
        </nav>
        <button onClick={() => setOpen(!open)} className="nav-mobile" aria-label="Menú" style={{
          display: 'none', background: 'transparent', border: 'none', cursor: 'pointer', color: dahila.ink900, padding: 0,
        }}>
          <Icon name="list" size={22}/>
        </button>

        {/* Center: brand */}
        <button onClick={() => onNavigate('home')} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
          justifySelf: 'center',
        }}>
          <img src="../../assets/isotype-color.png" alt="" style={{ width: 40, height: 40, objectFit: 'contain' }}/>
          <span style={{
            fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 22,
            color: dahila.ink900, letterSpacing: '0.18em',
          }}>DAHILA</span>
        </button>

        {/* Right: icons */}
        <div style={{ display: 'flex', gap: 18, alignItems: 'center', color: dahila.ink900, justifySelf: 'end' }}>
          <button style={iconBtn} aria-label="Buscar"><Icon name="magnifying-glass" size={18}/></button>
          <button style={iconBtn} aria-label="Lista"><Icon name="heart" size={18}/></button>
          <button onClick={() => onNavigate('encargo')} style={{ ...iconBtn, position: 'relative' }} aria-label="Carrito">
            <Icon name="shopping-bag" size={18}/>
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -8,
                minWidth: 16, height: 16, borderRadius: 999,
                background: dahila.ink900, color: '#fff',
                fontFamily: dahila.fontSans, fontSize: 9.5, fontWeight: 500,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 4px',
              }}>{cartCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {open && (
        <div style={{
          background: '#fff', borderTop: `1px solid ${dahila.border}`,
          padding: '14px 24px', display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {items.map((it) => (
            <button key={it.id} onClick={() => { onNavigate(it.id); setOpen(false); }} style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: dahila.fontSans, fontSize: 14, fontWeight: 300,
              color: dahila.ink900, textAlign: 'left', padding: '10px 0',
              letterSpacing: '0.04em',
            }}>{it.label}</button>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 720px) {
          .nav-desktop { display: none !important; }
          .nav-mobile { display: inline-flex !important; }
        }
      `}</style>
    </header>
  );
}

const iconBtn = {
  background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0,
  display: 'inline-flex', alignItems: 'center',
};

window.Header = Header;
