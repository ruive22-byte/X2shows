# X2SHOWS PROJECT ARCHITECTURE & SECURITY MANDATES

## 🏛️ Core Architecture (STRICT REQUIREMENT)
This application MUST remain **Vite + React (Frontend) + Express / Node.js (Backend)**.
- **NEVER** install Next.js (`"next"`) or add Next.js dependencies.
- **NEVER** create `next.config.js`, `next.config.ts`, `next.config.mjs`, or `.next` directories.
- Frontend builds to `dist/` using `vite build`.
- Backend entry point is `server.ts` compiled to `dist/server.cjs` via `esbuild`.
- Express backend runs on **Render** (`https://x2shows.onrender.com`) listening on port 3000 / `process.env.PORT`.
- **Vercel / Render** hosts the application, with `vercel.json` routing `/api/*` to the Render Express backend URL (`https://x2shows.onrender.com/api/$1`).
- `/api/*` MUST NEVER be rewritten to `/index.html`.

```
                 X2SHOWS ARCHITECTURE
                    │
          ┌─────────┴─────────┐
          │                   │
       VERCEL               RENDER
          │                   │
     Vite + React          Express
          │                   │
       dist/               /api/*
          │                   │
          └─────── Browser ───┘
```

---

## 🔐 Authentication & Security Rules
- **Stateless HMAC Sessions**: Authentication is handled via cryptographically signed HMAC-SHA256 session tokens stored in `HttpOnly; SameSite=Lax` cookies named `x2shows_session`.
- **Server Secrets**:
  - `SESSION_SECRET`: Dedicated cryptographic signing key.
  - `SITE_PASSWORD`: Authentication credential password.
  - **NEVER** expose `SESSION_SECRET` or `SITE_PASSWORD` to `VITE_*` environment variables or client-side bundles.
  - Production fails closed if `SESSION_SECRET` or `SITE_PASSWORD` are missing.
- **Forbidden Backdoors**:
  - Hardcoded backdoors (e.g. `sylenumber1`, `rsou24467!!`) are strictly prohibited and removed.
  - Deprecated password checking endpoints (e.g. `/api/check-password`) MUST return `410 Gone`. All authentication flows through `POST /api/login`.
  - No `localStorage` or `sessionStorage` token caching for session authentication.

---

## 🛡️ Architecture Guard Check
Before deploying or running builds, execute:
```bash
npm run guard
```
This script (`scripts/checkArchitecture.ts`) automatically validates package dependencies, config files, Vercel routing, and secret protection.
