// All settings come from environment variables. See .env.example.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

// `root` is the Node API folder. In the ZIP the SQL scripts and the built front end sit next to it:
//   database/  and  React Web/dist/   (the Docker image copies them under /app instead).
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const firstExisting = (...c) => c.find((p) => fs.existsSync(p)) || c[c.length - 1]
const bool = (v, d) => (v === undefined || v === '' ? d : ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase()))

function demoPassword(envName, role) {
  if (process.env[envName]) return process.env[envName]
  const secret = process.env.SESSION_SECRET
  const pw = secret
    ? 'Demo-' + crypto.createHmac('sha256', secret).update('demo-' + role).digest('base64url').slice(0, 12)
    : 'Demo-' + crypto.randomBytes(9).toString('base64url')
  if (bool(process.env.DEMO_MODE, true) && !secret) console.warn(`[ember-oak] ${envName} not set: using a random demo ${role} password for this run: ${pw}`)
  return pw
}

export const config = {
  root,
  port: Number(process.env.PORT) || 3000,
  host: process.env.HOST || '0.0.0.0',
  dbPath: path.resolve(root, process.env.DATABASE_PATH || 'data/ember-oak.db'),
  databaseDir: process.env.DATABASE_SCRIPTS_DIR ? path.resolve(root, process.env.DATABASE_SCRIPTS_DIR) : firstExisting(path.join(root, 'database'), path.resolve(root, '..', 'database')),
  staticDir: process.env.STATIC_DIR ? path.resolve(root, process.env.STATIC_DIR) : firstExisting(path.join(root, 'dist'), path.resolve(root, '..', 'React Web', 'dist')),
  demoMode: bool(process.env.DEMO_MODE, true),
  // Demo-only logins (used when DEMO_MODE=true). Not secrets: they are shown on the demo sign-in page.
  // Override with DEMO_ADMIN_EMAIL / DEMO_ADMIN_PASSWORD / DEMO_CUSTOMER_EMAIL / DEMO_CUSTOMER_PASSWORD.
  // No password is written in the code. Set DEMO_*_PASSWORD, or SESSION_SECRET (passwords are then derived from it
  // and stay the same on every serverless instance), or neither (random per start, printed to the server log).
  demo: {
    admin: { email: process.env.DEMO_ADMIN_EMAIL || 'admin@emberoak.demo', password: demoPassword('DEMO_ADMIN_PASSWORD', 'admin') },
    customer: { email: process.env.DEMO_CUSTOMER_EMAIL || 'customer@emberoak.demo', password: demoPassword('DEMO_CUSTOMER_PASSWORD', 'customer') },
  },
  sessionSecret: process.env.SESSION_SECRET || '',
  allowGuestCheckout: bool(process.env.ALLOW_GUEST_CHECKOUT, true),
  adminEmail: (process.env.ADMIN_EMAIL || '').trim().toLowerCase(),
  adminPassword: process.env.ADMIN_PASSWORD || '',
  trustProxy: bool(process.env.TRUST_PROXY, false),
  cookieSecure: bool(process.env.COOKIE_SECURE, false), // also turned on per request when the proxy says https
  allowedOrigins: (process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean),
  sessionDays: 7,
  statelessSessionHours: 12, // serverless demo cookies live shorter because they cannot be revoked
  // Store rules the server applies when it prices an order. The browser never decides prices.
  store: {
    taxRate: 0.07,
    freeShippingOverCents: 4500,
    shipping: [
      { id: 'standard', label: 'Standard (3–5 days)', priceCents: 590 },
      { id: 'express', label: 'Express (1–2 days)', priceCents: 1400 },
    ],
  },
}
