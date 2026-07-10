import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Today() {
  const [draft, setDraft] = useState(null);
  const [text, setText] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const d = await api('/api/drafts/today');
      setDraft(d);
      setText(d ? d.edited_content || d.content : '');
    } catch (e) {
      setMsg(e.message);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function act(action) {
    setMsg('Working…');
    try {
      if (action !== 'regenerate') {
        await api(`/api/drafts/${draft.id}`, { method: 'PUT', body: JSON.stringify({ edited_content: text }) });
      }
      if (action === 'approve') await api(`/api/drafts/${draft.id}/approve`, { method: 'POST' });
      if (action === 'publish') await api(`/api/drafts/${draft.id}/publish`, { method: 'POST' });
      if (action === 'regenerate') await api(`/api/drafts/${draft.id}/regenerate`, { method: 'POST' });
      setMsg(action === 'publish' ? 'Posted to LinkedIn ✔' : 'Done');
      await load();
    } catch (e) {
      setMsg(e.message);
    }
  }

  if (loading) return <p>Loading…</p>;
  if (!draft) return <p>No draft yet. One is generated every day at 9:00 AM.</p>;

  const locked = draft.status === 'posted';
  return (
    <div>
      <h1>
        Today's draft <span className={`badge ${draft.status}`}>{draft.status}</span>
      </h1>
      <p>
        Source: <a href={draft.article_url} target="_blank" rel="noreferrer">{draft.article_title}</a>
      </p>
      <textarea rows={14} value={text} onChange={e => setText(e.target.value)} disabled={locked} />
      <div className="actions">
        <button onClick={() => act('save')} disabled={locked}>Save edit</button>
        <button onClick={() => act('approve')} disabled={locked}>Approve (posts at 5 PM)</button>
        <button onClick={() => act('publish')} disabled={locked}>Post now</button>
        <button onClick={() => act('regenerate')} disabled={locked}>Regenerate</button>
      </div>
      <p>{msg}</p>
    </div>
  );
}
