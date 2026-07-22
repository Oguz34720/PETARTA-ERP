import { useEffect, useState } from 'react';
import axios from 'axios';

import { API } from '../config';
const CHANNEL_ICONS = { shopify:'🛍️', trendyol:'🟠', hepsiburada:'🟣', amazon:'📦', n11:'🔵', pazarama:'🟡', beymen:'⚫', defacto:'🔴', hipicon:'🟢', lcw:'🟤', isbasi:'🏢', edm:'🧾' };

export default function Channels() {
  const [channels, setChannels] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    axios.get(`${API}/api/channels`)
      .then(r => setChannels(r.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth_success') === 'shopify') {
      setMsg('🎉 Shopify mağazanız başarıyla bağlandı ve yetkilendirildi!');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const save = async () => {
    try {
      await axios.patch(`${API}/api/channels/${editing}`, form);
      setMsg('✅ Ayarlar başarıyla kaydedildi');
      setEditing(null);
      load();
    } catch (e) {
      setMsg('❌ Kaydedilemedi: ' + e.message);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-title-section">
        <h1 className="page-title">Entegrasyon Kanalları</h1>
        <p className="page-subtitle">Pazaryerleri, ERP ve E-Fatura entegrasyonu API ayarları</p>
      </div>

      {msg && <div className="toast-message">{msg}</div>}
      
      {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#9fa6bc' }}>⏳ Kanallar yükleniyor...</div>}
      {error && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#ef4444', marginBottom: 12 }}>❌ Bağlantı Hatası: API sunucusuna erişilemedi ({error})</p>
          <button className="btn-secondary" onClick={load}>Tekrar Dene</button>
        </div>
      )}
      {!loading && !error && (
        <div className="channels-grid">
          {channels.map(ch => (
            <div key={ch.channel} className={`channel-settings-card ${ch.is_active ? 'active' : 'inactive'}`}>
              <div className="card-header">
                <span className="card-logo">{CHANNEL_ICONS[ch.channel] || '🔌'}</span>
                <span className="card-title capitalize">{ch.channel}</span>
              </div>
              
              <div className="card-body">
                <div className="status-indicator">
                  <span className="status-dot"></span>
                  {ch.is_active ? 'Entegrasyon Aktif' : 'Entegrasyon Devre Dışı'}
                </div>
                <div className="api-preview">
                  <strong>API Key:</strong> {ch.api_key || <span style={{ color: '#ef4444' }}>Tanımsız</span>}
                </div>
              </div>
              
              <div className="card-footer">
                <button className="btn-action-block" onClick={() => { setEditing(ch.channel); setForm({ is_active: ch.is_active, api_key: '', api_secret: '' }); setMsg(''); }}>
                  ⚙️ Düzenle
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="modal-backdrop">
          <div className="modal-content small">
            <div className="modal-header">
              <h2 className="capitalize">{editing} Entegrasyon Ayarları</h2>
              <button className="modal-close-btn" onClick={() => setEditing(null)}>×</button>
            </div>
            
            <div className="modal-body">
              {editing === 'shopify' && (
                <div style={{ padding: 12, backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: 8, marginBottom: 16, border: '1px dashed #3b82f6' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: 14, color: '#60a5fa' }}>⚡ Otomatik Shopify Bağlantısı</h4>
                  <p style={{ margin: '0 0 12px 0', fontSize: 12, color: '#9fa6bc' }}>Mağazanızı tek tıkla bağlamak için myshopify alan adınızı yazın ve "Bağlan"a tıklayın.</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ flex: 1, fontSize: 13 }} 
                      id="shopifyShopInput"
                      name="shopify_shop"
                      placeholder="h1yrck-ch.myshopify.com" 
                      value={form.shopify_shop || ''} 
                      onChange={e => setForm(f => ({ ...f, shopify_shop: e.target.value }))} 
                    />
                    <button 
                      type="button" 
                      className="btn-primary" 
                      style={{ padding: '0 16px', fontSize: 13, height: 38 }}
                      onClick={() => {
                        const shop = form.shopify_shop || 'h1yrck-ch.myshopify.com';
                        window.location.href = `${API}/api/auth/shopify?shop=${shop}&redirect_host=${window.location.origin}/channels`;
                      }}
                    >
                      Bağlan
                    </button>
                  </div>
                </div>
              )}

              <div className="form-group-checkbox">
                <input type="checkbox" id="active-checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
                <label htmlFor="active-checkbox">Bu kanalı aktifleştir ve veri senkronizasyonunu başlat</label>
              </div>
              
              <div className="form-group">
                <label htmlFor="channelApiKey" className="form-label">API Key / Token</label>
                <input id="channelApiKey" name="api_key" className="form-input" value={form.api_key} onChange={e => setForm(f => ({ ...f, api_key: e.target.value }))} placeholder="Yeni API key girin" />
              </div>
              
              <div className="form-group">
                <label htmlFor="channelApiSecret" className="form-label">API Secret / Password</label>
                <input id="channelApiSecret" name="api_secret" type="password" className="form-input" value={form.api_secret} onChange={e => setForm(f => ({ ...f, api_secret: e.target.value }))} placeholder="Yeni secret girin" />
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setEditing(null)}>İptal</button>
              <button className="btn-primary" onClick={save}>Ayarları Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
