import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { useSettings, useSaveSettings } from '../settings/useSettings.js';

export default function Onboarding() {
  const navigate = useNavigate();
  const { data: s } = useSettings();
  const save = useSaveSettings();
  const [step, setStep] = useState(0);
  const [topics, setTopics] = useState('');
  const [tone, setTone] = useState('');
  const [time, setTime] = useState('12:00');
  const [error, setError] = useState('');

  if (s && s.onboarded === 'true') { navigate('/', { replace: true }); return null; }

  async function connectLinkedIn() {
    try {
      const { url } = await api('/api/linkedin/auth-url');
      window.location.href = url;
    } catch (e) { setError(e.message); }
  }

  function next(patch, done = false) {
    save.mutate(done ? { ...patch, onboarded: 'true' } : patch, {
      onSuccess: () => (done ? navigate('/') : setStep(step + 1)),
      onError: e => setError(e.message),
    });
  }

  const steps = [
    <div key="0">
      <h1>What do you post about?</h1>
      <p className="muted" style={{ margin: '8px 0 16px' }}>Topics guide the daily draft and the generator.</p>
      <div className="field"><label>Topics (comma-separated)</label>
        <input className="input" value={topics} onChange={e => setTopics(e.target.value)} placeholder="AI, Product strategy, Founder lessons" /></div>
      <div className="field"><label>Tone / persona</label>
        <textarea className="textarea" rows={3} value={tone} onChange={e => setTone(e.target.value)} placeholder="First person, practical, no hype, no emojis." /></div>
      <button className="btn" disabled={save.isPending} onClick={() => next({ topics, tone })}>Continue</button>
    </div>,
    <div key="1">
      <h1>When should posts go live?</h1>
      <p className="muted" style={{ margin: '8px 0 16px' }}>Default slot for approved posts without an explicit schedule. Stored in UTC.</p>
      <div className="field"><label>Default post time (UTC)</label>
        <input className="input" type="time" value={time} onChange={e => setTime(e.target.value)} /></div>
      <button className="btn" disabled={save.isPending} onClick={() => next({ default_post_time: time })}>Continue</button>
    </div>,
    <div key="2">
      <h1>Connect LinkedIn</h1>
      <p className="muted" style={{ margin: '8px 0 16px' }}>Needed to publish. You can also do this later in Settings.</p>
      <div className="actions">
        <button className="btn" onClick={connectLinkedIn}>Connect LinkedIn</button>
        <button className="btn ghost" disabled={save.isPending} onClick={() => next({}, true)}>Finish{s?.linkedin?.connected ? '' : ' without connecting'}</button>
      </div>
    </div>,
  ];

  return (
    <div className="login-wrap screen" style={{ maxWidth: 480 }}>
      <div className="brand" style={{ justifyContent: 'center' }}>
        <span className="brand-mark">L</span><span className="brand-name">Linkosting</span>
      </div>
      <div className="card">
        <p className="faint" style={{ fontSize: 12, fontWeight: 800, margin: '0 0 10px' }}>STEP {step + 1} OF 3</p>
        {steps[step]}
        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  );
}
