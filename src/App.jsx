import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Today from './pages/Today.jsx';
import History from './pages/History.jsx';
import Settings from './pages/Settings.jsx';
import { getToken } from './api.js';

function Guard({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}

function Nav() {
  const { pathname } = useLocation();
  if (pathname === '/login') return null;
  return (
    <nav>
      <strong>LinkedIn Post Pilot</strong>
      <Link to="/">Today</Link>
      <Link to="/history">History</Link>
      <Link to="/settings">Settings</Link>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Guard><Today /></Guard>} />
          <Route path="/history" element={<Guard><History /></Guard>} />
          <Route path="/settings" element={<Guard><Settings /></Guard>} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
