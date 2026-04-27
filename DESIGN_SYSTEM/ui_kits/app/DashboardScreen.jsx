// DashboardScreen.jsx
function DashboardScreen() {
  const [hand, setHand] = React.useState('all');
  const [period, setPeriod] = React.useState('3m');

  // SVG line chart — bell curve shape matching screenshot
  const chartW = 315, chartH = 100;
  const pts = [
    [0, 90], [30, 88], [60, 82], [90, 60], [110, 20], [130, 5], [150, 18],
    [170, 55], [200, 78], [230, 85], [260, 87], [290, 88], [315, 90]
  ];
  const peak = pts[5];
  const lineD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
  const areaD = lineD + ` L${chartW},${chartH} L0,${chartH} Z`;

  const stats = [
    { label: '3 Day Avg', val: '0 lbs' },
    { label: '1 Mo Avg', val: '0 lbs' },
    { label: 'All Time', val: '117 lbs' },
    { label: 'Change', val: '-100%', red: true },
  ];

  const card = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '16px' };
  const label = { fontFamily: 'Inter,sans-serif', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 0' }}>
      <div style={{ fontFamily: 'Inter,sans-serif', fontSize: 30, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>Dashboard</div>
      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginBottom: 16, marginTop: 2 }}>Your grip performance</div>

      {/* All / Left / Right segmented */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 3, marginBottom: 16, gap: 2 }}>
        {['all', 'left', 'right'].map(h => (
          <button key={h} onClick={() => setHand(h)} style={{ flex: 1, padding: '7px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'Inter,sans-serif', fontSize: 14, fontWeight: 500, background: hand === h ? 'rgba(255,255,255,0.12)' : 'transparent', color: hand === h ? '#fff' : 'rgba(255,255,255,0.45)', transition: 'all 150ms', textTransform: 'capitalize' }}>{h === 'all' ? 'All' : h.charAt(0).toUpperCase() + h.slice(1)}</button>
        ))}
      </div>

      {/* Main chart card */}
      <div style={{ ...card, marginBottom: 14 }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={label}>Today's Best</div>
          <div style={label}>Readiness</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
          <div>
            <div style={{ fontFamily: 'Inter,sans-serif', fontSize: 44, fontWeight: 700, color: '#fff', lineHeight: 1, letterSpacing: '-0.03em' }}>0 <span style={{ fontSize: 20, fontWeight: 400, color: 'rgba(255,255,255,0.6)' }}>lbs</span></div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>No tests today</div>
          </div>
          {/* Readiness ring */}
          <svg width="60" height="60" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="5"/>
            <circle cx="30" cy="30" r="24" fill="none" stroke="#E05050" strokeWidth="5"
              strokeDasharray="150.8" strokeDashoffset="150.8"
              strokeLinecap="round" transform="rotate(-90 30 30)"/>
            <text x="30" y="35" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="16" fontWeight="700" fill="#E05050">0</text>
          </svg>
        </div>

        {/* Chart */}
        <div style={{ marginTop: 8, marginBottom: 4, position: 'relative' }}>
          <svg width={chartW} height={chartH} viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
            <defs>
              <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4A8EE8" stopOpacity="0.35"/>
                <stop offset="100%" stopColor="#4A8EE8" stopOpacity="0.02"/>
              </linearGradient>
            </defs>
            <path d={areaD} fill="url(#chartFill)"/>
            <path d={lineD} fill="none" stroke="#4A8EE8" strokeWidth="2" strokeLinejoin="round"/>
            <circle cx={peak[0]} cy={peak[1]} r="4" fill="#fff" stroke="#4A8EE8" strokeWidth="1.5"/>
          </svg>
          {/* X axis labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            {['2/1','2/15','3/1','3/15','3/29','4/12','4/26'].map(d => (
              <span key={d} style={{ fontFamily: 'Inter,sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{d}</span>
            ))}
          </div>
        </div>

        {/* Period selector */}
        <div style={{ display: 'flex', gap: 4, margin: '10px 0' }}>
          {[['1w','1W'],['1m','1M'],['3m','3M'],['1y','1Y'],['all','All']].map(([k,l]) => (
            <button key={k} onClick={() => setPeriod(k)} style={{ flex: 1, padding: '6px 4px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'Inter,sans-serif', fontSize: 12, fontWeight: 500, background: period === k ? 'rgba(255,255,255,0.14)' : 'transparent', color: period === k ? '#fff' : 'rgba(255,255,255,0.4)', transition: 'all 150ms' }}>{l}</button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '8px 0' }}></div>

        {/* Stats row */}
        <div style={{ display: 'flex' }}>
          {stats.map(s => (
            <div key={s.label} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontFamily: 'Inter,sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontFamily: 'Inter,sans-serif', fontSize: 15, fontWeight: 700, color: s.red ? '#E05050' : '#fff' }}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Strength Balance + Streak */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        {/* Strength Balance */}
        <div style={card}>
          <div style={{ fontFamily: 'Inter,sans-serif', fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 8, whiteSpace: 'nowrap' }}>Strength Balance</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 5 }}>
            <span>Left</span><span>Right</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 9999, marginBottom: 8, overflow: 'hidden' }}>
            <div style={{ width: '99%', height: '100%', background: '#4A8EE8', borderRadius: 9999, marginLeft: 'auto' }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 15, fontWeight: 700, color: '#fff' }}>0.0 <span style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.4)' }}>lbs</span></span>
            <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 15, fontWeight: 700, color: '#fff' }}>101.9 <span style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.4)' }}>lbs</span></span>
          </div>
          <div style={{ marginTop: 8 }}>
            <span style={{ background: 'rgba(220,140,60,0.2)', color: '#E8884A', fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 6 }}>100% difference</span>
          </div>
        </div>

        {/* Streak */}
        <div style={card}>
          <div style={{ fontFamily: 'Inter,sans-serif', fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Streak</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            {['M','T','W','T','F','S','S'].map((d, i) => (
              <div key={i} style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>{d}</div>
            ))}
          </div>
          <div style={{ fontFamily: 'Inter,sans-serif', fontSize: 18, fontWeight: 700, color: '#fff', textAlign: 'center' }}>0 of 7 days</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 3 }}>This Week</div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontFamily: 'Inter,sans-serif', fontSize: 17, fontWeight: 600, color: '#fff' }}>Recent Sessions</div>
          <span style={{ fontSize: 13, color: '#4A8EE8', cursor: 'pointer' }}>View all ›</span>
        </div>
        {[
          { date: 'Apr 26', hand: 'Right', val: '106.3 lbs', time: '2 min ago' },
          { date: 'Apr 25', hand: 'Left', val: '98.1 lbs', time: 'Yesterday' },
        ].map((s, i) => (
          <div key={i} style={{ ...card, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{s.hand}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{s.time}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{s.val}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ height: 12 }}></div>
    </div>
  );
}

Object.assign(window, { DashboardScreen });
