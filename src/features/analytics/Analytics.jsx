import { useAnalytics } from './useAnalytics.js';
import StatTile from '../../components/StatTile.jsx';
import { fmtNum } from '../../lib/format.js';
import QueryState from '../../components/QueryState.jsx';

export default function Analytics() {
  const aQ = useAnalytics();
  const a = aQ.data;
  if (aQ.isLoading || aQ.error) return <QueryState q={aQ} height={300} />;

  const max = Math.max(1, ...a.postsPerWeek.map(w => w.count));
  const topicMax = Math.max(1, ...a.perTopic.map(t => t.count));

  return (
    <div className="screen">
      <div className="tiles" style={{ marginTop: 20 }}>
        <StatTile label="Posted" value={a.byStatus.posted ?? 0} note="all time" />
        <StatTile label="Approval rate" value={a.approvalRate == null ? '—' : `${Math.round(a.approvalRate * 100)}%`} note="posted vs skipped" />
        <StatTile label="Impressions" value={fmtNum(a.metrics.impressions)} note={`entered on ${a.metrics.tracked_posts} posts`} />
        <StatTile label="Reactions + comments" value={fmtNum(a.metrics.reactions + a.metrics.comments)} note="entered manually" />
      </div>

      <div className="grid-2">
        <div className="card">
          <h2>Posts per week</h2>
          <div className="bars">
            {a.postsPerWeek.map((w, i) => (
              <span key={w.weekStart} className={`bar${i === a.postsPerWeek.length - 1 ? ' hot' : ''}`}
                style={{ height: `${(w.count / max) * 100}%` }} title={`${w.weekStart}: ${w.count}`} />
            ))}
          </div>
          <p className="faint" style={{ fontSize: 10.5, fontWeight: 700, margin: '8px 0 0' }}>last {a.postsPerWeek.length} weeks</p>
        </div>
        <div className="card">
          <h2>By topic</h2>
          <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
            {a.perTopic.length === 0 && <p className="empty">No posts yet.</p>}
            {a.perTopic.slice(0, 8).map(t => (
              <div key={t.topic}>
                <div style={{ display: 'flex', fontSize: 12.5, fontWeight: 700 }}>
                  <span>{t.topic}</span><span style={{ marginLeft: 'auto' }} className="muted">{t.count}</span>
                </div>
                <div style={{ height: 8, background: 'var(--chipBg)', borderRadius: 999, marginTop: 4 }}>
                  <div style={{ height: 8, width: `${(t.count / topicMax) * 100}%`, background: 'var(--accent)', borderRadius: 999 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <h2>Status breakdown</h2>
        <div className="actions" style={{ marginTop: 12 }}>
          {['pending', 'approved', 'posted', 'skipped'].map(st => (
            <span key={st} className={`badge ${st}`} style={{ fontSize: 13, padding: '8px 14px' }}>
              {st}: {a.byStatus[st] ?? 0}
            </span>
          ))}
        </div>
        <p className="muted" style={{ marginTop: 12 }}>
          Impressions, reactions and comments are entered manually on posted drafts (LinkedIn's API doesn't expose personal-profile stats).
        </p>
      </div>
    </div>
  );
}
