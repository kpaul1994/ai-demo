import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../lib/AuthContext";
import { api } from "../lib/api";

const nav = [
  {
    to: "/", label: "Dashboard", end: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    to: "/recommendations", label: "Recommendations",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
      </svg>
    ),
  },
  {
    to: "/chat", label: "Ask AI",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
    ),
  },
  {
    to: "/settings", label: "Store",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [storeOk, setStoreOk] = useState(null);
  const [aiProvider, setAiProvider] = useState("");

  useEffect(() => {
    api.health()
      .then((h) => { setStoreOk(h.status === "ok"); setAiProvider(h.aiProvider || ""); })
      .catch(() => setStoreOk(false));
  }, []);

  function handleLogout() { logout(); navigate("/login"); }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div>
            <div className="sidebar-brand-name">Optiview</div>
            <div className="sidebar-brand-sub">AI store optimization</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar-nav-item${isActive ? " active" : ""}`}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-status">
            <span className={`status-dot ${storeOk === null ? "pending" : storeOk ? "ok" : "error"}`} />
            {storeOk === null ? "Checking…" : storeOk ? "Store connected" : "Store offline"}
          </div>
          {aiProvider && (
            <div className="sidebar-status" style={{ marginTop: -4 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11 }}>AI: {aiProvider}</span>
            </div>
          )}
          <div className="sidebar-user-email">{user?.email}</div>
          <button className="sidebar-logout" onClick={handleLogout}>
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <main className="main-content fade-up">{children}</main>
    </div>
  );
}
