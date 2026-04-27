// CTASection.jsx
function CTASection() {
  return (
    <section style={{ padding: '80px 48px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', borderRadius: 28, padding: '60px 52px', textAlign: 'center', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(181,123,255,0.12) 0%, rgba(22,34,56,0.9) 40%, rgba(74,142,232,0.08) 100%)', border: '1px solid rgba(181,123,255,0.20)', boxShadow: '0 0 80px rgba(181,123,255,0.08)' }}>
        <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 300, height: 200, background: 'radial-gradient(ellipse, rgba(181,123,255,0.2) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(181,123,255,0.8)', marginBottom: 16 }}>Early access</div>
          <h2 style={{ fontFamily: 'Inter,sans-serif', fontSize: 'clamp(26px,3.5vw,42px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1.15, marginBottom: 16 }}>The future of human readiness.</h2>
          <p style={{ fontFamily: 'Inter,sans-serif', fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 32, maxWidth: 420, margin: '0 auto 32px' }}>Join the waitlist for early access pricing when GripFit ships.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <input type="email" placeholder="your@email.com" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 11, padding: '13px 18px', color: '#fff', fontFamily: 'Inter,sans-serif', fontSize: 14, outline: 'none', width: 240 }} />
            <button style={{ background: '#B57BFF', border: 'none', borderRadius: 11, padding: '13px 28px', color: '#0B1020', fontFamily: 'Inter,sans-serif', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 0 24px rgba(181,123,255,0.4)', whiteSpace: 'nowrap' }}>Join waitlist</button>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 14 }}>No spam. Early access pricing for waitlist members.</div>
        </div>
      </div>
    </section>
  );
}
Object.assign(window, { CTASection });
