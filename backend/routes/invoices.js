const express = require('express');
const router = express.Router();
const { Order } = require('../models');

router.get('/', async (req, res) => {
  const orders = await Order.findAll({
    where: { edm_invoice_id: { [require('sequelize').Op.ne]: null } },
    order: [['created_at', 'DESC']],
  });
  res.json(orders);
});

module.exports = router;
