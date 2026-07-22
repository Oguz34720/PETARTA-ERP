const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const axios = require('axios');
const { Channel } = require('../models');

// Scopes required for the ERP operations
const SCOPES = 'read_products,write_products,read_inventory,write_inventory,read_orders,write_orders,read_fulfillments,read_assigned_fulfillment_orders,write_fulfillments,write_assigned_fulfillment_orders';

// Helper to verify Shopify OAuth callback HMAC
function verifyHmac(query, clientSecret) {
  const { hmac, ...params } = query;
  if (!hmac) return false;

  // Sort and format query parameters
  const message = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  const generatedHmac = crypto
    .createHmac('sha256', clientSecret)
    .update(message)
    .digest('hex');

  return generatedHmac === hmac;
}

// 1. Initiate Shopify OAuth Flow
router.get('/shopify', (req, res) => {
  const { shop, redirect_host } = req.query; // shop is e.g. petarya.myshopify.com

  if (!shop) {
    return res.status(400).send('Missing shop parameter');
  }

  const clientId = process.env.SHOPIFY_CLIENT_ID || process.env.SHOPIFY_ACCESS_ID; // Support either naming
  const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/shopify/callback`;
  
  // State encodes the frontend URL to redirect the user back after installation
  const state = redirect_host || (req.get('host').includes('onrender.com') 
    ? 'https://petarta-erp-1.onrender.com' 
    : 'http://localhost:3000');

  const authorizeUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${SCOPES}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}`;
  
  res.redirect(authorizeUrl);
});

// 2. Callback from Shopify
router.get('/shopify/callback', async (req, res) => {
  const { code, shop, hmac, state } = req.query;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET || process.env.SHOPIFY_ACCESS_TOKEN; // Client secret is the app's secret key from dashboard

  // Verify HMAC signature to check request origin
  const isValid = verifyHmac(req.query, clientSecret);
  if (!isValid) {
    return res.status(400).send('HMAC validation failed');
  }

  if (!code || !shop) {
    return res.status(400).send('Missing code or shop parameter');
  }

  try {
    const clientId = process.env.SHOPIFY_CLIENT_ID || process.env.SHOPIFY_ACCESS_ID;

    // Exchange authorization code for permanent access token
    const tokenRes = await axios.post(`https://${shop}/admin/oauth/access_token`, {
      client_id: clientId,
      client_secret: clientSecret,
      code
    });

    const accessToken = tokenRes.data.access_token;

    // Save token in the Channel model
    const [ch] = await Channel.findOrCreate({ where: { channel: 'shopify' } });
    ch.is_active = true;
    ch.api_key = accessToken;
    ch.extra_config = { shop };
    await ch.save();

    console.log(`✅ Shopify OAuth installation successful for ${shop}. Token saved.`);

    // Redirect the user back to the React dashboard
    res.redirect(`${state}?auth_success=shopify`);
  } catch (err) {
    console.error('Shopify OAuth exchange error:', err.response?.data || err.message);
    res.status(500).send('Failed to exchange Shopify authorization code: ' + (err.response?.data?.error_description || err.message));
  }
});

module.exports = router;
