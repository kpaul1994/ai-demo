/**
 * lib/recommendationEngine.js
 * Takes raw findings from analytics.js and uses the AI layer (provider-agnostic) to
 * generate explanations + suggested actions and save them to the recommendations table.
 */
const db = require("../db");
const ai = require("../services/ai");
const analytics = require("./analytics");

async function saveRecommendation({ type, productId, title, explanation, suggestedAction, supportingData, confidence }) {
  const { rows } = await db.query(
    `INSERT INTO recommendations
      (type, product_id, title, explanation, suggested_action, supporting_data, confidence, ai_provider)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [type, productId, title, explanation, suggestedAction, JSON.stringify(supportingData || {}), confidence, ai.getActiveProviderName()]
  );
  return rows[0];
}

async function generatePricingRecommendations() {
  const products = await analytics.findPricingOpportunities();
  const created = [];
  for (const p of products) {
    const systemPrompt = "You are an e-commerce pricing analyst. Reply in 2-3 concise sentences.";
    const userPrompt = `
Product: ${p.title}
Current price: $${p.price}
Units sold this period: ${p.units_sold_30d} (previous: ${p.units_sold_prev_30d})
Discount trend: ${p.discount_pct_30d}% (previous: ${p.discount_pct_prev_30d}%)

Explain why a small price increase (e.g. 5%) could be a good opportunity right now, and state the suggested action.`.trim();

    const explanation = await ai.generateText({ systemPrompt, userPrompt, maxTokens: 200 });
    const rec = await saveRecommendation({
      type: "pricing",
      productId: p.id,
      title: `Increase ${p.title} price by 5%`,
      explanation,
      suggestedAction: "Test a 5% price increase",
      supportingData: {
        current_price: p.price,
        units_sold_30d: p.units_sold_30d,
        units_sold_prev_30d: p.units_sold_prev_30d,
      },
      confidence: 0.75,
    });
    created.push(rec);
  }
  return created;
}

async function generateDecliningProductRecommendations() {
  const products = await analytics.findDecliningProducts();
  const created = [];
  for (const p of products) {
    const revenueChangePct = (((p.revenue_30d - p.revenue_prev_30d) / p.revenue_prev_30d) * 100).toFixed(1);
    const systemPrompt = "You are an e-commerce analyst. Reply in 2-3 concise sentences.";
    const userPrompt = `
Product: ${p.title}
Revenue this period: $${p.revenue_30d} (previous: $${p.revenue_prev_30d}, change: ${revenueChangePct}%)
Units sold: ${p.units_sold_30d} (previous: ${p.units_sold_prev_30d})

Explain the likely cause of this decline and suggest one concrete action.`.trim();

    const explanation = await ai.generateText({ systemPrompt, userPrompt, maxTokens: 200 });
    const rec = await saveRecommendation({
      type: "product_performance",
      productId: p.id,
      title: `${p.title} has declining performance`,
      explanation,
      suggestedAction: "Review pricing, marketing spend, or run a promotion",
      supportingData: {
        revenue_30d: p.revenue_30d,
        revenue_prev_30d: p.revenue_prev_30d,
        revenue_change_pct: revenueChangePct,
      },
      confidence: 0.7,
    });
    created.push(rec);
  }
  return created;
}

async function generateCrossSellRecommendations() {
  const pairs = await analytics.findCrossSellPairs();
  const created = [];
  for (const pair of pairs) {
    const systemPrompt = "You are an e-commerce marketing strategist. Reply in 2-3 concise sentences.";
    const userPrompt = `
Customers who buy "${pair.product_a_title}" also buy "${pair.product_b_title}" (${pair.co_purchase_count} co-purchases).

Suggest a cross-sell campaign idea for this pair.`.trim();

    const explanation = await ai.generateText({ systemPrompt, userPrompt, maxTokens: 200 });
    const rec = await saveRecommendation({
      type: "cross_sell",
      productId: pair.product_a_id,
      title: `Customers buying ${pair.product_a_title} are likely to buy ${pair.product_b_title}`,
      explanation,
      suggestedAction: `Bundle or recommend ${pair.product_b_title} at checkout for ${pair.product_a_title} buyers`,
      supportingData: {
        product_b_id: pair.product_b_id,
        product_b_title: pair.product_b_title,
        co_purchase_count: pair.co_purchase_count,
      },
      confidence: 0.65,
    });
    created.push(rec);
  }
  return created;
}

async function generateInventoryRecommendations() {
  const products = await analytics.findLowInventory();
  const created = [];
  for (const p of products) {
    const systemPrompt = "You are an inventory planning analyst. Reply in 2-3 concise sentences.";
    const userPrompt = `
Product: ${p.title}
Current inventory: ${p.inventory_qty} units
Sales velocity: ${p.units_sold_30d} units / 30 days
Estimated days remaining: ${p.days_remaining}

Explain the stockout risk and suggest an action.`.trim();

    const explanation = await ai.generateText({ systemPrompt, userPrompt, maxTokens: 200 });
    const rec = await saveRecommendation({
      type: "inventory",
      productId: p.id,
      title: `${p.title} may run out of stock soon`,
      explanation,
      suggestedAction: "Reorder stock or pause promotions for this product",
      supportingData: {
        inventory_qty: p.inventory_qty,
        units_sold_30d: p.units_sold_30d,
        days_remaining: p.days_remaining,
      },
      confidence: 0.8,
    });
    created.push(rec);
  }
  return created;
}

async function generateCustomerCampaignRecommendations() {
  const pairs = await analytics.findCrossSellPairs();
  const created = [];
  for (const pair of pairs.slice(0, 2)) { // Only top 2 pairs to build campaigns from, to avoid excessive AI calls
    const audience = await analytics.findCampaignAudience(pair.product_a_id, pair.product_b_id);
    if (audience.length === 0) continue;

    const systemPrompt = "You are a lifecycle marketing strategist. Reply in 2-3 concise sentences with a suggested offer/message.";
    const userPrompt = `
${audience.length} customers bought "${pair.product_a_title}" but not "${pair.product_b_title}".

Suggest a targeted campaign message/offer to convert them.`.trim();

    const explanation = await ai.generateText({ systemPrompt, userPrompt, maxTokens: 200 });
    const rec = await saveRecommendation({
      type: "customer_campaign",
      productId: pair.product_b_id,
      title: `Target customers who bought ${pair.product_a_title} but not ${pair.product_b_title}`,
      explanation,
      suggestedAction: `Send a targeted email/offer for ${pair.product_b_title}`,
      supportingData: {
        audience_size: audience.length,
        product_a_title: pair.product_a_title,
        product_b_title: pair.product_b_title,
      },
      confidence: 0.6,
    });
    created.push(rec);
  }
  return created;
}

async function generateReviewRecommendations() {
  const products = await analytics.findReviewProblems();
  const created = [];
  for (const p of products) {
    const reviewsText = (p.review_samples || []).join(" | ");
    const systemPrompt = "You are an e-commerce product quality & customer experience analyst. Reply in 2-3 concise sentences summarizing the review issue and suggesting a fix.";
    const userPrompt = `
Product: ${p.title}
Average Rating: ${p.avg_rating} / 5.0 (${p.review_count} reviews)
Customer reviews: "${reviewsText}"

Summarize the main customer pain point and suggest an immediate corrective action.`.trim();

    const explanation = await ai.generateText({ systemPrompt, userPrompt, maxTokens: 200 });
    const rec = await saveRecommendation({
      type: "review_sentiment",
      productId: p.id,
      title: `${p.title} has negative customer review trends`,
      explanation,
      suggestedAction: "Update product sizing guide and notify suppliers of quality feedback",
      supportingData: {
        avg_rating: `${p.avg_rating} / 5.0`,
        review_count: p.review_count,
        sample_feedback: p.review_samples?.[0] || "Customer sizing complaints",
      },
      confidence: 0.85,
    });
    created.push(rec);
  }
  return created;
}

/** Generate all types of recommendations at once (used by the Dashboard's "Analyze" button) */
async function generateAllRecommendations() {
  const results = await Promise.allSettled([
    generatePricingRecommendations(),
    generateDecliningProductRecommendations(),
    generateCrossSellRecommendations(),
    generateInventoryRecommendations(),
    generateCustomerCampaignRecommendations(),
    generateReviewRecommendations(),
  ]);

  const all = [];
  results.forEach((r) => {
    if (r.status === "fulfilled") all.push(...r.value);
    else console.error("[recommendationEngine] a generator failed:", r.reason.message);
  });
  return all;
}

module.exports = {
  generatePricingRecommendations,
  generateDecliningProductRecommendations,
  generateCrossSellRecommendations,
  generateInventoryRecommendations,
  generateCustomerCampaignRecommendations,
  generateReviewRecommendations,
  generateAllRecommendations,
};
