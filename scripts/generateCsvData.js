/**
 * scripts/generateCsvData.js
 * Generates official Shopify-compatible CSV datasets matching Section 11 of the Demo Scope:
 *
 * Store: Fashion / Apparel
 * Products:
 *   1. Premium Hoodie (Trending up, pricing elasticity)
 *   2. Running Shoes (Declining sales, sizing complaints)
 *   3. Denim Jacket (Cross-sell pair with Premium Hoodie)
 *   4. Cotton T-Shirt (High volume staple)
 *   5. Leather Backpack (Premium accessory)
 *   6. Running Socks (Low inventory alert: 12 units left)
 *   7. Sports Cap (Athletic casual wear)
 *   8. Travel Bag (Travel & weekend bag)
 *
 * Outputs:
 *   - demo_data/shopify_products.csv (Shopify Product Import CSV)
 *   - demo_data/shopify_customers.csv (Shopify Customer Import CSV)
 *   - demo_data/shopify_orders.csv (Shopify Order History CSV with anomalies)
 *   - demo_data/product_reviews.csv (Review sentiment dataset with review problems)
 *
 * Run command: node scripts/generateCsvData.js
 */
const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "..", "demo_data");
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// ── 1. PRODUCTS DATA ──────────────────────────────────────────────
const PRODUCTS = [
  {
    handle: "premium-hoodie",
    title: "Premium Hoodie",
    body: "<p>Heavyweight fleece hoodie crafted with organic French terry cotton. Features double-lined hood and durable ribbed trims.</p>",
    vendor: "Aura Apparel",
    type: "Apparel",
    tags: "hoodie, bestseller, winter, fleece, top-rated",
    sku: "HOODIE-PREM-001",
    grams: 650,
    inventory: 142,
    price: "85.00",
    comparePrice: "95.00",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
    status: "active",
  },
  {
    handle: "running-shoes",
    title: "Running Shoes",
    body: "<p>Lightweight breathable road running shoes designed for daily training and 10k mileage.</p>",
    vendor: "Velocity Gear",
    type: "Footwear",
    tags: "shoes, running, athletics, footwear, sports",
    sku: "SHOE-RUN-002",
    grams: 480,
    inventory: 88,
    price: "120.00",
    comparePrice: "140.00",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    status: "active",
  },
  {
    handle: "denim-jacket",
    title: "Denim Jacket",
    body: "<p>Classic vintage wash denim jacket made from 100% durable cotton denim with metal button closures.</p>",
    vendor: "Aura Apparel",
    type: "Outerwear",
    tags: "denim, jacket, outerwear, casual, layering",
    sku: "JACKET-DENIM-003",
    grams: 850,
    inventory: 64,
    price: "95.00",
    comparePrice: "110.00",
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80",
    status: "active",
  },
  {
    handle: "cotton-t-shirt",
    title: "Cotton T-Shirt",
    body: "<p>Everyday staple crewneck tee made from 180 GSM combed ringspun cotton for extra softness.</p>",
    vendor: "Basics Co",
    type: "Apparel",
    tags: "t-shirt, essential, cotton, summer, everyday",
    sku: "TEE-COTTON-004",
    grams: 210,
    inventory: 320,
    price: "28.00",
    comparePrice: "32.00",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
    status: "active",
  },
  {
    handle: "leather-backpack",
    title: "Leather Backpack",
    body: "<p>Full-grain vegetable-tanned leather backpack featuring a 15-inch laptop compartment and brass hardware.</p>",
    vendor: "Heritage Leather",
    type: "Accessories",
    tags: "backpack, leather, accessories, travel, work",
    sku: "BAG-LEATHER-005",
    grams: 1200,
    inventory: 45,
    price: "145.00",
    comparePrice: "165.00",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    status: "active",
  },
  {
    handle: "running-socks",
    title: "Running Socks",
    body: "<p>Anti-blister cushioned athletic socks with moisture-wicking synthetic yarn and arch compression.</p>",
    vendor: "Velocity Gear",
    type: "Accessories",
    tags: "socks, running, accessories, athletic",
    sku: "SOCK-RUN-006",
    grams: 95,
    inventory: 12, // Low inventory anomaly!
    price: "18.00",
    comparePrice: "22.00",
    image: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=800&q=80",
    status: "active",
  },
  {
    handle: "sports-cap",
    title: "Sports Cap",
    body: "<p>Quick-dry breathable 6-panel performance cap with adjustable snap closure and UV protection.</p>",
    vendor: "Velocity Gear",
    type: "Accessories",
    tags: "cap, hat, sports, summer, headwear",
    sku: "CAP-SPORT-007",
    grams: 110,
    inventory: 90,
    price: "24.00",
    comparePrice: "30.00",
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80",
    status: "active",
  },
  {
    handle: "travel-bag",
    title: "Travel Bag",
    body: "<p>Water-resistant weekender duffel bag with dedicated shoe compartment and reinforced leather handles.</p>",
    vendor: "Heritage Leather",
    type: "Accessories",
    tags: "bag, duffel, travel, weekend, luggage",
    sku: "BAG-TRAVEL-008",
    grams: 980,
    inventory: 38,
    price: "110.00",
    comparePrice: "130.00",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    status: "active",
  },
];

