import { config } from '../config.js'
import { send } from '../http.js'

export function systemRoutes({ route }) {
  route('GET', '/api/health', (c) => send(c.res, 200, { ok: true, demoMode: config.demoMode }))
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
