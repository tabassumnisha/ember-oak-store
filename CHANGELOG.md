# Changelog

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
- Added seven product photographs and three new products (Sumatra Mandheling, Copper French Press, Emerald Moka Pot).
- Improved readability of text over background images on phones.
- New deployment files: Node-based `Dockerfile`, `docker-compose.yml`, `render.yaml`, `.env.example`.
- Added Vercel demo hosting (`vercel.json`, `api/[...path].js`) with stateless signed sessions; data is temporary in this mode.
- Centred the loading and error pages.
- Removed the static-only deployment files (`nginx.conf`, `netlify.toml`).

## 1.0.0 (2026-11-06)
First release: front-end only storefront and admin using browser storage.
