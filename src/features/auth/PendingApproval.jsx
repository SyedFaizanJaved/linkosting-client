import AuthLayout from './AuthLayout.jsx';
import { useLogout } from './useAuth.js';

export default function PendingApproval() {
  const logout = useLogout();
  return (
    <AuthLayout title="Waiting for approval" subtitle="Your account was created and is pending admin approval.">
      <p className="muted">You'll be able to use Linkosting once an admin activates your account. Check back soon.</p>
      <button className="btn ghost" style={{ marginTop: 16 }} onClick={logout}>Sign out</button>
    </AuthLayout>
  );
}
