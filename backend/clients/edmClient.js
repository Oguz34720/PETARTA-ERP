const axios = require('axios');
require('dotenv').config();

const { EDM_API_URL, EDM_API_KEY } = process.env;
const MOCK = !EDM_API_KEY;

const api = axios.create({
  baseURL: EDM_API_URL || 'https://api.edm.com.tr',
  headers: { 'Authorization': `Bearer ${EDM_API_KEY}`, 'Content-Type': 'application/json' },
});

async function mockDelay() { return new Promise(r => setTimeout(r, 300 + Math.random() * 400)); }

async function createInvoice(data) {
  if (MOCK) {
    await mockDelay();
    return { invoiceId: `EDM-MOCK-${Date.now()}`, status: 'draft' };
  }
  const res = await api.post('/einvoice/create', data);
  return res.data;
}

async function getInvoiceStatus(invoiceId) {
  if (MOCK) { await mockDelay(); return { invoiceId, status: 'approved' }; }
  const res = await api.get(`/einvoice/${invoiceId}`);
  return res.data;
}

module.exports = { createInvoice, getInvoiceStatus };
