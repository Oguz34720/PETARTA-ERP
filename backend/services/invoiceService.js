const isbasiClient = require('../clients/isbasiClient');
const edmClient = require('../clients/edmClient');
const { Order } = require('../models');

async function createInvoices(order) {
  let isbasi_invoice_id = null;
  let edm_invoice_id = null;

  // 1. Logo İşbaşı draft invoice
  try {
    const isbasiRes = await isbasiClient.createInvoice({
      customerName: order.customer_name,
      items: order.items,
      totalAmount: order.total_amount,
      currency: order.currency,
      channelOrderId: order.channel_order_id,
      channel: order.channel,
    });
    isbasi_invoice_id = isbasiRes.invoiceId;
  } catch (err) {
    console.error('İşbaşı invoice error:', err.message);
  }

  // 2. EDM e-invoice
  try {
    const edmRes = await edmClient.createInvoice({
      buyerName: order.customer_name,
      buyerEmail: order.customer_email,
      buyerTCKN: order.customer_tckn || null,
      buyerTaxNo: order.customer_tax_no || null,
      lines: order.items.map(item => ({
        name: item.title,
        quantity: item.quantity,
        unitPrice: item.price,
        vatRate: item.vat_rate || 20,
      })),
      channel: order.channel,
      channelOrderId: order.channel_order_id,
    });
    edm_invoice_id = edmRes.invoiceId;
  } catch (err) {
    console.error('EDM invoice error:', err.message);
  }

  // 3. Update order record
  await Order.update(
    { isbasi_invoice_id, edm_invoice_id },
    { where: { id: order.id } }
  );

  return { isbasi_invoice_id, edm_invoice_id };
}

module.exports = { createInvoices };
