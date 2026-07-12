export default function Feedback({ msg, kind = 'ok' }) {
  if (!msg) return null;
  return <p className={kind === 'error' ? 'error-text' : 'ok-text'} style={{ margin: '10px 0 0' }}>{msg}</p>;
}
