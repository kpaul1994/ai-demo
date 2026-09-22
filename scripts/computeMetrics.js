/**
 * scripts/computeMetrics.js — Computes each product's
 * units_sold/revenue for the current 30 days vs the previous 30 days from order_items, and updates the products table.
 * Run this after syncShopify.js.
 * Run command: node scripts/computeMetrics.js
 */
require("dotenv").config();
const db = require("../db");

async function computeMetrics() {
  console.log("[metrics] Computing 30-day product metrics...");

  await db.query(`
    WITH current_period AS (
      SELECT oi.product_id,
             SUM(oi.quantity) AS units_sold,
             SUM(oi.quantity * oi.price) AS revenue
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.order_date >= NOW() - INTERVAL '30 days'
      GROUP BY oi.product_id
    ),
    previous_period AS (
      SELECT oi.product_id,
             SUM(oi.quantity) AS units_sold,
             SUM(oi.quantity * oi.price) AS revenue
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.order_date >= NOW() - INTERVAL '60 days'
        AND o.order_date < NOW() - INTERVAL '30 days'
      GROUP BY oi.product_id
    )
    UPDATE products p
    SET
      units_sold_30d = COALESCE(cp.units_sold, 0),
      revenue_30d = COALESCE(cp.revenue, 0),
      units_sold_prev_30d = COALESCE(pp.units_sold, 0),
      revenue_prev_30d = COALESCE(pp.revenue, 0),
      updated_at = NOW()
    FROM current_period cp
    FULL OUTER JOIN previous_period pp ON pp.product_id = cp.product_id
    WHERE p.id = COALESCE(cp.product_id, pp.product_id);
  `);

  console.log("[metrics] ✅ Product metrics updated.");
  process.exit(0);
}

computeMetrics().catch((err) => {
  console.error("[metrics] ❌ Failed:", err.message);
  process.exit(1);
});
