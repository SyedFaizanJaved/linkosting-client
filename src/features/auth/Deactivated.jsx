import AuthLayout from './AuthLayout.jsx';
import { useLogout } from './useAuth.js';

export default function Deactivated() {
  const logout = useLogout();
  return (
    <AuthLayout title="Account deactivated" subtitle="This account is no longer active.">
      <p className="muted">This account has been deactivated. Contact the admin if you think this is a mistake.</p>
      <button className="btn ghost" style={{ marginTop: 16 }} onClick={logout}>Sign out</button>
    </AuthLayout>
  );
}
