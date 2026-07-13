import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGenerate } from './useGenerate.js';
import { useCreateDraft, useDeleteDraft } from '../drafts/hooks.js';
import { useSettings, useSaveSettings } from '../settings/useSettings.js';
import { PREBUILT_TOPICS } from './prebuilt.js';

const TONES = ['professional', 'friendly', 'bold', 'analytical'];
const LENGTHS = ['short', 'medium', 'long'];
const LABEL = { fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', marginLeft: 6 };

export default function Generator() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { data: settings } = useSettings();
  const topics = (settings?.topics || '').split(',').map(t => t.trim()).filter(Boolean);

  const [prompt, setPrompt] = useState(params.get('prompt') || '');
  const [topic, setTopic] = useState(params.get('topic') || '');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const [saved, setSaved] = useState([]);   // auto-saved draft objects for this run
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const generate = useGenerate();
  const create = useCreateDraft();
  const del = useDeleteDraft();
  const saveSettings = useSaveSettings();
  const working = busy || generate.isPending;

  // Optional overrides let a prebuilt topic generate immediately without waiting
  // on setState to flush (prebuilt click passes its own prompt/topic directly).
  async function run(overridePrompt, overrideTopic) {
    const p = (overridePrompt ?? prompt).trim();
    const t = (overrideTopic ?? topic).trim();
    if (!p) return;
    if (overridePrompt !== undefined) setPrompt(p);
    if (overrideTopic !== undefined) setTopic(t);
    setError('');
    setSaved([]);
    setBusy(true);
    try {
      const { variants } = await generate.mutateAsync({ prompt: p, tone, length });
      // Persist a newly-typed topic so it's reusable in the future.
      if (t && !topics.includes(t)) {
        await saveSettings.mutateAsync({ topics: [...topics, t].join(', ') }).catch(() => {});
      }
      // Auto-save every variant so nothing is lost; the user discards what they don't want.
      const created = [];
      for (const content of variants) {
        const d = await create.mutateAsync({ content, source: 'generated', topic: t || null }).catch(() => null);
        if (d) created.push(d);
      }
      if (!created.length) setError('Generated, but saving the drafts failed. Check the server and try again.');
      setSaved(created);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  function discard(id) {
    setError('');
    del.mutate(id, {
      onSuccess: () => setSaved(s => s.filter(d => d.id !== id)),
      onError: e => setError(e.message),
    });
  }

  return (
    <div className="screen" style={{ maxWidth: 860, margin: '0 auto', width: '100%' }}>
      <h1 style={{ textAlign: 'center', marginTop: 18 }}>What should we write today?</h1>
      <p className="muted" style={{ textAlign: 'center', margin: '8px 0 0' }}>Tell me the idea — I'll draft three versions and save them automatically.</p>

      <div className="card" style={{ marginTop: 22, borderRadius: 22 }}>
        <textarea className="textarea" rows={3} value={prompt} onChange={e => setPrompt(e.target.value)}
          placeholder="e.g. A lesson about pricing from my first year of consulting…" style={{ border: 'none', padding: 0 }} />
        <div className="actions" style={{ borderTop: '1px solid var(--line)', paddingTop: 14 }}>
          <span className="faint" style={{ ...LABEL, marginLeft: 0 }}>Tone</span>
          {TONES.map(t => <span key={t} className={`chip${tone === t ? ' active' : ''}`} onClick={() => setTone(t)}>{t}</span>)}
          <span className="faint" style={LABEL}>Length</span>
          {LENGTHS.map(l => <span key={l} className={`chip${length === l ? ' active' : ''}`} onClick={() => setLength(l)}>{l}</span>)}
          <span className="faint" style={LABEL}>Topic</span>
          <input className="input" list="gen-topics" style={{ width: 180 }} placeholder="Optional — saved for reuse"
            value={topic} onChange={e => setTopic(e.target.value)} />
          <datalist id="gen-topics">{topics.map(t => <option key={t} value={t} />)}</datalist>
          <span style={{ flex: 1 }} />
          <button className="btn" disabled={working || !prompt.trim()} onClick={() => run()}>
            {working ? 'Writing…' : '✦ Generate'}
          </button>
        </div>
      </div>

      {working && (
        <div style={{ display: 'grid', gap: 14, marginTop: 22 }}>
          {[0, 1, 2].map(i => <div key={i} className="skeleton" style={{ height: 120, animationDelay: `${i * 0.15}s` }} />)}
          <p className="faint" style={{ textAlign: 'center', fontSize: 12.5, fontWeight: 700 }}>Writing three angles and saving them…</p>
        </div>
      )}

      {error && <p className="error-text" style={{ textAlign: 'center', marginTop: 16 }}>{error}</p>}

      {!working && saved.length > 0 && (
        <div style={{ display: 'grid', gap: 14, marginTop: 22 }}>
          <p className="muted" style={{ textAlign: 'center', margin: 0 }}>Saved as drafts — open the keepers, discard the rest.</p>
          {saved.map((d, i) => (
            <div key={d.id} className="card">
              <p className="faint" style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 800 }}>VARIANT {i + 1} · saved</p>
              <p style={{ whiteSpace: 'pre-wrap', margin: 0, fontSize: 14.5, lineHeight: 1.55 }}>{d.content}</p>
              <div className="actions">
                <button className="btn ink" onClick={() => navigate(`/drafts/${d.id}`)}>Open in editor</button>
                <button className="btn ghost" disabled={del.isPending} onClick={() => discard(d.id)}>Discard</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!working && !error && saved.length === 0 && (
        <div style={{ marginTop: 28 }}>
          <p className="muted" style={{ textAlign: 'center', margin: '0 0 14px' }}>
            Or start from a proven topic — one click drafts three posts.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
            {PREBUILT_TOPICS.map(pb => (
              <div key={pb.topic} className="card prebuilt-card" style={{ cursor: 'pointer' }}
                onClick={() => run(pb.prompt, pb.topic)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{pb.emoji}</span>
                  <span style={{ fontWeight: 800, fontSize: 15 }}>{pb.title}</span>
                </div>
                <p className="faint" style={{ margin: '8px 0 0', fontSize: 12.5, lineHeight: 1.5 }}>{pb.prompt}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
