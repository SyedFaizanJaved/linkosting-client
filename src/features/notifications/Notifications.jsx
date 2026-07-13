import { useNavigate } from 'react-router-dom';
import { useNotifications } from './useNotifications.js';

const ICONS = { review: '📝', posted: '✅', token: '⚠️' };

export default function Notifications() {
  const navigate = useNavigate();
  const { data: items, isLoading, error } = useNotifications();

  return (
    <div className="screen">
      <h1 style={{ marginTop: 20 }}>Notifications</h1>
      {isLoading && <div className="skeleton" style={{ height: 160, marginTop: 16 }} />}
      {error && <p className="error-text" style={{ marginTop: 16 }}>{error.message}</p>}
      {!isLoading && !error && items?.length === 0 && <p className="empty">All caught up.</p>}
      <div style={{ marginTop: 8 }}>
        {items?.map((n, i) => (
          <div key={i} className="row-item"
            onClick={() => (n.type === 'token' ? navigate('/settings') : n.draftId && navigate(`/drafts/${n.draftId}`))}>
            <span style={{ fontSize: 18 }}>{ICONS[n.type] || '🔔'}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontWeight: 700, fontSize: 14 }}>{n.title}</span>
              {n.detail && <span className="faint" style={{ display: 'block', fontSize: 12, marginTop: 2 }}>{n.detail}</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
