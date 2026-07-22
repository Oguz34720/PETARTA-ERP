const express = require('express');
const router = express.Router();
const { SyncLog } = require('../models');

router.get('/', async (req, res) => {
  const { status, channel, limit = 100 } = req.query;
  const where = {};
  if (status) where.status = status;
  if (channel) where.source_channel = channel;
  const logs = await SyncLog.findAll({ where, limit: parseInt(limit), order: [['created_at', 'DESC']] });
  res.json(logs);
});

module.exports = router;
