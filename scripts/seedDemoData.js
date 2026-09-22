/**
 * scripts/seedDemoData.js
 * Seeds the exact demo store dataset specified in "AI E-commerce Optimization Platform — Demo MVP Scope.pdf".
 *
 * Store: Fashion / Apparel
 * Target KPI Baseline:
 *   - Revenue: ~$124,820
 *   - Orders: ~2,184
 *   - AOV: ~$57.15
 *   - Customers: ~1,842
 *
 * Features pre-configured opportunities:
 *   1. Pricing: Premium Hoodie (demand surging +18%, discounting down -8%)
 *   2. Product Performance: Running Shoes (revenue down -28%, orders down -25%)
 *   3. Cross-Sell: Premium Hoodie + Denim Jacket (frequent co-purchases)
 *   4. Inventory: Running Socks (12 units left, 8 days supply remaining)
 *   5. Customer Campaign: Target Hoodie buyers who haven't tried Denim Jacket
 *
 * Run command: node scripts/seedDemoData.js
 */
require("dotenv").config();
const db = require("../db");

const PRODUCTS = [
  {
    shopify_id: "gid://shopify/Product/1001",
    title: "Premium Hoodie",
    handle: "premium-hoodie",
    price: 85.0,
    compare_price: 95.0,
    vendor: "Aura Apparel",
    product_type: "Apparel",
    status: "active",
    tags: ["hoodie", "bestseller", "winter", "fleece"],
    image_url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80",
    inventory_qty: 142,
    units_sold_30d: 410,
    revenue_30d: 34850.0,
    units_sold_prev_30d: 368,
    revenue_prev_30d: 29534.0,
    discount_pct_30d: 4.2,
    discount_pct_prev_30d: 12.2,
  },
  {
    shopify_id: "gid://shopify/Product/1002",
    title: "Running Shoes",
    handle: "running-shoes",
    price: 120.0,
    compare_price: 140.0,
    vendor: "Velocity Gear",
    product_type: "Footwear",
    status: "active",
    tags: ["shoes", "running", "athletics", "footwear"],
    image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    inventory_qty: 88,
    units_sold_30d: 135,
    revenue_30d: 16200.0,
    units_sold_prev_30d: 180,
    revenue_prev_30d: 22500.0,
    discount_pct_30d: 8.0,
    discount_pct_prev_30d: 5.0,
  },
  {
    shopify_id: "gid://shopify/Product/1003",
    title: "Denim Jacket",
    handle: "denim-jacket",
    price: 95.0,
    compare_price: 110.0,
    vendor: "Aura Apparel",
    product_type: "Outerwear",
    status: "active",
    tags: ["denim", "jacket", "outerwear", "casual"],
    image_url: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80",
    inventory_qty: 64,
    units_sold_30d: 198,
    revenue_30d: 18810.0,
    units_sold_prev_30d: 190,
    revenue_prev_30d: 18050.0,
    discount_pct_30d: 6.0,
    discount_pct_prev_30d: 6.5,
  },
  {
    shopify_id: "gid://shopify/Product/1004",
    title: "Cotton T-Shirt",
    handle: "cotton-t-shirt",
    price: 28.0,
    compare_price: 32.0,
    vendor: "Basics Co",
    product_type: "Apparel",
    status: "active",
    tags: ["t-shirt", "essential", "cotton", "summer"],
    image_url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
    inventory_qty: 320,
    units_sold_30d: 720,
    revenue_30d: 20160.0,
    units_sold_prev_30d: 710,
    revenue_prev_30d: 19880.0,
    discount_pct_30d: 5.0,
    discount_pct_prev_30d: 5.0,
  },
  {
    shopify_id: "gid://shopify/Product/1005",
    title: "Leather Backpack",
    handle: "leather-backpack",
    price: 145.0,
    compare_price: 165.0,
    vendor: "Heritage Leather",
    product_type: "Accessories",
    status: "active",
    tags: ["backpack", "leather", "accessories", "travel"],
    image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
    inventory_qty: 45,
    units_sold_30d: 110,
    revenue_30d: 15950.0,
    units_sold_prev_30d: 105,
    revenue_prev_30d: 15225.0,
    discount_pct_30d: 3.5,
    discount_pct_prev_30d: 4.0,
  },
  {
    shopify_id: "gid://shopify/Product/1006",
    title: "Running Socks",
    handle: "running-socks",
    price: 18.0,
    compare_price: 22.0,
    vendor: "Velocity Gear",
    product_type: "Accessories",
    status: "active",
    tags: ["socks", "running", "accessories"],
    image_url: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=600&q=80",
    inventory_qty: 12, // Low inventory anomaly!
    units_sold_30d: 245,
    revenue_30d: 4410.0,
    units_sold_prev_30d: 230,
    revenue_prev_30d: 4140.0,
    discount_pct_30d: 2.0,
    discount_pct_prev_30d: 2.0,
  },
  {
    shopify_id: "gid://shopify/Product/1007",
    title: "Sports Cap",
    handle: "sports-cap",
    price: 24.0,
    compare_price: 30.0,
    vendor: "Velocity Gear",
    product_type: "Accessories",
    status: "active",
    tags: ["cap", "hat", "sports", "summer"],
    image_url: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=600&q=80",
    inventory_qty: 90,
    units_sold_30d: 180,
    revenue_30d: 4320.0,
    units_sold_prev_30d: 175,
    revenue_prev_30d: 4200.0,
    discount_pct_30d: 4.0,
    discount_pct_prev_30d: 4.0,
  },
  {
    shopify_id: "gid://shopify/Product/1008",
    title: "Travel Bag",
    handle: "travel-bag",
    price: 110.0,
    compare_price: 130.0,
    vendor: "Heritage Leather",
    product_type: "Accessories",
    status: "active",
    tags: ["bag", "duffel", "travel", "weekend"],
    image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
    inventory_qty: 38,
    units_sold_30d: 92,
    revenue_30d: 10120.0,
    units_sold_prev_30d: 90,
    revenue_prev_30d: 9900.0,
    discount_pct_30d: 5.0,
    discount_pct_prev_30d: 5.0,
  },
];

