import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout.jsx';
import { useLogin } from './useAuth.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const login = useLogin();

  function submit(e) {
    e.preventDefault();
    login.mutate({ email, password }, { onSuccess: () => navigate('/') });
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your Linkosting account.">
      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor="login-email">Email</label>
          <input id="login-email" className="input" type="email" autoComplete="email"
            value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="login-password">Password</label>
          <input id="login-password" className="input" type="password" autoComplete="current-password"
            value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button className="btn" type="submit" disabled={login.isPending} style={{ width: '100%', justifyContent: 'center' }}>
          {login.isPending ? 'Signing in…' : 'Sign in'}
        </button>
        {login.isError && <p className="error-text">{login.error.message}</p>}
        <div className="auth-links">
          <Link to="/forgot">Forgot password?</Link>
          <Link to="/register">Create account</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
