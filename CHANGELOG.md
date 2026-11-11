# Changelog

## 2.0.2 (2026-11-11)
Review follow-up.
- Fixed "Something went wrong" on demo sign-in when hosted on Vercel: the host reads the request body before the handler runs, so the server never received the email and password. The server now uses the parsed body when the host provides it (test added).
- Sign-in pages have one-click "Sign in as Admin" and "Sign in as Customer" buttons (demo mode only).
- New landing page at `/` (hero, features, screenshots, benefits, Live demo button). The store moved to `/store/`.
- Production build now has two pages (`index.html` landing and `store/index.html`), and assets use absolute paths.

## 2.0.1 (2026-11-08)
Audit follow-up.
- Security audit (2026-11-08): `npm audit` reports 0 vulnerabilities in `React Web` (Vite 7.3.7, React 19.2.8) and `Node API` (no dependencies). The release workflow re-runs it on every build.
- Vercel demo works with no settings: the signing key is derived from the project's own Vercel id, so demo logins are the same on every instance. The demo sign-in page shows them.
- Audit round 2: no password is written anywhere in the code, docs or seed data any more. Demo passwords come from `DEMO_*_PASSWORD`, are derived from `SESSION_SECRET`, or are random per start. Added `docs/database.md` and a schema header that list the access rules, constraints and indexes.
- Demo logins now live in one place (`server/config.js`, overridable with `DEMO_*` variables) and are hashed at start-up. They are no longer stored in `seed.sql`, the front end or the tests.
- Removed the guessable fallback signing key. Signed (serverless) sessions use `SESSION_SECRET`, or a random per-process key with a warning. They now last 12 hours.
- Orders have their own rate limit (20 per hour per address), separate from sign-ups. Guest checkout is intentional and can be switched off with `ALLOW_GUEST_CHECKOUT=false`.
- Fixed a stock bug: an order now fails with 409 if a unit sold out in the meantime, and reopening a cancelled order is refused when stock is short (it no longer clamps to zero).
- `npm ci` everywhere (Vercel, Render, Docker), `.nvmrc` added. The front end no longer carries its own tax and shipping numbers.
- Split the product editor into its own file. 18 API tests.

## 2.0.0 (2026-11-08)
Full-stack release. The store now has a real back end.
- Added a dependency-free Node API (`server/`) with a SQLite database (`database/schema.sql`, `database/seed.sql`).
- Added customer accounts: register, sign in, sign out, "My account" with order history.
- Added real admin authentication. Passwords are hashed with scrypt, sessions use an HttpOnly cookie, and every write endpoint checks the role on the server.
- Prices, shipping, tax and stock are now calculated by the server. Tampered prices from the browser are ignored.
- Stock is reduced in a transaction when an order is placed and returned when an order is cancelled.
- Guest order confirmation pages are protected by a private link token.
- Added login rate limiting, CSRF checks, security headers and a content security policy.
- Added 16 API tests (`npm test`).
- Added thirteen product photographs (seven supplied, six coffee-bag variants with their own labels) and three new products (Sumatra Mandheling, Copper French Press, Emerald Moka Pot).
- Improved readability of text over background images on phones.
- New deployment files: Node-based `Dockerfile`, `docker-compose.yml`, `render.yaml`, `.env.example`.
- Added Vercel demo hosting (`vercel.json`, `api/[...path].mjs`) with stateless signed sessions; data is temporary in this mode.
- Centred the loading and error pages. Finder text now sits on a solid panel up to 1280 px wide, so it stays readable on phones in desktop-site mode.
- Restructured into `Node API/` and `React Web/` (each with its own package.json and lockfile), `database/` and `docs/` (API reference, database diagram, customisation guide).
- Split the long route file and stylesheet into smaller modules; split the layout components into separate files.
- Fixed the server start check for folder names that contain a space.
- Pinned Vite 7.3.7 (patched for the published dev-server advisories).
- Removed the static-only deployment files (`nginx.conf`, `netlify.toml`).

## 1.0.0 (2026-11-06)
First release: front-end only storefront and admin using browser storage.
