import { useEffect, useState } from "react";
import { api } from "../lib/api";
import Layout from "../components/Layout";

function formatMoney(n) {
  return `$${Number(n || 0).toFixed(2)}`;
}

export default function Settings() {
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState("");
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const [s, p] = await Promise.all([
        api.storeStatus().catch(() => null),
        api.products().catch(() => ({ products: [] })),
      ]);
      setStore(s);
      setProducts(p.products || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSeedDemo() {
    setActionLoading(true);
    setNotification("");
    setError("");
    try {
      const res = await api.seedDemo();
      setNotification(res.message || "Demo dataset loaded!");
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSyncShopify() {
    setActionLoading(true);
    setNotification("");
    setError("");
    try {
      const res = await api.syncShopify();
      setNotification(res.message || "Live Shopify products synced!");
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  const isConnected = !!store?.connected;

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Shopify Connection</h1>
          <p className="page-subtitle">Manage store integration and demo datasets.</p>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          {/* <button
            className="btn btn-ghost"
            onClick={handleSeedDemo}
            disabled={actionLoading}
            title="Reset store data to the $124.8K Fashion & Apparel Demo MVP dataset"
          >
            ⚡ Load Demo Store ($124.8K)
          </button> */}
          <button
            className="btn btn-primary"
            onClick={handleSyncShopify}
            disabled={actionLoading}
            title="Sync live products from connected Shopify store"
          >
            {actionLoading ? "Syncing…" : "🔄 Sync from Shopify"}
          </button>
        </div>
      </div>

      {notification && (
        <div style={{
          background: "var(--green-soft)",
          border: "1px solid var(--green-border)",
          color: "var(--green)",
          borderRadius: 10,
          padding: "12px 18px",
          marginBottom: 18,
          fontSize: 13.5,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}>
          <span>✓</span>
          <span>{notification}</span>
        </div>
      )}

      {error && <div className="alert-error" style={{ marginBottom: 18 }}>{error}</div>}

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="skeleton" style={{ height: 84, borderRadius: 14 }} />
          <div className="skeleton" style={{ height: 320, borderRadius: 14 }} />
        </div>
      ) : (
        <>
          {/* Connection status badge */}
          {isConnected ? (
            <div className="store-connected-badge" style={{ marginBottom: 18 }}>
              <div className="store-connected-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="store-connected-title">Shopify Connected ✓</div>

                </div>
                <div className="store-connected-sub" style={{ marginTop: 2 }}>
                  Store: <strong style={{ color: "inherit" }}>{store?.shop?.name || store?.domain}</strong> ({store?.domain})
                  {" · "}
                  {store?.shop?.currency || "USD"}
                  {" · "}
                  {products.length} products synced
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              background: "var(--red-soft)",
              border: "1.5px solid var(--red-border)",
              borderRadius: "var(--radius-lg)",
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 20,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 11,
                background: "var(--red)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--red)" }}>Store Offline</div>
                <div style={{ fontSize: 13, color: "var(--red)", opacity: 0.7, marginTop: 2 }}>Could not reach the backend server.</div>
              </div>
            </div>
          )}

          {/* System & Store info */}
          <div className="card" style={{ padding: "20px 24px", marginBottom: 18, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Store Domain</div>
              <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 14, fontWeight: 600 }}>{store?.domain || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>AI Provider</div>
              <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 14, fontWeight: 600, color: "var(--brand)" }}>{store?.ai_provider || "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Database Status</div>
              <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 14, fontWeight: 600, color: "var(--green)" }}>
                ● PostgreSQL Active
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Catalog Size</div>
              <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 14, fontWeight: 600 }}>{products.length} products</div>
            </div>
          </div>

          {/* Products table */}
          <div className="card" style={{ overflow: "hidden" }}>
            <div style={{ padding: "18px 24px 14px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: 15, fontWeight: 700 }}>Store Products & Inventory</h2>
              <span style={{ fontSize: 12.5, color: "var(--ink-muted)" }}>{products.length} items</span>
            </div>
            <div style={{ overflowY: "auto", maxHeight: 420 }}>
              {products.length === 0 ? (
                <div className="empty-state" style={{ padding: "40px 24px" }}>
                  <div style={{ fontSize: 13 }}>No products found. Click "Load Demo Store" or "Sync from Shopify" above.</div>
                </div>
              ) : (
                <table className="product-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Type</th>
                      <th>Vendor</th>
                      <th style={{ textAlign: "right" }}>Price</th>
                      <th style={{ textAlign: "right" }}>Inventory</th>
                      <th style={{ textAlign: "right" }}>Sold (30d)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.slice(0, 50).map((p) => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 500 }}>{p.title}</td>
                        <td style={{ color: "var(--ink-muted)" }}>{p.product_type || "—"}</td>
                        <td style={{ color: "var(--ink-muted)" }}>{p.vendor || "—"}</td>
                        <td className="mono" style={{ textAlign: "right" }}>{formatMoney(p.price)}</td>
                        <td className="mono" style={{ textAlign: "right", color: p.inventory_qty <= 15 ? "var(--red)" : "var(--ink)" }}>
                          {p.inventory_qty ?? 0}
                          {p.inventory_qty <= 15 && <span style={{ fontSize: 11, marginLeft: 4 }}>⚠️ Low</span>}
                        </td>
                        <td className="mono" style={{ textAlign: "right", color: "var(--green)" }}>
                          {p.units_sold_30d ?? 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
