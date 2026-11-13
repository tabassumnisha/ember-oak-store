import { config } from '../config.js'
import { send } from '../http.js'

export function systemRoutes({ db, route }) {
  route('GET', '/api/health', (c) => send(c.res, 200, {
    ok: true,
    demoMode: config.demoMode,
    // Build and runtime facts that help when checking a deployment. No secrets.
    node: process.version,
    commit: (process.env.VERCEL_GIT_COMMIT_SHA || '').slice(0, 7) || undefined,
    users: db.prepare('SELECT COUNT(*) AS n FROM users').get().n,
    products: db.prepare('SELECT COUNT(*) AS n FROM products').get().n,
  }))
  route('GET', '/api/config', (c) =>
    send(c.res, 200, {
      demoMode: config.demoMode,
      taxRate: config.store.taxRate,
      freeShippingOver: config.store.freeShippingOverCents / 100,
      shipping: config.store.shipping.map((s) => ({ id: s.id, label: s.label, price: s.priceCents / 100 })),
      demoAccounts: config.demoMode
        ? [{ role: 'admin', ...config.demo.admin }, { role: 'customer', ...config.demo.customer }]
        : [],
    }))

}
