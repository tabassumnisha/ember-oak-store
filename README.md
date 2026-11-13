# Ember & Oak: full-stack coffee store (React + Node + SQLite)

A complete online store for a specialty coffee roaster. Customers browse, register, order and track their orders. The owner signs in to an admin panel to manage products and orders. A real server and database sit behind it, so you can rebrand it and go live.

## Demo logins (demo mode)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@emberoak.demo` | the value of `DEMO_ADMIN_PASSWORD` |
| Customer | `customer@emberoak.demo` | the value of `DEMO_CUSTOMER_PASSWORD` |

On the Vercel demo no setup is needed: open the sign-in page and use the logins it shows. Admin panel: `/#/admin`. Customer sign-in: `/#/account/login`. The login pages show these details too while `DEMO_MODE=true`.

## 1. What you get

**Storefront**
- Home page with hero, taste finder, featured roasts, brewing gear and a starter-kit banner
- Shop with category, taste, origin and roast filters, search, sorting and an in-stock toggle
- Product pages with size, grind and colour options, tasting notes, flavour profile, photos and related products
- Slide-in bag with a free-shipping progress bar, wishlist, checkout with validation, shipping methods, tax, card or cash on delivery
- Order confirmation page, delivery and contact pages

**Customer accounts**
- Register, sign in, sign out
- "My account" with order history; a customer can only ever see their own orders

**Admin panel**
- Overview with revenue, orders, average order value, a 14-day chart, best sellers and low-stock alerts
- Products: add, edit, delete, stock
- Orders: filter by status, open details, change status (cancelling returns stock)
- Settings and a one-click "Restore demo data" (demo mode only)

**Back end**
- Node.js HTTP API with no npm dependencies (uses built-in `node:http`, `node:sqlite`, `node:crypto`)
- SQLite database with schema and seed files
- Server-side authentication, roles, price and stock calculation, validation, rate limiting, CSRF checks, security headers
- 16 automated API tests

## 2. Tech stack

| Layer | Choice |
|---|---|
| UI | React 19.2, plain CSS tokens, Inter font bundled locally |
| Build | Vite 7 |
| Server | Node.js 22.13+ built-in `http` (no framework) |
| Database | SQLite via built-in `node:sqlite` |
| Auth | Email + password, scrypt hashes, random session tokens stored hashed, HttpOnly SameSite cookie |
| Tests | `node --test` |

Database tables: `users`, `sessions`, `categories`, `products`, `orders`, `order_items` (see `database/schema.sql`).

## 3. Quick start

Requires Node.js 22.13 or newer.

```bash
cd "React Web" && npm ci && npm run build && cd ..
cd "Node API" && npm start          # landing page at http://localhost:3000, the store at /store/, demo data loads on first start
```

Docker: `docker compose up -d --build`. Development with hot reload: `npm run dev` in both folders. Tests: `npm test` in `Node API`. Full steps for a VPS and for Docker, database setup, first admin login and branding are in `HowToSetup.md`.

## 4. Configuration

Copy `.env.example` and set the values you need. The most important:

| Variable | Meaning |
|---|---|
| `DEMO_MODE` | `true` (demo only) loads sample data and the demo accounts. `false` starts empty and creates one admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD` |
| `DATABASE_PATH` | Where the SQLite file lives. Put it on a persistent disk or volume |
| `PORT` | HTTP port, default 3000 |
| `SESSION_SECRET` | Long random string. Required for signed sessions on serverless hosting (Vercel) |
| `DEMO_ADMIN_*`, `DEMO_CUSTOMER_*` | Optional overrides of the demo logins (`EMAIL`, `PASSWORD`) |
| `ALLOW_GUEST_CHECKOUT` | `true` (default) lets visitors order without an account; `false` requires sign-in |
| `COOKIE_SECURE`, `TRUST_PROXY` | Turn on when running behind HTTPS or a reverse proxy |

Tax rate, shipping prices and the free-shipping threshold are in `Node API/server/config.js`.

## 5. Make it yours

| To change | Edit |
|---|---|
| Store name, address, contact details | `React Web/src/config.js` |
| Tax, shipping prices, free-shipping threshold | `Node API/server/config.js` |
| Products and sample orders | the admin panel, or `database/seed.sql` for the starting data |
| Logo and backgrounds | the files in `React Web/src/assets/images/` (same file names) |
| Product photos | `React Web/public/products/`, then set the product's image path in the admin |
| Colours and typography | design tokens at the top of `React Web/src/styles/tokens.css` |

## 6. Deployment (four routes)

A real store needs a host that can run Node.js and keep a file on disk (routes A to C). Static-only hosts (Netlify, GitHub Pages) cannot run the server. Route D shows the store on Vercel for demonstrations only.

**Route A: Docker on a VPS**
```bash
docker compose up -d --build     # http://SERVER_IP:3000, data kept in a Docker volume
```
Put HTTPS in front (Caddy, nginx, Traefik or your cloud load balancer) and set `COOKIE_SECURE=true`.

**Route B: Render, Railway, Fly.io or any Node host**
Build command `cd "React Web" && npm ci && npm run build`, start command `cd "Node API" && npm start`, Node 22.13+, and a persistent disk mounted at the folder of `DATABASE_PATH`. A `render.yaml` blueprint for Render is included. Persistent disks are a paid feature on most hosts.

**Route C: plain VPS without Docker**
Build `React Web`, then run `npm start` in `Node API` under systemd or pm2 behind a reverse proxy (see `HowToSetup.md`).

**Route D: Vercel (live demo only)**
Import the repository into Vercel. `vercel.json` and `api/[...path].mjs` are included: the build runs `npm run build` and the API runs as a serverless function with an in-memory copy of the demo data. Sign-in works across instances through signed cookies. Data you change (new orders, edited products) is temporary and resets when the function restarts, so use this route to show the store, not to run it. Optionally set `SESSION_SECRET` in the Vercel project settings.

Hosting estimate: 1 vCPU and 512 MB RAM is enough.

## 7. Before you take real orders

1. Set `DEMO_MODE=false`, set `ADMIN_EMAIL` and a long `ADMIN_PASSWORD`, and start with an empty database.
2. Connect a payment provider. The card form only validates format; card details are never stored or sent.
3. Connect an email service. Order, newsletter and contact messages currently show on-screen confirmations only.
4. Put the site behind HTTPS and back up the SQLite file.
5. Review tax and shipping rules for your country.

## 8. Project structure

```
Node API/     package.json, package-lock.json
  server/     config, db, auth, validation, pricing, http helpers, routes/ (one file per area)
  tests/      API tests
React Web/    package.json, package-lock.json, index.html, vite.config.js
  src/        pages, components, store, API client, styles/ (split by area)
  public/     favicon and product photos
database/     schema.sql and seed.sql
docs/         api.md, erd.md (database diagram), customisation.md
api/          Vercel demo entry (optional)
```

`CLAUDE.md` explains the codebase for AI coding tools. It was built with Claude Code.

## 9. Licence, updates and support

Licensed under the Standard Licence in `LICENSE-NOTE.md` (one End Product per licence). Open-source notices are in `THIRD_PARTY_NOTICES.md`. See `CHANGELOG.md` for releases. Security and defect fixes are published through Vibe96 for 12 months from each sale, and support tickets are answered within two business days for 30 days.
