const axios = require('axios');
require('dotenv').config();

const { TRENDYOL_SUPPLIER_ID, TRENDYOL_API_KEY, TRENDYOL_API_SECRET } = process.env;
const MOCK = !TRENDYOL_API_KEY;

const api = axios.create({
  baseURL: `https://api.trendyol.com/sapigw/suppliers/${TRENDYOL_SUPPLIER_ID || 'mock_supplier'}`,
  auth: { username: TRENDYOL_API_KEY, password: TRENDYOL_API_SECRET },
  headers: { 'Content-Type': 'application/json', 'User-Agent': `${TRENDYOL_SUPPLIER_ID || 'mock'} - SelfIntegration` },
});

async function mockDelay() { return new Promise(r => setTimeout(r, 200 + Math.random() * 300)); }

async function updateStock(sku, qty) {
  if (MOCK) { await mockDelay(); console.log(`[MOCK] Trendyol updateStock SKU=${sku} qty=${qty}`); return { success: true, mock: true }; }
  const res = await api.post('/products/price-and-inventory', {
    items: [{ barcode: sku, quantity: qty }]
  });
  return res.data;
}

async function getOrders(params = {}) {
  if (MOCK) { await mockDelay(); return { content: [] }; }
  const res = await api.get('/orders', { params: { status: 'Created', size: 50, ...params } });
  return res.data;
}

async function shipOrder(shipmentPackageId, lines) {
  if (MOCK) { await mockDelay(); return { success: true, mock: true }; }
  const res = await api.put(`/shipment-packages/${shipmentPackageId}`, { lines });
  return res.data;
}

async function getProducts() {
  if (MOCK) {
    await mockDelay();
    return {
      items: [
        { barcode: "SKU-IPHONE15", productName: "iPhone 15 Black (Trendyol)", quantity: 40 },
        { barcode: "SKU-MACBOOKPRO", productName: "MacBook Pro 14 (Trendyol)", quantity: 10 },
        { barcode: "SKU-AIRPODSPRO", productName: "AirPods Pro 2 (Trendyol)", quantity: 110 }
      ]
    };
  }
  const res = await api.get('/products', { params: { approved: true, size: 100 } });
  return res.data;
}

module.exports = { updateStock, getOrders, shipOrder, getProducts };
