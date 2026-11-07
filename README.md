# Ember & Oak: premium coffee storefront (React + Vite)

A complete, ready-to-brand online store for a specialty coffee roaster, with a store admin dashboard. Everything runs in the browser, so you can see it working in seconds and then connect it to your own backend.

> **What this is, and what it is not.** This is a front-end application. Products, carts, orders and the admin session are stored in the browser (`localStorage`). There is no server, no database and no payment gateway in this package. Section 6 lists exactly what to connect before taking real orders.

## 1. What you get

**Storefront**
- Home page with a roast-this-week hero, taste finder, featured roasts, brewing gear and a starter-kit banner
- Shop page with category, taste, origin and roast filters, search, sorting and an in-stock toggle
- Product pages with size, grind and colour options, tasting notes, flavour profile, image views, reviews and related products
- Slide-in bag with a free-shipping progress bar and live totals
- Checkout with field validation, two shipping methods, tax, card or cash-on-delivery, and an order confirmation page
- Wishlist, delivery and returns page, contact form, 404 page

**Store admin** (`#/admin`)
- Overview with revenue, orders, average order value, a 14-day revenue chart, best sellers and low-stock alerts
- Product manager: add, edit and delete products, with stock tracking
- Order manager: filter by status, open order details and change status
- Settings and a one-click "restore demo data"

**Quality**
- 16 products in 4 categories and 22 sample orders, all original and invented for the demo
- Original SVG illustrations for every product, so the demo needs no photo licences. Set `image` on a product to use a real photo instead
- Responsive layout for phone, tablet and desktop, visible keyboard focus, labelled forms, reduced-motion support
- About 280 kB of JavaScript (about 86 kB gzipped), no runtime dependencies beyond React

## 2. Tech stack

| Layer | Choice |
|---|---|
| UI | React 19 |
| Build | Vite 7 with `@vitejs/plugin-react` |
| Routing | Small built-in hash router (`src/router.jsx`) |
| State | React context + `localStorage` (`src/store.jsx`) |
| Styling | One plain CSS file with design tokens in `:root` |
| Fonts | Inter, bundled locally (no external requests) |
| Database | None. Browser storage only |
| Server needs | None. Any static host works |

Node 20.19 or newer is required to build.

## 3. Quick start

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # outputs to dist/
npm run preview   # serves dist/ locally
```

No environment variables or API keys are needed. More detail is in `HowToSetup.md`.

**Demo admin login:** `admin@emberoak.demo` / `admin123` (set in `src/config.js`).

## 4. Make it yours

| To change | Edit |
|---|---|
| Store name, contact details, currency, tax rate, shipping prices, free-shipping threshold | `src/config.js` |
| Products, prices, stock, tasting notes, sizes | `src/data/products.js` (or use the admin) |
| Product photos | Add `image: '/path.jpg'` to a product |
| Colours and typography | Design tokens at the top of `src/styles.css` |
| Page copy | The files in `src/pages/` |

## 5. Deployment (two supported routes)

**Route A: Docker on a VPS**
```bash
docker compose up -d --build     # serves on http://SERVER_IP:8080
```
The included `Dockerfile` builds the site and serves it with nginx. Put a reverse proxy or your host's load balancer in front for HTTPS.

**Route B: static hosting (Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3 + CDN)**
Build command `npm run build`, publish directory `dist`. A `netlify.toml` is included. The app uses hash routes, so no rewrite rules are needed.

A VPS without Docker also works: run `npm run build` and copy `dist/` to any web root.

Hosting estimate: a 1 vCPU / 512 MB server or the free tier of any static host.

## 6. Before you take real orders

This demo deliberately keeps everything client-side. To go live, connect these pieces:

1. **Catalogue and orders.** Replace the `load` and `save` helpers in `src/store.jsx` with calls to your API or headless commerce backend.
2. **Payments.** The card form in `src/pages/Checkout.jsx` only validates format. Card details are never stored or sent anywhere. Swap it for Stripe, PayPal or your gateway.
3. **Admin access.** The admin login is a front-end demo, so it is not real access control. Protect `/admin` and every write with server-side authentication and roles.
4. **Tax and shipping.** The flat rates in `src/config.js` are placeholders.
5. **Emails.** The newsletter and contact forms show a confirmation only. Connect them to your email service.

## 7. Project structure

```
src/
  config.js            store settings and money formatting
  store.jsx            cart, wishlist, orders, products, admin session
  router.jsx           hash router
  art.jsx              original SVG product illustrations
  styles.css           design tokens and all styles
  data/                sample products and seeded orders
  components/          header, footer, bag drawer, product card, icons
  pages/               storefront pages
  pages/admin/         admin dashboard, products, orders
```

`CLAUDE.md` explains the codebase for AI coding tools. It was built with Claude Code.

## 8. Licence, updates and support

Sold under the Vibe96 Standard License (see `LICENSE.md`). Open-source notices are in `THIRD_PARTY_NOTICES.md`. Security and defect fixes are published through Vibe96 for 12 months from each sale, and support tickets are answered within two business days for 30 days.