const INITIAL_RECOMMENDATIONS = [
  {
    type: "pricing",
    product_idx: 0, // Premium Hoodie
    title: "Increase Premium Hoodie price by 5%",
    explanation:
      "Sales volume has increased 11.4% while revenue surged 18.0% and promotional discounting dropped by 8.0%. Strong demand elasticity suggests customers will absorb a 5% price increase ($85 → $89.25) without hurting conversion.",
    suggested_action: "Test a 5% price increase to $89.25 on the Shopify catalog.",
    supporting_data: {
      current_price: 85.0,
      suggested_price: 89.25,
      revenue_growth: "+18.0%",
      units_growth: "+11.4%",
      discount_trend: "-8.0%",
      estimated_monthly_gain: "+$1,742.50",
    },
    confidence: 0.88,
    status: "open",
  },
  {
    type: "product_performance",
    product_idx: 1, // Running Shoes
    title: "Running Shoes has declining performance",
    explanation:
      "Revenue dropped 28.0% ($22,500 → $16,200) and unit sales dropped 25.0% over the last 30 days compared to the previous period. Customer reviews indicate sizing issues and increased competition in the footwear category.",
    suggested_action: "Review size chart accuracy, refresh landing page creatives, and test a limited 10% bundle promotion.",
    supporting_data: {
      revenue_30d: 16200.0,
      revenue_prev_30d: 22500.0,
      revenue_change_pct: "-28.0%",
      units_change_pct: "-25.0%",
      review_sentiment: "3.2 / 5.0 (sizing complaints)",
    },
    confidence: 0.82,
    status: "open",
  },
  {
    type: "cross_sell",
    product_idx: 0, // Premium Hoodie
    title: "Customers buying Premium Hoodie are likely to buy Denim Jacket",
    explanation:
      "Order history analysis shows 148 customers purchased both Premium Hoodie and Denim Jacket within 14 days. These products share a high co-purchase affinity score (68%), making them an ideal post-purchase or cart bundle.",
    suggested_action: "Enable a 1-click cart cross-sell popup offering 10% off the Denim Jacket when Premium Hoodie is in the cart.",
    supporting_data: {
      primary_product: "Premium Hoodie",
      cross_sell_product: "Denim Jacket",
      co_purchases: 148,
      affinity_score: "68%",
      projected_aov_increase: "+$14.20",
    },
    confidence: 0.78,
    status: "open",
  },
  {
    type: "inventory",
    product_idx: 5, // Running Socks
    title: "Running Socks may run out of stock in 8 days",
    explanation:
      "Current inventory is down to 12 units while the 30-day sales velocity is 245 units (~8.1 units/day). At current demand rates, stockout will occur in approximately 8 days, leading to estimated lost revenue of $1,440.",
    suggested_action: "Issue an urgent supplier reorder for 300 units and temporarily remove Running Socks from paid ad campaigns.",
    supporting_data: {
      inventory_qty: 12,
      velocity_daily: "8.1 units/day",
      days_remaining: 8,
      stockout_risk_date: "In 8 days",
      estimated_lost_revenue: "$1,440.00",
    },
    confidence: 0.94,
    status: "open",
  },
  {
    type: "customer_campaign",
    product_idx: 2, // Denim Jacket
    title: "Target customers who bought Premium Hoodie but not Denim Jacket",
    explanation:
      "We identified an audience of 262 loyal customers who bought the Premium Hoodie in the past 60 days but haven't explored the Denim Jacket. Given high cross-category appeal, a personalized campaign has a high expected conversion rate.",
    suggested_action: "Send an email campaign: 'Complete your look — Style your Premium Hoodie with our Denim Jacket' with a $15 gift voucher.",
    supporting_data: {
      audience_size: 262,
      target_segment: "Premium Hoodie Owners (No Jacket)",
      recommended_offer: "15% off Denim Jacket or $15 voucher",
      expected_revenue: "+$3,730.00",
    },
    confidence: 0.74,
    status: "open",
  },
  {
    type: "review_sentiment",
    product_idx: 1, // Running Shoes
    title: "Running Shoes has negative customer review trends (2.5★)",
    explanation:
      "Customer sentiment analysis detected recurring dissatisfaction regarding narrow toe box sizing and sole durability. 65% of recent 1-2 star reviews mention sizing mismatch, which directly correlates with the 28% drop in reorder rates.",
    suggested_action: "Update sizing guide to recommend ordering 1/2 size up and request QA audit on sole rubber from manufacturer.",
    supporting_data: {
      avg_rating: "2.5 / 5.0",
      negative_review_rate: "42%",
      primary_complaint: "Narrow toe box & sizing inaccuracy",
      return_rate: "18.4%",
    },
    confidence: 0.91,
    status: "open",
  },
];

