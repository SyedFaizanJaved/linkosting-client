# Linkosting — Dashboard

React dashboard for the Linkosting LinkedIn assistant. The API lives in the
separate `linkedin-post-server` repo.

## Screens

Dashboard · AI Generator (3 variants) · Draft Editor · Calendar (per-post
scheduling) · Library · Topics · Analytics (own data + manually entered
metrics) · Notifications · Settings · Onboarding wizard (first run).

## Stack

Vite + React 18, react-router-dom, @tanstack/react-query, plain CSS
(design tokens in `src/styles/tokens.css`, light/dark via `data-theme`).

## Local dev

    cp .env.example .env   # VITE_API_URL=http://localhost:3000
    npm install
    npm run dev            # http://localhost:5173

Sign in with the ADMIN_EMAIL / ADMIN_PASSWORD seeded by the server's db:init.
First run walks through onboarding (topics, tone, default slot, LinkedIn).

## Deploy (Vercel)

1. Push to GitHub, import in Vercel (framework: Vite).
2. Env var `VITE_API_URL` = the Render server URL.
3. Set `CLIENT_ORIGIN` on the server to this URL (CORS) and redeploy.

`vercel.json` / `public/_redirects` handle SPA deep links. Netlify works
identically (build `npm run build`, publish `dist`).
