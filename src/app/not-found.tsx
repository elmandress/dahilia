import Link from 'next/link'

export default function NotFound() {
  return (
    <main
      style={{
        maxWidth: 560,
        margin: '0 auto',
        padding: '120px 24px',
        textAlign: 'center',
      }}
    >
      <span
        className="eyebrow"
        style={{ color: 'var(--ink-500)' }}
      >
        Error 404
      </span>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 300,
          fontSize: 'clamp(36px, 6vw, 64px)',
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          color: 'var(--ink-900)',
          margin: '14px 0 16px',
        }}
      >
        Esta página se perdió.
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: 18,
          color: 'var(--ink-700)',
          marginBottom: 28,
        }}
      >
        Quizá la prenda que buscabas ya no está, o el link cambió. Probá desde la tienda.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link
          href="/tienda"
          style={{
            background: 'var(--ink-900)',
            color: '#fff',
            padding: '14px 24px',
            borderRadius: 12,
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            fontWeight: 400,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            textDecoration: 'none',
          }}
        >
          Ir a la tienda
        </Link>
        <Link
          href="/"
          style={{
            background: 'transparent',
            color: 'var(--ink-900)',
            padding: '14px 24px',
            borderRadius: 12,
            border: '1px solid var(--ink-900)',
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            fontWeight: 400,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            textDecoration: 'none',
          }}
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}