const REVIEWS = [
  { product_idx: 0, rating: 5, review_text: "Incredible quality fleece! Warm, fits perfectly, and washes well." },
  { product_idx: 0, rating: 5, review_text: "Best hoodie I own. Thick fabric and premium drawstrings." },
  { product_idx: 1, rating: 2, review_text: "Runs smaller than standard sizing. Toe box is a bit narrow." },
  { product_idx: 1, rating: 3, review_text: "Good cushioning but soles wore down faster than expected." },
  { product_idx: 2, rating: 5, review_text: "Classic wash, pairs amazingly with the hoodie. Tons of compliments." },
  { product_idx: 3, rating: 4, review_text: "Soft organic cotton, great everyday basic." },
  { product_idx: 4, rating: 5, review_text: "Stunning leather craftsmanship. Perfect work and travel bag." },
  { product_idx: 5, rating: 5, review_text: "Super breathable anti-blister running socks. Need to buy 5 more pairs!" },
];

async function seed() {
  console.log("[seedDemoData] Starting realistic demo dataset seeding...");
  const client = await db.getClient();

  try {
    await client.query("BEGIN");

    // 1. Insert/Update Products
    const productDbMap = [];
    for (const p of PRODUCTS) {
      const { rows } = await client.query(
        `INSERT INTO products
          (shopify_id, title, handle, price, compare_price, vendor, product_type, status, tags, image_url,
           inventory_qty, units_sold_30d, revenue_30d, units_sold_prev_30d, revenue_prev_30d, discount_pct_30d, discount_pct_prev_30d, synced_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW())
         ON CONFLICT (shopify_id) DO UPDATE SET
           title = EXCLUDED.title, price = EXCLUDED.price, compare_price = EXCLUDED.compare_price,
           inventory_qty = EXCLUDED.inventory_qty, units_sold_30d = EXCLUDED.units_sold_30d,
           revenue_30d = EXCLUDED.revenue_30d, units_sold_prev_30d = EXCLUDED.units_sold_prev_30d,
           revenue_prev_30d = EXCLUDED.revenue_prev_30d, discount_pct_30d = EXCLUDED.discount_pct_30d,
           discount_pct_prev_30d = EXCLUDED.discount_pct_prev_30d, image_url = EXCLUDED.image_url,
           updated_at = NOW()
         RETURNING id, title`,
        [
          p.shopify_id,
          p.title,
          p.handle,
          p.price,
          p.compare_price,
          p.vendor,
          p.product_type,
          p.status,
          p.tags,
          p.image_url,
          p.inventory_qty,
          p.units_sold_30d,
          p.revenue_30d,
          p.units_sold_prev_30d,
          p.revenue_prev_30d,
          p.discount_pct_30d,
          p.discount_pct_prev_30d,
        ]
      );
      productDbMap.push(rows[0]);
    }
    console.log(`[seedDemoData] ✓ ${productDbMap.length} Products seeded`);

    // Clean existing orders and line items first
    await client.query("DELETE FROM order_items");
    await client.query("DELETE FROM orders");
    await client.query("DELETE FROM customers WHERE shopify_id LIKE 'demo-cust-%' OR shopify_id LIKE 'gen-cust-%'");

    // 2. Customers
    const firstNames = ["James", "Emma", "Olivia", "Liam", "Sophia", "Noah", "Ava", "Lucas", "Mia", "Ethan", "Isabella", "Mason"];
    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];
    
    // Seed initial 30 named customers in bulk
    const customerValues = [];
    const customerParams = [];
    for (let i = 1; i <= 30; i++) {
      const fn = firstNames[i % firstNames.length];
      const ln = lastNames[i % lastNames.length];
      const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.com`;
      const spend = (Math.random() * 300 + 45).toFixed(2);
      const ordersCount = Math.floor(Math.random() * 4) + 1;
      const offset = (i - 1) * 5;
      customerValues.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, NOW())`);
      customerParams.push(`demo-cust-${i}`, `${fn} ${ln}`, email, spend, ordersCount);
    }
    const { rows: insertedCusts } = await client.query(
      `INSERT INTO customers (shopify_id, name, email, total_spend, orders_count, synced_at)
       VALUES ${customerValues.join(", ")}
       RETURNING id`,
      customerParams
    );
    const primaryCustomerId = insertedCusts[0].id;

    // Fast batch generation for total customer count closer to ~1,842
    await client.query(`
      INSERT INTO customers (shopify_id, name, email, total_spend, orders_count, synced_at)
      SELECT
        'gen-cust-' || s.i,
        'Customer ' || s.i,
        'customer' || s.i || '@example.com',
        ROUND((RANDOM() * 150 + 25)::numeric, 2),
        FLOOR(RANDOM() * 3 + 1)::int,
        NOW() - (RANDOM() * INTERVAL '90 days')
      FROM generate_series(1, 1812) AS s(i)
    `);
    console.log("[seedDemoData] ✓ Customers seeded (~1,842 total)");

    // 3. Orders matching scope: 2,184 orders, $124,820 revenue ($57.15 avg)
    const targetOrders = 2184;
    const avgOrderAmount = 57.15;

    const { rows: insertedOrders } = await client.query(`
      INSERT INTO orders (shopify_id, customer_id, order_date, total_amount, synced_at)
      SELECT
        'demo-ord-' || s.i,
        ${primaryCustomerId},
        NOW() - (RANDOM() * INTERVAL '28 days'),
        ROUND((${avgOrderAmount} + (RANDOM() * 30 - 15))::numeric, 2),
        NOW()
      FROM generate_series(1, ${targetOrders}) AS s(i)
      RETURNING id
    `);

    // Attach order items in bulk
    const hoodieId = productDbMap[0].id;
    const denimId = productDbMap[2].id;
    const shoesId = productDbMap[1].id;
    const socksId = productDbMap[5].id;
    const shirtId = productDbMap[3].id;

    const itemRows = [];
    for (let i = 0; i < Math.min(250, insertedOrders.length); i++) {
      const ordId = insertedOrders[i].id;
      if (i < 130) {
        // Cross-sell pair (Hoodie + Denim Jacket)
        itemRows.push(`(${ordId}, ${hoodieId}, 1, 85.0)`);
        itemRows.push(`(${ordId}, ${denimId}, 1, 95.0)`);
      } else if (i < 190) {
        itemRows.push(`(${ordId}, ${shoesId}, 1, 120.0)`);
        itemRows.push(`(${ordId}, ${socksId}, 2, 18.0)`);
      } else {
        itemRows.push(`(${ordId}, ${shirtId}, 2, 28.0)`);
      }
    }

    if (itemRows.length > 0) {
      await client.query(`INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ${itemRows.join(", ")}`);
    }
    console.log("[seedDemoData] ✓ Orders & Line Items seeded ($124.8K revenue / 2,184 orders)");

    // 4. Reviews
    await client.query("DELETE FROM reviews");
    for (const r of REVIEWS) {
      const prod = productDbMap[r.product_idx];
      if (prod) {
        await client.query(
          `INSERT INTO reviews (product_id, rating, review_text, synced_at) VALUES ($1, $2, $3, NOW())`,
          [prod.id, r.rating, r.review_text]
        );
      }
    }
    console.log("[seedDemoData] ✓ Reviews seeded");

    // 5. Seed Pre-analyzed Recommendations (all 5 types from Scope doc)
    await client.query("DELETE FROM recommendations");
    for (const rec of INITIAL_RECOMMENDATIONS) {
      const prod = productDbMap[rec.product_idx];
      await client.query(
        `INSERT INTO recommendations
          (type, product_id, title, explanation, suggested_action, supporting_data, confidence, ai_provider, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
        [
          rec.type,
          prod ? prod.id : null,
          rec.title,
          rec.explanation,
          rec.suggested_action,
          JSON.stringify(rec.supporting_data),
          rec.confidence,
          process.env.AI_PROVIDER || "mock",
          rec.status,
        ]
      );
    }
    console.log(`[seedDemoData] ✓ ${INITIAL_RECOMMENDATIONS.length} Recommendations seeded (all 5 scope types)`);

    await client.query("COMMIT");
    console.log("\n==================================================");
    console.log("✅ DEMO MVP DATASET SEEDED SUCCESSFULLY!");
    console.log("   - Store: Fashion & Apparel");
    console.log("   - Products: 8 items");
    console.log("   - Revenue: ~$124,820 (30 days)");
    console.log("   - Orders: 2,184");
    console.log("   - Customers: ~1,842");
    console.log("   - 6 AI Opportunities active & ready for demo");
    console.log("==================================================\n");
    return {
      success: true,
      store: "Fashion & Apparel",
      products: productDbMap.length,
      orders: targetOrders,
      customers: 1842,
      recommendations: INITIAL_RECOMMENDATIONS.length,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[seedDemoData] ❌ Failed to seed:", err.message);
    throw err;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { seed };
