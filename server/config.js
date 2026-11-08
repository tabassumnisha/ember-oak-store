// All settings come from environment variables. See .env.example.
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const bool = (v, d) => (v === undefined || v === '' ? d : ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase()))

export const config = {
  root,
  port: Number(process.env.PORT) || 3000,
  host: process.env.HOST || '0.0.0.0',
  dbPath: path.resolve(root, process.env.DATABASE_PATH || 'data/ember-oak.db'),
  staticDir: path.resolve(root, process.env.STATIC_DIR || 'dist'),
  demoMode: bool(process.env.DEMO_MODE, true),
  adminEmail: (process.env.ADMIN_EMAIL || '').trim().toLowerCase(),
  adminPassword: process.env.ADMIN_PASSWORD || '',
  trustProxy: bool(process.env.TRUST_PROXY, false),
  cookieSecure: bool(process.env.COOKIE_SECURE, false), // also turned on per request when the proxy says https
  allowedOrigins: (process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean),
  sessionDays: 7,
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
