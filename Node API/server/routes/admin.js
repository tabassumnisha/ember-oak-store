import { config } from '../config.js'
import { resetDemo } from '../db.js'
import { HttpError, send } from '../http.js'

export function adminRoutes({ db, route, requireAdmin }) {
  // ---- demo reset (admin only, and only when DEMO_MODE=true)
  route('POST', '/api/admin/reset-demo', (c) => {
    requireAdmin(c)
    if (!config.demoMode) throw new HttpError(403, 'Demo reset is disabled when DEMO_MODE is off')
    resetDemo(db)
    send(c.res, 200, { ok: true })
  }, { body: true })

}
