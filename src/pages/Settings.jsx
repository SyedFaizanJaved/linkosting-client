import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Settings() {
  const [s, setS] = useState(null);
  const [feedsText, setFeedsText] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api('/api/settings').then(data => {
      setS(data);
      setFeedsText(data.feeds.join('\n'));
    }).catch(e => setMsg(e.message));
  }, []);

  async function save(e) {
    e.preventDefault();
    setMsg('Saving…');
    try {
      await api('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({
          topics: s.topics,
          tone: s.tone,
          hashtags: s.hashtags,
          feeds: feedsText.split('\n').map(f => f.trim()).filter(Boolean),
        }),
      });
      setMsg('Saved');
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function connectLinkedIn() {
    const { url } = await api('/api/linkedin/auth-url');
    window.open(url, '_blank');
  }

  if (!s) return <p>{msg || 'Loading…'}</p>;
  return (
    <form onSubmit={save}>
      <h1>Settings</h1>

      <label>Topics (comma-separated)</label>
      <input value={s.topics} onChange={e => setS({ ...s, topics: e.target.value })} />

      <label>Tone / persona prompt</label>
      <textarea rows={3} value={s.tone} onChange={e => setS({ ...s, tone: e.target.value })} />

      <label>Hashtags</label>
      <input value={s.hashtags} onChange={e => setS({ ...s, hashtags: e.target.value })} />

      <label>RSS feeds (one per line)</label>
      <textarea rows={4} value={feedsText} onChange={e => setFeedsText(e.target.value)} />

      <div className="actions">
        <button type="submit">Save</button>
        <button type="button" onClick={connectLinkedIn}>
          {s.linkedin.connected ? 'Reconnect LinkedIn' : 'Connect LinkedIn'}
        </button>
      </div>

      <p>
        LinkedIn: {s.linkedin.connected
          ? `connected — token expires in ${s.linkedin.daysLeft} day(s)`
          : 'not connected'}
      </p>
      <p>{msg}</p>
    </form>
  );
}
