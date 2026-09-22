import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import Layout from "../components/Layout";

function formatMoney(n) {
  return `$${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function formatNum(n) {
  return Number(n || 0).toLocaleString();
}

const TYPE_META = {
  pricing:              { label: "Pricing",           color: "var(--amber)",  bg: "var(--amber-soft)",  border: "var(--amber-border)"  },
  product_performance:  { label: "Performance",       color: "var(--red)",    bg: "var(--red-soft)",    border: "var(--red-border)"    },
  cross_sell:           { label: "Cross-sell",        color: "var(--blue)",   bg: "var(--blue-soft)",   border: "var(--blue-border)"   },
  inventory:            { label: "Inventory",         color: "var(--purple)", bg: "var(--purple-soft)", border: "var(--purple-border)" },
  customer_campaign:    { label: "Campaign",          color: "var(--teal)",   bg: "var(--teal-soft)",   border: "var(--teal-border)"   },
  review_sentiment:     { label: "Reviews",           color: "var(--rose)",   bg: "rgba(244,63,94,0.12)", border: "rgba(244,63,94,0.28)" },
};

const KPI_ICONS = {
  revenue:   { icon: "$", color: "var(--green)",  bg: "var(--green-soft)",  css: "--kpi-color: var(--green); --kpi-bg: var(--green-soft);" },
  orders:    { icon: "📦", color: "var(--blue)",   bg: "var(--blue-soft)",   css: "--kpi-color: var(--blue); --kpi-bg: var(--blue-soft);" },
  aov:       { icon: "⌀", color: "var(--brand)",  bg: "var(--brand-soft)",  css: "--kpi-color: var(--brand); --kpi-bg: var(--brand-soft);" },
  customers: { icon: "👥", color: "var(--amber)",  bg: "var(--amber-soft)",  css: "--kpi-color: var(--amber); --kpi-bg: var(--amber-soft);" },
};

function KpiCard({ label, value, kpiKey }) {
  const meta = KPI_ICONS[kpiKey] || KPI_ICONS.orders;
  return (
    <div className="kpi-card" style={{ ["--kpi-color"]: meta.color, ["--kpi-bg"]: meta.bg }}>
      <div className="kpi-icon">
        <span style={{ fontSize: 17 }}>{meta.icon}</span>
      </div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
    </div>
  );
}

function RecPreviewCard({ rec, onClick }) {
  const meta = TYPE_META[rec.type] || { label: rec.type, color: "var(--brand)", bg: "var(--brand-soft)", border: "var(--line)" };
  return (
    <div
      className="rec-card"
      onClick={onClick}
      style={{ ["--type-color"]: meta.color, ["--type-bg"]: meta.bg, ["--type-border"]: meta.border }}
    >
      <div className="rec-card-body">
        <span className="rec-type-badge" style={{ color: meta.color, background: meta.bg, borderColor: meta.border }}>
          {meta.label}
        </span>
        <p className="rec-card-title">{rec.title}</p>
        {rec.product_title && <p className="rec-card-product">{rec.product_title}</p>}
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </div>
  );
}

export default function Dashboard() {
  const [kpi, setKpi] = useState(null);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [d, r] = await Promise.all([
        api.dashboard(),
        api.recommendations({ status: "open" }),
      ]);
      setKpi(d);
      setRecs(r.recommendations.slice(0, 5));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleAnalyze() {
    setGenerating(true);
    setError("");
    try {
      await api.generateRecommendations();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Layout>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Last 30 days · synced from your Shopify store</p>
        </div>
        <button id="analyze-btn" className="btn btn-primary" onClick={handleAnalyze} disabled={generating}>
          {generating ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}>
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.3"/><path d="M21 12a9 9 0 00-9-9"/>
              </svg>
              Analyzing…
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              Analyze store
            </>
          )}
        </button>
      </div>

      {error && <div className="alert-error" style={{ marginBottom: 20 }}>{error}</div>}

      {loading ? (
        <SkeletonDash />
      ) : (
        <>
          {/* KPI Grid */}
          <div className="kpi-grid">
            <KpiCard label="Revenue (30d)" value={formatMoney(kpi?.revenue)} kpiKey="revenue" />
            <KpiCard label="Orders (30d)"  value={formatNum(kpi?.orders)}   kpiKey="orders"  />
            <KpiCard label="Avg. Order Value" value={formatMoney(kpi?.aov)} kpiKey="aov"     />
            <KpiCard label="Customers"    value={formatNum(kpi?.customers)} kpiKey="customers"/>
          </div>

          {/* Opportunities Banner */}
          <div className="opportunity-banner">
            <div>
              <div className="opportunity-banner-count">{kpi?.open_opportunities ?? 0}</div>
              <div className="opportunity-banner-text">
                open AI opportunities identified in your store
              </div>
              {kpi?.open_opportunities === 0 && (
                <div style={{ fontSize: 12, color: "#a5b4fc", marginTop: 6 }}>
                  Click "Analyze store" to generate recommendations
                </div>
              )}
            </div>
            <Link to="/recommendations" className="opportunity-banner-link">
              View all recommendations
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </Link>
          </div>

          {/* Top Recommendations */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Top recommendations</h2>
            {recs.length > 0 && (
              <Link to="/recommendations" style={{ fontSize: 13, color: "var(--brand)", fontWeight: 600 }}>See all →</Link>
            )}
          </div>

          {recs.length === 0 ? (
            <div className="card" style={{ padding: "32px 24px" }}>
              <div className="empty-state" style={{ padding: "20px 0" }}>
                <div className="empty-state-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                </div>
                <div style={{ fontWeight: 600, color: "var(--ink-soft)" }}>No recommendations yet</div>
                <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>Click "Analyze store" above to let AI find opportunities in your data.</div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recs.map((r) => (
                <RecPreviewCard key={r.id} rec={r} onClick={() => navigate(`/recommendations/${r.id}`)} />
              ))}
            </div>
          )}
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Layout>
  );
}

function SkeletonDash() {
  return (
    <>
      <div className="kpi-grid">
        {[0,1,2,3].map(i => (
          <div key={i} className="kpi-card">
            <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 9, marginBottom: 14 }} />
            <div className="skeleton" style={{ width: "60%", height: 12, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: "80%", height: 28 }} />
          </div>
        ))}
      </div>
      <div className="skeleton" style={{ height: 90, borderRadius: 14, marginBottom: 28 }} />
      <div className="skeleton" style={{ height: 18, width: 180, marginBottom: 14 }} />
      {[0,1,2].map(i => (
        <div key={i} className="skeleton" style={{ height: 68, borderRadius: 12, marginBottom: 10 }} />
      ))}
    </>
  );
}
