// DeviceScreen.jsx — Bluetooth device connection
function DeviceScreen() {
  const [scanning, setScanning] = React.useState(false);
  const [scanTimer, setScanTimer] = React.useState(null);

  const startScan = () => {
    setScanning(true);
    const t = setTimeout(() => setScanning(false), 5000);
    setScanTimer(t);
  };
  const stopScan = () => {
    setScanning(false);
    if (scanTimer) clearTimeout(scanTimer);
  };

  React.useEffect(() => () => { if (scanTimer) clearTimeout(scanTimer); }, []);

  const card = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 };

  return (
    <div style={{ flex: 1, padding: '16px 16px 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'Inter,sans-serif', fontSize: 30, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>Device</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>Grip strength insights</div>
        </div>
        {/* Status badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: scanning ? 'rgba(220,130,40,0.15)' : 'rgba(255,255,255,0.08)',
          border: `1px solid ${scanning ? 'rgba(220,130,40,0.3)' : 'rgba(255,255,255,0.12)'}`,
          borderRadius: 20, padding: '6px 12px', marginTop: 6,
        }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: scanning ? '#E8884A' : 'rgba(255,255,255,0.4)' }}></div>
          <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 12, fontWeight: 500, color: scanning ? '#E8884A' : 'rgba(255,255,255,0.6)' }}>
            {scanning ? 'Scanning' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Main card */}
      {!scanning ? (
        /* Idle state */
        <div style={{ ...card, padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <div style={{ alignSelf: 'flex-start' }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', fontFamily: 'Inter,sans-serif' }}>No device connected</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>Scan for nearby devices</div>
          </div>
          {/* BT circle */}
          <div style={{ width: 120, height: 120, borderRadius: '50%', border: '2px solid #3D72D0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={startScan}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6.5 6.5 17.5 17.5"/><polyline points="17.5 6.5 6.5 17.5"/>
              <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
            </svg>
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter,sans-serif', cursor: 'pointer' }} onClick={startScan}>Scan for Devices</div>
        </div>
      ) : (
        /* Scanning state */
        <>
          <div style={{ ...card, padding: '28px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginBottom: 12 }}>
            {/* Spinner */}
            <style>{`@keyframes spin{to{transform:rotate(360deg)}} .spinner{animation:spin 1s linear infinite;transform-origin:center}`}</style>
            <svg className="spinner" width="36" height="36" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="3"/>
              <path d="M18 4 A14 14 0 0 1 32 18" fill="none" stroke="#E8884A" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(220,130,40,0.15)', border: '1px solid rgba(220,130,40,0.3)', borderRadius: 20, padding: '5px 12px' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#E8884A' }}></div>
              <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 12, fontWeight: 500, color: '#E8884A' }}>Scanning</span>
            </div>
          </div>
          <button onClick={stopScan} style={{ width: '100%', padding: '16px', borderRadius: 14, background: 'rgba(60,100,210,0.15)', border: '1px solid #3D72D0', color: '#fff', fontFamily: 'Inter,sans-serif', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
            Stop Scanning
          </button>
        </>
      )}
    </div>
  );
}

Object.assign(window, { DeviceScreen });
