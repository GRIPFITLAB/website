// FeaturesSection.jsx
function FeaturesSection() {
  const features = [
    { title: 'Precision force sensing', body: 'Strain-gauge load cell accurate to ±0.5 lbs. Captures peak force, rate of force development, and fatigue curves every squeeze.', accent: '#4A8EE8' },
    { title: 'Left / right tracking', body: 'Measure dominant and non-dominant hands independently. Asymmetry analysis flags imbalances before they become injuries.', accent: '#B57BFF' },
    { title: 'Readiness intelligence', body: 'Grip strength correlates with CNS fatigue. GripFit turns daily measurements into a single, precise readiness score.', accent: '#4ADE80' },
    { title: 'iOS companion app', body: 'Real-time force curves, session history, 7-day trends, and streak tracking. Connects via Bluetooth in under 3 seconds.', accent: '#B57BFF' },
  ];

  const icons = [
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
  ];

  return (
    <section style={{ padding: '96px 48px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(181,123,255,0.8)', marginBottom: 14 }}>Why GripFit</div>
        <h2 style={{ fontFamily: 'Inter,sans-serif', fontSize: 'clamp(26px,3.5vw,44px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1.15 }}>
          Every metric that matters.<br/><span style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>Nothing that doesn't.</span>
        </h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {features.map((f, i) => (
          <div key={f.title} style={{ background: 'rgba(22,34,56,0.7)', borderRadius: 20, padding: '28px 24px', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: `${f.accent}18`, border: `1px solid ${f.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.accent, marginBottom: 18 }}>
              {icons[i]}
            </div>
            <h3 style={{ fontFamily: 'Inter,sans-serif', fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 10, lineHeight: 1.3 }}>{f.title}</h3>
            <p style={{ fontFamily: 'Inter,sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
Object.assign(window, { FeaturesSection });
