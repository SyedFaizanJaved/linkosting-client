import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout.jsx';
import { useRegister } from './useAuth.js';
import { validate, registerSchema } from '../../lib/validation.js';
import { toast } from '../../lib/toast.js';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const register = useRegister();

  function submit(e) {
    e.preventDefault();
    const { ok, errors: errs } = validate(registerSchema, { email, password, confirm });
    setErrors(errs);
    if (!ok) { toast.error(Object.values(errs)[0]); return; }
    register.mutate({ email, password }, { onSuccess: () => navigate('/pending') });
  }

  return (
    <AuthLayout title="Create your account" subtitle="Create your account — an admin will approve it.">
      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor="reg-email">Email</label>
          <input id="reg-email" className="input" type="email" autoComplete="email"
            value={email} onChange={e => setEmail(e.target.value)} required />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>
        <div className="field">
          <label htmlFor="reg-password">Password</label>
          <input id="reg-password" className="input" type="password" autoComplete="new-password"
            value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
          {errors.password && <p className="field-error">{errors.password}</p>}
        </div>
        <div className="field">
          <label htmlFor="reg-confirm">Confirm password</label>
          <input id="reg-confirm" className="input" type="password" autoComplete="new-password"
            value={confirm} onChange={e => setConfirm(e.target.value)} required />
          {errors.confirm && <p className="field-error">{errors.confirm}</p>}
        </div>
        <button className="btn" type="submit" disabled={register.isPending}
          style={{ width: '100%', justifyContent: 'center' }}>
          {register.isPending ? 'Creating…' : 'Create account'}
        </button>
        {register.isError && <p className="error-text">{register.error.message}</p>}
        <div className="auth-links">
          <span className="faint">Already have an account?</span>
          <Link to="/login">Sign in</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
