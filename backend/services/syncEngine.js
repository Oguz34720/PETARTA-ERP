const { Inventory, SyncLog, ChannelSetting } = require('../models');
const clients = require('../clients');

const CHANNELS = ['shopify','trendyol','hepsiburada','amazon','n11','pazarama','beymen','defacto','hipicon','lcw','isbasi'];

async function getActiveChannels() {
  const settings = await ChannelSetting.findAll({ where: { is_active: true } });
  return settings.map(s => s.channel);
}

async function log(event_type, source, target, sku, payload, status, error_message = null) {
  await SyncLog.create({ event_type, source_channel: source, target_channel: target, sku, payload, status, error_message });
}

async function propagateStock(sku, newQty, source) {
  // 1. Update master inventory
  await Inventory.upsert({ sku, master_quantity: newQty, last_synced_at: new Date() });

  const active = await getActiveChannels();
  const targets = CHANNELS.filter(ch => ch !== source && active.includes(ch));

  // 2. Parallel propagation with loop prevention
  const results = await Promise.allSettled(
    targets.map(async (channel) => {
      try {
        const client = clients[channel];
        if (!client) throw new Error(`No client for ${channel}`);
        await client.updateStock(sku, newQty);
        await log('stock_update', source, channel, sku, { sku, newQty }, 'success');
      } catch (err) {
        await log('stock_update', source, channel, sku, { sku, newQty }, 'failed', err.message);
        throw err;
      }
    })
  );

  const failed = results.filter(r => r.status === 'rejected');
  return { total: targets.length, failed: failed.length, succeeded: targets.length - failed.length };
}

async function reserveStock(sku, qty) {
  const inv = await Inventory.findOne({ where: { sku } });
  if (!inv) throw new Error(`SKU ${sku} not found in inventory`);
  inv.reserved_quantity += qty;
  await inv.save();
}

async function releaseStock(sku, qty) {
  const inv = await Inventory.findOne({ where: { sku } });
  if (!inv) return;
  inv.reserved_quantity = Math.max(0, inv.reserved_quantity - qty);
  await inv.save();
}

async function deductStock(sku, qty, source) {
  const inv = await Inventory.findOne({ where: { sku } });
  if (!inv) throw new Error(`SKU ${sku} not found`);
  const newQty = Math.max(0, inv.master_quantity - qty);
  await propagateStock(sku, newQty, source);
}

module.exports = { propagateStock, reserveStock, releaseStock, deductStock };
