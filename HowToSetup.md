# How to set up Ember & Oak on a clean machine

## Requirements
- Node.js 20.19 or newer (22 recommended) and npm 10 or newer
- No database, no environment variables, no API keys

## 1. Install
```bash
npm install
```
This installs React, Vite and the React plugin at the exact versions pinned in `package.json`, and creates `package-lock.json` on first run. Commit that lockfile so every machine builds the same tree.

## 2. Run locally
```bash
npm run dev
```
Open http://localhost:5173. Sample products and orders load automatically.

Sign in to the admin at http://localhost:5173/#/admin with `admin@emberoak.demo` and `admin123`.

## 3. Build for production
```bash
npm run build
```
The finished site is written to `dist/`. Preview it with `npm run preview`.

## 4. Deploy

**Docker (any VPS)**
```bash
docker compose up -d --build
```
Open `http://SERVER_IP:8080`. Add HTTPS with your reverse proxy or load balancer.

**Static host**
Upload the contents of `dist/`, or connect the repository and use build command `npm run build` with publish directory `dist`.

## 5. Reset the demo data
Sign in to the admin, open Settings and choose "Restore demo data". To clear everything, delete the site's data in your browser (keys start with `emberoak.v1`).

## Troubleshooting
| Problem | Fix |
|---|---|
| `Unsupported engine` or a Vite error on install | Upgrade Node to 20.19 or newer |
| Blank page after deploying to a sub-folder | Keep `base: './'` in `vite.config.js` (already set) |
| Changes to `products.js` do not appear | The browser keeps earlier data. Use Settings, then "Restore demo data" |
| Port 5173 is busy | Run `npm run dev -- --port 3000` |
