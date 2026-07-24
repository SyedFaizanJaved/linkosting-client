import { useEffect, useState } from 'react';

export default function OfflineBanner() {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down); };
  }, []);
  if (online) return null;
  return (
    <div className="offline-banner" role="alert">
      ⚡ You're offline — changes won't be saved until you reconnect.
    </div>
  );
}
