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
Open http://localhost:3000. For production run it under systemd or pm2 behind nginx, Caddy or Traefik with HTTPS, and set `COOKIE_SECURE=true` and `TRUST_PROXY=true`.

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
- **Demo mode** (default): sign in at `/#/admin` with `admin@emberoak.demo` / `Admin#Demo2026`. A customer account `customer@emberoak.demo` / `Customer#Demo2026` is also loaded.
- **Real store**: set `DEMO_MODE=false`, `ADMIN_EMAIL` and an `ADMIN_PASSWORD` of 10+ characters, start on an empty database, and sign in at `/#/admin` with those. No demo account is created.

## Branding and content changes
See `docs/customisation.md`. In short: store details in `React Web/src/config.js`, tax and shipping in `Node API/server/config.js`, logo and banners in `React Web/src/assets/images/`, product photos in `React Web/public/products/`, colours in `React Web/src/styles/tokens.css`. After editing the front end run `npm run build` again in `React Web`.

## Environment variables
Copy `.env.example`. The main ones are `DEMO_MODE`, `DATABASE_PATH`, `PORT`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `COOKIE_SECURE`, `TRUST_PROXY`. Meanings are in the comments in that file and in `README.md`.

## Development
Two terminals:
```bash
cd "Node API" && npm run dev        # API with auto-restart on :3000
cd "React Web" && npm run dev       # React with hot reload on :5173, forwards /api to :3000
```
Open http://localhost:5173.

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
