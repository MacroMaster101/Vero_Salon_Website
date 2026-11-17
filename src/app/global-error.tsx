'use client';

// Last-resort boundary: replaces the root layout, so it renders its own
// <html>/<body> and can't rely on global CSS.
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: '100dvh', display: 'grid', placeItems: 'center', fontFamily: 'system-ui, sans-serif', background: '#111', color: '#f5f5f5', padding: 16 }}>
        <div style={{ maxWidth: 420, textAlign: 'center' }}>
          <h1 style={{ fontSize: 28, margin: '0 0 12px' }}>Something went wrong</h1>
          <p style={{ opacity: 0.75, margin: '0 0 24px', lineHeight: 1.6 }}>Please try again. If it keeps happening, call us.</p>
          <button type="button" onClick={() => retry()}
            style={{ padding: '12px 22px', borderRadius: 999, border: 0, background: '#c9a24a', color: '#111', fontWeight: 700, cursor: 'pointer' }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
