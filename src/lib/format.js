export const fmtDate = iso => (iso ? new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—');
export const fmtDateTime = iso => (iso ? new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—');
export const fmtNum = n => (n == null ? '—' : Intl.NumberFormat(undefined, { notation: n >= 10000 ? 'compact' : 'standard' }).format(n));
