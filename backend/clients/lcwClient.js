const CHANNEL = 'lcw';
const API_KEY = process.env[`${CHANNEL.toUpperCase()}_API_KEY`];
const MOCK = !API_KEY;

async function mockDelay() { return new Promise(r => setTimeout(r, 200 + Math.random() * 300)); }

async function updateStock(sku, qty) {
  if (MOCK) { await mockDelay(); console.log(`[MOCK] ${CHANNEL} updateStock SKU=${sku} qty=${qty}`); return { success: true, mock: true }; }
  // TODO: Real API call
}

async function getOrders(params = {}) {
  if (MOCK) { await mockDelay(); return { orders: [] }; }
  // TODO: Real API call
}

async function getProducts() {
  if (MOCK) {
    await mockDelay();
    return {
      products: [
        { sku: "SKU-IPHONE15", name: "iPhone 15 Black (LCW)", quantity: 45 },
        { sku: "SKU-MACBOOKPRO", name: "MacBook Pro 14 (LCW)", quantity: 12 },
        { sku: "SKU-AIRPODSPRO", name: "AirPods Pro 2 (LCW)", quantity: 122 }
      ]
    };
  }
  // TODO: Real API call
}

module.exports = { updateStock, getOrders, getProducts };
