/**
 * scripts/syncShopify.js
 * Pulls live products from the connected Shopify store, sets up analytics baseline,
 * and generates live AI recommendations immediately.
 * Run command: node scripts/syncShopify.js  (or: npm run sync)
 */
require("dotenv").config();
const { syncRealShopifyStore } = require("../services/storeSync");

async function main() {
  console.log("[sync] Connecting to live Shopify store...");
  const result = await syncRealShopifyStore();
  console.log(`[sync] ✅ Complete! Synced ${result.products_synced} products from "${result.shop}".`);
  console.log(`[sync] ✅ Generated ${result.recommendations_created} AI recommendations ready on the dashboard!`);
  process.exit(0);
}

main().catch((err) => {
  console.error("[sync] ❌ Sync failed:", err.message);
  process.exit(1);
});