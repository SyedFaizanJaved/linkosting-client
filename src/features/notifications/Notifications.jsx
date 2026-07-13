import { useNavigate } from 'react-router-dom';
import { useNotifications, useReadAllNotifications, useDismissNotification } from './useNotifications.js';

const ICONS = { review: '📝', posted: '✅', token: '⚠️' };

export default function Notifications() {
  const navigate = useNavigate();
  const { data: items, isLoading, error } = useNotifications();
  const readAll = useReadAllNotifications();
  const dismiss = useDismissNotification();
  const unread = (items || []).filter(n => !n.read).length;

  return (
    <div className="screen">
      <div style={{ display: 'flex', alignItems: 'center', marginTop: 20 }}>
        <h1>Notifications</h1>
        <span style={{ flex: 1 }} />
        {unread > 0 && (
          <button className="btn ghost" disabled={readAll.isPending} onClick={() => readAll.mutate()}>
            Mark all as read
          </button>
        )}
      </div>
      {isLoading && <div className="skeleton" style={{ height: 160, marginTop: 16 }} />}
      {error && <p className="error-text" style={{ marginTop: 16 }}>{error.message}</p>}
      {!isLoading && !error && items?.length === 0 && <p className="empty">All caught up.</p>}
      <div style={{ marginTop: 8 }}>
        {items?.map(n => (
          <div key={n.id} className="row-item" style={{ cursor: 'default', opacity: n.read ? 0.6 : 1 }}>
            <span style={{ fontSize: 18 }}>{ICONS[n.type] || '🔔'}</span>
            <span style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
              onClick={() => (n.type === 'token' ? navigate('/settings') : n.draftId && navigate(`/drafts/${n.draftId}`))}>
              <span style={{ display: 'block', fontWeight: 700, fontSize: 14 }}>{n.title}</span>
              {n.detail && <span className="faint" style={{ display: 'block', fontSize: 12, marginTop: 2 }}>{n.detail}</span>}
            </span>
            <button className="icon-btn" title="Dismiss" disabled={dismiss.isPending}
              onClick={() => dismiss.mutate(n.id)} style={{ width: 30, height: 30, flex: 'none' }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}
