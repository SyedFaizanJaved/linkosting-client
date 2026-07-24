import { useEffect, useState } from 'react';

// The non-happy paths of a TanStack query in one place: skeleton while
// loading (with a slow-network hint once it drags), error with a retry
// button, and an optional empty state. Renders null when data is ready.
export default function QueryState({ q, height = 200, empty, emptyAction }) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!q.isLoading) { setSlow(false); return; }
    const t = setTimeout(() => setSlow(true), 6000);
    return () => clearTimeout(t);
  }, [q.isLoading]);

  if (q.isLoading) {
    return (
      <div>
        <div className="skeleton" style={{ height, margin: '12px 0' }} />
        {slow && (
          <p className="muted" style={{ textAlign: 'center', fontSize: 13, fontWeight: 600 }}>
            Still loading — your connection looks slow…
          </p>
        )}
      </div>
    );
  }
  if (q.error) {
    return (
      <div className="empty">
        <p className="error-text" style={{ margin: 0 }}>{q.error.message}</p>
        <button className="btn ghost" style={{ marginTop: 14 }} onClick={() => q.refetch()}>Try again</button>
      </div>
    );
  }
  if (empty !== undefined && Array.isArray(q.data) && q.data.length === 0) {
    return (
      <div className="empty">
        <p style={{ margin: 0 }}>{empty}</p>
        {emptyAction && <div style={{ marginTop: 14 }}>{emptyAction}</div>}
      </div>
    );
  }
  return null;
}
