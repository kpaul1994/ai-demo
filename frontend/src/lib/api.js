const BASE_URL = import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : "";

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = localStorage.getItem("token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  login: (email, password) =>
    request("/api/auth/login", { method: "POST", body: { email, password }, auth: false }),
  dashboard: () => request("/api/dashboard"),
  products: () => request("/api/products"),
  recommendations: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/recommendations${qs ? `?${qs}` : ""}`);
  },
  recommendation: (id) => request(`/api/recommendations/${id}`),
  updateRecommendation: (id, status) =>
    request(`/api/recommendations/${id}`, { method: "PATCH", body: { status } }),
  generateRecommendations: () => request("/api/recommendations/generate", { method: "POST" }),
  chat: (message, history) => request("/api/chat", { method: "POST", body: { message, history } }),
  health: () => request("/health", { auth: false }),
  storeStatus: () => request("/api/store/status"),
  seedDemo: () => request("/api/store/seed-demo", { method: "POST" }),
  syncShopify: () => request("/api/store/sync-shopify", { method: "POST" }),
};
