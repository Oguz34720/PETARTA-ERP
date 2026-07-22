const express = require('express');
const router = express.Router();
const { Order } = require('../models');
const { Op } = require('sequelize');

router.get('/', async (req, res) => {
  const { channel, status, limit = 50, offset = 0 } = req.query;
  const where = {};
  if (channel) where.channel = channel;
  if (status) where.status = status;
  const orders = await Order.findAndCountAll({ where, limit: parseInt(limit), offset: parseInt(offset), order: [['created_at', 'DESC']] });
  res.json(orders);
});

router.get('/:id', async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) return res.status(404).json({ error: 'Not found' });
  res.json(order);
});

router.patch('/:id/status', async (req, res) => {
  await Order.update({ status: req.body.status }, { where: { id: req.params.id } });
  res.json({ success: true });
});

module.exports = router;
