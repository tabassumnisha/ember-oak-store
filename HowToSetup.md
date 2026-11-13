# How to set up Ember & Oak on a clean machine

The package has two parts and two ways to run it:

```
Node API/    the server (package.json, package-lock.json, server/, tests/)
React Web/   the storefront and admin (package.json, package-lock.json, src/, public/)
database/    schema.sql and seed.sql
docs/        API reference, database diagram, customisation guide
```

## Requirements
- Node.js 22.13 or newer and npm 10 or newer (for target A), or Docker 24+ with Compose (for target B)
- Nothing else: no database server, no API keys. SQLite is built into Node

Check with `node -v`. Older Node versions have no `node:sqlite` and the server will not start.

## Target A: a VPS or any Linux, macOS or Windows machine (no Docker)

```bash
# 1. Build the storefront
cd "React Web"
npm ci
npm run build
cd ..

# 2. Configure
cp .env.example "Node API/.env"       # edit it, see "Environment variables" below

# 3. Start the server
cd "Node API"
npm ci                                  # the server has no dependencies, this only checks the lockfile
node --env-file=.env server/index.js    # or: npm start (uses defaults, demo mode on)
```
Open http://localhost:3000 (landing page) and http://localhost:3000/store/ (the store). For production run it under systemd or pm2 behind nginx, Caddy or Traefik with HTTPS, and set `COOKIE_SECURE=true` and `TRUST_PROXY=true`.

## Target B: Docker

```bash
docker compose up -d --build        # from the folder that contains docker-compose.yml
```
Open http://SERVER_IP:3000. The database lives in the `store-data` Docker volume, so it survives rebuilds. Edit the `environment` section of `docker-compose.yml` to change settings. Put HTTPS in front and set `COOKIE_SECURE: "true"`.

## Database setup
Nothing to run by hand. On every start the server executes `database/schema.sql` (safe to repeat, it only creates what is missing). If `DEMO_MODE=true` and the database is empty it then loads `database/seed.sql`.

Manual use, if you prefer the SQLite command line:
```bash
sqlite3 store.db < database/schema.sql
sqlite3 store.db < database/seed.sql      # demo data, optional
```
Set `DATABASE_PATH` to the file you want the server to use. Back it up by copying the file while the server is stopped, or with `sqlite3 store.db ".backup backup.db"`.

## First admin login
- **Demo mode** (default): sign in at `/#/admin` with `admin@emberoak.demo` and the password you set in `DEMO_ADMIN_PASSWORD` (the demo sign-in page also shows it). A customer account `customer@emberoak.demo` is loaded too, with the password from `DEMO_CUSTOMER_PASSWORD`. If you set neither, a random password is printed in the server log at start-up.
- **Real store**: set `DEMO_MODE=false`, `ADMIN_EMAIL` and an `ADMIN_PASSWORD` of 10+ characters, start on an empty database, and sign in at `/#/admin` with those. No demo account is created.

## Branding and content changes
See `docs/customisation.md`. In short: store details in `React Web/src/config.js`, tax and shipping in `Node API/server/config.js`, logo and banners in `React Web/src/assets/images/`, product photos in `React Web/public/products/`, colours in `React Web/src/styles/tokens.css`. After editing the front end run `npm run build` again in `React Web`.

## Environment variables
Copy `.env.example` to `.env` in the project root, then start the server from `Node API` with `node --env-file=../.env server/index.js` (Docker Compose reads `.env` itself). Every variable in the file:

| Variable | Meaning |
|---|---|
| `PORT` | HTTP port, default 3000 |
| `DATABASE_PATH` | SQLite file, relative to the folder you start the server in (`Node API`), default `data/ember-oak.db` |
| `DEMO_MODE` | `false` (the example file's value) starts empty and creates one admin. `true` is for demos only: sample data, demo logins on the sign-in page |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | The first admin, used when `DEMO_MODE=false` and the database has no users |
| `COOKIE_SECURE` | `true` when served over HTTPS |
| `TRUST_PROXY` | `true` behind a reverse proxy, so rate limits use the real client address. Without it every visitor shares one limit |
| `STATELESS_SESSIONS`, `SESSION_SECRET` | Serverless demo hosting only (Vercel). Refused when `DEMO_MODE=false` |
| `DEMO_ADMIN_EMAIL`, `DEMO_ADMIN_PASSWORD`, `DEMO_CUSTOMER_EMAIL`, `DEMO_CUSTOMER_PASSWORD` | Demo logins, demo mode only |
| `ALLOW_GUEST_CHECKOUT` | `true` (default) lets visitors order without an account |
| `ALLOWED_ORIGINS` | Extra browser origins allowed to call the API, normally empty |

To try the sample store locally set `DEMO_MODE=true` in `.env` (or run `DEMO_MODE=true npm start` in `Node API`).

Where the built front end lives: the server serves `React Web/dist` when run from this repository, and `/app/dist` inside Docker. Run `npm ci && npm run build` in `React Web` before starting the API, or the site shows a "build the front end" message.

## Development
Two terminals:
```bash
cd "Node API" && npm run dev        # API with auto-restart on :3000
cd "React Web" && npm run dev       # React with hot reload on :5173, forwards /api to :3000
```
Open http://localhost:5173 (landing page) and http://localhost:5173/store/ (the store).

## Tests
```bash
cd "Node API" && npm test
```
17 API tests against an in-memory database. Your data file is not touched.

## Optional: Vercel demo hosting
Import the repository in Vercel with the default settings (Node 22 or newer). `vercel.json` is included. Demo data is rebuilt in memory when a function instance starts, so edits are temporary. Do not use it for a real store.

## Reset the demo
Sign in as admin, open Settings and choose "Restore demo data" (demo mode only).

## Troubleshooting
| Problem | Fix |
|---|---|
| `No such built-in module: node:sqlite` | Upgrade Node to 22.13 or newer |
| "Front end not built" | Run `npm run build` inside `React Web` first |
| Cannot stay signed in over plain HTTP | Leave `COOKIE_SECURE=false` until HTTPS is on |
| Data disappears after a redeploy | The database file is on a temporary disk. Mount a persistent volume at the `DATABASE_PATH` folder |
| "Too many sign-in attempts" | Wait 15 minutes; the limit is 10 tries per email and address |
| Port 3000 in use | Set `PORT=4000` |
