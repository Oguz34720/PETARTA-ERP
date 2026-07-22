import { useEffect, useState } from 'react';
import axios from 'axios';

import { API } from '../config';
const CHANNEL_ICONS = { shopify:'🛍️', trendyol:'🟠', hepsiburada:'🟣', amazon:'📦', n11:'🔵', pazarama:'🟡', beymen:'⚫', defacto:'🔴', hipicon:'🟢', lcw:'🟤' };

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    axios.get(`${API}/api/invoices`)
      .then(r => setInvoices(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="fade-in">
      <div className="page-title-section">
        <h1 className="page-title">E-Fatura Entegrasyon Takibi</h1>
        <p className="page-subtitle">EDM Fatura ve Logo İşbaşı entegrasyonu ile kesilen e-fatura listesi</p>
      </div>

      <div className="table-wrapper">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 className="section-title" style={{ margin: 0 }}>Fatura Kayıtları</h3>
          <button className="btn-secondary" onClick={load} disabled={loading}>
            {loading ? 'Yükleniyor...' : '🔄 Yenile'}
          </button>
        </div>
        
        <table className="data-table">
          <thead>
            <tr>
              <th>Sipariş ID</th>
              <th>Kaynak Kanal</th>
              <th>Müşteri</th>
              <th>Toplam Tutar</th>
              <th>EDM Fatura ID</th>
              <th>Logo İşbaşı Fatura ID</th>
              <th>Oluşturulma Tarihi</th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id}>
                <td><strong>#{inv.id}</strong></td>
                <td className="capitalize">{CHANNEL_ICONS[inv.channel]} {inv.channel}</td>
                <td>{inv.customer_name || '—'}</td>
                <td><strong>{inv.total_amount} {inv.currency}</strong></td>
                <td>
                  <span className="invoice-badge edm">🧾 {inv.edm_invoice_id}</span>
                </td>
                <td>
                  <span className="invoice-badge isbasi">🏢 {inv.isbasi_invoice_id}</span>
                </td>
                <td className="time-text">{new Date(inv.created_at).toLocaleString('tr-TR')}</td>
                <td>
                  <span className="badge badge-success">Onaylandı</span>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan="8" className="empty-message">Henüz kesilmiş fatura kaydı bulunmuyor.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
