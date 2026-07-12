import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { useSettings, useSaveSettings } from '../settings/useSettings.js';
import { utcHHMMToLocal, localHHMMToUtc } from '../../lib/format.js';

export default function Onboarding() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { data: s } = useSettings();
  const save = useSaveSettings();
  const [step, setStep] = useState(() => (params.get('linkedin') ? 2 : 0));
  const [topics, setTopics] = useState('');
  const [tone, setTone] = useState('');
  const [time, setTime] = useState(() => utcHHMMToLocal('12:00'));
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.get('linkedin') === 'error') setError(`LinkedIn connection failed: ${params.get('reason') || 'unknown error'}`);
    if (params.get('linkedin')) window.history.replaceState({}, '', window.location.pathname);
  }, []);

  if (s && s.onboarded === 'true') return <Navigate to="/" replace />;

  async function connectLinkedIn() {
    setConnecting(true);
    try {
      const { url } = await api('/api/linkedin/auth-url?from=onboarding');
      window.location.href = url;
    } catch (e) {
      setError(e.message);
      setConnecting(false);
    }
  }

  function next(patch, done = false) {
    save.mutate(done ? { ...patch, onboarded: 'true' } : patch, {
      onSuccess: () => (done ? navigate('/') : setStep(step + 1)),
      onError: e => setError(e.message),
    });
  }

  function back() {
    setError('');
    setStep(st => Math.max(0, st - 1));
  }

  const connected = !!s?.linkedin?.connected;
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
      <p className="muted" style={{ margin: '8px 0 16px' }}>Default slot for approved posts without an explicit schedule.</p>
      <div className="field"><label>Default post time (your local time)</label>
        <input className="input" type="time" value={time} onChange={e => setTime(e.target.value)} />
        <p className="faint" style={{ fontSize: 12, margin: '6px 0 0' }}>Stored as {localHHMMToUtc(time)} UTC</p></div>
      <div className="actions">
        <button className="btn ghost" disabled={save.isPending} onClick={back}>← Back</button>
        <button className="btn" disabled={save.isPending} onClick={() => next({ default_post_time: localHHMMToUtc(time) })}>Continue</button>
      </div>
    </div>,
    <div key="2">
      <h1>Connect LinkedIn</h1>
      {connected
        ? <p className="ok-text" style={{ margin: '8px 0 16px' }}>LinkedIn connected ✓</p>
        : <p className="muted" style={{ margin: '8px 0 16px' }}>Needed to publish. You can also do this later in Settings.</p>}
      <div className="actions">
        <button className="btn ghost" disabled={save.isPending} onClick={back}>← Back</button>
        {!connected && (
          <button className="btn" disabled={connecting} onClick={connectLinkedIn}>
            {connecting ? 'Opening LinkedIn…' : 'Connect LinkedIn'}
          </button>
        )}
        <button className={connected ? 'btn' : 'btn ghost'} disabled={save.isPending} onClick={() => next({}, true)}>
          Finish{connected ? '' : ' without connecting'}
        </button>
      </div>
    </div>,
  ];

  return (
    <div className="login-wrap screen" style={{ maxWidth: 480 }}>
      <div className="brand" style={{ justifyContent: 'center' }}>
        <img className="brand-mark" src="/logo.png" alt="Linkosting" /><span className="brand-name">Linkosting</span>
      </div>
      <div className="card">
        <p className="faint" style={{ fontSize: 12, fontWeight: 800, margin: '0 0 10px' }}>STEP {step + 1} OF 3</p>
        {steps[step]}
        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  );
}
