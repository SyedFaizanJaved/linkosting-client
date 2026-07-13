import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Providers } from './providers.jsx';
import Layout from './layout/Layout.jsx';
import { useMe } from '../features/auth/useAuth.js';
import { useSettings } from '../features/settings/useSettings.js';
import Login from '../features/auth/Login.jsx';
import Register from '../features/auth/Register.jsx';
import ForgotPassword from '../features/auth/ForgotPassword.jsx';
import ResetPassword from '../features/auth/ResetPassword.jsx';
import PendingApproval from '../features/auth/PendingApproval.jsx';
import Deactivated from '../features/auth/Deactivated.jsx';
import Onboarding from '../features/onboarding/Onboarding.jsx';
import Dashboard from '../features/dashboard/Dashboard.jsx';
import Generator from '../features/generator/Generator.jsx';
import Editor from '../features/editor/Editor.jsx';
import Calendar from '../features/calendar/Calendar.jsx';
import Library from '../features/library/Library.jsx';
import Topics from '../features/topics/Topics.jsx';
import Analytics from '../features/analytics/Analytics.jsx';
import Notifications from '../features/notifications/Notifications.jsx';
import Settings from '../features/settings/Settings.jsx';

function Guard({ children, allow }) {
  const me = useMe();
  if (me.isLoading) {
    return <div className="screen" style={{ padding: 40 }}><div className="skeleton" style={{ height: 220 }} /></div>;
  }
  if (me.isError || !me.data) return <Navigate to="/login" replace />;
  const status = me.data.status;
  if (allow === status) return children;
  if (status === 'pending') return <Navigate to="/pending" replace />;
  if (status === 'deactivated') return <Navigate to="/deactivated" replace />;
  return children; // active
}

function OnboardGate({ children }) {
  const { data: settings } = useSettings();
  if (settings && settings.onboarded !== 'true') return <Navigate to="/onboarding" replace />;
  return children;
}

export default function App() {
  return (
    <Providers>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/reset" element={<ResetPassword />} />
          <Route path="/pending" element={<Guard allow="pending"><PendingApproval /></Guard>} />
          <Route path="/deactivated" element={<Guard allow="deactivated"><Deactivated /></Guard>} />
          <Route path="/onboarding" element={<Guard><Onboarding /></Guard>} />
          <Route element={<Guard><OnboardGate><Layout /></OnboardGate></Guard>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/generate" element={<Generator />} />
            <Route path="/drafts/:id" element={<Editor />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/library" element={<Library />} />
            <Route path="/topics" element={<Topics />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Providers>
  );
}
