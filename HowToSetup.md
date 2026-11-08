# How to set up Ember & Oak on a clean machine

## Requirements
- Node.js 22.13 or newer and npm 10 or newer
- Nothing else: no database server, no API keys

Check with `node -v`. Older Node versions do not include `node:sqlite` and the server will not start.

## 1. Install and build
```bash
npm install
npm run build
```
This installs React and Vite at the exact versions pinned in `package.json` and creates `package-lock.json` on first run. Commit that file so every machine builds the same tree. The server itself needs no packages.

## 2. Start
```bash
npm start
```
Open http://localhost:3000. On first start the server creates `data/ember-oak.db`, applies `database/schema.sql` and, because `DEMO_MODE` defaults to `true`, loads `database/seed.sql`.

Sign in:
- Admin at http://localhost:3000/#/admin with `admin@emberoak.demo` / `Admin#Demo2026`
- Customer at http://localhost:3000/#/account/login with `customer@emberoak.demo` / `Customer#Demo2026`

## 3. Development
Two terminals:
```bash
npm run dev:server    # API with auto-restart on :3000
npm run dev           # React with hot reload on :5173
```
Open http://localhost:5173. Vite forwards `/api` calls to port 3000.

## 4. Tests
```bash
npm test
```
Runs 16 API tests against an in-memory database. Your data file is not touched.

## 5. Environment variables
Copy `.env.example` to `.env`, edit it, then start with `node --env-file=.env server/index.js`. Docker Compose reads the same names from `docker-compose.yml`. See the table in `README.md`.

## 6. Deploy
- Docker: `docker compose up -d --build`
- Node host (Render, Railway, Fly.io, VPS): build `npm install && npm run build`, start `npm start`, mount a persistent disk at the `DATABASE_PATH` folder
Add HTTPS in front and set `COOKIE_SECURE=true`.

## 7. Go live (turn demo mode off)
1. Stop the server and delete `data/ember-oak.db` (or use a new path).
2. Set `DEMO_MODE=false`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (10+ characters).
3. Start the server. It creates an empty store with that one admin.
4. Add your own products in the admin.

## 8. Reset the demo
Sign in as admin, open Settings and choose "Restore demo data". This works only while `DEMO_MODE=true`. It removes visitor accounts and orders and reloads the samples.

## Troubleshooting
| Problem | Fix |
|---|---|
| `No such built-in module: node:sqlite` | Upgrade Node to 22.13 or newer |
| "Front end not built" | Run `npm run build` first |
| Cannot stay signed in over HTTP on a server | Leave `COOKIE_SECURE=false` until HTTPS is on |
| Data disappears after a redeploy | The database file is on a temporary disk. Mount a persistent volume at the `DATABASE_PATH` folder |
| "Too many sign-in attempts" | Wait 15 minutes; the limit is 10 tries per email and address |
| Port 3000 in use | Set `PORT=4000` |
