import { useEffect, useState } from 'react';
import axios from 'axios';

import { API } from '../config';

const CHANNELS = [
  { key: 'shopify_variant_id', label: 'Shopify Variant ID', icon: '🛍️' },
  { key: 'trendyol_barcode', label: 'Trendyol Barcode', icon: '🟠' },
  { key: 'hepsiburada_sku', label: 'Hepsiburada SKU', icon: '🟣' },
  { key: 'amazon_asin', label: 'Amazon ASIN', icon: '📦' },
  { key: 'n11_product_id', label: 'N11 Product ID', icon: '🔵' },
  { key: 'pazarama_product_id', label: 'Pazarama Product ID', icon: '🟡' },
  { key: 'beymen_product_id', label: 'Beymen Product ID', icon: '⚫' },
  { key: 'defacto_product_id', label: 'Defacto Product ID', icon: '🔴' },
  { key: 'hipicon_product_id', label: 'Hipicon Product ID', icon: '🟢' },
  { key: 'lcw_product_id', label: 'LCW Product ID', icon: '🟤' }
];

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [adjustSku, setAdjustSku] = useState('');
  const [adjustQty, setAdjustQty] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [importChannel, setImportChannel] = useState('shopify');
  
  // Editing state
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ sku: '', name: '', master_quantity: 0, mapping: {} });

  const load = () => {
    setLoading(true);
    axios.get(`${API}/api/inventory`)
      .then(r => setItems(r.data))
      .finally(() => setLoading(false));
  };
  
  useEffect(() => { load(); }, []);

  const adjust = async () => {
    if (!adjustSku || adjustQty === '') {
      setMsg('❌ Lütfen geçerli bir SKU ve miktar girin.');
      return;
    }
    try {
      setMsg('⏳ Stok güncelleniyor ve yayılıyor...');
      await axios.post(`${API}/api/inventory/adjust`, { sku: adjustSku, quantity: parseInt(adjustQty), source: 'manual' });
      setMsg('✅ Stok güncellendi ve tüm kanallara yayıldı');
      load();
    } catch (e) {
      setMsg('❌ Hata: ' + e.message);
    }
  };

  const importFromChannel = async () => {
    setLoading(true);
    setMsg(`⏳ ${importChannel.toUpperCase()} ürünleri ve SKU eşleştirmeleri çekiliyor...`);
    try {
      const res = await axios.post(`${API}/api/inventory/import/${importChannel}`);
      setMsg(`✅ ${importChannel.toUpperCase()} kanalından ${res.data.count} ürün başarıyla içe aktarıldı ve eşleştirildi.`);
      load();
    } catch (e) {
      setMsg('❌ İçe aktarma hatası: ' + (e.response?.data?.error || e.message));
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item) => {
    setEditingItem(item.sku);
    setEditForm({
      sku: item.sku,
      name: item.name || '',
      master_quantity: item.master_quantity,
      mapping: item.mapping || {}
    });
  };

  const handleMappingChange = (key, val) => {
    setEditForm(f => ({
      ...f,
      mapping: {
        ...f.mapping,
        [key]: val
      }
    }));
  };

  const saveEdit = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/api/inventory/edit`, editForm);
      setMsg('✅ Ürün bilgileri ve pazaryeri eşleştirmeleri güncellendi, stoklar yayıldı.');
      setEditingItem(null);
      load();
    } catch (e) {
      setMsg('❌ Kaydetme hatası: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-title-section">
        <h1 className="page-title">Stok ve Ürün Yönetimi</h1>
        <p className="page-subtitle">Merkezi ürün detayları, envanter takibi ve tüm pazaryeri eşleştirmeleri</p>
      </div>

      <div className="quick-adjust-card">
        <h3 className="section-title">Manuel Stok Düzeltme & Yayma</h3>
        <div className="adjust-form">
          <div className="form-group">
            <label className="form-label">SKU</label>
            <input className="form-input" value={adjustSku} onChange={e => setAdjustSku(e.target.value)} placeholder="SKU123" />
          </div>
          <div className="form-group">
            <label className="form-label">Yeni Miktar</label>
            <input type="number" className="form-input" value={adjustQty} onChange={e => setAdjustQty(e.target.value)} placeholder="50" style={{ width: 120 }} />
          </div>
          <button onClick={adjust} className="btn-primary">
            Güncelle & Yay
          </button>
        </div>
        {msg && <div className="form-message">{msg}</div>}
      </div>

      <div className="table-wrapper">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 className="section-title" style={{ margin: 0 }}>Merkezi Ürün & Stok Listesi</h3>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <select className="form-select" value={importChannel} onChange={e => setImportChannel(e.target.value)} style={{ width: 160, margin: 0 }}>
              <option value="shopify">🛍️ Shopify</option>
              <option value="trendyol">🟠 Trendyol</option>
              <option value="hepsiburada">🟣 Hepsiburada</option>
              <option value="amazon">📦 Amazon</option>
              <option value="n11">🔵 N11</option>
              <option value="pazarama">🟡 Pazarama</option>
              <option value="beymen">⚫ Beymen</option>
              <option value="defacto">🔴 Defacto</option>
              <option value="hipicon">🟢 Hipicon</option>
              <option value="lcw">🟤 LCW</option>
              <option value="isbasi">🏢 Logo İşbaşı</option>
            </select>
            <button className="btn-primary" onClick={importFromChannel} disabled={loading}>
              İçe Aktar
            </button>
            <button className="btn-secondary" onClick={load} disabled={loading}>
              {loading ? 'Yükleniyor...' : '🔄 Yenile'}
            </button>
          </div>
        </div>
        
        <table className="data-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Ürün Adı</th>
              <th>Master Stok</th>
              <th>Rezerve</th>
              <th>Kullanılabilir</th>
              <th>Bağlantılar</th>
              <th>Son Sync</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {items.map(i => {
              const activeMappings = CHANNELS.filter(c => i.mapping && i.mapping[c.key]);
              return (
                <tr key={i.id}>
                  <td><strong>{i.sku}</strong></td>
                  <td>{i.name || <span style={{ color: '#6b7280', fontStyle: 'italic' }}>— İsimsiz Ürün —</span>}</td>
                  <td>{i.master_quantity}</td>
                  <td style={{ color: '#f59e0b', fontWeight: 600 }}>{i.reserved_quantity}</td>
                  <td>
                    <span className={`stock-level-badge ${i.available_quantity > 10 ? 'high' : i.available_quantity > 0 ? 'low' : 'out'}`}>
                      {i.available_quantity}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {activeMappings.map(m => (
                        <span key={m.key} title={`${m.label}: ${i.mapping[m.key]}`} style={{ fontSize: 16 }}>
                          {m.icon}
                        </span>
                      ))}
                      {activeMappings.length === 0 && (
                        <span style={{ color: '#ef4444', fontSize: 11, fontWeight: 700 }}>Eşleştirilmemiş</span>
                      )}
                    </div>
                  </td>
                  <td className="time-text">{i.last_synced_at ? new Date(i.last_synced_at).toLocaleString('tr-TR') : '—'}</td>
                  <td>
                    <button className="btn-action" onClick={() => startEdit(i)}>Düzenle</button>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan="8" className="empty-message">Veritabanında henüz stok kaydı bulunamadı. Kanal ayarlarından pazaryerini bağlayıp "İçe Aktar" butonuna tıklayabilirsiniz.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingItem && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ width: 620 }}>
            <div className="modal-header">
              <h2>Ürün ve Eşleştirme Düzenleme — SKU: {editForm.sku}</h2>
              <button className="modal-close-btn" onClick={() => setEditingItem(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Ürün Adı</label>
                <input className="form-input" style={{ width: '100%' }} value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} placeholder="Ürün adını girin" />
              </div>
              
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Master Stok Adedi (Gerçek Stok)</label>
                <input type="number" className="form-input" style={{ width: 150 }} value={editForm.master_quantity} onChange={e => setEditForm(f => ({ ...f, master_quantity: parseInt(e.target.value) || 0 }))} />
              </div>

              <h4 className="detail-title" style={{ marginTop: 20, marginBottom: 10, borderBottom: '1px solid var(--border-light)', paddingBottom: 6 }}>Pazaryeri / ERP Entegrasyon Eşleştirmeleri</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {CHANNELS.map(ch => (
                  <div key={ch.key} className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{ch.icon}</span> {ch.label}
                    </label>
                    <input className="form-input" style={{ width: '100%', fontSize: 13 }} value={editForm.mapping[ch.key] || ''} onChange={e => handleMappingChange(ch.key, e.target.value)} placeholder="Barcode / Variant ID" />
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setEditingItem(null)}>İptal</button>
              <button className="btn-primary" onClick={saveEdit}>Stok Güncelle & Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
