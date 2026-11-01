# discovr

Dark-only, mobile-first web app. Eight things worth doing tonight in Goa.

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## PWA

Production build registers a service worker (app shell + offline fallback + ticket cache rules).

```bash
npm run build
npm start
```

To exercise the SW in development: `npm run dev:pwa` (still registers only when `NODE_ENV=production` unless you flip `PwaProvider`).

Install prompt: Android/desktop via `beforeinstallprompt`. iOS Add to Home Screen copy comes later — after a successful booking.

## Layout

```
src/
  app/           # routes only
  features/      # home | experience | booking → components / utils / styles
  shared/        # cross-feature components, utils, design tokens
  types/
```

Agent rules live in the repo-root `.cursor/skills/` (`discovr-structure`, `discovr-brand`, `discovr-code`, `discovr-product`).
