const express = require('express');
const router = express.Router();
const { ChannelSetting } = require('../models');

router.get('/', async (req, res) => {
  const channels = await ChannelSetting.findAll();
  // Mask secrets
  const safe = channels.map(c => ({
    ...c.toJSON(),
    api_key: c.api_key ? '••••••••' + c.api_key.slice(-4) : null,
    api_secret: c.api_secret ? '••••' : null,
  }));
  res.json(safe);
});

router.patch('/:channel', async (req, res) => {
  try {
    const { is_active, api_key, api_secret, extra_config } = req.body;
    await ChannelSetting.update(
      { is_active, api_key, api_secret, extra_config, updated_at: new Date() },
      { where: { channel: req.params.channel } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
