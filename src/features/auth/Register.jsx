import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout.jsx';
import { useRegister, useAuthStatus } from './useAuth.js';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [mismatch, setMismatch] = useState('');
  const navigate = useNavigate();
  const status = useAuthStatus();
  const register = useRegister();

  // First-run only: once an account exists, registration is closed.
  if (status.data?.registered) return <Navigate to="/login" replace />;

  function submit(e) {
    e.preventDefault();
    setMismatch('');
    if (password !== confirm) { setMismatch('Passwords do not match.'); return; }
    if (password.length < 8) { setMismatch('Password must be at least 8 characters.'); return; }
    register.mutate({ email, password }, { onSuccess: () => navigate('/onboarding') });
  }

  return (
    <AuthLayout title="Create your account" subtitle="Set up the single account for this workspace.">
      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor="reg-email">Email</label>
          <input id="reg-email" className="input" type="email" autoComplete="email"
            value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="reg-password">Password</label>
          <input id="reg-password" className="input" type="password" autoComplete="new-password"
            value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
        </div>
        <div className="field">
          <label htmlFor="reg-confirm">Confirm password</label>
          <input id="reg-confirm" className="input" type="password" autoComplete="new-password"
            value={confirm} onChange={e => setConfirm(e.target.value)} required />
        </div>
        <button className="btn" type="submit" disabled={register.isPending || status.isLoading}
          style={{ width: '100%', justifyContent: 'center' }}>
          {register.isPending ? 'Creating…' : 'Create account'}
        </button>
        {(mismatch || register.isError) && <p className="error-text">{mismatch || register.error.message}</p>}
        <div className="auth-links">
          <span className="faint">Already have an account?</span>
          <Link to="/login">Sign in</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
