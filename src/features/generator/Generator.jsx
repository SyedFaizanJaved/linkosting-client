import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGenerate } from './useGenerate.js';
import { useCreateDraft } from '../drafts/hooks.js';
import { useSettings } from '../settings/useSettings.js';

const TONES = ['professional', 'friendly', 'bold', 'analytical'];
const LENGTHS = ['short', 'medium', 'long'];

export default function Generator() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { data: settings } = useSettings();
  const topics = (settings?.topics || '').split(',').map(t => t.trim()).filter(Boolean);
  const [prompt, setPrompt] = useState(params.get('prompt') || '');
  const [topic, setTopic] = useState(params.get('topic') || '');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const generate = useGenerate();
  const create = useCreateDraft();

  function saveVariant(content) {
    create.mutate({ content, source: 'generated', topic: topic || null }, {
      onSuccess: d => navigate(`/drafts/${d.id}`),
    });
  }

  return (
    <div className="screen" style={{ maxWidth: 860, margin: '0 auto', width: '100%' }}>
      <h1 style={{ textAlign: 'center', marginTop: 18 }}>What should we write today?</h1>
      <p className="muted" style={{ textAlign: 'center', margin: '8px 0 0' }}>Tell me the idea — I'll draft it in your voice, three ways.</p>

      <div className="card" style={{ marginTop: 22, borderRadius: 22 }}>
        <textarea className="textarea" rows={3} value={prompt} onChange={e => setPrompt(e.target.value)}
          placeholder="e.g. A lesson about pricing from my first year of consulting…" style={{ border: 'none', padding: 0 }} />
        <div className="actions" style={{ borderTop: '1px solid var(--line)', paddingTop: 14 }}>
          <span className="faint" style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em' }}>Tone</span>
          {TONES.map(t => <span key={t} className={`chip${tone === t ? ' active' : ''}`} onClick={() => setTone(t)}>{t}</span>)}
          <span className="faint" style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', marginLeft: 6 }}>Length</span>
          {LENGTHS.map(l => <span key={l} className={`chip${length === l ? ' active' : ''}`} onClick={() => setLength(l)}>{l}</span>)}
          {topics.length > 0 && (
            <>
              <span className="faint" style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', marginLeft: 6 }}>Topic</span>
              <select className="select" style={{ width: 160 }} value={topic} onChange={e => setTopic(e.target.value)}>
                <option value="">No topic</option>
                {topics.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </>
          )}
          <span style={{ flex: 1 }} />
          <button className="btn" disabled={generate.isPending || !prompt.trim()}
            onClick={() => generate.mutate({ prompt, tone, length })}>
            {generate.isPending ? 'Writing…' : '✦ Generate'}
          </button>
        </div>
      </div>

      {generate.isPending && (
        <div style={{ display: 'grid', gap: 14, marginTop: 22 }}>
          {[0, 1, 2].map(i => <div key={i} className="skeleton" style={{ height: 120, animationDelay: `${i * 0.15}s` }} />)}
          <p className="faint" style={{ textAlign: 'center', fontSize: 12.5, fontWeight: 700 }}>Writing three angles in your voice…</p>
        </div>
      )}

      {generate.isError && <p className="error-text" style={{ textAlign: 'center', marginTop: 16 }}>{generate.error.message}</p>}

      {generate.isSuccess && (
        <div style={{ display: 'grid', gap: 14, marginTop: 22 }}>
          {generate.data.variants.map((v, i) => (
            <div key={i} className="card">
              <p className="faint" style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 800 }}>VARIANT {i + 1}</p>
              <p style={{ whiteSpace: 'pre-wrap', margin: 0, fontSize: 14.5, lineHeight: 1.55 }}>{v}</p>
              <div className="actions">
                <button className="btn ink" disabled={create.isPending} onClick={() => saveVariant(v)}>Save as draft</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {generate.isIdle && (
        <div className="empty">
          <p style={{ fontWeight: 700, color: 'var(--ink)' }}>Your drafts will appear here</p>
          <p style={{ fontSize: 12.5 }}>Each one is written in your voice.</p>
        </div>
      )}
    </div>
  );
}
