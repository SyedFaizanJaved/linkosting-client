import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from './AuthLayout.jsx';
import { useResetPassword } from './useAuth.js';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [mismatch, setMismatch] = useState('');
  const navigate = useNavigate();
  const reset = useResetPassword();

  if (!token) return <Navigate to="/forgot" replace />;

  function submit(e) {
    e.preventDefault();
    setMismatch('');
    if (password !== confirm) { setMismatch('Passwords do not match.'); return; }
    if (password.length < 8) { setMismatch('Password must be at least 8 characters.'); return; }
    reset.mutate({ token, password });
  }

  return (
    <AuthLayout title="Set a new password" subtitle="Choose a password for your account.">
      {reset.isSuccess ? (
        <div>
          <p className="ok-text">Password updated. You can sign in with it now.</p>
          <button className="btn" onClick={() => navigate('/login')} style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>
            Go to sign in
          </button>
        </div>
      ) : (
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="reset-password">New password</label>
            <input id="reset-password" className="input" type="password" autoComplete="new-password"
              value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
          </div>
          <div className="field">
            <label htmlFor="reset-confirm">Confirm password</label>
            <input id="reset-confirm" className="input" type="password" autoComplete="new-password"
              value={confirm} onChange={e => setConfirm(e.target.value)} required />
          </div>
          <button className="btn" type="submit" disabled={reset.isPending} style={{ width: '100%', justifyContent: 'center' }}>
            {reset.isPending ? 'Updating…' : 'Update password'}
          </button>
          {(mismatch || reset.isError) && <p className="error-text">{mismatch || reset.error.message}</p>}
          <div className="auth-links" style={{ justifyContent: 'flex-start' }}>
            <Link to="/login">Back to sign in</Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
