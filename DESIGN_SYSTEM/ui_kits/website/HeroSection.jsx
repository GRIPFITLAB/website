// HeroSection.jsx
function HeroSection({ navigate }) {
  return (
    <section style={{
      minHeight: '92vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '80px 48px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Layered ambient glows — purple brand + blue data */}
      <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 500, background: 'radial-gradient(ellipse, rgba(181,123,255,0.18) 0%, transparent 65%)', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', top: '20%', right: '5%', width: 400, height: 400, background: 'radial-gradient(ellipse, rgba(74,142,232,0.12) 0%, transparent 65%)', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '0', left: '10%', width: 350, height: 300, background: 'radial-gradient(ellipse, rgba(181,123,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }}></div>

      <div style={{ maxWidth: 960, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 28, position: 'relative' }}>

        {/* Eyebrow pill */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(181,123,255,0.10)', border: '1px solid rgba(181,123,255,0.25)', borderRadius: 9999, padding: '6px 18px' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#B57BFF', boxShadow: '0 0 8px rgba(181,123,255,0.8)' }}></div>
          <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 12, fontWeight: 500, color: '#B57BFF', letterSpacing: '0.04em' }}>Smart hand dynamometer · Now available</span>
        </div>

        {/* Headline */}
        <h1 style={{ fontFamily: 'Inter,sans-serif', fontSize: 'clamp(40px,5.5vw,76px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.04em', color: '#fff' }}>
          Measure your grip.<br />
          <span style={{ background: 'linear-gradient(135deg, #C99BFF 0%, #B57BFF 40%, #7A8EFF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Know your readiness.
          </span>
        </h1>

        <p style={{ fontFamily: 'Inter,sans-serif', fontSize: 18, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: 520 }}>
          GripFit pairs a precision hand dynamometer with iOS to track peak force, endurance, and fatigue in real time — turning grip data into actionable readiness intelligence.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button style={{ background: '#B57BFF', border: 'none', borderRadius: 12, padding: '14px 34px', color: '#0B1020', fontFamily: 'Inter,sans-serif', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 0 36px rgba(181,123,255,0.4)', transition: 'all 200ms' }}>Pre-order GripFit</button>
          <button onClick={() => navigate('science')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '14px 34px', color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter,sans-serif', fontSize: 15, fontWeight: 500, cursor: 'pointer', transition: 'all 200ms' }}>The science →</button>
        </div>

        {/* Mock app card */}
        <div style={{ marginTop: 20, width: '100%', maxWidth: 600, background: 'rgba(22,34,56,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, backdropFilter: 'blur(20px)', overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(181,123,255,0.06)' }}>
          {/* Fake status bar */}
          <div style={{ background: 'rgba(11,16,32,0.6)', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter,sans-serif', fontWeight: 500 }}>
            <span>9:41</span><span>◉ Dashboard</span><span>70%</span>
          </div>
          {/* Dashboard preview strip */}
          <div style={{ padding: '20px 24px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>TODAY'S BEST</div>
                <div style={{ fontFamily: 'Inter,sans-serif', fontSize: 40, fontWeight: 800, color: '#fff', lineHeight: 1, letterSpacing: '-0.03em' }}>84 <span style={{ fontSize: 18, fontWeight: 400, color: 'rgba(255,255,255,0.5)' }}>lbs</span></div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>READINESS</div>
                <svg width="56" height="56" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5"/>
                  <circle cx="28" cy="28" r="22" fill="none" stroke="#4ADE80" strokeWidth="5"
                    strokeDasharray="138.2" strokeDashoffset="13.8"
                    strokeLinecap="round" transform="rotate(-90 28 28)"
                    style={{ filter: 'drop-shadow(0 0 6px rgba(74,222,128,0.6))' }}/>
                  <text x="28" y="33" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="15" fontWeight="700" fill="#4ADE80">91</text>
                </svg>
              </div>
            </div>
            {/* Mini chart */}
            <svg width="100%" height="60" viewBox="0 0 552 60" preserveAspectRatio="none">
              <defs>
                <linearGradient id="hfill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4A8EE8" stopOpacity="0.4"/>
                  <stop offset="100%" stopColor="#4A8EE8" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path d="M0,55 C60,55 80,50 120,35 C160,20 190,5 220,2 C250,-1 280,15 310,30 C340,45 380,52 440,54 L552,55 Z" fill="url(#hfill)"/>
              <path d="M0,55 C60,55 80,50 120,35 C160,20 190,5 220,2 C250,-1 280,15 310,30 C340,45 380,52 440,54" fill="none" stroke="#4A8EE8" strokeWidth="2"/>
            </svg>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
          {[['±0.5 lbs','Accuracy'],['6h','Battery'],['< 3s','BT pairing'],['iOS 16+','Compatible']].map(([v,l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Inter,sans-serif', fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>{v}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
Object.assign(window, { HeroSection });
