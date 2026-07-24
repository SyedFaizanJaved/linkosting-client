import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  useDraft, useSaveDraft, useApproveDraft, useScheduleDraft,
  usePublishDraft, useRegenerateDraft, useSaveMetrics,
  useGenerateImage, useDeleteImage,
} from '../drafts/hooks.js';
import { useSettings } from '../settings/useSettings.js';
import { fmtDateTime, nowLocalInputValue } from '../../lib/format.js';
import ConfirmButton from '../../components/ConfirmButton.jsx';
import QueryState from '../../components/QueryState.jsx';
import Feedback from '../../components/Feedback.jsx';
import { validate, metricSchema } from '../../lib/validation.js';
import { toast } from '../../lib/toast.js';
import { apiBlob } from '../../lib/api.js';

function defaultSlotIso(defaultPostTime) {
  const [h, m] = (defaultPostTime || '12:00').split(':').map(Number);
  const d = new Date();
  d.setUTCHours(h, m, 0, 0);
  if (d < new Date()) d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString();
}

export default function Editor() {
  const { id } = useParams();
  const draftQ = useDraft(id);
  const draft = draftQ.data;
  const { data: settings } = useSettings();
  const [text, setText] = useState('');
  const [slot, setSlot] = useState('');
  const [metrics, setMetrics] = useState({ impressions: '', reactions: '', comments: '' });
  const [msg, setMsg] = useState(null);
  const [metricErrors, setMetricErrors] = useState({});

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

  if (draftQ.isLoading || draftQ.error) return <QueryState q={draftQ} height={300} />;
  if (!draft) return <p className="empty">No draft yet. One is generated every morning, or create one in the Generator.</p>;

  const locked = draft.status === 'posted';
  const dirty = text !== (draft.edited_content || draft.content || '');
  const effectiveSlotIso = draft.scheduled_at || defaultSlotIso(settings?.default_post_time);
  const slotLabel = fmtDateTime(effectiveSlotIso);
  const ok = t => setMsg({ text: t, kind: 'ok' });
  const fail = e => setMsg({ text: e.message, kind: 'error' });
  const withSave = fn => save.mutate({ id: draft.id, edited_content: text }, { onSuccess: fn, onError: fail });

  function submitMetrics() {
    const errs = {};
    for (const k of ['impressions', 'reactions', 'comments']) {
      if (metrics[k] === '') continue;
      const r = validate(metricSchema, metrics[k]);
      if (!r.ok) errs[k] = r.errors._;
    }
    setMetricErrors(errs);
    if (Object.keys(errs).length) { toast.error(Object.values(errs)[0]); return; }
    saveMetrics.mutate({
      id: draft.id,
      ...(metrics.impressions !== '' && { impressions: Number(metrics.impressions) }),
      ...(metrics.reactions !== '' && { reactions: Number(metrics.reactions) }),
      ...(metrics.comments !== '' && { comments: Number(metrics.comments) }),
    }, { onSuccess: () => ok('Metrics saved'), onError: fail });
  }

  return (
    <div className="screen" style={{ maxWidth: 760 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 22 }}>Draft #{draft.id}</h1>
        <span className={`badge ${draft.status}`}>{draft.status}</span>
        {draft.scheduled_at && <span className="muted">→ {fmtDateTime(draft.scheduled_at)}</span>}
      </div>
      {draft.status === 'approved' && (
        <p className="muted" style={{ margin: '6px 0 0' }}>
          Will post {slotLabel} — Unschedule to stop it.
        </p>
      )}
      {draft.article_url && !draft.article_url.startsWith('manual:') && (
        <p className="muted" style={{ margin: '6px 0 0' }}>
          Source: <a href={draft.article_url} target="_blank" rel="noreferrer">{draft.article_title}</a>
        </p>
      )}

      <div className="card" style={{ marginTop: 14 }}>
        <textarea className="textarea" rows={14} value={text}
          onChange={e => { setText(e.target.value); setMsg(null); }}
          disabled={locked} style={{ border: 'none', padding: 0 }} />
      </div>

      <ImagePanel draft={draft} locked={locked} onMessage={setMsg} />

      {!locked && (
        <>
          <div className="actions">
            <button className="btn ghost" disabled={busy}
              onClick={() => save.mutate({ id: draft.id, edited_content: text }, { onSuccess: () => ok('Saved'), onError: fail })}>
              Save edit
            </button>
            <button className="btn" disabled={busy}
              onClick={() => withSave(() => approve.mutate(draft.id, { onSuccess: () => ok(`Approved — will post ${slotLabel}`), onError: fail }))}>
              Approve · posts {slotLabel}
            </button>
            <ConfirmButton className="btn ink" disabled={busy}
              label="Post now" confirmLabel="Confirm — post to LinkedIn"
              onConfirm={() => withSave(() => publish.mutate(draft.id, { onSuccess: () => ok('Posted to LinkedIn'), onError: fail }))} />
            <ConfirmButton className="btn ghost" disabled={busy} skipConfirm={!dirty}
              label="Regenerate" confirmLabel="Discard edits and regenerate?"
              onConfirm={() => regenerate.mutate(draft.id, { onSuccess: () => ok('Regenerated'), onError: fail })} />
          </div>
          <div className="actions">
            <input className="input" type="datetime-local" value={slot} min={nowLocalInputValue()}
              onChange={e => setSlot(e.target.value)} style={{ width: 230 }} />
            <button className="btn ghost" disabled={busy || !slot}
              onClick={() => schedule.mutate({ id: draft.id, scheduled_at: new Date(slot).toISOString() },
                { onSuccess: () => ok(`Scheduled for ${fmtDateTime(new Date(slot).toISOString())}`), onError: fail })}>
              Schedule
            </button>
            {(draft.scheduled_at || draft.status === 'approved') && (
              <button className="btn ghost" disabled={busy}
                onClick={() => schedule.mutate({ id: draft.id, scheduled_at: null },
                  { onSuccess: () => ok('Unscheduled'), onError: fail })}>
                Unschedule
              </button>
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
                {metricErrors[k] && <p className="field-error">{metricErrors[k]}</p>}
              </div>
            ))}
            <button className="btn" style={{ alignSelf: 'flex-end' }} disabled={saveMetrics.isPending}
              onClick={submitMetrics}>
              Save metrics
            </button>
          </div>
          {draft.linkedin_post_id && (
            <p style={{ marginTop: 12 }}>
              <a href={`https://www.linkedin.com/feed/update/${draft.linkedin_post_id}/`} target="_blank" rel="noreferrer">View on LinkedIn →</a>
            </p>
          )}
        </div>
      )}
      <Feedback msg={msg?.text} kind={msg?.kind} />
    </div>
  );
}

