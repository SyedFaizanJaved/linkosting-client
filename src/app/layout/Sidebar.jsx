import { NavLink, useNavigate } from 'react-router-dom';
import { useLogout } from '../../features/auth/useAuth.js';

const NAV = [
  ['/', 'Dashboard'], ['/generate', 'AI Generator'], ['/drafts/today', 'Draft Editor'],
  ['/calendar', 'Calendar'], ['/library', 'Library'], ['/topics', 'Topics'],
  ['/analytics', 'Analytics'], ['/settings', 'Settings'],
];

export default function Sidebar({ linkedin, open, onClose }) {
  const navigate = useNavigate();
  const logout = useLogout();
  const [liLabel, liColor] = linkedin?.expired
    ? ['Expired', 'var(--red)']
    : linkedin?.connected
      ? ['Connected', '#2BB673']
      : ['Not connected', 'var(--red)'];
  return (
    <aside className={`sidebar${open ? ' open' : ''}`}>
      <div className="brand" onClick={() => { onClose(); navigate('/'); }}>
        <img className="brand-mark" src="/logo.png" alt="Linkosting" />
        <span className="brand-name">Linkosting</span>
      </div>
      <nav className="nav">
        {NAV.map(([to, label]) => (
          <NavLink key={to} to={to} end={to === '/'} onClick={onClose}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-foot">
        <div className="card" style={{ padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--rowBg)', borderRadius: 10, padding: '8px 10px' }}>
            <span style={{ width: 16, height: 16, borderRadius: 4.5, background: '#0A66C2', color: '#fff', fontSize: 9.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>in</span>
            <span className="muted" style={{ fontSize: 12 }}>{liLabel}</span>
            <span style={{ marginLeft: 'auto', width: 7, height: 7, borderRadius: '50%', background: liColor }} />
          </div>
          <button className="btn ghost" onClick={logout}
            style={{ width: '100%', marginTop: 10, justifyContent: 'center', fontSize: 13 }}>
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
