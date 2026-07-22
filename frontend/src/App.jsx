import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Invoices from './pages/Invoices';
import Channels from './pages/Channels';
import SyncLog from './pages/SyncLog';
import './index.css';

const NAV = [
  { to: '/', label: '📊 Dashboard' },
  { to: '/inventory', label: '📦 Stok' },
  { to: '/orders', label: '🛒 Siparişler' },
  { to: '/invoices', label: '🧾 Faturalar' },
  { to: '/channels', label: '🔌 Kanallar' },
  { to: '/sync-log', label: '🔄 Sync Log' },
];

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="app-container">
        <aside className="sidebar">
          <div className="sidebar-header">
            🏪 Unified Commerce
          </div>
          <nav className="sidebar-nav">
            {NAV.map(n => (
              <NavLink key={n.to} to={n.to} end={n.to === '/'} className="nav-link">
                {n.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="main-content">
          <header className="main-header">
            <span className="system-status-indicator">● System Status: Operational</span>
          </header>
          <div className="page-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/channels" element={<Channels />} />
              <Route path="/sync-log" element={<SyncLog />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}
