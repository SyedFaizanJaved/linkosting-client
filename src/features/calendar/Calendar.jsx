import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDrafts, useScheduleDraft } from '../drafts/hooks.js';
import { nowLocalInputValue } from '../../lib/format.js';
import Feedback from '../../components/Feedback.jsx';

function monthDays(year, month) {
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(1 - ((first.getDay() + 6) % 7)); // back to Monday
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export default function Calendar() {
  const navigate = useNavigate();
  const [cursor, setCursor] = useState(() => { const n = new Date(); return { y: n.getFullYear(), m: n.getMonth() }; });
  const [slots, setSlots] = useState({});
  const [scheduleError, setScheduleError] = useState('');
  const { data: drafts, isLoading, error } = useDrafts();
  const schedule = useScheduleDraft();

  const days = monthDays(cursor.y, cursor.m);
  const todayKey = new Date().toDateString();
  const byDay = {};
  for (const d of drafts || []) {
    if (!d.scheduled_at) continue;
    const key = new Date(d.scheduled_at).toDateString();
    (byDay[key] ||= []).push(d);
  }
  const unscheduled = (drafts || []).filter(d => !d.scheduled_at && (d.status === 'pending' || d.status === 'approved'));
  const monthName = new Date(cursor.y, cursor.m).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  if (isLoading) return <div className="skeleton" style={{ height: 420, marginTop: 20 }} />;
  if (error) return <p className="error-text" style={{ marginTop: 20 }}>{error.message}</p>;

  return (
    <div className="screen">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 20 }}>
        <h1>{monthName}</h1>
        <span className="faint" style={{ fontSize: 12, fontWeight: 700 }}>Times are your local timezone.</span>
        <span style={{ flex: 1 }} />
        <button className="btn ghost" onClick={() => setCursor(c => (c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 }))}>←</button>
        <button className="btn ghost" onClick={() => setCursor(c => (c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 }))}>→</button>
      </div>

      <div className="cal-grid" style={{ marginTop: 18 }}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
          <span key={d} className="faint" style={{ fontSize: 11, fontWeight: 800, textAlign: 'center' }}>{d}</span>
        ))}
        {days.map(day => {
          const inMonth = day.getMonth() === cursor.m;
          const posts = byDay[day.toDateString()] || [];
          return (
            <div key={day.toISOString()} className={`cal-cell${day.toDateString() === todayKey ? ' today' : ''}`}
              style={{ opacity: inMonth ? 1 : 0.4 }}>
              <span className="day">{day.getDate()}</span>
              {posts.map(p => (
                <div key={p.id} className="cal-post" title={p.edited_content || p.content}
                  onClick={() => navigate(`/drafts/${p.id}`)}>
                  {new Date(p.scheduled_at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })} · {(p.edited_content || p.content).split('\n')[0]}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <h2>Unscheduled drafts</h2>
        {unscheduled.length === 0 && <p className="empty">Everything has a slot.</p>}
        {unscheduled.map(d => (
          <div key={d.id} className="row-item" style={{ cursor: 'default' }}>
            <span style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => navigate(`/drafts/${d.id}`)}>
              <span style={{ display: 'block', fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {(d.edited_content || d.content).split('\n')[0]}
              </span>
              <span className={`badge ${d.status}`} style={{ marginTop: 4, display: 'inline-block' }}>{d.status}</span>
            </span>
            <input className="input" type="datetime-local" style={{ width: 220 }} min={nowLocalInputValue()}
              value={slots[d.id] || ''} onChange={e => setSlots({ ...slots, [d.id]: e.target.value })} />
            <button className="btn ghost" disabled={schedule.isPending || !slots[d.id]}
              onClick={() => schedule.mutate(
                { id: d.id, scheduled_at: new Date(slots[d.id]).toISOString() },
                {
                  onSuccess: () => { setScheduleError(''); setSlots(sl => ({ ...sl, [d.id]: '' })); },
                  onError: e => setScheduleError(e.message),
                }
              )}>
              Schedule
            </button>
          </div>
        ))}
        <Feedback msg={scheduleError} kind="error" />
      </div>
    </div>
  );
}
