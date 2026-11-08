# CLAUDE.md

Guidance for AI coding tools (Claude Code, Codex, Cursor) working in this repository.

## What this project is
"Ember & Oak", a full-stack e-commerce store for a fictional coffee roaster. React 19 + Vite 7 front end, a dependency-free Node 22 API, SQLite database. Customers and one admin role, server-side auth.

## Commands
- `npm install`, then `npm run build`, then `npm start` (http://localhost:3000)
- Development: `npm run dev:server` and `npm run dev` in two terminals (Vite proxies `/api` to :3000)
- `npm test` runs `tests/api.test.js` with `node --test` on an in-memory database
- No linter is configured

## Server (`server/`)
- `index.js` creates the HTTP server: `/api/*` goes to the router, everything else is static files from `dist/`.
- `config.js` reads environment variables and holds store rules (tax rate, shipping prices, free-shipping threshold, in cents).
- `db.js` opens SQLite (`node:sqlite`), applies `database/schema.sql`, seeds demo data in `DEMO_MODE`, or creates the admin from env vars. `tx()` wraps a transaction.
- `auth.js` scrypt password hashing, session tokens (random, stored as sha256), cookie helpers, in-memory rate limiter.
- `routes.js` every endpoint. Each handler calls `requireUser` or `requireAdmin` itself. Add new routes with `route(method, pattern, handler, { body: true })`.
- `validate.js` input validation. `pricing.js` row-to-JSON mapping and `priceOrder()`, which prices an order from database values only.
- `http.js` JSON helpers, security headers, CSRF origin check, static file serving.

- `api/[...path].js` is the Vercel entry (demo hosting only). It sets `STATELESS_SESSIONS=true` so sessions are signed cookies instead of database rows, and uses an in-memory database.

## Database (`database/`)
`schema.sql` is idempotent (`IF NOT EXISTS`) and runs on every start. `seed.sql` is demo content, loaded only into an empty database. Money is integer cents in the database and dollars in the JSON the API returns.

## API summary
Public: `GET /api/health|config|products|products/:id|auth/me`, `POST /api/auth/login|register|logout`, `POST /api/orders`, `GET /api/orders/:id?token=`.
Signed in: `GET /api/orders` (own orders; admin gets all), `GET /api/orders/:id` (owner or admin).
Admin only: `POST|PUT|DELETE /api/products`, `PATCH /api/orders/:id`, `POST /api/admin/reset-demo` (demo mode only).

## Front end (`src/`)
- `main.jsx` mounts `<StoreProvider><App/></StoreProvider>`. `api.js` is the fetch wrapper.
- `store.jsx` holds products (loaded from the API), user, orders, bag and wishlist. Bag and wishlist stay in `localStorage` (`emberoak.v2.*`). Everything else comes from the server.
- `router.jsx` is a hash router (`#/shop?cat=beans`). Use `navigate(to)`, `buildQuery(obj)` and `<Link to>`. Do not add a router library.
- `pages/` one component per route; `pages/Account.jsx` has sign-in, register and the account page; `pages/admin/` the admin screens.
- `art.jsx` SVG product illustrations, used when a product has no `image`. `components/Media.jsx` chooses.
- `styles.css` is the only stylesheet; tokens are CSS custom properties in `:root`.
- `config.js` holds branding and display defaults. Tax and shipping are overwritten at start-up from `/api/config`, so edit `server/config.js` for those.

## Conventions
- Plain JavaScript (ES modules), JSX function components, no TypeScript, no CSS-in-JS.
- Keep files under about 300 lines.
- Never trust the browser: prices, totals, stock and roles are decided on the server. The checkout sends product ids and quantities only.
- Every form field has a visible `<label>` and an inline error. No `dangerouslySetInnerHTML`.
- Copy is plain, sentence case, active voice.

## Security notes
- Do not put secrets in the repo. The only credentials are the demo accounts in `database/seed.sql`, active only in demo mode. Delete them before going live.
- Card details are validated in `Checkout.jsx` and discarded; they are never sent to the server. Use a payment provider's hosted fields.
- Session cookie is HttpOnly and SameSite=Lax. State-changing requests must be JSON and pass an Origin check.
- Add a role check to every new write endpoint and a test for the 401 and 403 cases in `tests/api.test.js`.

## Common tasks
- **Add a product:** admin, Products, or add a row to `database/seed.sql` (demo data only).
- **Add a category:** insert it in `database/schema.sql` (lookup rows at the bottom) and add it to `CATEGORIES` in `src/data/products.js`.
- **Change tax or shipping:** `server/config.js`.
- **Add a payment provider:** create the payment on the server in `POST /api/orders` after `priceOrder()`, using `priced.total`.
- **Re-skin:** tokens at the top of `src/styles.css`, images in `src/assets/images/`.
