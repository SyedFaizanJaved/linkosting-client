import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { useSettings, useSaveSettings } from './useSettings.js';

export default function Settings() {
  const { data: s, isLoading, error } = useSettings();
  const save = useSaveSettings();
  const [form, setForm] = useState(null);
  const [feedsText, setFeedsText] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (s && !form) {
      setForm({ topics: s.topics, tone: s.tone, hashtags: s.hashtags, default_post_time: s.default_post_time });
      setFeedsText(s.feeds.join('\n'));
    }
  }, [s]);

  if (isLoading || !form) return <div className="skeleton" style={{ height: 300, marginTop: 20 }} />;
  if (error) return <p className="error-text" style={{ marginTop: 20 }}>{error.message}</p>;

  async function connectLinkedIn() {
    try {
      const { url } = await api('/api/linkedin/auth-url');
      window.location.href = url;
    } catch (e) { setMsg(e.message); }
  }

  function submit(e) {
    e.preventDefault();
    save.mutate({
      ...form,
      feeds: feedsText.split('\n').map(f => f.trim()).filter(Boolean),
    }, { onSuccess: () => setMsg('Saved'), onError: err => setMsg(err.message) });
  }

  return (
    <div className="screen" style={{ maxWidth: 640 }}>
      <h1 style={{ marginTop: 20 }}>Settings</h1>

      <form className="card" style={{ marginTop: 14 }} onSubmit={submit}>
        <div className="field"><label>Topics (comma-separated)</label>
          <input className="input" value={form.topics} onChange={e => setForm({ ...form, topics: e.target.value })} /></div>
        <div className="field"><label>Tone / persona prompt</label>
          <textarea className="textarea" rows={3} value={form.tone} onChange={e => setForm({ ...form, tone: e.target.value })} /></div>
        <div className="field"><label>Hashtags</label>
          <input className="input" value={form.hashtags} onChange={e => setForm({ ...form, hashtags: e.target.value })} /></div>
        <div className="field"><label>RSS feeds (one per line)</label>
          <textarea className="textarea" rows={4} value={feedsText} onChange={e => setFeedsText(e.target.value)} /></div>
        <div className="field"><label>Default post time (UTC)</label>
          <input className="input" type="time" value={form.default_post_time} style={{ width: 160 }}
            onChange={e => setForm({ ...form, default_post_time: e.target.value })} /></div>
        <div className="actions">
          <button className="btn" type="submit" disabled={save.isPending}>{save.isPending ? 'Saving…' : 'Save'}</button>
          <span className="muted">{msg}</span>
        </div>
      </form>

      <div className="card" style={{ marginTop: 14 }}>
        <h2>LinkedIn</h2>
        <p className="muted" style={{ margin: '8px 0 12px' }}>
          {s.linkedin.connected
            ? `Connected — token expires in ${s.linkedin.daysLeft} day(s). Reconnect any time.`
            : 'Not connected. Publishing needs this.'}
        </p>
        <button className="btn ghost" onClick={connectLinkedIn}>
          {s.linkedin.connected ? 'Reconnect LinkedIn' : 'Connect LinkedIn'}
        </button>
      </div>
    </div>
  );
}