function ImagePanel({ draft, locked, onMessage }) {
  const [url, setUrl] = useState(null);
  const [ver, setVer] = useState(0);
  const gen = useGenerateImage();
  const del = useDeleteImage();
  const busy = gen.isPending || del.isPending;

  useEffect(() => {
    let revoked = false;
    let objectUrl;
    if (draft.has_image) {
      apiBlob(`/api/drafts/${draft.id}/image?v=${ver}`)
        .then(b => { if (!revoked) { objectUrl = URL.createObjectURL(b); setUrl(objectUrl); } })
        .catch(() => {});
    } else {
      setUrl(null);
    }
    return () => { revoked = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [draft.id, draft.has_image, ver]);

  const generate = () => gen.mutate(draft.id, {
    onSuccess: () => { setVer(v => v + 1); onMessage({ text: 'Image generated', kind: 'ok' }); },
    onError: e => onMessage({ text: e.message, kind: 'error' }),
  });
  const remove = () => del.mutate(draft.id, {
    onSuccess: () => onMessage({ text: 'Image removed', kind: 'ok' }),
    onError: e => onMessage({ text: e.message, kind: 'error' }),
  });

  return (
    <div className="card" style={{ marginTop: 14 }}>
      <h2>Image</h2>
      {busy && <div className="skeleton" style={{ height: 180, marginTop: 12 }} />}
      {!busy && url && (
        <img src={url} alt="Post illustration" style={{ width: '100%', borderRadius: 12, marginTop: 12, display: 'block' }} />
      )}
      {!busy && !draft.has_image && (
        <p className="muted" style={{ margin: '8px 0 0' }}>No image yet. Add one generated from your post text.</p>
      )}
      {!locked && (
        <div className="actions">
          {draft.has_image
            ? <>
                <button className="btn ghost" disabled={busy} onClick={generate}>Regenerate image</button>
                <button className="btn ghost" disabled={busy} onClick={remove}>Remove image</button>
              </>
            : <button className="btn" disabled={busy} onClick={generate}>Add image ✦</button>}
        </div>
      )}
    </div>
  );
}