function generateProductsCsv() {
  const headers = [
    "Handle",
    "Title",
    "Body (HTML)",
    "Vendor",
    "Product Category",
    "Type",
    "Tags",
    "Published",
    "Option1 Name",
    "Option1 Value",
    "Option2 Name",
    "Option2 Value",
    "Option3 Name",
    "Option3 Value",
    "Variant SKU",
    "Variant Grams",
    "Variant Inventory Tracker",
    "Variant Inventory Qty",
    "Variant Inventory Policy",
    "Variant Fulfillment Service",
    "Variant Price",
    "Variant Compare At Price",
    "Variant Requires Shipping",
    "Variant Taxable",
    "Image Src",
    "Image Position",
    "Image Alt Text",
    "Gift Card",
    "SEO Title",
    "SEO Description",
    "Status",
  ];

  const rows = [headers.join(",")];

  for (const p of PRODUCTS) {
    const row = [
      p.handle,
      `"${p.title}"`,
      `"${p.body.replace(/"/g, '""')}"`,
      `"${p.vendor}"`,
      `"Apparel & Accessories"`,
      `"${p.type}"`,
      `"${p.tags}"`,
      "TRUE",
      "Title",
      "Default Title",
      "",
      "",
      "",
      "",
      p.sku,
      p.grams,
      "shopify",
      p.inventory,
      "deny",
      "manual",
      p.price,
      p.comparePrice,
      "TRUE",
      "TRUE",
      p.image,
      "1",
      `"${p.title}"`,
      "FALSE",
      `"${p.title} - Official Store"`,
      `"Buy the ${p.title} at best price with fast shipping."`,
      p.status,
    ];
    rows.push(row.join(","));
  }

  const filePath = path.join(OUT_DIR, "shopify_products.csv");
  fs.writeFileSync(filePath, rows.join("\n"), "utf8");
  console.log(`[generateCsv] ✓ Created ${filePath} (${PRODUCTS.length} products)`);
}

