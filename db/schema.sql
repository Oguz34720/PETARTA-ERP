-- Unified Commerce Hub — PostgreSQL Schema

CREATE TABLE IF NOT EXISTS product_mappings (
  id SERIAL PRIMARY KEY,
  sku VARCHAR(100) NOT NULL UNIQUE,
  shopify_variant_id BIGINT,
  trendyol_barcode VARCHAR(100),
  hepsiburada_sku VARCHAR(100),
  amazon_asin VARCHAR(20),
  n11_product_id BIGINT,
  pazarama_product_id BIGINT,
  beymen_product_id VARCHAR(100),
  defacto_product_id VARCHAR(100),
  hipicon_product_id VARCHAR(100),
  lcw_product_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  sku VARCHAR(100) NOT NULL UNIQUE,
  master_quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER NOT NULL DEFAULT 0,
  last_synced_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  channel VARCHAR(50) NOT NULL,
  channel_order_id VARCHAR(100),
  status VARCHAR(50),
  total_amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'TRY',
  customer_name VARCHAR(200),
  customer_email VARCHAR(200),
  customer_tckn VARCHAR(11),
  customer_tax_no VARCHAR(20),
  items JSONB,
  edm_invoice_id VARCHAR(100),
  isbasi_invoice_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  synced_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sync_logs (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(100),
  source_channel VARCHAR(50),
  target_channel VARCHAR(50),
  sku VARCHAR(100),
  payload JSONB,
  status VARCHAR(20) DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS channel_settings (
  id SERIAL PRIMARY KEY,
  channel VARCHAR(50) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT FALSE,
  api_key VARCHAR(500),
  api_secret VARCHAR(500),
  extra_config JSONB,
  updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO channel_settings (channel) VALUES
  ('shopify'), ('isbasi'), ('trendyol'), ('hepsiburada'),
  ('amazon'), ('n11'), ('pazarama'), ('beymen'),
  ('defacto'), ('hipicon'), ('lcw'), ('edm')
ON CONFLICT (channel) DO NOTHING;
