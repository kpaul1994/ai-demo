# Demo Store Dataset — Fashion & Apparel (Scope Section 11)

This folder contains realistic, official Shopify-formatted CSV datasets built strictly according to:
**AI E-commerce Optimization Platform — Demo MVP Scope (Section 11: Demo Data)**

---

## 📁 Included Files

1. **`shopify_products.csv`**
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

2. **`shopify_customers.csv`**
   - Official Shopify Customer Import format.
   - 120 realistic customers with names, emails, addresses, total orders, and lifetime spend tags.
   - Importable via **Shopify Admin > Customers > Import**.

3. **`shopify_orders.csv`**
   - Order history formatted with deliberate business opportunity patterns:
     - **Increasing product**: Surging order volume on *Premium Hoodie*.
     - **Declining product**: Decreasing order frequency on *Running Shoes*.
     - **Cross-sell relationship**: Co-purchases between *Premium Hoodie* and *Denim Jacket*.
     - **Low inventory velocity**: High sales rate on *Running Socks*.

4. **`product_reviews.csv`**
   - Review sentiment dataset compatible with Judge.me / Loox / Shopify Product Reviews:
     - **Review problems**: 2.5★ rating on *Running Shoes* with complaints about narrow toe box sizing.
     - **High praise**: 5.0★ rating on *Premium Hoodie* and *Denim Jacket*.

---

## ⚡ How to Import Into Shopify
- **Products**: Go to `Shopify Admin > Products > Import`, select `shopify_products.csv`, check "Publish new products", and click **Upload and continue**.
- **Customers**: Go to `Shopify Admin > Customers > Import`, select `shopify_customers.csv`, and click **Import customers**.

---

## 🚀 How to Load Directly in the Demo Platform
- Run: `npm run seed:demo` on the command line.
- OR in the web UI, go to **Store Connection** and click **`⚡ Load Demo Store ($124.8K)`**.