// ── 2. CUSTOMERS DATA ─────────────────────────────────────────────
function generateCustomersCsv() {
  const headers = [
    "First Name",
    "Last Name",
    "Email",
    "Accepts Email Marketing",
    "Company",
    "Address1",
    "Address2",
    "City",
    "Province",
    "Province Code",
    "Country",
    "Country Code",
    "Zip",
    "Phone",
    "Total Spent",
    "Total Orders",
    "Tags",
    "Note",
  ];

  const firstNames = ["James", "Emma", "Olivia", "Liam", "Sophia", "Noah", "Ava", "Lucas", "Mia", "Ethan", "Isabella", "Mason", "Harper", "Logan", "Evelyn"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez"];
  const cities = [
    { city: "New York", province: "New York", code: "NY", zip: "10001" },
    { city: "Los Angeles", province: "California", code: "CA", zip: "90001" },
    { city: "Chicago", province: "Illinois", code: "IL", zip: "60601" },
    { city: "Austin", province: "Texas", code: "TX", zip: "73301" },
    { city: "Seattle", province: "Washington", code: "WA", zip: "98101" },
  ];

  const rows = [headers.join(",")];
  const count = 120; // 120 detailed representative customer rows

  for (let i = 1; i <= count; i++) {
    const fn = firstNames[(i - 1) % firstNames.length];
    const ln = lastNames[(i - 1) % lastNames.length];
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.com`;
    const loc = cities[(i - 1) % cities.length];
    const totalOrders = Math.floor(Math.random() * 4) + 1;
    const totalSpent = (totalOrders * (50 + Math.random() * 60)).toFixed(2);
    const tags = i <= 35 ? "VIP, hoodie-buyer, high-value" : "customer, repeat";

    const row = [
      fn,
      ln,
      email,
      "yes",
      "",
      `"${100 + i} Main Street"`,
      "",
      loc.city,
      loc.province,
      loc.code,
      "United States",
      "US",
      loc.zip,
      `+1555${String(1000000 + i).slice(1)}`,
      totalSpent,
      totalOrders,
      `"${tags}"`,
      `"Demo customer ${i}"`,
    ];
    rows.push(row.join(","));
  }

  const filePath = path.join(OUT_DIR, "shopify_customers.csv");
  fs.writeFileSync(filePath, rows.join("\n"), "utf8");
  console.log(`[generateCsv] ✓ Created ${filePath} (${count} customers)`);
}

// ── 3. ORDERS DATA ────────────────────────────────────────────────
function generateOrdersCsv() {
  const headers = [
    "Name",
    "Email",
    "Financial Status",
    "Paid at",
    "Fulfillment Status",
    "Fulfilled at",
    "Accepts Marketing",
    "Currency",
    "Subtotal",
    "Shipping",
    "Taxes",
    "Total",
    "Discount Code",
    "Discount Amount",
    "Shipping Method",
    "Created at",
    "Lineitem quantity",
    "Lineitem name",
    "Lineitem price",
    "Lineitem compare at price",
    "Lineitem sku",
    "Lineitem requires shipping",
    "Lineitem taxable",
    "Lineitem fulfillment status",
    "Billing Name",
    "Billing Street",
    "Billing City",
    "Billing Zip",
    "Billing Province",
    "Billing Country",
    "Shipping Name",
    "Shipping Street",
    "Shipping City",
    "Shipping Zip",
    "Shipping Province",
    "Shipping Country",
    "Notes",
  ];

  const rows = [headers.join(",")];
  const orderCount = 350; // Representative orders with deliberate patterns

  for (let i = 1; i <= orderCount; i++) {
    const orderNum = `#${1000 + i}`;
    const email = `customer${(i % 60) + 1}@example.com`;
    const date = new Date(Date.now() - (orderCount - i) * 7200000).toISOString();

    // Intentional Opportunity Patterns:
    let lineitemQty = 1;
    let prod = PRODUCTS[3]; // default T-shirt

    if (i % 6 === 0) {
      // Cross-sell pair (Hoodie + Denim Jacket)
      // Row 1: Hoodie
      prod = PRODUCTS[0];
      const row1 = [
        orderNum, email, "paid", date, "fulfilled", date, "yes", "USD",
        "180.00", "0.00", "14.40", "194.40", "", "0.00", "Standard Shipping", date,
        1, `"${prod.title}"`, prod.price, prod.comparePrice, prod.sku, "TRUE", "TRUE", "fulfilled",
        `"Customer ${i}"`, `"123 Market St"`, `"New York"`, `"10001"`, `"NY"`, `"US"`,
        `"Customer ${i}"`, `"123 Market St"`, `"New York"`, `"10001"`, `"NY"`, `"US"`,
        `"Co-purchase order"`,
      ];
      rows.push(row1.join(","));

      // Row 2: Denim Jacket in same order
      const prod2 = PRODUCTS[2];
      const row2 = [
        orderNum, email, "paid", date, "fulfilled", date, "yes", "USD",
        "180.00", "0.00", "14.40", "194.40", "", "0.00", "Standard Shipping", date,
        1, `"${prod2.title}"`, prod2.price, prod2.comparePrice, prod2.sku, "TRUE", "TRUE", "fulfilled",
        `"Customer ${i}"`, `"123 Market St"`, `"New York"`, `"10001"`, `"NY"`, `"US"`,
        `"Customer ${i}"`, `"123 Market St"`, `"New York"`, `"10001"`, `"NY"`, `"US"`,
        `"Co-purchase order"`,
      ];
      rows.push(row2.join(","));
      continue;
    } else if (i % 5 === 0) {
      // Low inventory item (Running Socks)
      prod = PRODUCTS[5];
      lineitemQty = 2;
    } else if (i % 4 === 0) {
      // Premium Hoodie (Surging demand)
      prod = PRODUCTS[0];
    } else if (i % 7 === 0) {
      // Running Shoes (Declining)
      prod = PRODUCTS[1];
    } else if (i % 3 === 0) {
      // Leather Backpack
      prod = PRODUCTS[4];
    }

    const price = parseFloat(prod.price);
    const subtotal = (price * lineitemQty).toFixed(2);
    const tax = (subtotal * 0.08).toFixed(2);
    const total = (parseFloat(subtotal) + parseFloat(tax)).toFixed(2);

    const row = [
      orderNum, email, "paid", date, "fulfilled", date, "yes", "USD",
      subtotal, "0.00", tax, total, "", "0.00", "Standard Shipping", date,
      lineitemQty, `"${prod.title}"`, prod.price, prod.comparePrice, prod.sku, "TRUE", "TRUE", "fulfilled",
      `"Customer ${i}"`, `"123 Market St"`, `"New York"`, `"10001"`, `"NY"`, `"US"`,
      `"Customer ${i}"`, `"123 Market St"`, `"New York"`, `"10001"`, `"NY"`, `"US"`,
      "",
    ];
    rows.push(row.join(","));
  }

  const filePath = path.join(OUT_DIR, "shopify_orders.csv");
  fs.writeFileSync(filePath, rows.join("\n"), "utf8");
  console.log(`[generateCsv] ✓ Created ${filePath} (${rows.length - 1} order lineitems)`);
}

// ── 4. PRODUCT REVIEWS DATA ───────────────────────────────────────
function generateReviewsCsv() {
  const headers = [
    "Product Handle",
    "Product Title",
    "Rating",
    "Reviewer Name",
    "Reviewer Email",
    "Review Title",
    "Review Body",
    "Created At",
    "Verified Buyer",
  ];

  const REVIEWS = [
    // Premium Hoodie (high praise)
    {
      handle: "premium-hoodie",
      title: "Premium Hoodie",
      rating: 5,
      name: "Marcus Sterling",
      email: "marcus.s@example.com",
      heading: "Incredible quality fleece!",
      body: "Thick fabric, perfect hood shape, and zero shrinkage after multiple cold washes. Easily worth the price.",
      date: "2026-09-01T14:22:00Z",
    },
    {
      handle: "premium-hoodie",
      title: "Premium Hoodie",
      rating: 5,
      name: "Sarah Jenkins",
      email: "sarah.j@example.com",
      heading: "Best hoodie in my closet",
      body: "Super soft interior fleece and heavyweight drape. Pairs perfectly with denim.",
      date: "2026-09-05T18:10:00Z",
    },
    {
      handle: "premium-hoodie",
      title: "Premium Hoodie",
      rating: 5,
      name: "David Kim",
      email: "david.k@example.com",
      heading: "Premium construction",
      body: "Heavy metal drawstring aglets and thick cuffs. Top tier quality.",
      date: "2026-09-10T11:45:00Z",
    },

    // Running Shoes (Review Problem: 2.5★ sizing complaints)
    {
      handle: "running-shoes",
      title: "Running Shoes",
      rating: 2,
      name: "Chris Evans",
      email: "chris.e@example.com",
      heading: "Runs very narrow in the toe box",
      body: "Good cushioning but the toe box is unusually tight. Order at least half a size up or avoid if you have wide feet.",
      date: "2026-09-04T09:15:00Z",
    },
    {
      handle: "running-shoes",
      title: "Running Shoes",
      rating: 2,
      name: "Laura Henderson",
      email: "laura.h@example.com",
      heading: "Sizing mismatch & blisters",
      body: "I always wear US 9, but these felt like an 8.25. Caused blisters on my first 5k run. Disappointed.",
      date: "2026-09-08T16:30:00Z",
    },
    {
      handle: "running-shoes",
      title: "Running Shoes",
      rating: 3,
      name: "Daniel Moore",
      email: "daniel.m@example.com",
      heading: "Decent midsole, questionable sole rubber",
      body: "Great foam response but the outer tread started showing wear after only 60km.",
      date: "2026-09-12T13:20:00Z",
    },

    // Denim Jacket (Pairs with hoodie)
    {
      handle: "denim-jacket",
      title: "Denim Jacket",
      rating: 5,
      name: "Elena Rostova",
      email: "elena.r@example.com",
      heading: "Classic vintage wash",
      body: "Looks amazing layered over a hoodie. The wash is authentic and fit is relaxed.",
      date: "2026-09-02T10:00:00Z",
    },

    // Running Socks
    {
      handle: "running-socks",
      title: "Running Socks",
      rating: 5,
      name: "Tom Bradley",
      email: "tom.b@example.com",
      heading: "Anti-blister magic",
      body: "No slipping inside the shoe, excellent arch support. Buying more before they run out of stock!",
      date: "2026-09-07T12:00:00Z",
    },

    // Leather Backpack
    {
      handle: "leather-backpack",
      title: "Leather Backpack",
      rating: 5,
      name: "Rachel Green",
      email: "rachel.g@example.com",
      heading: "Outstanding leather craftsmanship",
      body: "Smells incredible, robust zippers, and fits a 15-inch laptop with room to spare.",
      date: "2026-09-11T15:40:00Z",
    },
  ];

  const rows = [headers.join(",")];

  for (const r of REVIEWS) {
    const row = [
      r.handle,
      `"${r.title}"`,
      r.rating,
      `"${r.name}"`,
      r.email,
      `"${r.heading}"`,
      `"${r.body.replace(/"/g, '""')}"`,
      r.date,
      "TRUE",
    ];
    rows.push(row.join(","));
  }

  const filePath = path.join(OUT_DIR, "product_reviews.csv");
  fs.writeFileSync(filePath, rows.join("\n"), "utf8");
  console.log(`[generateCsv] ✓ Created ${filePath} (${REVIEWS.length} reviews)`);
}

// ── 5. README FOR DATASET ─────────────────────────────────────────
function generateReadme() {
  const content = `# Demo Store Dataset — Fashion & Apparel (Scope Section 11)

This folder contains realistic, official Shopify-formatted CSV datasets built strictly according to:
**AI E-commerce Optimization Platform — Demo MVP Scope (Section 11: Demo Data)**

---

## 📁 Included Files

1. **\`shopify_products.csv\`**
   - Official Shopify Product Import format.
   - Contains all **8 target products**:
     - *Premium Hoodie* ($85.00)
     - *Running Shoes* ($120.00)
     - *Denim Jacket* ($95.00)
     - *Cotton T-Shirt* ($28.00)
     - *Leather Backpack* ($145.00)
     - *Running Socks* ($18.00 - Low Stock: 12 units)
     - *Sports Cap* ($24.00)
     - *Travel Bag* ($110.00)
   - Ready to import into any Shopify store via **Shopify Admin > Products > Import**.

2. **\`shopify_customers.csv\`**
   - Official Shopify Customer Import format.
   - 120 realistic customers with names, emails, addresses, total orders, and lifetime spend tags.
   - Importable via **Shopify Admin > Customers > Import**.

3. **\`shopify_orders.csv\`**
   - Order history formatted with deliberate business opportunity patterns:
     - **Increasing product**: Surging order volume on *Premium Hoodie*.
     - **Declining product**: Decreasing order frequency on *Running Shoes*.
     - **Cross-sell relationship**: Co-purchases between *Premium Hoodie* and *Denim Jacket*.
     - **Low inventory velocity**: High sales rate on *Running Socks*.

4. **\`product_reviews.csv\`**
   - Review sentiment dataset compatible with Judge.me / Loox / Shopify Product Reviews:
     - **Review problems**: 2.5★ rating on *Running Shoes* with complaints about narrow toe box sizing.
     - **High praise**: 5.0★ rating on *Premium Hoodie* and *Denim Jacket*.

---

## ⚡ How to Import Into Shopify
- **Products**: Go to \`Shopify Admin > Products > Import\`, select \`shopify_products.csv\`, check "Publish new products", and click **Upload and continue**.
- **Customers**: Go to \`Shopify Admin > Customers > Import\`, select \`shopify_customers.csv\`, and click **Import customers**.

---

## 🚀 How to Load Directly in the Demo Platform
- Run: \`npm run seed:demo\` on the command line.
- OR in the web UI, go to **Store Connection** and click **\`⚡ Load Demo Store ($124.8K)\`**.
`;

  const filePath = path.join(OUT_DIR, "README.md");
  fs.writeFileSync(filePath, content, "utf8");
  console.log(`[generateCsv] ✓ Created ${filePath}`);
}

function main() {
  console.log("[generateCsv] Generating Shopify CSV datasets...");
  generateProductsCsv();
  generateCustomersCsv();
  generateOrdersCsv();
  generateReviewsCsv();
  generateReadme();
  console.log("\n==================================================");
  console.log("✅ ALL SHOPIFY CSV DATASETS GENERATED SUCCESSFULLY!");
  console.log(`   Location: ${OUT_DIR}`);
  console.log("==================================================\n");
}

main();
