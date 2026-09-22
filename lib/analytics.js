/**
 * lib/analytics.js — Rule-based logic (per section 10 of scope)
 * AI is not used for raw calculations — what comes out here are just
 * "findings"; the AI layer then converts them into explanations/actions.
 */
const db = require("../db");

// 1. Pricing opportunity — sales rising, discount decreasing
async function findPricingOpportunities() {
  const { rows } = await db.query(`
    SELECT * FROM products
    WHERE units_sold_prev_30d > 0
      AND units_sold_30d > units_sold_prev_30d * 1.10
      AND discount_pct_30d <= discount_pct_prev_30d
    ORDER BY (units_sold_30d - units_sold_prev_30d) DESC
    LIMIT 5
  `);
  return rows;
}

// 2. Declining product performance
async function findDecliningProducts() {
  const { rows } = await db.query(`
    SELECT * FROM products
    WHERE revenue_prev_30d > 0
      AND revenue_30d < revenue_prev_30d * 0.85
    ORDER BY (revenue_prev_30d - revenue_30d) DESC
    LIMIT 5
  `);
  return rows;
}

// 3. Cross-sell — product pairs frequently bought together (co-purchase count)
async function findCrossSellPairs() {
  const { rows } = await db.query(`
    SELECT
      oi1.product_id AS product_a_id, p1.title AS product_a_title,
      oi2.product_id AS product_b_id, p2.title AS product_b_title,
      COUNT(DISTINCT oi1.order_id) AS co_purchase_count
    FROM order_items oi1
    JOIN order_items oi2
      ON oi1.order_id = oi2.order_id AND oi1.product_id < oi2.product_id
    JOIN products p1 ON p1.id = oi1.product_id
    JOIN products p2 ON p2.id = oi2.product_id
    GROUP BY oi1.product_id, p1.title, oi2.product_id, p2.title
    HAVING COUNT(DISTINCT oi1.order_id) >= 3
    ORDER BY co_purchase_count DESC
    LIMIT 5
  `);
  return rows;
}

// 4. Low inventory — calculate days remaining based on sales velocity
async function findLowInventory() {
  const { rows } = await db.query(`
    SELECT *,
      CASE WHEN units_sold_30d > 0
        THEN ROUND(inventory_qty / (units_sold_30d / 30.0), 1)
        ELSE NULL
      END AS days_remaining
    FROM products
    WHERE units_sold_30d > 0
      AND inventory_qty / (units_sold_30d / 30.0) <= 14
    ORDER BY days_remaining ASC
    LIMIT 5
  `);
  return rows;
}

// 5. Customer campaign — customers who bought X but not Y (extract audience from cross-sell pair)
async function findCampaignAudience(productAId, productBId) {
  const { rows } = await db.query(
    `
    SELECT DISTINCT c.id, c.name, c.email
    FROM customers c
    JOIN orders o ON o.customer_id = c.id
    JOIN order_items oi ON oi.order_id = o.id AND oi.product_id = $1
    WHERE c.id NOT IN (
      SELECT o2.customer_id FROM orders o2
      JOIN order_items oi2 ON oi2.order_id = o2.id
      WHERE oi2.product_id = $2
    )
    LIMIT 500
    `,
    [productAId, productBId]
  );
  return rows;
}

// 6. Review problems — products with average rating < 3.5 or negative reviews
async function findReviewProblems() {
  const { rows } = await db.query(`
    SELECT
      p.id, p.title, p.price, p.image_url,
      ROUND(AVG(r.rating)::numeric, 1) AS avg_rating,
      COUNT(r.id) AS review_count,
      ARRAY_AGG(r.review_text) AS review_samples
    FROM products p
    JOIN reviews r ON r.product_id = p.id
    GROUP BY p.id, p.title, p.price, p.image_url
    HAVING AVG(r.rating) < 3.8
    ORDER BY avg_rating ASC
    LIMIT 5
  `);
  return rows;
}

module.exports = {
  findPricingOpportunities,
  findDecliningProducts,
  findCrossSellPairs,
  findLowInventory,
  findCampaignAudience,
  findReviewProblems,
};
