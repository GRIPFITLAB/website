// Nav.jsx — GripFit website navigation
function WebNav({ page, navigate }) {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const el = document.getElementById('web-scroll');
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 20);
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      padding: '0 48px',
      background: scrolled ? 'rgba(11,16,32,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      transition: 'all 300ms ease',
      display: 'flex', alignItems: 'center', height: 68,
    }}>
      <div onClick={() => navigate('home')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flex: 1 }}>
        <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
          <rect x="8" y="12" width="22" height="28" rx="5" fill="url(#wng)"/>
          <rect x="12" y="17" width="14" height="3" rx="1.5" fill="rgba(255,255,255,0.55)"/>
          <rect x="12" y="23" width="14" height="3" rx="1.5" fill="rgba(255,255,255,0.38)"/>
          <rect x="12" y="29" width="9" height="3" rx="1.5" fill="rgba(255,255,255,0.22)"/>
          <path d="M34 17 Q39 26 34 35" stroke="#B57BFF" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
          <defs><linearGradient id="wng" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#C99BFF"/><stop offset="100%" stopColor="#6B35BF"/></linearGradient></defs>
        </svg>
        <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
          Grip<span style={{ fontWeight: 300, color: '#B57BFF' }}>Fit</span>
        </span>
      </div>
      <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
        {[['product','Product'],['science','Science']].map(([id,l]) => (
          <button key={id} onClick={() => navigate(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter,sans-serif', fontSize: 14, fontWeight: 500, color: page === id ? '#B57BFF' : 'rgba(255,255,255,0.55)', transition: 'color 150ms', padding: 0 }}>{l}</button>
        ))}
        <button style={{ background: '#B57BFF', border: 'none', borderRadius: 10, padding: '9px 22px', color: '#0B1020', fontFamily: 'Inter,sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 0 24px rgba(181,123,255,0.35)', transition: 'all 200ms' }}>Pre-order</button>
      </div>
    </nav>
  );
}
Object.assign(window, { WebNav });
