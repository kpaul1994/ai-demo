import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";
import Layout from "../components/Layout";

const TYPE_META = {
  pricing:              { label: "Pricing Opportunity",    color: "var(--amber)",  bg: "var(--amber-soft)",  border: "var(--amber-border)",  icon: "💰" },
  product_performance:  { label: "Product Performance",   color: "var(--red)",    bg: "var(--red-soft)",    border: "var(--red-border)",    icon: "📉" },
  cross_sell:           { label: "Cross-sell Opportunity", color: "var(--blue)",   bg: "var(--blue-soft)",   border: "var(--blue-border)",   icon: "🔗" },
  inventory:            { label: "Inventory Alert",        color: "var(--purple)", bg: "var(--purple-soft)", border: "var(--purple-border)", icon: "📦" },
  customer_campaign:    { label: "Customer Campaign",      color: "var(--teal)",   bg: "var(--teal-soft)",   border: "var(--teal-border)",   icon: "🎯" },
  review_sentiment:     { label: "Review & Quality Alert", color: "var(--rose)",   bg: "rgba(244,63,94,0.12)", border: "rgba(244,63,94,0.28)", icon: "⭐" },
};

function formatKey(key) {
  return key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function formatValue(value) {
  if (typeof value === "number") {
    if (String(value).includes(".") && Math.abs(value) < 100) return `${value}%`;
    return value.toLocaleString();
  }
  return String(value);
}

export default function RecommendationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    api.recommendation(id)
      .then((d) => setRec(d.recommendation))
      .finally(() => setLoading(false));
  }, [id]);

  async function setStatus(status) {
    setUpdating(true);
    try {
      const { recommendation } = await api.updateRecommendation(id, status);
      setRec(recommendation);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="skeleton" style={{ height: 24, width: 180, borderRadius: 6 }} />
          <div className="skeleton" style={{ height: 40, width: "60%", borderRadius: 10 }} />
          <div className="skeleton" style={{ height: 140, borderRadius: 12 }} />
          <div className="skeleton" style={{ height: 120, borderRadius: 12 }} />
          <div className="skeleton" style={{ height: 100, borderRadius: 12 }} />
        </div>
      </Layout>
    );
  }

  if (!rec) {
    return (
      <Layout>
        <Link to="/recommendations" className="back-link">← Back</Link>
        <p style={{ color: "var(--ink-muted)" }}>Recommendation not found.</p>
      </Layout>
    );
  }

  const meta = TYPE_META[rec.type] || { label: rec.type, color: "var(--brand)", bg: "var(--brand-soft)", border: "var(--line)", icon: "◈" };
  const data = rec.supporting_data || {};
  const confidence = rec.confidence ? Math.round(rec.confidence * 100) : null;

  return (
    <Layout>
      {/* Back */}
      <Link to="/recommendations" className="back-link">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back to recommendations
      </Link>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span
            className="rec-type-badge"
            style={{ color: meta.color, background: meta.bg, borderColor: meta.border, fontSize: 11.5 }}
          >
            <span>{meta.icon}</span> {meta.label}
          </span>
          <span className={`status-pill ${rec.status}`}>{rec.status}</span>
        </div>

        <h1 style={{ fontSize: 24, letterSpacing: "-0.03em", lineHeight: 1.25 }}>{rec.title}</h1>
        {rec.product_title && (
          <p style={{ fontSize: 14, color: "var(--ink-muted)", marginTop: 6 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
            {rec.product_title}
          </p>
        )}
      </div>

      {/* Why */}
      <div className="detail-block">
        <div className="detail-block-title">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 5 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Why this recommendation?
        </div>
        <p style={{ fontSize: 14.5, lineHeight: 1.7, color: "var(--ink)" }}>{rec.explanation}</p>
      </div>

      {/* Supporting Data */}
      {Object.keys(data).length > 0 && (
        <div className="detail-block">
          <div className="detail-block-title">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 5 }}>
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            Supporting data
          </div>
          <div className="data-tiles">
            {Object.entries(data).map(([key, value]) => (
              <div key={key} className="data-tile">
                <div className="data-tile-label">{formatKey(key)}</div>
                <div className="data-tile-value">{formatValue(value)}</div>
              </div>
            ))}
          </div>

          {/* Confidence */}
          {confidence !== null && (
            <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--line-soft)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12, fontWeight: 600, color: "var(--ink-muted)" }}>
                <span style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>AI Confidence</span>
                <span style={{ color: meta.color }}>{confidence}%</span>
              </div>
              <div className="confidence-bar-wrap" style={{ height: 8 }}>
                <div className="confidence-bar-fill" style={{ width: `${confidence}%` }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Suggested Action */}
      <div className="detail-block" style={{ borderLeft: `3px solid ${meta.color}` }}>
        <div className="detail-block-title">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 5 }}>
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
          AI suggested action
        </div>
        <p style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", lineHeight: 1.5 }}>{rec.suggested_action}</p>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap", alignItems: "center" }}>
        <button
          id="mark-done-btn"
          className="btn btn-success"
          disabled={updating || rec.status === "done"}
          onClick={() => setStatus("done")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Mark as done
        </button>
        <button
          id="dismiss-btn"
          className="btn btn-danger"
          disabled={updating || rec.status === "dismissed"}
          onClick={() => setStatus("dismissed")}
        >
          Dismiss
        </button>
        {rec.status === "done" && (
          <button className="btn btn-ghost" onClick={() => setStatus("open")}>Reopen</button>
        )}
        {rec.status !== "open" && (
          <span style={{ fontSize: 13, color: "var(--ink-muted)", marginLeft: 4 }}>
            Status: <strong style={{ color: "var(--ink)", textTransform: "capitalize" }}>{rec.status}</strong>
          </span>
        )}
      </div>
    </Layout>
  );
}
