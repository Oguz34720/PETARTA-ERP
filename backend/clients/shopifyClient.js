const axios = require('axios');
require('dotenv').config();

let Channel;
try {
  // Dynamically require to avoid circular dependencies during initialization
  const models = require('../models');
  Channel = models.Channel;
} catch (e) {
  console.error('Failed to load Channel model in shopifyClient:', e);
}

async function mockDelay() {
  return new Promise(r => setTimeout(r, 200 + Math.random() * 300));
}

async function getApiClient() {
  let token = process.env.SHOPIFY_ACCESS_TOKEN;
  let shop = process.env.SHOPIFY_SHOP_DOMAIN || 'mock.myshopify.com';

  if (Channel) {
    try {
      const ch = await Channel.findOne({ where: { channel: 'shopify' } });
      if (ch && ch.is_active && ch.api_key) {
        token = ch.api_key;
        if (ch.extra_config && ch.extra_config.shop) {
          shop = ch.extra_config.shop;
        }
      }
    } catch (err) {
      console.error('Shopify dynamic token load failed:', err.message);
    }
  }

  const isMock = !token;

  const client = axios.create({
    baseURL: `https://${shop}/admin/api/2026-07`,
    headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' },
  });

  return { client, isMock };
}

async function updateStock(sku, qty) {
  const { client, isMock } = await getApiClient();
  if (isMock) {
    await mockDelay();
    console.log(`[MOCK] Shopify updateStock SKU=${sku} qty=${qty}`);
    return { success: true, mock: true };
  }
  
  // Real: find inventory_item_id by SKU, then set level
  const variantsRes = await client.get(`/variants.json?sku=${sku}`);
  const variant = variantsRes.data.variants?.[0];
  if (!variant) throw new Error(`Shopify: variant not found for SKU ${sku}`);

  const locRes = await client.get('/locations.json');
  const locationId = locRes.data.locations[0].id;

  await client.post('/inventory_levels/set.json', {
    location_id: locationId,
    inventory_item_id: variant.inventory_item_id,
    available: qty,
  });
  return { success: true };
}

async function getOrders(params = {}) {
  const { client, isMock } = await getApiClient();
  if (isMock) {
    await mockDelay();
    return { orders: [] };
  }
  const res = await client.get('/orders.json', { params: { status: 'open', limit: 50, ...params } });
  return res.data;
}

async function fulfillOrder(orderId, trackingInfo = {}) {
  const { client, isMock } = await getApiClient();
  if (isMock) { await mockDelay(); return { success: true, mock: true }; }
  const res = await client.post(`/orders/${orderId}/fulfillments.json`, {
    fulfillment: { notify_customer: true, ...trackingInfo }
  });
  return res.data;
}

async function cancelOrder(orderId) {
  const { client, isMock } = await getApiClient();
  if (isMock) { await mockDelay(); return { success: true, mock: true }; }
  const res = await client.post(`/orders/${orderId}/cancel.json`);
  return res.data;
}

async function getProducts() {
  const { client, isMock } = await getApiClient();
  if (isMock) {
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
  const res = await client.get('/products.json?limit=250');
  return res.data;
}

module.exports = { updateStock, getOrders, fulfillOrder, cancelOrder, getProducts };
