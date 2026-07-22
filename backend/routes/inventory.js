const express = require('express');
const router = express.Router();
const { Inventory, ProductMapping } = require('../models');
const { propagateStock } = require('../services/syncEngine');

router.get('/', async (req, res) => {
  try {
    const items = await Inventory.findAll({ order: [['updated_at', 'DESC']] });
    const mappings = await ProductMapping.findAll();
    const mappingsMap = new Map(mappings.map(m => [m.sku, m.toJSON()]));

    const result = items.map(i => {
      const mapped = mappingsMap.get(i.sku) || {};
      return {
        ...i.toJSON(),
        available_quantity: i.master_quantity - i.reserved_quantity,
        mapping: mapped
      };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/adjust', async (req, res) => {
  try {
    const { sku, quantity, source = 'manual' } = req.body;
    const result = await propagateStock(sku, quantity, source);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/mappings', async (req, res) => {
  try {
    const mappings = await ProductMapping.findAll();
    res.json(mappings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/mappings', async (req, res) => {
  try {
    const mapping = await ProductMapping.upsert(req.body);
    res.json({ success: true, mapping });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/edit', async (req, res) => {
  try {
    const { sku, name, master_quantity, mapping } = req.body;

    // 1. Update/insert central inventory
    const [invItem, created] = await Inventory.findOrCreate({
      where: { sku },
      defaults: {
        sku,
        name: name || sku,
        master_quantity: parseInt(master_quantity) || 0,
        reserved_quantity: 0
      }
    });

    if (!created) {
      invItem.name = name || invItem.name;
      invItem.master_quantity = parseInt(master_quantity) || 0;
      await invItem.save();
    }

    // 2. Update/insert mappings
    if (mapping) {
      const cleanMapping = { sku };
      const channels = [
        'shopify_variant_id', 'trendyol_barcode', 'hepsiburada_sku',
        'amazon_asin', 'n11_product_id', 'pazarama_product_id',
        'beymen_product_id', 'defacto_product_id', 'hipicon_product_id',
        'lcw_product_id'
      ];
      channels.forEach(ch => {
        if (mapping[ch] !== undefined) {
          cleanMapping[ch] = mapping[ch] || null;
        }
      });
      await ProductMapping.upsert(cleanMapping);
    }

    // 3. Propagate updated stocks to all active marketplace channels
    const result = await propagateStock(sku, parseInt(master_quantity) || 0, 'manual');

    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/import/:channel', async (req, res) => {
  const { channel } = req.params;
  try {
    const clients = require('../clients');
    const client = clients[channel];
    if (!client || typeof client.getProducts !== 'function') {
      throw new Error(`Import feature not supported or client not implemented for: ${channel}`);
    }

    const data = await client.getProducts();
    const products = data.products || data.items || data.listings || [];
    let importedCount = 0;

    for (const p of products) {
      // Standardize field mapping for multi-channel schemas
      const sku = p.sku || p.barcode || p.merchantSku || (p.variants?.[0]?.sku);
      const name = p.name || p.title || p.productName || (p.variants?.[0]?.title);
      const qty = p.inventory_quantity ?? p.quantity ?? p.availableStock ?? 0;
      const externalId = p.id || p.variantId || p.barcode || p.sku || (p.variants?.[0]?.id);

      if (sku) {
        // 1. Upsert central inventory
        const [invItem, created] = await Inventory.findOrCreate({
          where: { sku },
          defaults: {
            sku,
            name: name || sku,
            master_quantity: qty,
            reserved_quantity: 0,
            last_synced_at: new Date()
          }
        });

        if (!created) {
          invItem.name = name || invItem.name;
          invItem.last_synced_at = new Date();
          await invItem.save();
        }

        // 2. Dynamic map resolving
        const mappingFields = { sku };
        const val = externalId ? String(externalId) : null;
        
        if (channel === 'shopify') mappingFields.shopify_variant_id = val;
        if (channel === 'trendyol') mappingFields.trendyol_barcode = val;
        if (channel === 'hepsiburada') mappingFields.hepsiburada_sku = val;
        if (channel === 'amazon') mappingFields.amazon_asin = val;
        if (channel === 'n11') mappingFields.n11_product_id = val;
        if (channel === 'pazarama') mappingFields.pazarama_product_id = val;
        if (channel === 'beymen') mappingFields.beymen_product_id = val;
        if (channel === 'defacto') mappingFields.defacto_product_id = val;
        if (channel === 'hipicon') mappingFields.hipicon_product_id = val;
        if (channel === 'lcw') mappingFields.lcw_product_id = val;

        const mapping = await ProductMapping.findOne({ where: { sku } });
        if (mapping) {
          await mapping.update(mappingFields);
        } else {
          await ProductMapping.create(mappingFields);
        }

        importedCount++;
      }
    }

    res.json({ success: true, count: importedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/mappings/:sku', async (req, res) => {
  try {
    await ProductMapping.destroy({ where: { sku: req.params.sku } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
