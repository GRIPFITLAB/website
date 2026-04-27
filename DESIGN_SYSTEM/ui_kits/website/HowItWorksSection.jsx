// HowItWorksSection.jsx
function HowItWorksSection() {
  const steps = [
    { n: '01', title: 'Connect your device', body: 'Power on GripFit and open the iOS app. It pairs via Bluetooth in seconds — no account required to start measuring.' },
    { n: '02', title: 'Squeeze and measure', body: 'Grip the device and apply max force for 5–10 seconds. The app captures your full force curve in real time, both hands separately.' },
    { n: '03', title: 'Track your readiness', body: 'View fatigue index, endurance score, and daily readiness output. Build your baseline over time for precision insight.' },
  ];
  return (
    <section style={{ padding: '80px 48px', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(11,16,32,0.6)' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(181,123,255,0.8)', marginBottom: 14 }}>How it works</div>
          <h2 style={{ fontFamily: 'Inter,sans-serif', fontSize: 'clamp(24px,3vw,38px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1.2 }}>Three steps to clarity.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: 40 }}>
          {steps.map((s, i) => (
            <div key={s.n}>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ fontFamily: 'Inter,sans-serif', fontSize: 12, fontWeight: 700, color: '#B57BFF', opacity: 0.8, flexShrink: 0, marginTop: 3, letterSpacing: '0.04em' }}>{s.n}</div>
                <div>
                  <div style={{ width: 32, height: 2, background: 'linear-gradient(90deg, #B57BFF, #4A8EE8)', borderRadius: 9999, marginBottom: 14 }}></div>
                  <h3 style={{ fontFamily: 'Inter,sans-serif', fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8, lineHeight: 1.3 }}>{s.title}</h3>
                  <p style={{ fontFamily: 'Inter,sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{s.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
Object.assign(window, { HowItWorksSection });
