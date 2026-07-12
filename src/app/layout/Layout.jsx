import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import { useSettings } from '../../features/settings/useSettings.js';

export default function Layout() {
  const { data: settings } = useSettings();
  const [navOpen, setNavOpen] = useState(false);
  return (
    <div className="app">
      <Sidebar linkedin={settings?.linkedin} open={navOpen} onClose={() => setNavOpen(false)} />
      {navOpen && <div className="nav-backdrop" onClick={() => setNavOpen(false)} />}
      <main className="main">
        <Topbar onMenu={() => setNavOpen(o => !o)} />
        <Outlet />
      </main>
    </div>
  );
}
