import { config } from './config.js'
import { HttpError, send, readJson, checkOrigin } from './http.js'
import { COOKIE, parseCookies, userFromToken, makeLimiter, stateless } from './auth.js'
import { systemRoutes } from './routes/system.js'
import { authRoutes } from './routes/auth.js'
import { productRoutes } from './routes/products.js'
import { orderRoutes } from './routes/orders.js'
import { adminRoutes } from './routes/admin.js'

// Builds the request handler. Routes are registered by the modules in ./routes/.
// Every write route calls requireUser or requireAdmin itself: role checks live on the server, not in React.
export function createHandler(db) {
  // Signed-cookie sessions cannot be revoked, so they are only allowed for the demo host.
  if (stateless() && !config.demoMode) throw new Error('STATELESS_SESSIONS is for the demo host only. Set DEMO_MODE=true or STATELESS_SESSIONS=false.')
  const q = (sql) => db.prepare(sql)
  const helpers = {
    db, q,
    categories: () => q('SELECT id FROM categories').all().map((c) => c.id),
    itemsOf: (id) => q('SELECT * FROM order_items WHERE order_id = ? ORDER BY id').all(id),
    productRow: (id) => q('SELECT * FROM products WHERE id = ?').get(id),
    loginLimit: makeLimiter(10, 15 * 60_000),
    writeLimit: makeLimiter(40, 60 * 60_000),
    requireUser: (ctx) => { if (!ctx.user) throw new HttpError(401, 'Please sign in'); return ctx.user },
    requireAdmin: (ctx) => {
      const u = helpers.requireUser(ctx)
      if (u.role !== 'admin') throw new HttpError(403, 'Admin access required')
      return u
    },
  }

  const routes = []
  helpers.route = (method, pattern, handler, { body = false } = {}) =>
    routes.push({ method, re: new RegExp('^' + pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$'), handler, body })

  for (const register of [systemRoutes, authRoutes, productRoutes, orderRoutes, adminRoutes]) register(helpers)

  return async function handle(req, res) {
    const url = new URL(req.url, 'http://x')
    const ip = (config.trustProxy && String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()) || req.socket.remoteAddress || 'unknown'
    try {
      const match = routes.find((r) => r.method === req.method && r.re.test(url.pathname))
      if (!match) {
        if (routes.some((r) => r.re.test(url.pathname))) throw new HttpError(405, 'Method not allowed')
        throw new HttpError(404, 'Not found')
      }
      const token = parseCookies(req.headers.cookie)[COOKIE]
      const mutating = req.method !== 'GET'
      if (mutating) checkOrigin(req)
      const body = mutating ? await readJson(req) : {}
      const user = userFromToken(db, token)
      await match.handler({ req, res, url, ip, token, user, body, params: url.pathname.match(match.re).groups || {} })
    } catch (e) {
      if (e instanceof HttpError) return send(res, e.status, { error: e.message, fields: e.fields })
      console.error('[ember-oak] unexpected error:', e)
      send(res, 500, { error: 'Something went wrong' })
    }
  }
}
