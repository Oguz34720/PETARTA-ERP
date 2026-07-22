const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

let sequelize;

if (process.env.DB_HOST && process.env.DB_USER) {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
    }
  );
  console.log('📦 Using PostgreSQL');
} else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './unified-commerce-db.sqlite',
    logging: false,
  });
  console.log('📦 Using SQLite fallback');
}

// ── Models ──────────────────────────────────────────────

const ProductMapping = sequelize.define('ProductMapping', {
  sku: { type: DataTypes.STRING, allowNull: false, unique: true },
  shopify_variant_id: DataTypes.BIGINT,
  trendyol_barcode: DataTypes.STRING,
  hepsiburada_sku: DataTypes.STRING,
  amazon_asin: DataTypes.STRING,
  n11_product_id: DataTypes.BIGINT,
  pazarama_product_id: DataTypes.BIGINT,
  beymen_product_id: DataTypes.STRING,
  defacto_product_id: DataTypes.STRING,
  hipicon_product_id: DataTypes.STRING,
  lcw_product_id: DataTypes.STRING,
}, { tableName: 'product_mappings', timestamps: true, createdAt: 'created_at', updatedAt: false });

const Inventory = sequelize.define('Inventory', {
  sku: { type: DataTypes.STRING, allowNull: false, unique: true },
  name: { type: DataTypes.STRING, defaultValue: '' },
  master_quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
  reserved_quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
  last_synced_at: DataTypes.DATE,
}, { tableName: 'inventory', timestamps: true, createdAt: false, updatedAt: 'updated_at' });

const Order = sequelize.define('Order', {
  channel: { type: DataTypes.STRING, allowNull: false },
  channel_order_id: DataTypes.STRING,
  status: DataTypes.STRING,
  total_amount: DataTypes.DECIMAL(10, 2),
  currency: { type: DataTypes.STRING, defaultValue: 'TRY' },
  customer_name: DataTypes.STRING,
  customer_email: DataTypes.STRING,
  customer_tckn: DataTypes.STRING,
  customer_tax_no: DataTypes.STRING,
  items: DataTypes.JSON,
  edm_invoice_id: DataTypes.STRING,
  isbasi_invoice_id: DataTypes.STRING,
  synced_at: DataTypes.DATE,
}, { tableName: 'orders', timestamps: true, createdAt: 'created_at', updatedAt: false });

const SyncLog = sequelize.define('SyncLog', {
  event_type: DataTypes.STRING,
  source_channel: DataTypes.STRING,
  target_channel: DataTypes.STRING,
  sku: DataTypes.STRING,
  payload: DataTypes.JSON,
  status: { type: DataTypes.STRING, defaultValue: 'pending' },
  error_message: DataTypes.TEXT,
}, { tableName: 'sync_logs', timestamps: true, createdAt: 'created_at', updatedAt: false });

const ChannelSetting = sequelize.define('ChannelSetting', {
  channel: { type: DataTypes.STRING, allowNull: false, unique: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: false },
  api_key: DataTypes.STRING(500),
  api_secret: DataTypes.STRING(500),
  extra_config: DataTypes.JSON,
}, { tableName: 'channel_settings', timestamps: true, createdAt: false, updatedAt: 'updated_at' });

// ── Sync & Export ────────────────────────────────────────

const CHANNELS = ['shopify','isbasi','trendyol','hepsiburada','amazon','n11','pazarama','beymen','defacto','hipicon','lcw','edm'];

async function syncDB() {
  await sequelize.sync({ alter: true });
  for (const ch of CHANNELS) {
    await ChannelSetting.findOrCreate({ where: { channel: ch }, defaults: { channel: ch } });
  }
  console.log('✅ Database synced');
}

module.exports = { sequelize, ProductMapping, Inventory, Order, SyncLog, ChannelSetting, syncDB };
