const axios = require('axios');
require('dotenv').config();

const { ISBASI_API_URL, ISBASI_API_KEY } = process.env;
const MOCK = !ISBASI_API_KEY;

const api = axios.create({
  baseURL: ISBASI_API_URL || 'https://api.isbasi.com',
  headers: { 'Authorization': `Bearer ${ISBASI_API_KEY}`, 'Content-Type': 'application/json' },
});

async function mockDelay() { return new Promise(r => setTimeout(r, 200 + Math.random() * 300)); }

async function getStock(sku) {
  if (MOCK) { await mockDelay(); return { sku, quantity: Math.floor(Math.random() * 100) }; }
  const res = await api.get(`/stock/${sku}`);
  return res.data;
}

async function updateStock(sku, qty) {
  if (MOCK) { await mockDelay(); return { success: true, mock: true }; }
  const res = await api.put(`/stock/${sku}`, { quantity: qty });
  return res.data;
}

async function createOrder(order) {
  if (MOCK) { await mockDelay(); return { invoiceId: `ISB-MOCK-${Date.now()}` }; }
  const res = await api.post('/orders', order);
  return res.data;
}

async function createInvoice(data) {
  if (MOCK) { await mockDelay(); return { invoiceId: `ISB-INV-${Date.now()}` }; }
  const res = await api.post('/invoices', data);
  return res.data;
}

async function getProducts() {
  if (MOCK) {
    await mockDelay();
    return {
      products: [
        { sku: "SKU-IPHONE15", name: "iPhone 15 Black (Logo İşbaşı)", quantity: 45 },
        { sku: "SKU-MACBOOKPRO", name: "MacBook Pro 14 (Logo İşbaşı)", quantity: 12 },
        { sku: "SKU-AIRPODSPRO", name: "AirPods Pro 2 (Logo İşbaşı)", quantity: 120 },
        { sku: "SKU-IPADPRO", name: "iPad Pro M4 (Logo İşbaşı)", quantity: 15 }
      ]
    };
  }
  const res = await api.get('/products');
  return res.data;
}

module.exports = { getStock, updateStock, createOrder, createInvoice, getProducts };
