const { Order } = require('../models');
const { reserveStock, deductStock } = require('./syncEngine');
const { createInvoices } = require('./invoiceService');
const isbasiClient = require('../clients/isbasiClient');

async function processOrder(channel, rawOrder) {
  // 1. Normalize & save order
  const order = await Order.create({
    channel,
    channel_order_id: String(rawOrder.id || rawOrder.orderId),
    status: rawOrder.status || 'new',
    total_amount: rawOrder.totalPrice || rawOrder.totalAmount,
    currency: rawOrder.currency || 'TRY',
    customer_name: rawOrder.customer?.name || rawOrder.customerName,
    customer_email: rawOrder.customer?.email || rawOrder.customerEmail,
    customer_tckn: rawOrder.customer?.tckn || null,
    customer_tax_no: rawOrder.customer?.taxNo || null,
    items: rawOrder.items || rawOrder.lines || [],
    synced_at: new Date(),
  });

  // 2. Reserve & deduct stock per item
  for (const item of order.items) {
    if (item.sku) {
      try {
        await reserveStock(item.sku, item.quantity);
        await deductStock(item.sku, item.quantity, channel);
      } catch (err) {
        console.error(`Stock error for SKU ${item.sku}:`, err.message);
      }
    }
  }

  // 3. Send to Logo İşbaşı
  try {
    await isbasiClient.createOrder(order);
  } catch (err) {
    console.error('İşbaşı order sync error:', err.message);
  }

  // 4. Create invoices
  await createInvoices(order);

  return order;
}

module.exports = { processOrder };
