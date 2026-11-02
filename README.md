# discovr

Dark-only, mobile-first web app. Eight things worth doing tonight in Goa.

## Run

```bash
cp .env.example .env.local
# edit NEXT_PUBLIC_API_BASE_URL if needed
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API base URL

All catalog calls use `NEXT_PUBLIC_API_BASE_URL` (see `src/shared/utils/apiBase.ts`).

| Where | What to set |
| --- | --- |
| Local | `.env.local` → `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8080` |
| Vercel / host | Project env → same key, value = your Render API URL (e.g. `https://….onrender.com`) |

Must be set at **build** time for Next (`NEXT_PUBLIC_*`). No trailing slash.

## PWA

Production build registers a service worker (app shell + offline fallback + ticket cache rules).

```bash
npm run build
npm start
```

To exercise the SW in development: `npm run dev:pwa` (still registers only when `NODE_ENV=production` unless you flip `PwaProvider`).

## Layout

```
src/
  app/           # routes only
  features/      # home | experience | booking → components / utils / styles
  shared/        # cross-feature components, utils, design tokens
  types/
```

Agent rules live in the repo-root `.cursor/skills/` (`discovr-structure`, `discovr-brand`, `discovr-code`, `discovr-product`).
