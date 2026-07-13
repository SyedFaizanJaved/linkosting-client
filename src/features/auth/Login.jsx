import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout.jsx';
import { useLogin } from './useAuth.js';
import { validate, loginSchema } from '../../lib/validation.js';
import { toast } from '../../lib/toast.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const login = useLogin();

  function submit(e) {
    e.preventDefault();
    const { ok, errors: errs } = validate(loginSchema, { email, password });
    setErrors(errs);
    if (!ok) { toast.error(Object.values(errs)[0]); return; }
    login.mutate({ email, password }, { onSuccess: () => navigate('/') });
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your Linkosting account.">
      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor="login-email">Email</label>
          <input id="login-email" className="input" type="email" autoComplete="email"
            value={email} onChange={e => setEmail(e.target.value)} required />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>
        <div className="field">
          <label htmlFor="login-password">Password</label>
          <input id="login-password" className="input" type="password" autoComplete="current-password"
            value={password} onChange={e => setPassword(e.target.value)} required />
          {errors.password && <p className="field-error">{errors.password}</p>}
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
