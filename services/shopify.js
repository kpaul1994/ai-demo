const https = require('https');

const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;
const API_VERSION = '2024-10';

let cachedToken = {
  value: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || null,
  expiresAt: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ? Date.now() + 23 * 60 * 60 * 1000 : 0,
};

async function refreshToken() {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, grant_type: 'client_credentials' });
    const req = https.request({ hostname: STORE_DOMAIN, path: '/admin/oauth/access_token', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        const p = JSON.parse(data);
        cachedToken = { value: p.access_token, expiresAt: Date.now() + (p.expires_in - 300) * 1000 };
        console.log('[Shopify] Token refreshed');
        resolve(cachedToken.value);
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function getToken() {
  if (!cachedToken.value || Date.now() >= cachedToken.expiresAt) await refreshToken();
  return cachedToken.value;
}

async function shopifyRequest(endpoint, method = 'GET', body = null) {
  const token = await getToken();
  return new Promise((resolve, reject) => {
    const req = https.request({ hostname: STORE_DOMAIN, path: `/admin/api/${API_VERSION}${endpoint}`, method, headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' } }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

module.exports = {
  getProducts: (limit = 10) => shopifyRequest(`/products.json?limit=${limit}`),
  getProduct: (id) => shopifyRequest(`/products/${id}.json`),
  getOrders: (limit = 10) => shopifyRequest(`/orders.json?limit=${limit}&status=any`),
  getOrder: (id) => shopifyRequest(`/orders/${id}.json`),
  getCustomers: (limit = 10) => shopifyRequest(`/customers.json?limit=${limit}`),
  createProduct: (data) => shopifyRequest('/products.json', 'POST', { product: data }),
  updateProduct: (id, data) => shopifyRequest(`/products/${id}.json`, 'PUT', { product: data }),
  createOrder: (data) => shopifyRequest('/orders.json', 'POST', { order: data }),
  request: shopifyRequest,
  getToken,
};
