const express = require('express');
const router = express.Router();
const { processOrder } = require('../services/orderOrchestrator');
const { propagateStock } = require('../services/syncEngine');

// Shopify order webhook
router.post('/shopify', async (req, res) => {
  try {
    const order = await processOrder('shopify', {
      id: req.body.id,
      status: req.body.financial_status,
      totalPrice: req.body.total_price,
      currency: req.body.currency,
      customer: {
        name: `${req.body.customer?.first_name || ''} ${req.body.customer?.last_name || ''}`.trim() || 'Shopify Customer',
        email: req.body.customer?.email,
      },
      items: (req.body.line_items || []).map(li => ({
        sku: li.sku,
        title: li.title,
        quantity: li.quantity,
        price: li.price,
        vat_rate: 20,
      })),
    });
    res.json({ success: true, orderId: order.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Trendyol order webhook
router.post('/trendyol', async (req, res) => {
  try {
    const order = await processOrder('trendyol', req.body);
    res.json({ success: true, orderId: order.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Hepsiburada order webhook
router.post('/hepsiburada', async (req, res) => {
  try {
    const order = await processOrder('hepsiburada', req.body);
    res.json({ success: true, orderId: order.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// İşbaşı stock change webhook
router.post('/isbasi/stock', async (req, res) => {
  try {
    const { sku, quantity } = req.body;
    const result = await propagateStock(sku, quantity, 'isbasi');
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generic webhook simulator (for testing)
router.post('/simulate/:channel', async (req, res) => {
  try {
    const order = await processOrder(req.params.channel, req.body);
    res.json({ success: true, orderId: order.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
