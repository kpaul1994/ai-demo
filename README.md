# AI E-commerce Optimization Platform — Demo MVP

Full-stack demo: Node.js/Express backend (API + auth + AI layer) + React frontend.

## Local Setup

**Backend:**
1. `npm install`
2. Copy `.env.example` → `.env` and fill in all keys
3. `npm run migrate`
4. `npm run seed:user`
5. `npm run sync` (pull data from Shopify dev store)
6. `npm run metrics`
7. `npm start` (API will now run at `http://localhost:3000`)

**Frontend (in a separate terminal):**
1. `cd frontend`
2. Copy `.env.example` → `.env`
3. `npm install`
4. `npm run dev` (UI will now run at `http://localhost:5173`)

Login demo credentials: whatever you set for `DEMO_USER_EMAIL` / `DEMO_USER_PASSWORD` in `.env`.

## Railway Deploy (single service)

- Add the Postgres plugin (DATABASE_URL will be auto-injected)
- Set the remaining env vars (AI keys, Shopify token, JWT_SECRET) in the Railway dashboard
- Build command (already in `railway.toml`): `npm install && npm run build` — this runs both backend deps + frontend build; the backend will serve that build (API + UI on the same URL)
- After deploy, run once from shell: `npm run migrate && npm run seed:user && npm run sync && npm run metrics`

## Pages (frontend/src/pages)

- Login
- Dashboard (KPI cards + AI summary + top recommendations)
- Recommendations (list, filter by status/type)
- Recommendation Detail (why, supporting data, suggested action, mark done/dismiss)
- Ask AI (chat)
- Store (Shopify connection status + synced product list)

## Main API Endpoints

- `POST /api/auth/login`
- `GET /api/dashboard`
- `POST /api/recommendations/generate` — uses AI to generate all types of recommendations
- `GET /api/recommendations`, `GET/PATCH /api/recommendations/:id`
- `POST /api/chat`

To switch AI provider, just change `AI_PROVIDER=groq|openai|claude` in `.env`.
