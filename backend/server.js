require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { syncDB } = require('./models');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/channels', require('./routes/channels'));
app.use('/api/sync-logs', require('./routes/syncLogs'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/webhooks', require('./routes/webhooks'));

app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

const PORT = process.env.PORT || 3001;

syncDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}).catch(err => {
  console.error('Failed to sync DB or start server:', err);
});
