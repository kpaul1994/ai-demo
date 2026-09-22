import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import Layout from "../components/Layout";

const TYPES = [
  { value: "",                    label: "All types",    icon: "◈" },
  { value: "pricing",             label: "Pricing",      icon: "💰" },
  { value: "product_performance", label: "Performance",  icon: "📉" },
  { value: "cross_sell",          label: "Cross-sell",   icon: "🔗" },
  { value: "inventory",           label: "Inventory",    icon: "📦" },
  { value: "customer_campaign",   label: "Campaign",     icon: "🎯" },
  { value: "review_sentiment",    label: "Reviews",      icon: "⭐" },
];

const TYPE_META = {
  pricing:              { label: "Pricing",     color: "var(--amber)",  bg: "var(--amber-soft)",  border: "var(--amber-border)",  icon: "💰" },
  product_performance:  { label: "Performance", color: "var(--red)",    bg: "var(--red-soft)",    border: "var(--red-border)",    icon: "📉" },
  cross_sell:           { label: "Cross-sell",  color: "var(--blue)",   bg: "var(--blue-soft)",   border: "var(--blue-border)",   icon: "🔗" },
  inventory:            { label: "Inventory",   color: "var(--purple)", bg: "var(--purple-soft)", border: "var(--purple-border)", icon: "📦" },
  customer_campaign:    { label: "Campaign",    color: "var(--teal)",   bg: "var(--teal-soft)",   border: "var(--teal-border)",   icon: "🎯" },
  review_sentiment:     { label: "Reviews",     color: "var(--rose)",   bg: "rgba(244,63,94,0.12)", border: "rgba(244,63,94,0.28)", icon: "⭐" },
};

function RecCard({ rec, onClick }) {
  const meta = TYPE_META[rec.type] || { label: rec.type, color: "var(--brand)", bg: "var(--brand-soft)", border: "var(--line)", icon: "◈" };
  const confidence = rec.confidence ? Math.round(rec.confidence * 100) : null;

  return (
    <div
      className="rec-card"
      onClick={onClick}
      id={`rec-${rec.id}`}
      style={{
        "--type-color": meta.color,
        "--type-bg":    meta.bg,
        "--type-border":meta.border,
      }}
    >
      <div className="rec-card-icon">
        <span style={{ fontSize: 18 }}>{meta.icon}</span>
      </div>

      <div className="rec-card-body">
        <span
          className="rec-type-badge"
          style={{ color: meta.color, background: meta.bg, borderColor: meta.border }}
        >
          {meta.label}
        </span>
        <p className="rec-card-title">{rec.title}</p>
        {rec.product_title && <p className="rec-card-product">{rec.product_title}</p>}
        {confidence !== null && (
          <div style={{ marginTop: 8, maxWidth: 180 }}>
            <div style={{ fontSize: 10.5, color: "var(--ink-muted)", marginBottom: 4, fontWeight: 600 }}>
              Confidence · {confidence}%
            </div>
            <div className="confidence-bar-wrap">
              <div className="confidence-bar-fill" style={{ width: `${confidence}%` }} />
            </div>
          </div>
        )}
      </div>

      <div className="rec-card-meta">
        <span className={`status-pill ${rec.status}`}>{rec.status}</span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
    </div>
  );
}

export default function Recommendations() {
  const [recs, setRecs] = useState([]);
  const [status, setStatus] = useState("open");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (status) params.status = status;
    if (type)   params.type   = type;
    api.recommendations(params)
      .then((d) => setRecs(d.recommendations))
      .finally(() => setLoading(false));
  }, [status, type]);

  const statusBtns = [
    { v: "open",      l: "Open"      },
    { v: "done",      l: "Done"      },
    { v: "dismissed", l: "Dismissed" },
    { v: "",          l: "All"       },
  ];

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Recommendations</h1>
          <p className="page-subtitle">Everything AI has identified in your store data.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius)", padding: "8px 14px", fontSize: 13, color: "var(--ink-soft)" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          {recs.length} result{recs.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Filters */}
      <div className="filter-row">
        {statusBtns.map(({ v, l }) => (
          <button
            key={v || "all"}
            className={`btn btn-ghost${status === v ? " active" : ""}`}
            onClick={() => setStatus(v)}
          >
            {l}
          </button>
        ))}

        <select
          className="select-input"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
          ))}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[0,1,2,3].map(i => (
            <div key={i} className="skeleton" style={{ height: 84, borderRadius: 12 }} />
          ))}
        </div>
      ) : recs.length === 0 ? (
        <div className="card" style={{ padding: "48px 24px" }}>
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              </svg>
            </div>
            <div style={{ fontWeight: 600, color: "var(--ink-soft)" }}>No recommendations match this filter</div>
            <div style={{ fontSize: 13 }}>Try adjusting the filters above, or go to Dashboard and click "Analyze store".</div>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {recs.map((r) => (
            <RecCard key={r.id} rec={r} onClick={() => navigate(`/recommendations/${r.id}`)} />
          ))}
        </div>
      )}
    </Layout>
  );
}
