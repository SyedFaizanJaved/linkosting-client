import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import { useSettings } from '../../features/settings/useSettings.js';

export default function Layout() {
  const { data: settings } = useSettings();
  return (
    <div className="app">
      <Sidebar linkedinConnected={!!settings?.linkedin?.connected} />
      <main className="main">
        <Topbar />
        <Outlet />
      </main>
    </div>
  );
}
