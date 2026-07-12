export const fmtDate = iso => (iso ? new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—');
export const fmtDateTime = iso => (iso ? new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—');
export const fmtNum = n => (n == null ? '—' : Intl.NumberFormat(undefined, { notation: n >= 10000 ? 'compact' : 'standard' }).format(n));

const pad = n => String(n).padStart(2, '0');

export function utcHHMMToLocal(hhmm) {
  const [h, m] = (hhmm || '12:00').split(':').map(Number);
  const d = new Date();
  d.setUTCHours(h, m, 0, 0);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function localHHMMToUtc(hhmm) {
  const [h, m] = (hhmm || '12:00').split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

export function nowLocalInputValue() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}
