// Product card — minimal kaiastudios-style.
// Image + name + price. Optional badge over image. Hover shows secondary image OR a quick-add bar.
function ProductCard({ name, price, photo, photoAlt, badge, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'transparent', border: 'none', padding: 0, textAlign: 'left',
        cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10,
      }}>
      <div style={{
        position: 'relative',
        aspectRatio: '3 / 4',
        borderRadius: 12, overflow: 'hidden',
        background: dahila.cream50,
      }}>
        <img src={photo} alt={photoAlt || name} style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%', objectFit: 'cover',
          transition: `opacity 360ms ${dahila.ease}, transform 600ms ${dahila.ease}`,
          opacity: hover && photoAlt ? 0 : 1,
          transform: hover ? 'scale(1.02)' : 'scale(1)',
        }}/>
        {badge && (
          <span style={{ position: 'absolute', top: 10, left: 10 }}>
            <Badge tone={badge === 'Agotado' ? 'sold' : (badge === 'A medida' ? 'cream' : 'white')}>{badge}</Badge>
          </span>
        )}
        {/* Quick-add bar on hover */}
        <div style={{
          position: 'absolute', left: 10, right: 10, bottom: 10,
          background: 'rgba(255,255,255,0.95)',
          borderRadius: 8,
          padding: '8px 12px',
          fontFamily: dahila.fontSans, fontSize: 11, fontWeight: 500,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: dahila.ink900, textAlign: 'center',
          opacity: hover ? 1 : 0,
          transform: hover ? 'translateY(0)' : 'translateY(8px)',
          transition: `all 220ms ${dahila.ease}`,
          pointerEvents: hover ? 'auto' : 'none',
        }}>
          Elegir
        </div>
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        gap: 12, padding: '0 2px',
      }}>
        <span style={{
          fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 16,
          color: dahila.ink900, lineHeight: 1.2,
        }}>{name}</span>
        <span style={{
          fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 400, color: dahila.ink900,
          whiteSpace: 'nowrap',
        }}>{price}</span>
      </div>
    </button>
  );
}

window.ProductCard = ProductCard;
