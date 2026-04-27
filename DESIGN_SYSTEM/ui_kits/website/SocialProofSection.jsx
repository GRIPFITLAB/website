// SocialProofSection.jsx
function SocialProofSection() {
  const quotes = [
    { text: "I've tried every grip tracker out there. GripFit is the first one that actually tells me when I'm ready to train hard.", name: 'Jordan M.', role: 'Competitive climber' },
    { text: "The asymmetry tracking caught a left-hand deficit I didn't know I had. Fixed it in 6 weeks of targeted work.", name: 'Priya K.', role: 'Olympic weightlifter' },
    { text: "Daily grip readings have become my go-to readiness signal. Simple, fast, accurate.", name: 'Sam L.', role: 'Strength coach' },
  ];
  return (
    <section style={{ padding: '96px 48px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(181,123,255,0.8)', marginBottom: 14 }}>Athletes trust GripFit</div>
        <h2 style={{ fontFamily: 'Inter,sans-serif', fontSize: 'clamp(24px,3vw,38px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff' }}>Precision for people who mean it.</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))', gap: 16, marginBottom: 48 }}>
        {quotes.map(q => (
          <div key={q.name} style={{ background: 'rgba(22,34,56,0.7)', borderRadius: 20, padding: '28px 24px', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize: 32, color: '#B57BFF', opacity: 0.4, fontFamily: 'Georgia,serif', lineHeight: 1, marginBottom: 14 }}>"</div>
            <p style={{ fontFamily: 'Inter,sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.68)', lineHeight: 1.75, marginBottom: 20 }}>{q.text}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#B57BFF,#4A8EE8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>{q.name[0]}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', fontFamily: 'Inter,sans-serif' }}>{q.name}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginTop: 1 }}>{q.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Stats bar */}
      <div style={{ background: 'rgba(22,34,56,0.7)', borderRadius: 20, padding: '32px 48px', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 24 }}>
        {[['±0.5 lbs','Accuracy'],['< 3s','BT pairing'],['6h','Battery life'],['iOS 16+','Compatible']].map(([v,l]) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Inter,sans-serif', fontSize: 26, fontWeight: 800, background: 'linear-gradient(135deg,#C99BFF,#4A8EE8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.03em' }}>{v}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
Object.assign(window, { SocialProofSection });
