import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDrafts } from '../drafts/hooks.js';
import { useAnalytics } from '../analytics/useAnalytics.js';
import { useSettings } from '../settings/useSettings.js';
import StatTile from '../../components/StatTile.jsx';
import { fmtDate, fmtDateTime, fmtNum } from '../../lib/format.js';

export default function Dashboard() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const { data: drafts } = useDrafts();
  const { data: a } = useAnalytics();
  const { data: s } = useSettings();

  const upNext = (drafts || [])
    .filter(d => d.scheduled_at && d.status !== 'posted' && d.status !== 'skipped')
    .sort((x, y) => new Date(x.scheduled_at) - new Date(y.scheduled_at))
    .slice(0, 3);
  const topics = (s?.topics || '').split(',').map(t => t.trim()).filter(Boolean);
  const recent = (drafts || []).slice(0, 6);
  const go = () => navigate(`/generate${prompt.trim() ? `?prompt=${encodeURIComponent(prompt.trim())}` : ''}`);

  return (
    <div className="screen">
      <div className="hero">
        <h1>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}</h1>
        <p className="muted" style={{ margin: '6px 0 0' }}>
          {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          {upNext[0] && <> · next post <span style={{ color: 'var(--accent)', fontWeight: 800 }}>{fmtDateTime(upNext[0].scheduled_at)}</span></>}
        </p>
        <div className="card" style={{ marginTop: 18, borderRadius: 999, display: 'flex', alignItems: 'center', padding: '6px 6px 6px 20px', gap: 12 }}>
          <input value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={e => e.key === 'Enter' && go()}
            placeholder="What do you want to post about today?"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', font: 'inherit', fontSize: 14.5, color: 'var(--ink)' }} />
          <button className="btn ink" onClick={go}>Generate ✦</button>
        </div>
        {topics.length > 0 && (
          <div className="actions" style={{ marginTop: 14 }}>
            {topics.map(t => <span key={t} className="chip" onClick={() => navigate(`/generate?prompt=${encodeURIComponent(t)}&topic=${encodeURIComponent(t)}`)}>{t}</span>)}
            <span className="chip" style={{ borderStyle: 'dashed' }} onClick={() => navigate('/topics')}>+ New topic</span>
          </div>
        )}
      </div>

      <div className="tiles">
        <StatTile label="Posted" value={a?.byStatus?.posted ?? '—'} note="all time" />
        <StatTile label="Scheduled" value={(drafts || []).filter(d => d.status === 'approved' && d.scheduled_at).length} note="in queue" />
        <StatTile label="Impressions (entered)" value={fmtNum(a?.metrics?.impressions)} note={`${a?.metrics?.tracked_posts ?? 0} posts tracked`} />
        <StatTile label="Approval rate" value={a?.approvalRate == null ? '—' : `${Math.round(a.approvalRate * 100)}%`} note="posted vs skipped" />
      </div>

      <div className="grid-2">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h2>Up next</h2>
            <a style={{ marginLeft: 'auto', fontSize: 12.5, fontWeight: 800, cursor: 'pointer' }} onClick={() => navigate('/calendar')}>Open calendar →</a>
          </div>
          {upNext.length === 0 && <p className="empty">Nothing scheduled. Generate a post and pick a slot.</p>}
          {upNext.map(d => (
            <div key={d.id} className="row-item" onClick={() => navigate(`/drafts/${d.id}`)}>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {(d.edited_content || d.content).split('\n')[0]}
                </span>
                <span className="faint" style={{ display: 'block', fontSize: 11.5, fontWeight: 600, marginTop: 3 }}>
                  {fmtDateTime(d.scheduled_at)}{d.topic ? ` · ${d.topic}` : ''}
                </span>
              </span>
              <span className={`badge ${d.status}`}>{d.status}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <h2>Posts per week</h2>
            <a style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 800, cursor: 'pointer' }} onClick={() => navigate('/analytics')}>Analytics →</a>
          </div>
          <WeekBars series={a?.postsPerWeek} />
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h2>Recent drafts</h2>
          <a style={{ marginLeft: 'auto', fontSize: 12.5, fontWeight: 800, cursor: 'pointer' }} onClick={() => navigate('/library')}>View library →</a>
        </div>
        {recent.length === 0 && <p className="empty">No drafts yet — generate your first post.</p>}
        {recent.map(d => (
          <div key={d.id} className="row-item" onClick={() => navigate(`/drafts/${d.id}`)}>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {(d.edited_content || d.content).split('\n')[0]}
              </span>
              <span className="faint" style={{ display: 'block', fontSize: 11.5, fontWeight: 600, marginTop: 3 }}>
                {fmtDate(d.created_at)}{d.topic ? ` · ${d.topic}` : ''}
              </span>
            </span>
            <span className={`badge ${d.status}`}>{d.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WeekBars({ series }) {
  if (!series) return <div className="skeleton" style={{ height: 190, marginTop: 16 }} />;
  const max = Math.max(1, ...series.map(w => w.count));
  const label = iso => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 190, marginTop: 16 }}>
      {series.map((w, i) => {
        const isLast = i === series.length - 1;
        return (
          <div key={w.weekStart} title={`Week of ${w.weekStart}: ${w.count} post(s)`}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 5, height: '100%' }}>
            <span className="faint" style={{ fontSize: 10.5, fontWeight: 800 }}>{w.count || ''}</span>
            <div style={{
              width: '100%', height: `${Math.max(6, (w.count / max) * 140)}px`, borderRadius: 7,
              background: isLast ? 'var(--accent)' : 'var(--tint)', boxShadow: isLast ? 'var(--accSh)' : 'none',
            }} />
            <span className="faint" style={{ fontSize: 9.5, fontWeight: 700 }}>{label(w.weekStart)}</span>
          </div>
        );
      })}
    </div>
  );
}
