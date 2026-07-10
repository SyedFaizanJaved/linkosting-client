import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="login-wrap screen">
      <div className="brand" style={{ justifyContent: 'center' }}>
        <span className="brand-mark">L</span>
        <span className="brand-name">Linkosting</span>
      </div>
      <form className="card" onSubmit={submit}>
        <h1 style={{ fontSize: 22, marginBottom: 16 }}>Welcome back</h1>
        <div className="field">
          <label>Email</label>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label>Password</label>
          <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button className="btn" type="submit" disabled={login.isPending} style={{ width: '100%', justifyContent: 'center' }}>
          {login.isPending ? 'Signing in…' : 'Sign in'}
        </button>
        {login.isError && <p className="error-text">{login.error.message}</p>}
      </form>
    </div>
  );
}
