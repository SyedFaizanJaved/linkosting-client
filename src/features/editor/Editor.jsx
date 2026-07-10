import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  useDraft, useSaveDraft, useApproveDraft, useScheduleDraft,
  usePublishDraft, useRegenerateDraft, useSaveMetrics,
} from '../drafts/hooks.js';
import { fmtDateTime } from '../../lib/format.js';

export default function Editor() {
  const { id } = useParams();
  const { data: draft, isLoading, error } = useDraft(id);
  const [text, setText] = useState('');
  const [slot, setSlot] = useState('');
  const [metrics, setMetrics] = useState({ impressions: '', reactions: '', comments: '' });
  const [msg, setMsg] = useState('');

  const save = useSaveDraft();
  const approve = useApproveDraft();
  const schedule = useScheduleDraft();
  const publish = usePublishDraft();
  const regenerate = useRegenerateDraft();
  const saveMetrics = useSaveMetrics();
  const busy = save.isPending || approve.isPending || schedule.isPending || publish.isPending || regenerate.isPending;

  useEffect(() => {
    if (draft) {
      setText(draft.edited_content || draft.content || '');
      setMetrics({
        impressions: draft.impressions ?? '', reactions: draft.reactions ?? '', comments: draft.comments ?? '',
      });
    }
  }, [draft?.id, draft?.content, draft?.edited_content]);

  if (isLoading) return <div className="skeleton" style={{ height: 300, marginTop: 20 }} />;
  if (error) return <p className="error-text" style={{ marginTop: 20 }}>{error.message}</p>;
  if (!draft) return <p className="empty">No draft yet. One is generated every morning, or create one in the Generator.</p>;

  const locked = draft.status === 'posted';
  const opts = { onSuccess: () => setMsg('Done'), onError: e => setMsg(e.message) };
  const withSave = fn => save.mutate({ id: draft.id, edited_content: text }, { onSuccess: fn, onError: e => setMsg(e.message) });

  return (
    <div className="screen" style={{ maxWidth: 760 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20 }}>
        <h1 style={{ fontSize: 22 }}>Draft #{draft.id}</h1>
        <span className={`badge ${draft.status}`}>{draft.status}</span>
        {draft.scheduled_at && <span className="muted">→ {fmtDateTime(draft.scheduled_at)}</span>}
      </div>
      {draft.article_url && !draft.article_url.startsWith('manual:') && (
        <p className="muted" style={{ margin: '6px 0 0' }}>
          Source: <a href={draft.article_url} target="_blank" rel="noreferrer">{draft.article_title}</a>
        </p>
      )}

      <div className="card" style={{ marginTop: 14 }}>
        <textarea className="textarea" rows={14} value={text} onChange={e => setText(e.target.value)}
          disabled={locked} style={{ border: 'none', padding: 0 }} />
      </div>

      {!locked && (
        <>
          <div className="actions">
            <button className="btn ghost" disabled={busy} onClick={() => save.mutate({ id: draft.id, edited_content: text }, opts)}>Save edit</button>
            <button className="btn" disabled={busy} onClick={() => withSave(() => approve.mutate(draft.id, opts))}>Approve</button>
            <button className="btn ink" disabled={busy} onClick={() => withSave(() => publish.mutate(draft.id, opts))}>Post now</button>
            <button className="btn ghost" disabled={busy} onClick={() => regenerate.mutate(draft.id, opts)}>Regenerate</button>
          </div>
          <div className="actions">
            <input className="input" type="datetime-local" value={slot} onChange={e => setSlot(e.target.value)} style={{ width: 230 }} />
            <button className="btn ghost" disabled={busy || !slot}
              onClick={() => schedule.mutate({ id: draft.id, scheduled_at: new Date(slot).toISOString() }, opts)}>Schedule</button>
            {draft.scheduled_at && (
              <button className="btn ghost" disabled={busy}
                onClick={() => schedule.mutate({ id: draft.id, scheduled_at: null }, opts)}>Unschedule</button>
            )}
          </div>
        </>
      )}

      {locked && (
        <div className="card" style={{ marginTop: 14 }}>
          <h2>Performance</h2>
          <p className="muted" style={{ margin: '4px 0 12px' }}>Copy the numbers from LinkedIn whenever you like.</p>
          <div className="actions" style={{ marginTop: 0 }}>
            {['impressions', 'reactions', 'comments'].map(k => (
              <div key={k} className="field" style={{ marginBottom: 0 }}>
                <label>{k}</label>
                <input className="input" type="number" min="0" style={{ width: 130 }}
                  value={metrics[k]} onChange={e => setMetrics({ ...metrics, [k]: e.target.value })} />
              </div>
            ))}
            <button className="btn" style={{ alignSelf: 'flex-end' }} disabled={saveMetrics.isPending}
              onClick={() => saveMetrics.mutate({
                id: draft.id,
                ...(metrics.impressions !== '' && { impressions: Number(metrics.impressions) }),
                ...(metrics.reactions !== '' && { reactions: Number(metrics.reactions) }),
                ...(metrics.comments !== '' && { comments: Number(metrics.comments) }),
              }, opts)}>Save metrics</button>
          </div>
          {draft.linkedin_post_id && (
            <p style={{ marginTop: 12 }}>
              <a href={`https://www.linkedin.com/feed/update/${draft.linkedin_post_id}/`} target="_blank" rel="noreferrer">View on LinkedIn →</a>
            </p>
          )}
        </div>
      )}
      <p className="muted">{msg}</p>
    </div>
  );
}
