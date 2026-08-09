# X2SHOWS ARCHITECTURAL & SECURITY CONSTRAINTS

- **Stack**: Vite + React SPA (Frontend) + Express (Backend on Render).
- **No Next.js**: Never install `"next"` or create `next.config.*`.
- **Output Directory**: `dist/` created via `vite build`.
- **Vercel Routing**: `vercel.json` proxies `/api/*` to Render Express backend (`https://x2shows.onrender.com/api/$1`).
- **Authentication**: `x2shows_session` HttpOnly cookie signed with server-side HMAC-SHA256 (`SESSION_SECRET`). No hardcoded backdoor passwords. No `VITE_*` secret exposure.
- **Guard Check**: `npm run guard` validates architecture on every `npm run build`.
