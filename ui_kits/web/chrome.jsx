// Dahila — minimal primitives (v2)
// White-led. Cream only on cards. Pink only on micro-details.
// Avoid the name `styles` — collisions break multi-file Babel scope.

const dahila = {
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
  ink500: '#8C8285',
  ink300: '#C9C2C4',
  ink100: '#EDE9EA',
  border: 'rgba(31,26,27,0.08)',
  borderStrong: 'rgba(31,26,27,0.18)',
  shadowSm: '0 4px 14px -8px rgba(31,26,27,0.08)',
  shadowMd: '0 14px 30px -18px rgba(31,26,27,0.12)',
  ease: 'cubic-bezier(0.22,0.61,0.36,1)',
  fontDisplay: "'Fraunces', Georgia, serif",
  fontSerif: "'Fraunces', Georgia, serif",
  fontSans: "'Inter', system-ui, -apple-system, sans-serif",
};

// --- Button ---------------------------------------------------
function Button({ variant = 'primary', size = 'md', children, onClick, full = false, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const base = {
    fontFamily: dahila.fontSans,
    fontWeight: 400,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    border: '1px solid transparent',
    cursor: 'pointer',
    transition: `all 160ms ${dahila.ease}`,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    width: full ? '100%' : 'auto',
  };
  const sizes = {
    sm: { padding: '9px 16px', fontSize: 11, borderRadius: 8 },
    md: { padding: '13px 22px', fontSize: 12, borderRadius: 10 },
    lg: { padding: '16px 28px', fontSize: 13, borderRadius: 12 },
  };
  const variants = {
    primary: {
      background: dahila.ink900, color: '#fff',
      ...(hover && { background: dahila.wine700 }),
    },
    secondary: {
      background: 'transparent', color: dahila.ink900,
      borderColor: dahila.ink900,
      ...(hover && { background: dahila.ink900, color: '#fff' }),
    },
    cream: {
      background: dahila.cream100, color: dahila.ink900,
      ...(hover && { background: dahila.cream200 }),
    },
    ghost: {
      background: 'transparent', color: dahila.ink900,
      textTransform: 'none', letterSpacing: '0.02em',
      fontWeight: 300,
      ...(hover && { color: dahila.wine600 }),
    },
  };
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      {...rest}
    >
      {children}
    </button>
  );
}

// --- Chip -----------------------------------------------------
function Chip({ children, on, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      fontFamily: dahila.fontSans, fontSize: 12, fontWeight: 400, letterSpacing: '0.04em',
      padding: '8px 14px', borderRadius: 999,
      background: on ? dahila.ink900 : (hover ? dahila.cream50 : '#fff'),
      color: on ? '#fff' : dahila.ink700,
      border: `1px solid ${on ? dahila.ink900 : dahila.borderStrong}`,
      cursor: 'pointer', transition: `all 140ms ${dahila.ease}`,
    }}>{children}</button>
  );
}

// --- Badge ----------------------------------------------------
function Badge({ tone = 'white', children }) {
  const tones = {
    white: { background: 'rgba(255,255,255,0.92)', color: dahila.ink900, border: `1px solid ${dahila.border}` },
    cream: { background: dahila.cream100, color: dahila.ink900 },
    ink:   { background: dahila.ink900, color: '#fff' },
    sold:  { background: dahila.ink100, color: dahila.ink500 },
    pink:  { background: dahila.rose100, color: dahila.wine700 },
  };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontFamily: dahila.fontSans, fontSize: 10, fontWeight: 400,
      padding: '5px 10px', borderRadius: 999,
      letterSpacing: '0.18em', textTransform: 'uppercase',
      ...tones[tone],
    }}>{children}</span>
  );
}

// --- Eyebrow --------------------------------------------------
function Eyebrow({ children, style }) {
  return <span style={{
    fontFamily: dahila.fontSans, fontSize: 10,
    letterSpacing: '0.22em', textTransform: 'uppercase',
    color: dahila.ink500, fontWeight: 400, ...style,
  }}>{children}</span>;
}

// --- Field / Input -------------------------------------------
function Field({ label, helper, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{
        fontFamily: dahila.fontSans, fontSize: 10, letterSpacing: '0.22em',
        textTransform: 'uppercase', color: dahila.ink500, fontWeight: 400,
      }}>{label}</span>
      {children}
      {helper && <span style={{ fontFamily: dahila.fontSans, fontSize: 12, fontWeight: 300, color: dahila.ink500 }}>{helper}</span>}
    </label>
  );
}

function TextInput({ placeholder, value, onChange, type = 'text' }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value || ''}
      onChange={(e) => onChange && onChange(e.target.value)}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={{
        fontFamily: dahila.fontSans, fontSize: 14, fontWeight: 300, color: dahila.ink900,
        background: 'transparent',
        border: 'none',
        borderBottom: `1px solid ${focus ? dahila.ink900 : dahila.borderStrong}`,
        padding: '10px 0 8px',
        outline: 'none',
        transition: `all 160ms ${dahila.ease}`,
      }}
    />
  );
}

// --- Icon (Phosphor) ------------------------------------------
function Icon({ name, size = 18, color, weight = 'light' }) {
  return <i className={`ph-${weight} ph-${name}`} style={{ fontSize: size, color: color || 'currentColor', lineHeight: 1 }}/>;
}

Object.assign(window, { dahila, Button, Chip, Badge, Eyebrow, Field, TextInput, Icon });
