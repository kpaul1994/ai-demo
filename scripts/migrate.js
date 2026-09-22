/**
 * scripts/migrate.js — Full DB schema (all tables per scope)
 * Run command: node scripts/migrate.js  (or: npm run migrate)
 * Idempotent — safe to run multiple times.
 */

require("dotenv").config();
const db = require("../db");

async function migrate() {
  console.log("[migrate] Starting schema migration...");
  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    // ── users (demo login) ───────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            SERIAL PRIMARY KEY,
        email         VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at    TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log("[migrate] ✓ users");

    // ── products ──────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id                  SERIAL PRIMARY KEY,
        shopify_id          VARCHAR(64) UNIQUE NOT NULL,
        title               TEXT NOT NULL,
        handle              TEXT,
        price               NUMERIC(10,2),
        compare_price       NUMERIC(10,2),
        vendor              TEXT,
        product_type        TEXT,
        status              VARCHAR(20) DEFAULT 'active',
        tags                TEXT[],
        image_url           TEXT,
        inventory_qty       INTEGER DEFAULT 0,
        units_sold_30d      INTEGER DEFAULT 0,
        revenue_30d         NUMERIC(12,2) DEFAULT 0,
        units_sold_prev_30d INTEGER DEFAULT 0,
        revenue_prev_30d    NUMERIC(12,2) DEFAULT 0,
        discount_pct_30d    NUMERIC(6,2) DEFAULT 0,
        discount_pct_prev_30d NUMERIC(6,2) DEFAULT 0,
        synced_at           TIMESTAMPTZ DEFAULT NOW(),
        created_at          TIMESTAMPTZ DEFAULT NOW(),
        updated_at          TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log("[migrate] ✓ products");

    // ── customers ─────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id            SERIAL PRIMARY KEY,
        shopify_id    VARCHAR(64) UNIQUE NOT NULL,
        name          TEXT,
        email         TEXT,
        total_spend   NUMERIC(12,2) DEFAULT 0,
        orders_count  INTEGER DEFAULT 0,
        synced_at     TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log("[migrate] ✓ customers");

    // ── orders ────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id            SERIAL PRIMARY KEY,
        shopify_id    VARCHAR(64) UNIQUE NOT NULL,
        customer_id   INTEGER REFERENCES customers(id) ON DELETE SET NULL,
        order_date    TIMESTAMPTZ NOT NULL,
        total_amount  NUMERIC(12,2) NOT NULL,
        synced_at     TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log("[migrate] ✓ orders");

    // ── order_items (needed for cross-sell analysis) ───────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id          SERIAL PRIMARY KEY,
        order_id    INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id  INTEGER REFERENCES products(id) ON DELETE CASCADE,
        quantity    INTEGER NOT NULL DEFAULT 1,
        price       NUMERIC(10,2) NOT NULL
      );
    `);
    console.log("[migrate] ✓ order_items");

    // ── reviews ───────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id          SERIAL PRIMARY KEY,
        product_id  INTEGER REFERENCES products(id) ON DELETE CASCADE,
        rating      SMALLINT CHECK (rating BETWEEN 1 AND 5),
        review_text TEXT,
        synced_at   TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log("[migrate] ✓ reviews");

    // ── recommendations (generalized for all 5 types) ────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS recommendations (
        id                SERIAL PRIMARY KEY,
        type              VARCHAR(50) NOT NULL,  -- pricing | product_performance | cross_sell | inventory | customer_campaign
        product_id        INTEGER REFERENCES products(id) ON DELETE SET NULL,
        title             VARCHAR(255) NOT NULL,
        explanation       TEXT,
        suggested_action  TEXT,
        supporting_data   JSONB,
        confidence        NUMERIC(4,2),
        ai_provider       VARCHAR(20),
        status            VARCHAR(20) DEFAULT 'open', -- open | done | dismissed
        created_at        TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log("[migrate] ✓ recommendations");

    // ── ai_logs (for debugging / tracking provider usage) ──────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS ai_logs (
        id            SERIAL PRIMARY KEY,
        product_id    INTEGER REFERENCES products(id) ON DELETE SET NULL,
        provider      VARCHAR(20) NOT NULL,
        prompt_type   VARCHAR(50),
        user_prompt   TEXT,
        ai_response   TEXT,
        latency_ms    INTEGER,
        error         TEXT,
        created_at    TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log("[migrate] ✓ ai_logs");

    // ── indexes ───────────────────────────────────────────────────
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_products_shopify_id ON products(shopify_id);
      CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date);
      CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
      CREATE INDEX IF NOT EXISTS idx_recommendations_status ON recommendations(status);
      CREATE INDEX IF NOT EXISTS idx_recommendations_type ON recommendations(type);
      CREATE INDEX IF NOT EXISTS idx_ai_logs_created_at ON ai_logs(created_at DESC);
    `);
    console.log("[migrate] ✓ indexes");

    await client.query("COMMIT");
    console.log("[migrate] ✅ Migration complete!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[migrate] ❌ Migration failed:", err.message);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

migrate();
