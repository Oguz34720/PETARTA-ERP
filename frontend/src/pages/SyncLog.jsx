import { useEffect, useState } from 'react';
import axios from 'axios';

import { API } from '../config';
const CHANNELS = ['', 'shopify', 'trendyol', 'hepsiburada', 'amazon', 'n11', 'pazarama', 'beymen', 'defacto', 'hipicon', 'lcw', 'isbasi'];

export default function SyncLog() {
  const [logs, setLogs] = useState([]);
  const [channel, setChannel] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const load = () => {
    setLoading(true);
    axios.get(`${API}/api/sync-logs`, {
      params: {
        channel: channel || undefined,
        status: status || undefined,
        limit: 100
      }
    })
      .then(r => setLogs(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [channel, status]);

  return (
    <div className="fade-in">
      <div className="page-title-section">
        <h1 className="page-title">Sistem Sync Günlükleri</h1>
        <p className="page-subtitle">Tüm kanallar arası stok, sipariş ve fatura akış logları</p>
      </div>

      <div className="filters-card">
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <select className="form-select" value={channel} onChange={e => setChannel(e.target.value)}>
              {CHANNELS.map(c => <option key={c} value={c}>{c ? `Kaynak: ${c.toUpperCase()}` : '🌐 Tüm Kaynaklar'}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="">Status: Tümü</option>
              <option value="success">🟢 Başarılı</option>
              <option value="failed">🔴 Hatalı</option>
              <option value="pending">🟡 Beklemede</option>
            </select>
          </div>
          <span className="results-count">{logs.length} adet günlük listelendi</span>
        </div>
        <button className="btn-secondary" onClick={load} disabled={loading}>
          {loading ? 'Yükleniyor...' : '🔄 Yenile'}
        </button>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>İşlem Tipi</th>
              <th>Kaynak</th>
              <th>Hedef</th>
              <th>SKU</th>
              <th>Sonuç</th>
              <th>Zaman</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(l => (
              <tr key={l.id}>
                <td><strong>#{l.id}</strong></td>
                <td>{l.event_type}</td>
                <td className="capitalize">{l.source_channel}</td>
                <td className="capitalize">{l.target_channel || '—'}</td>
                <td><strong>{l.sku || '—'}</strong></td>
                <td>
                  <span className={`badge ${l.status === 'success' ? 'badge-success' : l.status === 'failed' ? 'badge-danger' : 'badge-warning'}`}>
                    {l.status}
                  </span>
                </td>
                <td className="time-text">{new Date(l.created_at).toLocaleString('tr-TR')}</td>
                <td>
                  <button className="btn-action" onClick={() => setSelectedLog(l)}>Detay</button>
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan="8" className="empty-message">Kriterlere uygun sync logu bulunamadı.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedLog && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Log Detayı — #{selectedLog.id}</h2>
              <button className="modal-close-btn" onClick={() => setSelectedLog(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="order-details-grid">
                <div>
                  <h4 className="detail-title">İşlem Tipi</h4>
                  <p className="detail-value">{selectedLog.event_type}</p>
                </div>
                <div>
                  <h4 className="detail-title">Kaynak / Hedef</h4>
                  <p className="detail-value capitalize">{selectedLog.source_channel} ➔ {selectedLog.target_channel || 'Herkes'}</p>
                </div>
                <div>
                  <h4 className="detail-title">SKU</h4>
                  <p className="detail-value"><strong>{selectedLog.sku || '—'}</strong></p>
                </div>
                <div>
                  <h4 className="detail-title">Durum</h4>
                  <p className="detail-value">
                    <span className={`badge ${selectedLog.status === 'success' ? 'badge-success' : selectedLog.status === 'failed' ? 'badge-danger' : 'badge-warning'}`}>
                      {selectedLog.status}
                    </span>
                  </p>
                </div>
              </div>

              {selectedLog.error_message && (
                <div style={{ marginTop: 20 }}>
                  <h4 className="detail-title" style={{ color: '#ef4444' }}>Hata Mesajı</h4>
                  <pre className="error-payload-block">{selectedLog.error_message}</pre>
                </div>
              )}

              <h4 className="detail-title" style={{ marginTop: 20 }}>Payload Verisi</h4>
              <pre className="raw-json-block">{JSON.stringify(selectedLog.payload, null, 2)}</pre>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedLog(null)}>Kapat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
