import { NavLink, useNavigate } from 'react-router-dom';

const NAV = [
  ['/', 'Dashboard'], ['/generate', 'AI Generator'], ['/drafts/today', 'Draft Editor'],
  ['/calendar', 'Calendar'], ['/library', 'Library'], ['/topics', 'Topics'],
  ['/analytics', 'Analytics'], ['/settings', 'Settings'],
];

export default function Sidebar({ linkedinConnected }) {
  const navigate = useNavigate();
  return (
    <aside className="sidebar">
      <div className="brand" onClick={() => navigate('/')}>
        <span className="brand-mark">L</span>
        <span className="brand-name">Linkosting</span>
      </div>
      <nav className="nav">
        {NAV.map(([to, label]) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-foot">
        <div className="card" style={{ padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--rowBg)', borderRadius: 10, padding: '8px 10px' }}>
            <span style={{ width: 16, height: 16, borderRadius: 4.5, background: '#0A66C2', color: '#fff', fontSize: 9.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>in</span>
            <span className="muted" style={{ fontSize: 12 }}>{linkedinConnected ? 'Connected' : 'Not connected'}</span>
            <span style={{ marginLeft: 'auto', width: 7, height: 7, borderRadius: '50%', background: linkedinConnected ? '#2BB673' : 'var(--red)' }} />
          </div>
        </div>
      </div>
    </aside>
  );
}
