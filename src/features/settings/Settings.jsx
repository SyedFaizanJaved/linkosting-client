import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { useSettings, useSaveSettings } from './useSettings.js';
import { utcHHMMToLocal, localHHMMToUtc } from '../../lib/format.js';
import Feedback from '../../components/Feedback.jsx';

export default function Settings() {
  const { data: s, isLoading, error } = useSettings();
  const save = useSaveSettings();
  const [form, setForm] = useState(null);
  const [feedsText, setFeedsText] = useState('');
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (s && !form) {
      setForm({
        topics: s.topics, tone: s.tone, hashtags: s.hashtags,
        default_post_time: utcHHMMToLocal(s.default_post_time),
      });
      setFeedsText(s.feeds.join('\n'));
    }
  }, [s]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const li = params.get('linkedin');
    if (li === 'connected') setMsg({ text: 'LinkedIn connected', kind: 'ok' });
    if (li === 'error') setMsg({ text: `LinkedIn connection failed: ${params.get('reason') || 'unknown error'}`, kind: 'error' });
    if (li) window.history.replaceState({}, '', window.location.pathname);
  }, []);

  if (isLoading || !form) return <div className="skeleton" style={{ height: 300, marginTop: 20 }} />;
  if (error) return <p className="error-text" style={{ marginTop: 20 }}>{error.message}</p>;

  const edit = patch => { setForm({ ...form, ...patch }); setMsg(null); };
  const payload = () => ({
    ...form,
    default_post_time: localHHMMToUtc(form.default_post_time),
    feeds: feedsText.split('\n').map(f => f.trim()).filter(Boolean),
  });

  async function connectLinkedIn() {
    try {
      await save.mutateAsync(payload());
      const { url } = await api('/api/linkedin/auth-url');
      window.location.href = url;
    } catch (e) { setMsg({ text: e.message, kind: 'error' }); }
  }

  function submit(e) {
    e.preventDefault();
    save.mutate(payload(), {
      onSuccess: () => setMsg({ text: 'Saved', kind: 'ok' }),
      onError: err => setMsg({ text: err.message, kind: 'error' }),
    });
  }

  return (
    <div className="screen" style={{ maxWidth: 640 }}>
      <h1 style={{ marginTop: 20 }}>Settings</h1>

      <form className="card" style={{ marginTop: 14 }} onSubmit={submit}>
        <div className="field"><label>Topics (comma-separated)</label>
          <input className="input" value={form.topics} onChange={e => edit({ topics: e.target.value })} /></div>
        <div className="field"><label>Tone / persona prompt</label>
          <textarea className="textarea" rows={3} value={form.tone} onChange={e => edit({ tone: e.target.value })} /></div>
        <div className="field"><label>Hashtags</label>
          <input className="input" value={form.hashtags} onChange={e => edit({ hashtags: e.target.value })} /></div>
        <div className="field"><label>RSS feeds (one per line)</label>
          <textarea className="textarea" rows={4} value={feedsText} onChange={e => { setFeedsText(e.target.value); setMsg(null); }} /></div>
        <div className="field"><label>Default post time (your local time)</label>
          <input className="input" type="time" value={form.default_post_time} style={{ width: 160 }}
            onChange={e => edit({ default_post_time: e.target.value })} />
          <p className="faint" style={{ fontSize: 12, margin: '6px 0 0' }}>Stored as {localHHMMToUtc(form.default_post_time)} UTC</p></div>
        <div className="actions">
          <button className="btn" type="submit" disabled={save.isPending}>{save.isPending ? 'Saving…' : 'Save'}</button>
        </div>
        <Feedback msg={msg?.text} kind={msg?.kind} />
      </form>

      <div className="card" style={{ marginTop: 14 }}>
        <h2>LinkedIn</h2>
        {s.linkedin.expired ? (
          <p className="error-text" style={{ margin: '8px 0 12px' }}>Connection expired — reconnect to keep posting.</p>
        ) : (
          <p className="muted" style={{ margin: '8px 0 12px' }}>
            {s.linkedin.connected
              ? `Connected — token expires in ${s.linkedin.daysLeft} day(s). Reconnect any time.`
              : 'Not connected. Publishing needs this.'}
          </p>
        )}
        <button className="btn ghost" onClick={connectLinkedIn}>
          {s.linkedin.connected || s.linkedin.expired ? 'Reconnect LinkedIn' : 'Connect LinkedIn'}
        </button>
      </div>
    </div>
  );
}
