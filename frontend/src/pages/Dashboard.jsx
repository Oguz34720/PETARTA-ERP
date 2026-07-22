import { useEffect, useState } from 'react';
import axios from 'axios';

import { API } from '../config';
const CHANNEL_ICONS = { shopify:'🛍️', trendyol:'🟠', hepsiburada:'🟣', amazon:'📦', n11:'🔵', pazarama:'🟡', beymen:'⚫', defacto:'🔴', hipicon:'🟢', lcw:'🟤', isbasi:'🏢', edm:'🧾' };

export default function Dashboard() {
  const [channels, setChannels] = useState([]);
  const [orders, setOrders] = useState({ count: 0 });
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    axios.get(`${API}/api/channels`).then(r => setChannels(r.data));
    axios.get(`${API}/api/orders?limit=5`).then(r => setOrders(r.data));
    axios.get(`${API}/api/sync-logs?limit=5`).then(r => setLogs(r.data));
  }, []);

  return (
    <div className="fade-in">
      <div className="page-title-section">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Multi-channel operations overview</p>
      </div>

      <h3 className="section-title">Kanal Durumları</h3>
      <div className="channels-grid">
        {channels.map(ch => (
          <div key={ch.channel} className={`channel-card ${ch.is_active ? 'active' : 'inactive'}`}>
            <div className="channel-icon">{CHANNEL_ICONS[ch.channel] || '🔗'}</div>
            <div className="channel-name">{ch.channel}</div>
            <div className="channel-status">
              <span className="status-dot"></span>
              {ch.is_active ? 'Aktif' : 'Pasif'}
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-table-container">
          <h3 className="section-title">Son Siparişler ({orders.count || 0} toplam)</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Kanal</th>
                <th>Durum</th>
                <th>Tutar</th>
                <th>Tarih</th>
              </tr>
            </thead>
            <tbody>
              {(orders.rows || []).map(o => (
                <tr key={o.id}>
                  <td><strong>#{o.id}</strong></td>
                  <td className="capitalize">{CHANNEL_ICONS[o.channel]} {o.channel}</td>
                  <td>
                    <span className="badge badge-info">{o.status}</span>
                  </td>
                  <td>{o.total_amount} {o.currency}</td>
                  <td>{new Date(o.created_at).toLocaleDateString('tr-TR')}</td>
                </tr>
              ))}
              {(!orders.rows || orders.rows.length === 0) && (
                <tr>
                  <td colSpan="5" className="empty-message">Henüz sipariş bulunmuyor.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="dashboard-logs-container">
          <h3 className="section-title">Son Sync Olayları</h3>
          <div className="log-list">
            {logs.map(l => (
              <div key={l.id} className="log-item">
                <span className={`log-status-dot ${l.status}`}></span>
                <div className="log-details">
                  <div className="log-event-type">{l.event_type}</div>
                  <div className="log-path">{l.source_channel} → {l.target_channel}</div>
                  {l.sku && <div className="log-sku">SKU: {l.sku}</div>}
                  {l.error_message && <div className="log-error-text">{l.error_message}</div>}
                </div>
                <span className="log-time">{new Date(l.created_at).toLocaleTimeString('tr-TR')}</span>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="empty-message">Henüz sync günlüğü kaydı yok.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
