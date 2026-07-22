const axios = require('axios');
require('dotenv').config();

const { SHOPIFY_SHOP_DOMAIN, SHOPIFY_ACCESS_TOKEN } = process.env;
const MOCK = !SHOPIFY_ACCESS_TOKEN;

const api = axios.create({
  baseURL: `https://${SHOPIFY_SHOP_DOMAIN || 'mock.myshopify.com'}/admin/api/2026-07`,
  headers: { 'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN, 'Content-Type': 'application/json' },
});

async function mockDelay() {
  return new Promise(r => setTimeout(r, 200 + Math.random() * 300));
}

async function updateStock(sku, qty) {
  if (MOCK) {
    await mockDelay();
    console.log(`[MOCK] Shopify updateStock SKU=${sku} qty=${qty}`);
    return { success: true, mock: true };
  }
  // Real: find inventory_item_id by SKU, then set level
  const variantsRes = await api.get(`/variants.json?sku=${sku}`);
  const variant = variantsRes.data.variants?.[0];
  if (!variant) throw new Error(`Shopify: variant not found for SKU ${sku}`);

  const locRes = await api.get('/locations.json');
  const locationId = locRes.data.locations[0].id;

  await api.post('/inventory_levels/set.json', {
    location_id: locationId,
    inventory_item_id: variant.inventory_item_id,
    available: qty,
  });
  return { success: true };
}

async function getOrders(params = {}) {
  if (MOCK) {
    await mockDelay();
    return { orders: [] };
  }
  const res = await api.get('/orders.json', { params: { status: 'open', limit: 50, ...params } });
  return res.data;
}

async function fulfillOrder(orderId, trackingInfo = {}) {
  if (MOCK) { await mockDelay(); return { success: true, mock: true }; }
  const res = await api.post(`/orders/${orderId}/fulfillments.json`, {
    fulfillment: { notify_customer: true, ...trackingInfo }
  });
  return res.data;
}

async function cancelOrder(orderId) {
  if (MOCK) { await mockDelay(); return { success: true, mock: true }; }
  const res = await api.post(`/orders/${orderId}/cancel.json`);
  return res.data;
}

async function getProducts() {
  if (MOCK) {
    await mockDelay();
    return {
      products: [
        {
          id: 123456,
          title: "iPhone 15 Black",
          variants: [
            { id: 4589210485901, sku: "SKU-IPHONE15", inventory_quantity: 45, inventory_item_id: 99123 }
          ]
        },
        {
          id: 789012,
          title: "MacBook Pro 14",
          variants: [
            { id: 4589210485902, sku: "SKU-MACBOOKPRO", inventory_quantity: 12, inventory_item_id: 99456 }
          ]
        }
      ]
    };
  }
  const res = await api.get('/products.json?limit=250');
  return res.data;
}

module.exports = { updateStock, getOrders, fulfillOrder, cancelOrder, getProducts };
