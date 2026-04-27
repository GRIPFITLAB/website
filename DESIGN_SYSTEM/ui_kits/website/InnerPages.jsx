// InnerPages.jsx — Product + Science pages
function ProductPage({ navigate }) {
  const specs = [
    { label: 'Force range', val: '0–150 lbs' },
    { label: 'Accuracy', val: '±0.5 lbs' },
    { label: 'Sampling rate', val: '100 Hz' },
    { label: 'Connectivity', val: 'Bluetooth 5.2' },
    { label: 'Battery', val: '6h continuous' },
    { label: 'Compatibility', val: 'iOS 16+' },
    { label: 'Weight', val: '185g' },
    { label: 'Materials', val: 'Aluminium alloy' },
  ];
  return (
    <div style={{ padding: '80px 48px', maxWidth: 900, margin: '0 auto' }}>
      <button onClick={() => navigate('home')} style={{ background: 'none', border: 'none', color: '#B57BFF', fontFamily: 'Inter,sans-serif', fontSize: 13, fontWeight: 500, cursor: 'pointer', padding: 0, marginBottom: 40 }}>← Home</button>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(181,123,255,0.8)', marginBottom: 14 }}>Technical specs</div>
      <h1 style={{ fontFamily: 'Inter,sans-serif', fontSize: 'clamp(30px,4vw,52px)', fontWeight: 800, letterSpacing: '-0.04em', color: '#fff', lineHeight: 1.1, marginBottom: 16 }}>GripFit Pro</h1>
      <p style={{ fontFamily: 'Inter,sans-serif', fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: 500, marginBottom: 48 }}>Engineered for athletes who demand measurement-grade accuracy and real-time readiness intelligence.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 12, marginBottom: 48 }}>
        {specs.map(s => (
          <div key={s.label} style={{ background: 'rgba(22,34,56,0.7)', borderRadius: 14, padding: '18px', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.32)', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontFamily: 'Inter,sans-serif', fontSize: 18, fontWeight: 700, color: '#fff' }}>{s.val}</div>
          </div>
        ))}
      </div>
      <div style={{ height: 200, background: 'rgba(22,34,56,0.5)', borderRadius: 20, border: '1px solid rgba(181,123,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>Product photography placeholder</div>
        </div>
      </div>
    </div>
  );
}

function SciencePage({ navigate }) {
  const items = [
    { title: 'Grip strength as a CNS proxy', body: 'Research shows grip force correlates with central nervous system fatigue. A drop of 5–8% in peak grip reliably predicts compromised neuromuscular readiness before subjective fatigue is perceived.' },
    { title: 'Rate of force development', body: 'RFD — how quickly you reach peak force — is sensitive to fatigue state before peak force itself changes, making it an early-warning signal for overreaching.' },
    { title: 'Fatigue index', body: 'GripFit calculates the force drop over a sustained grip. Higher fatigue index = greater glycolytic fatigue, helping coaches manage athlete load with objective data.' },
    { title: 'Asymmetry detection', body: 'L/R asymmetries greater than 10–15% are linked to injury risk. Daily bilateral tracking catches developing imbalances early, before they become problems.' },
  ];
  return (
    <div style={{ padding: '80px 48px', maxWidth: 740, margin: '0 auto' }}>
      <button onClick={() => navigate('home')} style={{ background: 'none', border: 'none', color: '#B57BFF', fontFamily: 'Inter,sans-serif', fontSize: 13, fontWeight: 500, cursor: 'pointer', padding: 0, marginBottom: 40 }}>← Home</button>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(181,123,255,0.8)', marginBottom: 14 }}>The science</div>
      <h1 style={{ fontFamily: 'Inter,sans-serif', fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, letterSpacing: '-0.04em', color: '#fff', lineHeight: 1.1, marginBottom: 48 }}>Why grip predicts readiness.</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
        {items.map((item, i) => (
          <div key={i} style={{ paddingLeft: 24, borderLeft: '2px solid rgba(181,123,255,0.35)' }}>
            <h3 style={{ fontFamily: 'Inter,sans-serif', fontSize: 19, fontWeight: 700, color: '#fff', marginBottom: 10 }}>{item.title}</h3>
            <p style={{ fontFamily: 'Inter,sans-serif', fontSize: 15, color: 'rgba(255,255,255,0.52)', lineHeight: 1.8 }}>{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { ProductPage, SciencePage });
