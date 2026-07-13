import { useEffect, useState } from 'react';
import { subscribe, dismiss } from '../lib/toast.js';

const ICON = { error: '⚠️', success: '✅', info: 'ℹ️' };

export default function Toaster() {
  const [items, setItems] = useState([]);
  useEffect(() => subscribe(setItems), []); // subscription, not data fetching

  return (
    <div className="toaster">
      {items.map(t => (
        <div key={t.id} className={`toast toast-${t.kind}`} role="alert" onClick={() => dismiss(t.id)}>
          <span>{ICON[t.kind] || ''}</span>
          <span style={{ flex: 1 }}>{t.message}</span>
          <span aria-hidden="true" style={{ opacity: 0.7 }}>✕</span>
        </div>
      ))}
    </div>
  );
}
