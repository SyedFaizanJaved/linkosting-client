# LinkedIn Post Pilot — Dashboard

React dashboard for the LinkedIn daily-post automation. The API lives in the
separate `linkedin-post-server` repo.

## Local dev

    cp .env.example .env   # VITE_API_URL=http://localhost:3000
    npm install
    npm run dev            # http://localhost:5173

Sign in with the ADMIN_EMAIL / ADMIN_PASSWORD seeded by the server's db:init.

## Deploy (Vercel)

1. Push this repo to GitHub, import it in Vercel (framework: Vite).
2. Set env var `VITE_API_URL` = your Render server URL.
3. After deploy, set `CLIENT_ORIGIN` on the server to this Vercel URL
   (CORS) and redeploy the server.

Netlify works identically (build `npm run build`, publish dir `dist`).
