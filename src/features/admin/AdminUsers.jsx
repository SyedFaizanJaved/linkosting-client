import { useUsers, useSetUserStatus } from './useUsers.js';
import ConfirmButton from '../../components/ConfirmButton.jsx';
import { toast } from '../../lib/toast.js';

const LABEL = { pending: 'Pending approval', active: 'Active', deactivated: 'Deactivated' };

export default function AdminUsers({ me }) {
  const isAdmin = me?.role === 'admin';
  const { data: users, isLoading, error } = useUsers(isAdmin);
  const setStatus = useSetUserStatus();

  if (!isAdmin) return null;

  function change(user, status) {
    setStatus.mutate({ id: user.id, status }, {
      onSuccess: () => toast.success(`${user.email} is now ${LABEL[status].toLowerCase()}`),
      onError: err => toast.error(err.message),
    });
  }

  const pending = users?.filter(u => u.status === 'pending').length || 0;

  return (
    <div className="card" style={{ marginTop: 14 }}>
      <h2>Members{pending ? ` — ${pending} awaiting approval` : ''}</h2>

      {isLoading && <p className="muted" style={{ margin: '8px 0 0' }}>Loading members…</p>}
      {error && <p className="error-text" style={{ margin: '8px 0 0' }}>Couldn't load members: {error.message}</p>}

      {users?.map(u => (
        <div key={u.id} style={{
          display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
          padding: '10px 0', borderTop: '1px solid var(--line)',
        }}>
          <div style={{ flex: '1 1 200px', minWidth: 0 }}>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</div>
            <div className="faint" style={{ fontSize: 12 }}>
              {LABEL[u.status] || u.status}{u.role === 'admin' ? ' · admin' : ''}
            </div>
          </div>

          {u.status !== 'active' && (
            <button className="btn" disabled={setStatus.isPending} onClick={() => change(u, 'active')}>
              Approve
            </button>
          )}
          {/* An admin can't deactivate themselves — the server blocks it too. */}
          {u.status === 'active' && u.email !== me.email && (
            <ConfirmButton
              className="btn ghost"
              label="Deactivate"
              confirmLabel="Really deactivate?"
              disabled={setStatus.isPending}
              onConfirm={() => change(u, 'deactivated')}
            />
          )}
        </div>
      ))}

      <p className="faint" style={{ fontSize: 12, margin: '12px 0 0' }}>
        New sign-ups stay pending until you approve them. Deactivating blocks sign-in but keeps their drafts.
      </p>
    </div>
  );
}
