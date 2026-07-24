import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDrafts } from '../drafts/hooks.js';
import { useSettings } from '../settings/useSettings.js';
import { fmtDate } from '../../lib/format.js';
import QueryState from '../../components/QueryState.jsx';

const STATUSES = ['', 'pending', 'approved', 'posted', 'skipped'];

export default function Library() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  const [topic, setTopic] = useState('');
  const [qInput, setQInput] = useState('');
  const [q, setQ] = useState('');
  const draftsQ = useDrafts({ status, topic, q });
  const drafts = draftsQ.data;
  const filtered = Boolean(q || status || topic);
  const { data: s } = useSettings();
  const topics = (s?.topics || '').split(',').map(t => t.trim()).filter(Boolean);

  return (
    <div className="screen">
      <div className="actions" style={{ marginTop: 20 }}>
        <form onSubmit={e => { e.preventDefault(); setQ(qInput); }} style={{ display: 'flex', gap: 8, flex: 1 }}>
          <input className="input" placeholder="Search posts…" value={qInput} onChange={e => setQInput(e.target.value)} style={{ maxWidth: 280 }} />
          <button className="btn ghost" type="submit">Search</button>
        </form>
        <select className="select" style={{ width: 150 }} value={status} onChange={e => setStatus(e.target.value)}>
          {STATUSES.map(x => <option key={x} value={x}>{x || 'All statuses'}</option>)}
        </select>
        <select className="select" style={{ width: 180 }} value={topic} onChange={e => setTopic(e.target.value)}>
          <option value="">All topics</option>
          {topics.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="card" style={{ marginTop: 14, padding: '8px 20px' }}>
        <QueryState
          q={draftsQ}
          empty={filtered ? 'No posts match your search.' : 'No posts yet — generate your first.'}
          emptyAction={filtered
            ? <button className="btn ghost" onClick={() => { setQ(''); setQInput(''); setStatus(''); setTopic(''); }}>Clear filters</button>
            : <button className="btn ghost" onClick={() => navigate('/generate')}>Open generator</button>}
        />
        {drafts?.length > 0 && (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Date</th><th>Post</th><th>Topic</th><th>Status</th><th>Link</th></tr>
              </thead>
              <tbody>
                {drafts.map(d => (
                  <tr key={d.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/drafts/${d.id}`)}>
                    <td className="muted">{fmtDate(d.created_at)}</td>
                    <td style={{ maxWidth: 380, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 700 }}>
                      {d.has_image && <span title="Has image" style={{ marginRight: 6 }}>🖼</span>}
                      {(d.edited_content || d.content).split('\n')[0]}
                    </td>
                    <td className="muted">{d.topic || '—'}</td>
                    <td><span className={`badge ${d.status}`}>{d.status}</span></td>
                    <td onClick={e => e.stopPropagation()}>
                      {d.linkedin_post_id && (
                        <a href={`https://www.linkedin.com/feed/update/${d.linkedin_post_id}/`} target="_blank" rel="noreferrer">View</a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
