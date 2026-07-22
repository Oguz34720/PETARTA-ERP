const { Inventory, ProductMapping, Order, SyncLog, sequelize } = require('./models');

async function seed() {
  try {
    // Wait for models to sync
    await sequelize.authenticate();
    console.log('Database connection authenticated.');

    // 1. Seed Inventory
    const inventoryData = [
      { sku: 'SKU-IPHONE15', master_quantity: 45, reserved_quantity: 3, last_synced_at: new Date() },
      { sku: 'SKU-MACBOOKPRO', master_quantity: 12, reserved_quantity: 1, last_synced_at: new Date() },
      { sku: 'SKU-AIRPODSPRO', master_quantity: 120, reserved_quantity: 0, last_synced_at: new Date() },
      { sku: 'SKU-IPADPRO', master_quantity: 0, reserved_quantity: 0, last_synced_at: new Date() }
    ];

    for (const item of inventoryData) {
      await Inventory.findOrCreate({ where: { sku: item.sku }, defaults: item });
    }
    console.log('🌱 Seeded inventory data');

    // 2. Seed Mappings
    const mappingsData = [
      {
        sku: 'SKU-IPHONE15',
        shopify_variant_id: 4589210485901,
        trendyol_barcode: '8680001002012',
        hepsiburada_sku: 'HBV00000IPH15',
        amazon_asin: 'B0CHX1A123',
        n11_product_id: 109283748,
        pazarama_product_id: 882736,
        beymen_product_id: 'BEY-IPH15-BLK',
        defacto_product_id: 'DF-IPH15-BLK',
        hipicon_product_id: 'HP-IPH15-BLK',
        lcw_product_id: 'LCW-IPH15-BLK'
      },
      {
        sku: 'SKU-MACBOOKPRO',
        shopify_variant_id: 4589210485902,
        trendyol_barcode: '8680001002029',
        hepsiburada_sku: 'HBV00000MACBP',
        amazon_asin: 'B0CHX1A456',
        n11_product_id: 109283749,
        pazarama_product_id: 882737,
        beymen_product_id: 'BEY-MACBP-SLV',
        defacto_product_id: 'DF-MACBP-SLV',
        hipicon_product_id: 'HP-MACBP-SLV',
        lcw_product_id: 'LCW-MACBP-SLV'
      }
    ];

    for (const map of mappingsData) {
      await ProductMapping.findOrCreate({ where: { sku: map.sku }, defaults: map });
    }
    console.log('🌱 Seeded product mappings data');

    // 3. Seed Orders
    const ordersData = [
      {
        channel: 'shopify',
        channel_order_id: '1001',
        status: 'paid',
        total_amount: 54999.00,
        currency: 'TRY',
        customer_name: 'Ahmet Yılmaz',
        customer_email: 'ahmet.yilmaz@example.com',
        customer_tckn: '12345678901',
        customer_tax_no: null,
        items: [
          { sku: 'SKU-IPHONE15', title: 'iPhone 15 Black 128GB', quantity: 1, price: 54999.00, vat_rate: 20 }
        ],
        edm_invoice_id: 'EDM-20260000001',
        isbasi_invoice_id: 'ISB-2026-0004',
        synced_at: new Date()
      },
      {
        channel: 'trendyol',
        channel_order_id: '829471927',
        status: 'approved',
        total_amount: 84999.00,
        currency: 'TRY',
        customer_name: 'Ayşe Demir',
        customer_email: 'ayse.demir@example.com',
        customer_tckn: null,
        customer_tax_no: '9876543210',
        items: [
          { sku: 'SKU-MACBOOKPRO', title: 'MacBook Pro 14 M3 16GB', quantity: 1, price: 84999.00, vat_rate: 20 }
        ],
        edm_invoice_id: 'EDM-20260000002',
        isbasi_invoice_id: 'ISB-2026-0005',
        synced_at: new Date()
      },
      {
        channel: 'hepsiburada',
        channel_order_id: 'HB9283712',
        status: 'new',
        total_amount: 119998.00,
        currency: 'TRY',
        customer_name: 'Mehmet Kaya',
        customer_email: 'mehmet.kaya@example.com',
        customer_tckn: '11111111111',
        customer_tax_no: null,
        items: [
          { sku: 'SKU-IPHONE15', title: 'iPhone 15 Black 128GB', quantity: 2, price: 59999.00, vat_rate: 20 }
        ],
        edm_invoice_id: null,
        isbasi_invoice_id: null,
        synced_at: null
      }
    ];

    for (const order of ordersData) {
      await Order.findOrCreate({ where: { channel_order_id: order.channel_order_id, channel: order.channel }, defaults: order });
    }
    console.log('🌱 Seeded orders data');

    // 4. Seed Sync Logs
    const logsData = [
      { event_type: 'stock_update', source_channel: 'isbasi', target_channel: 'shopify', sku: 'SKU-IPHONE15', payload: { sku: 'SKU-IPHONE15', qty: 45 }, status: 'success' },
      { event_type: 'stock_update', source_channel: 'isbasi', target_channel: 'trendyol', sku: 'SKU-IPHONE15', payload: { sku: 'SKU-IPHONE15', qty: 45 }, status: 'success' },
      { event_type: 'stock_update', source_channel: 'isbasi', target_channel: 'hepsiburada', sku: 'SKU-IPHONE15', payload: { sku: 'SKU-IPHONE15', qty: 45 }, status: 'success' },
      { event_type: 'order_import', source_channel: 'shopify', target_channel: 'isbasi', sku: null, payload: { orderId: '1001' }, status: 'success' },
      { event_type: 'invoice_generation', source_channel: 'shopify', target_channel: 'edm', sku: null, payload: { orderId: '1001' }, status: 'success' },
      { event_type: 'stock_update', source_channel: 'shopify', target_channel: 'trendyol', sku: 'SKU-MACBOOKPRO', payload: { sku: 'SKU-MACBOOKPRO', qty: 11 }, status: 'failed', error_message: 'Trendyol API: Timeout connection error' }
    ];

    for (const logItem of logsData) {
      await SyncLog.create(logItem);
    }
    console.log('🌱 Seeded sync logs data');

    console.log('✨ Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
