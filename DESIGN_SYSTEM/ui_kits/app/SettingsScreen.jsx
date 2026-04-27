// SettingsScreen.jsx — Full settings matching screenshots
function SettingsScreen() {
  const [units, setUnits] = React.useState('pounds');
  const [hand, setHand] = React.useState('right');
  const [copied, setCopied] = React.useState(false);

  const card = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16, overflow: 'hidden',
  };

  const Row = ({ icon, label, sub, right, danger, last }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}>
      {icon && (
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(60,100,210,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </div>
      )}
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'Inter,sans-serif', fontSize: 15, fontWeight: 500, color: danger ? '#E05050' : '#fff' }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{sub}</div>}
      </div>
      {right !== undefined ? right : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      )}
    </div>
  );

  const SegPicker = ({ options, value, onChange }) => (
    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: 9, padding: 3, gap: 2 }}>
      {options.map(o => (
        <button key={o.val} onClick={() => onChange(o.val)} style={{ padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', fontFamily: 'Inter,sans-serif', fontSize: 13, fontWeight: 500, background: value === o.val ? 'rgba(255,255,255,0.15)' : 'transparent', color: value === o.val ? '#fff' : 'rgba(255,255,255,0.5)', transition: 'all 150ms', whiteSpace: 'nowrap' }}>
          {o.label}
        </button>
      ))}
    </div>
  );

  const PrefRow = ({ label, sub, children, last }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.06)', gap: 12 }}>
      <div>
        <div style={{ fontFamily: 'Inter,sans-serif', fontSize: 15, fontWeight: 500, color: '#fff' }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{sub}</div>}
      </div>
      {children}
    </div>
  );

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 0' }}>
      {/* Title */}
      <div style={{ fontFamily: 'Inter,sans-serif', fontSize: 30, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>Settings</div>
      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginBottom: 18, marginTop: 2 }}>Manage your profile & preferences</div>

      {/* Profile card */}
      <div style={{ ...card, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px' }}>
          <div style={{ width: 46, height: 46, borderRadius: '50%', background: '#6B5CC4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter,sans-serif', fontSize: 16, fontWeight: 700, color: '#fff', flexShrink: 0 }}>AS</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Inter,sans-serif', fontSize: 16, fontWeight: 600, color: '#fff' }}>Andrew Schaefer</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>avschaefer@proton.me</div>
          </div>
          <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 9, padding: '6px 16px', color: '#fff', fontFamily: 'Inter,sans-serif', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Edit</button>
        </div>
      </div>

      {/* Getting Started */}
      <div style={{ ...card, marginBottom: 12 }}>
        <Row icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A8EE8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>}
          label="Getting Started" sub="Pairing, usage & data tips" last />
      </div>

      {/* Grip & Readiness */}
      <div style={{ ...card, marginBottom: 18 }}>
        <Row icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A8EE8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>}
          label="Grip & Readiness" sub="How grip strength impacts readiness" last />
      </div>

      {/* Preferences */}
      <div style={{ fontFamily: 'Inter,sans-serif', fontSize: 17, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Preferences</div>
      <div style={{ ...card, marginBottom: 18 }}>
        <PrefRow label="Units">
          <SegPicker options={[{val:'kilograms',label:'Kilograms'},{val:'pounds',label:'Pounds'}]} value={units} onChange={setUnits} />
        </PrefRow>
        <PrefRow label="Default Hand" sub="Used when starting a new test">
          <SegPicker options={[{val:'left',label:'Left'},{val:'right',label:'Right'}]} value={hand} onChange={setHand} />
        </PrefRow>
        <PrefRow label="Readiness Window" sub="Time frame for readiness score" last>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
            <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 14, color: '#fff' }}>1 Week</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>
          </div>
        </PrefRow>
      </div>

      {/* Actions */}
      <div style={{ fontFamily: 'Inter,sans-serif', fontSize: 17, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Actions</div>
      <div style={{ ...card, marginBottom: 18 }}>
        <Row icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A8EE8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
          label="Send Feedback" last />
      </div>

      {/* Subscription */}
      <div style={{ fontFamily: 'Inter,sans-serif', fontSize: 17, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Subscription</div>
      <div style={{ ...card, marginBottom: 18 }}>
        <div style={{ margin: 10, background: 'rgba(50,130,80,0.25)', border: '1px solid rgba(50,180,100,0.25)', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🎁</span>
          <div>
            <div style={{ fontFamily: 'Inter,sans-serif', fontSize: 14, fontWeight: 600, color: '#4ADE80' }}>All features unlocked</div>
            <div style={{ fontSize: 12, color: 'rgba(74,222,128,0.7)', marginTop: 1 }}>Free during early access period</div>
          </div>
        </div>
      </div>

      {/* Referrals */}
      <div style={{ fontFamily: 'Inter,sans-serif', fontSize: 17, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Referrals</div>
      <div style={{ ...card, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter,sans-serif' }}>Your Code</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 14, fontWeight: 600, color: '#fff', letterSpacing: '0.04em' }}>GRIP-UGFZ</span>
            <span onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ cursor: 'pointer', color: copied ? '#4ADE80' : 'rgba(255,255,255,0.4)', fontSize: 16 }}>
              {copied ? '✓' : '⧉'}
            </span>
          </div>
        </div>
        <Row icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A8EE8" strokeWidth="2" strokeLinecap="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>}
          label="Share Referral Link" last />
      </div>

      {/* About */}
      <div style={{ fontFamily: 'Inter,sans-serif', fontSize: 17, fontWeight: 600, color: '#fff', marginBottom: 8 }}>About</div>
      <div style={{ ...card, marginBottom: 18 }}>
        <Row icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A8EE8" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>} label="Privacy" />
        <Row icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A8EE8" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>} label="Terms" />
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 16px' }}>
          <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', fontFamily: 'Inter,sans-serif' }}>Version</span>
          <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', fontFamily: 'Inter,sans-serif' }}>0.0.1</span>
        </div>
      </div>

      {/* Data */}
      <div style={{ fontFamily: 'Inter,sans-serif', fontSize: 17, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Data</div>
      <div style={{ ...card, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', cursor: 'pointer' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E05050" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 15, fontWeight: 500, color: '#E05050' }}>Delete All Sessions</span>
        </div>
      </div>

      {/* Sign out */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '16px', cursor: 'pointer', marginBottom: 8 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E05050" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 16, fontWeight: 500, color: '#E05050' }}>Sign Out</span>
      </div>

      <div style={{ height: 12 }}></div>
    </div>
  );
}

Object.assign(window, { SettingsScreen });
