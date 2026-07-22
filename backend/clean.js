const { Inventory, ProductMapping, Order, SyncLog, sequelize } = require('./models');

async function clean() {
  try {
    await sequelize.authenticate();
    console.log('Database connection authenticated.');

    // Disable foreign key checks for SQLite/Postgres to avoid constraint errors
    await sequelize.query('PRAGMA foreign_keys = OFF;'); // SQLite
    
    // Clear the transactional and mapping tables
    await ProductMapping.destroy({ where: {}, truncate: true });
    await Inventory.destroy({ where: {}, truncate: true });
    await Order.destroy({ where: {}, truncate: true });
    await SyncLog.destroy({ where: {}, truncate: true });

    await sequelize.query('PRAGMA foreign_keys = ON;'); // SQLite
    
    console.log('🧹 All dummy products, mappings, orders, and logs have been deleted successfully!');
    console.log('✨ The database is now clean and ready for production data.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Database clean failed:', err);
    process.exit(1);
  }
}

clean();
