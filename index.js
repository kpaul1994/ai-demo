/**
 * index.js — Express server entry point
 * Railway will run it with `node index.js` (see Procfile / railway.toml)
 */
require("dotenv").config();
const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const db = require("./db");
const ai = require("./services/ai");
const auth = require("./lib/auth");
const engine = require("./lib/recommendationEngine");
const shopifyService = require("./services/shopify");
const seedDemoData = require("./scripts/seedDemoData");
const storeSync = require("./services/storeSync");

const app = express();

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

// ── Health check ──────────────────────────────────────────────────
app.get("/health", async (req, res) => {
  try {
    const dbTime = await db.healthCheck();
    res.json({ status: "ok", db: "connected", dbTime, aiProvider: ai.getActiveProviderName() });
  } catch (err) {
    res.status(503).json({ status: "error", message: err.message });
  }
});

// ── Auth ──────────────────────────────────────────────────────────
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "email and password are required" });
  try {
    const result = await auth.login(email, password);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// All routes below this point are protected
app.use("/api", (req, res, next) => {
  if (req.path === "/auth/login") return next();
  auth.requireAuth(req, res, next);
});

// ── Dashboard ─────────────────────────────────────────────────────
app.get("/api/dashboard", async (req, res) => {
  try {
    const { rows: kpi } = await db.query(`
      SELECT
        COALESCE(SUM(total_amount), 0) AS revenue,
        COUNT(*) AS orders,
        COALESCE(AVG(total_amount), 0) AS aov
      FROM orders
      WHERE order_date >= NOW() - INTERVAL '30 days'
    `);
    const { rows: customerCount } = await db.query(`SELECT COUNT(*) AS customers FROM customers`);
    const { rows: openRecs } = await db.query(`SELECT COUNT(*) AS count FROM recommendations WHERE status = 'open'`);

    res.json({
      revenue: Number(kpi[0].revenue),
      orders: Number(kpi[0].orders),
      aov: Number(kpi[0].aov),
      customers: Number(customerCount[0].customers),
      open_opportunities: Number(openRecs[0].count),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Products ──────────────────────────────────────────────────────
app.get("/api/products", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM products ORDER BY updated_at DESC LIMIT 100");
    res.json({ products: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Recommendations ───────────────────────────────────────────────

// List all recommendations ("AI Recommendations" screen on the dashboard)
app.get("/api/recommendations", async (req, res) => {
  const { status, type } = req.query;
  const conditions = [];
  const params = [];
  if (status) { params.push(status); conditions.push(`r.status = $${params.length}`); }
  if (type) { params.push(type); conditions.push(`r.type = $${params.length}`); }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    const { rows } = await db.query(
      `SELECT r.*, p.title AS product_title, p.image_url AS product_image
       FROM recommendations r
       LEFT JOIN products p ON p.id = r.product_id
       ${where}
       ORDER BY r.created_at DESC LIMIT 50`,
      params
    );
    res.json({ recommendations: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Detail view for a single recommendation
app.get("/api/recommendations/:id", async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT r.*, p.title AS product_title, p.price AS product_price, p.image_url AS product_image
       FROM recommendations r
       LEFT JOIN products p ON p.id = r.product_id
       WHERE r.id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Not found" });
    res.json({ recommendation: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark as Done / Dismiss
app.patch("/api/recommendations/:id", async (req, res) => {
  const { status } = req.body;
  if (!["open", "done", "dismissed"].includes(status)) {
    return res.status(400).json({ error: "status must be open | done | dismissed" });
  }
  try {
    const { rows } = await db.query(
      `UPDATE recommendations SET status = $1 WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Not found" });
    res.json({ recommendation: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// "AI analyzes store data" button — generates all types of recommendations
app.post("/api/recommendations/generate", async (req, res) => {
  try {
    const created = await engine.generateAllRecommendations();
    res.json({ created_count: created.length, recommendations: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── AI Chat (P1) ──────────────────────────────────────────────────
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;
  if (!message) return res.status(400).json({ error: "message is required" });

  try {
    // Adding dataset summary as context so the AI gives store-specific answers
    const { rows: kpi } = await db.query(`
      SELECT COALESCE(SUM(total_amount),0) AS revenue, COUNT(*) AS orders
      FROM orders WHERE order_date >= NOW() - INTERVAL '30 days'
    `);
    const { rows: openRecs } = await db.query(
      `SELECT title, explanation FROM recommendations WHERE status = 'open' ORDER BY created_at DESC LIMIT 5`
    );

    const systemPrompt = `You are an AI assistant for a Shopify merchant. Store summary: revenue $${kpi[0].revenue} and ${kpi[0].orders} orders in the last 30 days. Current open opportunities: ${openRecs.map((r) => r.title).join("; ") || "none"}. Answer the merchant's question concisely using this context.`;

    const messages = [...(history || []), { role: "user", content: message }];
    const reply = await ai.chat({ systemPrompt, messages, maxTokens: 300 });
    res.json({ reply, provider: ai.getActiveProviderName() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Store Status & Sync (Shopify Connection experience per Scope) ──
app.get("/api/store/status", async (req, res) => {
  try {
    const { rows: prodCount } = await db.query("SELECT COUNT(*) AS count FROM products");
    const { rows: orderCount } = await db.query("SELECT COUNT(*) AS count FROM orders");
    const { rows: custCount } = await db.query("SELECT COUNT(*) AS count FROM customers");

    let shopDetails = null;
    try {
      const resp = await shopifyService.request("/shop.json");
      if (resp.status === 200 && resp.data?.shop) {
        shopDetails = {
          name: resp.data.shop.name,
          domain: resp.data.shop.domain,
          currency: resp.data.shop.currency,
          country: resp.data.shop.country_name,
        };
      }
    } catch {
      // Dev store offline or token issue fallback
    }

    res.json({
      connected: true,
      domain: process.env.SHOPIFY_STORE_DOMAIN || "headless-shop-ocbpq7tt.myshopify.com",
      shop: shopDetails,
      ai_provider: ai.getActiveProviderName(),
      products_count: Number(prodCount[0].count),
      orders_count: Number(orderCount[0].count),
      customers_count: Number(custCount[0].count),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/store/seed-demo", async (req, res) => {
  try {
    const result = await seedDemoData.seed();
    res.json({ success: true, message: "Demo dataset ($124.8K MVP) loaded successfully", ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/store/sync-shopify", async (req, res) => {
  try {
    const result = await storeSync.syncRealShopifyStore();
    res.json({
      success: true,
      message: `Successfully connected & synced ${result.products_synced} products from "${result.shop}"! Generated ${result.recommendations_created} AI recommendations.`,
      ...result,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Serve built frontend (frontend/dist) in production mode ───────
const frontendDist = path.join(__dirname, "frontend", "dist");
app.use(express.static(frontendDist));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api") || req.path === "/health") return next();
  const indexPath = path.join(frontendDist, "index.html");
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.status(404).send("Frontend build not found. Run `npm run build` first.");
});

// ── Start ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[server] Running in production mode on port ${PORT}`);
  console.log(`[server] AI Provider: ${ai.getActiveProviderName()}`);
  console.log(`[server] Health: http://localhost:${PORT}/health`);
});
