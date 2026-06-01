// ----------------------------------------------------------------
//  TiendaScreen — filter chips + product grid, mobile 2-up
// ----------------------------------------------------------------
function TiendaScreen({ onNavigate, products }) {
  const [filter, setFilter] = React.useState('todo');
  const cats = [
    { id: 'todo',       label: 'Todo' },
    { id: 'tops',       label: 'Tops' },
    { id: 'accesorios', label: 'Accesorios' },
    { id: 'cardigans',  label: 'Cardigans' },
    { id: 'sets',       label: 'Sets' },
  ];
  const filtered = filter === 'todo' ? products : products.filter((p) => p.category === filter);

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
        <Eyebrow>Tienda</Eyebrow>
        <h1 style={{
          fontFamily: dahila.fontDisplay, fontWeight: 300,
          fontSize: 'clamp(32px, 5vw, 48px)', lineHeight: 1.05, letterSpacing: '-0.02em',
          color: dahila.ink900, margin: 0,
        }}>Colección actual</h1>
      </div>

      <div style={{
        display: 'flex', gap: 8, flexWrap: 'wrap',
        paddingBottom: 24, marginBottom: 32,
        borderBottom: `1px solid ${dahila.border}`,
      }}>
        {cats.map((c) => (
          <Chip key={c.id} on={filter === c.id} onClick={() => setFilter(c.id)}>{c.label}</Chip>
        ))}
      </div>

      <div className="tienda-grid" style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22, rowGap: 44,
      }}>
        {filtered.map((p) => (
          <ProductCard key={p.id} {...p} onClick={() => onNavigate('producto', p.id)}/>
        ))}
      </div>

      <style>{`
        @media (max-width: 720px) {
          .tienda-grid { grid-template-columns: 1fr 1fr !important; gap: 14px !important; row-gap: 32px !important; }
        }
      `}</style>
    </main>
  );
}

// ----------------------------------------------------------------
//  ProductoScreen — single product detail
// ----------------------------------------------------------------
function ProductoScreen({ product, onAddToCart, onNavigate }) {
  const [talle, setTalle] = React.useState('M');
  const [added, setAdded] = React.useState(false);

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 0' }}>
      <nav style={{
        display: 'flex', gap: 6, fontFamily: dahila.fontSans, fontSize: 11,
        color: dahila.ink500, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 28,
      }}>
        <button onClick={() => onNavigate('home')} style={crumb}>Inicio</button>
        <span>/</span>
        <button onClick={() => onNavigate('tienda')} style={crumb}>Tienda</button>
        <span>/</span>
        <span style={{ color: dahila.ink900 }}>{product.name}</span>
      </nav>

      <div className="producto-split" style={{
        display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 56, alignItems: 'start',
      }}>
        {/* Image stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{
            aspectRatio: '4/5', borderRadius: 12, overflow: 'hidden',
            background: dahila.cream50,
          }}>
            <img src={product.photo} alt={product.name} style={{
              width: '100%', height: '100%', objectFit: 'cover',
            }}/>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[product.photo, product.photo2 || product.photo, product.photo].map((p, i) => (
              <div key={i} style={{
                aspectRatio: '1/1', borderRadius: 8, overflow: 'hidden',
                background: dahila.cream50,
                border: i === 0 ? `1px solid ${dahila.ink900}` : `1px solid ${dahila.border}`,
              }}>
                <img src={p} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
              </div>
            ))}
          </div>
        </div>

        {/* Detail */}
        <div className="producto-detail" style={{
          position: 'sticky', top: 90, display: 'flex', flexDirection: 'column', gap: 20,
        }}>
          <div>
            <Eyebrow>{product.badge || 'Hecho a mano'}</Eyebrow>
            <h1 style={{
              fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 38,
              color: dahila.ink900, margin: '10px 0 4px', letterSpacing: '-0.02em', lineHeight: 1.1,
            }}>{product.name}</h1>
            <div style={{
              fontFamily: dahila.fontSans, fontSize: 16, fontWeight: 400, color: dahila.ink900,
            }}>{product.price}</div>
          </div>

          <p style={{ fontFamily: dahila.fontSans, fontSize: 14, fontWeight: 300, lineHeight: 1.7, color: dahila.ink700, margin: 0 }}>
            {product.description || 'Tejida a mano en mi atelier. Empieza cuando vos confirmás colores y medida — entre dos y seis semanas según el modelo.'}
          </p>

          <Field label="Talle">
            <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
              {['XS', 'S', 'M', 'L', 'XL'].map((t) => (
                <button key={t} onClick={() => setTalle(t)} style={{
                  width: 44, height: 40, borderRadius: 8,
                  fontFamily: dahila.fontSans, fontSize: 12, fontWeight: 400,
                  border: `1px solid ${talle === t ? dahila.ink900 : dahila.borderStrong}`,
                  background: talle === t ? dahila.ink900 : '#fff',
                  color: talle === t ? '#fff' : dahila.ink900,
                  cursor: 'pointer', transition: `all 140ms ${dahila.ease}`,
                }}>{t}</button>
              ))}
              <button style={{
                padding: '0 14px', height: 40, borderRadius: 8,
                fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink900,
                background: 'transparent', border: `1px dashed ${dahila.borderStrong}`, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
                <Icon name="ruler" size={14}/> A medida
              </button>
            </div>
          </Field>

          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="primary" size="lg" full onClick={() => { onAddToCart(); setAdded(true); setTimeout(() => setAdded(false), 2200); }} style={{ flex: 1 }}>
              {added ? '✓ Añadido' : 'Añadir al carrito'}
            </Button>
            <Button variant="secondary" size="lg" onClick={() => {}}>
              <Icon name="heart" size={16}/>
            </Button>
          </div>

          <ul style={{
            margin: '6px 0 0', padding: 0, listStyle: 'none',
            display: 'flex', flexDirection: 'column', gap: 8,
            borderTop: `1px solid ${dahila.border}`, paddingTop: 16,
          }}>
            {[
              ['ruler',       '90% algodón pima · 10% lurex'],
              ['flower',      'Tejido a mano en Montevideo'],
              ['package',     'Envío a todo Uruguay'],
              ['arrow-clockwise', 'Encargos a medida (consultar plazos)'],
            ].map(([icon, txt]) => (
              <li key={txt} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 300, color: dahila.ink700,
              }}>
                <Icon name={icon} size={16} color={dahila.ink500}/> {txt}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .producto-split { grid-template-columns: 1fr !important; gap: 24px !important;}
          .producto-detail { position: static !important; }
        }
      `}</style>
    </main>
  );
}

const crumb = {
  background: 'none', border: 'none', color: 'inherit', cursor: 'pointer',
  padding: 0, fontFamily: 'inherit', fontSize: 'inherit', letterSpacing: 'inherit', textTransform: 'inherit',
};

window.TiendaScreen = TiendaScreen;
window.ProductoScreen = ProductoScreen;
