import { useEffect, useState } from 'react';
import axios from 'axios';

import { API } from '../config';
const CHANNELS = ['', 'shopify', 'trendyol', 'hepsiburada', 'amazon', 'n11', 'pazarama', 'beymen', 'defacto', 'hipicon', 'lcw'];
const CHANNEL_ICONS = { shopify:'🛍️', trendyol:'🟠', hepsiburada:'🟣', amazon:'📦', n11:'🔵', pazarama:'🟡', beymen:'⚫', defacto:'🔴', hipicon:'🟢', lcw:'🟤' };

export default function Orders() {
  const [orders, setOrders] = useState({ rows: [], count: 0 });
  const [channel, setChannel] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    axios.get(`${API}/api/orders`, { params: { channel: channel || undefined } })
      .then(r => setOrders(r.data))
      .finally(() => setLoading(false));
  };
  
  useEffect(() => { load(); }, [channel]);

  return (
    <div className="fade-in">
      <div className="page-title-section">
        <h1 className="page-title">Sipariş Yönetimi</h1>
        <p className="page-subtitle">Tüm kanallardan gelen siparişlerin merkezi izleme ekranı</p>
      </div>

      <div className="filters-card">
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <select className="form-select" value={channel} onChange={e => setChannel(e.target.value)}>
              {CHANNELS.map(c => <option key={c} value={c}>{c ? `${CHANNEL_ICONS[c]} ${c.toUpperCase()}` : '🌐 Tüm Kanallar'}</option>)}
            </select>
          </div>
          <span className="results-count">{orders.count} adet sipariş listelendi</span>
        </div>
        <button className="btn-secondary" onClick={load} disabled={loading}>
          {loading ? 'Yükleniyor...' : '🔄 Yenile'}
        </button>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Sipariş ID</th>
              <th>Kanal</th>
              <th>Müşteri</th>
              <th>Durum</th>
              <th>Tutar</th>
              <th>EDM Fatura</th>
              <th>İşbaşı Fatura</th>
              <th>Tarih</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {(orders.rows || []).map(o => (
              <tr key={o.id}>
                <td><strong>#{o.id}</strong></td>
                <td className="capitalize">{CHANNEL_ICONS[o.channel]} {o.channel}</td>
                <td>{o.customer_name || '—'}</td>
                <td>
                  <span className={`badge ${o.status === 'paid' || o.status === 'approved' ? 'badge-success' : 'badge-info'}`}>
                    {o.status}
                  </span>
                </td>
                <td>{o.total_amount} {o.currency}</td>
                <td>
                  {o.edm_invoice_id ? (
                    <span className="invoice-badge edm">🧾 {o.edm_invoice_id}</span>
                  ) : (
                    <span className="invoice-badge-empty">—</span>
                  )}
                </td>
                <td>
                  {o.isbasi_invoice_id ? (
                    <span className="invoice-badge isbasi">🏢 {o.isbasi_invoice_id}</span>
                  ) : (
                    <span className="invoice-badge-empty">—</span>
                  )}
                </td>
                <td className="time-text">{new Date(o.created_at).toLocaleDateString('tr-TR')}</td>
                <td>
                  <button className="btn-action" onClick={() => setSelected(o)}>Detay</button>
                </td>
              </tr>
            ))}
            {(!orders.rows || orders.rows.length === 0) && (
              <tr>
                <td colSpan="9" className="empty-message">Kriterlere uygun sipariş bulunamadı.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Sipariş Detayı — #{selected.id}</h2>
              <button className="modal-close-btn" onClick={() => setSelected(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="order-details-grid">
                <div>
                  <h4 className="detail-title">Kanal Bilgisi</h4>
                  <p className="detail-value capitalize">{CHANNEL_ICONS[selected.channel]} {selected.channel}</p>
                </div>
                <div>
                  <h4 className="detail-title">Kanal Sipariş Numarası</h4>
                  <p className="detail-value">#{selected.channel_order_id}</p>
                </div>
                <div>
                  <h4 className="detail-title">Müşteri</h4>
                  <p className="detail-value">{selected.customer_name || '—'}</p>
                  <p className="detail-subvalue">{selected.customer_email || ''}</p>
                </div>
                <div>
                  <h4 className="detail-title">Toplam Tutar</h4>
                  <p className="detail-value highlight">{selected.total_amount} {selected.currency}</p>
                </div>
              </div>

              <h4 className="detail-title" style={{ marginTop: 20 }}>Sipariş Kalemleri</h4>
              <div className="order-items-list">
                {Array.isArray(selected.items) && selected.items.map((item, idx) => (
                  <div key={idx} className="order-item-row">
                    <div style={{ flex: 1 }}>
                      <strong>{item.title}</strong>
                      <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>SKU: {item.sku || 'Belirtilmemiş'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div>{item.quantity} x {item.price} {selected.currency}</div>
                      <div style={{ fontSize: 11, color: '#22c55e', marginTop: 2 }}>KDV: %{item.vat_rate || 20}</div>
                    </div>
                  </div>
                ))}
              </div>

              <h4 className="detail-title" style={{ marginTop: 20 }}>Entegrasyon Bilgileri</h4>
              <div className="order-details-grid">
                <div>
                  <h4 className="detail-title">Logo İşbaşı Fatura ID</h4>
                  <p className="detail-value" style={{ fontSize: 13 }}>{selected.isbasi_invoice_id || 'Oluşturulmamış'}</p>
                </div>
                <div>
                  <h4 className="detail-title">EDM Fatura ID</h4>
                  <p className="detail-value" style={{ fontSize: 13 }}>{selected.edm_invoice_id || 'Oluşturulmamış'}</p>
                </div>
              </div>

              <h4 className="detail-title" style={{ marginTop: 20 }}>Raw JSON Payloadi</h4>
              <pre className="raw-json-block">{JSON.stringify(selected, null, 2)}</pre>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelected(null)}>Kapat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
