import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../theme.js';
import { useNotifications } from '../../features/notifications/useNotifications.js';

const TITLES = {
  '/': 'Dashboard', '/generate': 'AI Generator', '/calendar': 'Calendar', '/library': 'Library',
  '/topics': 'Topics', '/analytics': 'Analytics', '/notifications': 'Notifications', '/settings': 'Settings',
};

export default function Topbar({ onMenu }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { theme, toggle } = useTheme();
  const { data: notifications } = useNotifications();
  const title = TITLES[pathname] || (pathname.startsWith('/drafts') ? 'Draft Editor' : 'Linkosting');
  return (
    <div className="topbar">
      <span className="icon-btn menu-btn" title="Menu" onClick={onMenu}>☰</span>
      <span className="topbar-title">{title}</span>
      <span style={{ flex: 1 }} />
      <span className="icon-btn" title="Toggle theme" onClick={toggle}>{theme === 'light' ? '🌙' : '☀️'}</span>
      <span className="icon-btn" title="Notifications" onClick={() => navigate('/notifications')}>
        🔔{notifications?.length > 0 && <span className="bell-dot" />}
      </span>
      <button className="btn" onClick={() => navigate('/generate')}>＋ New post</button>
    </div>
  );
}
