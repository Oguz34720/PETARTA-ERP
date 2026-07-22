const axios = require('axios');
require('dotenv').config();

const { HEPSIBURADA_USERNAME, HEPSIBURADA_PASSWORD } = process.env;
const MOCK = !HEPSIBURADA_USERNAME;

const api = axios.create({
  baseURL: 'https://listing-external.hepsiburada.com',
  auth: { username: HEPSIBURADA_USERNAME, password: HEPSIBURADA_PASSWORD },
  headers: { 'Content-Type': 'application/json' },
});

async function mockDelay() { return new Promise(r => setTimeout(r, 200 + Math.random() * 300)); }

async function updateStock(sku, qty) {
  if (MOCK) { await mockDelay(); console.log(`[MOCK] Hepsiburada updateStock SKU=${sku} qty=${qty}`); return { success: true, mock: true }; }
  const res = await api.post('/listings/merchantsku/stock-uploads', {
    listings: [{ merchantSku: sku, availableStock: qty }]
  });
  return res.data;
}

async function getOrders(params = {}) {
  if (MOCK) { await mockDelay(); return { data: [] }; }
  const res = await api.get('/orders', { params });
  return res.data;
}

async function getProducts() {
  if (MOCK) {
    await mockDelay();
    return {
      listings: [
        { merchantSku: "SKU-IPHONE15", productName: "iPhone 15 Black (Hepsiburada)", availableStock: 42 },
        { merchantSku: "SKU-MACBOOKPRO", productName: "MacBook Pro 14 (Hepsiburada)", availableStock: 11 },
        { merchantSku: "SKU-AIRPODSPRO", productName: "AirPods Pro 2 (Hepsiburada)", availableStock: 115 }
      ]
    };
  }
  const res = await api.get('/listings', { params: { limit: 100 } });
  return { listings: res.data };
}

module.exports = { updateStock, getOrders, getProducts };
