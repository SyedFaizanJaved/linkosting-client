import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings, useSaveSettings } from '../settings/useSettings.js';
import { useAnalytics } from '../analytics/useAnalytics.js';

export default function Topics() {
  const navigate = useNavigate();
  const { data: s } = useSettings();
  const { data: a } = useAnalytics();
  const save = useSaveSettings();
  const [newTopic, setNewTopic] = useState('');

  const topics = (s?.topics || '').split(',').map(t => t.trim()).filter(Boolean);
  const counts = Object.fromEntries((a?.perTopic || []).map(t => [t.topic, t.count]));

  function saveTopics(list) {
    save.mutate({ topics: list.join(', ') });
  }

  return (
    <div className="screen" style={{ maxWidth: 720 }}>
      <h1 style={{ marginTop: 20 }}>Topics</h1>
      <p className="muted" style={{ margin: '6px 0 0' }}>Topics steer the daily draft and appear as quick chips in the generator.</p>

      <form className="actions" onSubmit={e => {
        e.preventDefault();
        const t = newTopic.trim();
        if (t && !topics.includes(t)) saveTopics([...topics, t]);
        setNewTopic('');
      }}>
        <input className="input" placeholder="Add a topic…" value={newTopic} onChange={e => setNewTopic(e.target.value)} style={{ maxWidth: 280 }} />
        <button className="btn" type="submit" disabled={save.isPending || !newTopic.trim()}>Add</button>
      </form>

      <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
        {topics.length === 0 && <p className="empty">No topics yet — add your first.</p>}
        {topics.map(t => (
          <div key={t} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px' }}>
            <span style={{ fontWeight: 800 }}>{t}</span>
            <span className="badge">{counts[t] || 0} posts</span>
            <span style={{ flex: 1 }} />
            <button className="btn ghost" onClick={() => navigate(`/generate?prompt=${encodeURIComponent(t)}`)}>Generate ✦</button>
            <button className="btn ghost" disabled={save.isPending} onClick={() => saveTopics(topics.filter(x => x !== t))}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}
