// Footer.jsx
function WebFooter({ navigate }) {
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '40px 48px 36px', background: 'rgba(11,16,32,0.8)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
        <div onClick={() => navigate('home')} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
          <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
            <rect x="8" y="12" width="22" height="28" rx="5" fill="url(#fng)"/>
            <rect x="12" y="17" width="14" height="3" rx="1.5" fill="rgba(255,255,255,0.5)"/>
            <rect x="12" y="23" width="14" height="3" rx="1.5" fill="rgba(255,255,255,0.3)"/>
            <path d="M34 17 Q39 26 34 35" stroke="#B57BFF" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7"/>
            <defs><linearGradient id="fng" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#C99BFF"/><stop offset="100%" stopColor="#6B35BF"/></linearGradient></defs>
          </svg>
          <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.65)', letterSpacing: '-0.01em' }}>Grip<span style={{ fontWeight: 300, color: '#B57BFF' }}>Fit</span></span>
        </div>
        <div style={{ display: 'flex', gap: 28 }}>
          {['Product','Science','Privacy','Contact'].map(l => (
            <span key={l} style={{ fontFamily: 'Inter,sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.35)', cursor: 'pointer' }}>{l}</span>
          ))}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontFamily: 'Inter,sans-serif' }}>© 2026 GripFit. All rights reserved.</div>
      </div>
    </footer>
  );
}
Object.assign(window, { WebFooter });
