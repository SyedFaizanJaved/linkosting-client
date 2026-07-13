import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from './AuthLayout.jsx';
import { useForgotPassword } from './useAuth.js';
import { validate, forgotSchema } from '../../lib/validation.js';
import { toast } from '../../lib/toast.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const forgot = useForgotPassword();

  function submit(e) {
    e.preventDefault();
    const { ok, errors: errs } = validate(forgotSchema, { email });
    setErrors(errs);
    if (!ok) { toast.error(Object.values(errs)[0]); return; }
    forgot.mutate({ email });
  }

  return (
    <AuthLayout title="Reset your password" subtitle="We'll email you a link to set a new password.">
      {forgot.isSuccess ? (
        <div>
          <p className="ok-text">If an account matches that email, a reset link is on its way.</p>
          <p className="auth-note" style={{ marginTop: 10 }}>The link expires in 1 hour. Check your inbox (and spam).</p>
          <div className="auth-links" style={{ justifyContent: 'flex-start' }}>
            <Link to="/login">Back to sign in</Link>
          </div>
        </div>
      ) : (
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="forgot-email">Email</label>
            <input id="forgot-email" className="input" type="email" autoComplete="email"
              value={email} onChange={e => setEmail(e.target.value)} required />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>
          <button className="btn" type="submit" disabled={forgot.isPending} style={{ width: '100%', justifyContent: 'center' }}>
            {forgot.isPending ? 'Sending…' : 'Send reset link'}
          </button>
          {forgot.isError && <p className="error-text">{forgot.error.message}</p>}
          <div className="auth-links" style={{ justifyContent: 'flex-start' }}>
            <Link to="/login">Back to sign in</Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
