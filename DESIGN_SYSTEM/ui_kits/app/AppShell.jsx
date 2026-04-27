// AppShell.jsx
function AppShell({ screen, onNavigate }) {
  // Background gradient matching screenshots
  const bgStyle = {
    position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
    background: 'radial-gradient(ellipse at 35% 0%, rgba(40,80,200,0.28) 0%, transparent 55%), radial-gradient(ellipse at 80% 5%, rgba(60,40,160,0.18) 0%, transparent 40%), #0B1020',
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : 'rgba(255,255,255,0.45)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    )},
    { id: 'device', label: 'Device', icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : 'rgba(255,255,255,0.45)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6.5 6.5 17.5 17.5"/><polyline points="17.5 6.5 6.5 17.5"/>
        <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
      </svg>
    )},
    { id: 'settings', label: 'Settings', icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : 'rgba(255,255,255,0.45)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    )},
  ];

  return (
    <>
      <div style={bgStyle}></div>
      <div style={{ position: 'relative', zIndex: 1, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {screen === 'dashboard' && <DashboardScreen />}
        {screen === 'device'    && <DeviceScreen />}
        {screen === 'settings'  && <SettingsScreen />}
      </div>
      <div style={{ position: 'relative', zIndex: 1, padding: '8px 16px 20px', display: 'flex', justifyContent: 'center', flexShrink: 0, background: 'transparent' }}>
        <div style={{ display: 'flex', background: '#141E30', borderRadius: 40, padding: 5, gap: 2 }}>
          {tabs.map(t => {
            const active = screen === t.id;
            return (
              <button key={t.id} onClick={() => onNavigate(t.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '8px 20px', borderRadius: 32, border: 'none', cursor: 'pointer', background: active ? '#232E45' : 'transparent', transition: 'background 200ms' }}>
                {t.icon(active)}
                <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 10, fontWeight: 500, color: active ? '#fff' : 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap' }}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

Object.assign(window, { AppShell });
