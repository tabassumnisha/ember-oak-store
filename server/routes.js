import crypto from 'node:crypto'
import { config } from './config.js'
import { tx, resetDemo } from './db.js'
import { HttpError, send, readJson, checkOrigin } from './http.js'
import { COOKIE, parseCookies, hashPassword, verifyPassword, verifyDummy, createSession, destroySession, userFromToken, sessionCookie, makeLimiter } from './auth.js'
import { productOut, orderOut, priceOrder } from './pricing.js'
import { validateRegister, validateCustomer, validateProduct, EMAIL_RE } from './validate.js'

const STATUSES = ['Processing', 'Roasting', 'Shipped', 'Delivered', 'Cancelled']
const loginLimit = makeLimiter(10, 15 * 60_000)
const writeLimit = makeLimiter(40, 60 * 60_000)

const slug = (s) => s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').slice(0, 60) || 'product'
const publicUser = (u) => ({ id: u.id, email: u.email, name: u.name, role: u.role })

export function createHandler(db) {
  const q = (sql) => db.prepare(sql)
  const categories = () => q('SELECT id FROM categories').all().map((c) => c.id)
  const itemsOf = (id) => q('SELECT * FROM order_items WHERE order_id = ? ORDER BY id').all(id)
  const productRow = (id) => q('SELECT * FROM products WHERE id = ?').get(id)

  // Every route receives ctx = { req, res, params, url, user, body }.
  // Role checks live here, on the server, not in the React code.
  const requireUser = (ctx) => { if (!ctx.user) throw new HttpError(401, 'Please sign in'); return ctx.user }
  const requireAdmin = (ctx) => { const u = requireUser(ctx); if (u.role !== 'admin') throw new HttpError(403, 'Admin access required'); return u }

  const routes = []
  const route = (method, pattern, handler, { body = false } = {}) =>
    routes.push({ method, re: new RegExp('^' + pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$'), handler, body })

  route('GET', '/api/health', (c) => send(c.res, 200, { ok: true, demoMode: config.demoMode }))
  route('GET', '/api/config', (c) =>
    send(c.res, 200, {
      demoMode: config.demoMode,
      taxRate: config.store.taxRate,
      freeShippingOver: config.store.freeShippingOverCents / 100,
      shipping: config.store.shipping.map((s) => ({ id: s.id, label: s.label, price: s.priceCents / 100 })),
      demoAccounts: config.demoMode
        ? [{ role: 'admin', email: 'admin@emberoak.demo', password: 'Admin#Demo2026' }, { role: 'customer', email: 'customer@emberoak.demo', password: 'Customer#Demo2026' }]
        : [],
    }))

  // ---- auth
  const startSession = (c, user) => {
    const token = createSession(db, user.id)
    const secure = config.cookieSecure || c.req.headers['x-forwarded-proto'] === 'https'
    return { 'Set-Cookie': sessionCookie(token, secure) }
  }
  route('POST', '/api/auth/register', (c) => {
    if (!writeLimit.take('reg:' + c.ip)) throw new HttpError(429, 'Too many attempts. Try again later.')
    const v = validateRegister(c.body)
    if (q('SELECT 1 FROM users WHERE email = ?').get(v.email)) throw new HttpError(409, 'An account with this email already exists', { email: 'Already registered' })
    const r = q("INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, 'customer')").run(v.email, v.name, hashPassword(v.password))
    const user = { id: Number(r.lastInsertRowid), email: v.email, name: v.name, role: 'customer' }
    send(c.res, 201, { user: publicUser(user) }, startSession(c, user))
  }, { body: true })

  route('POST', '/api/auth/login', (c) => {
    const email = String(c.body.email || '').trim().toLowerCase().slice(0, 160)
    const password = String(c.body.password || '').slice(0, 200)
    const key = `${c.ip}|${email}`
    if (!loginLimit.take(key)) throw new HttpError(429, 'Too many sign-in attempts. Try again in 15 minutes.')
    const row = q('SELECT * FROM users WHERE email = ?').get(email)
    const ok = row ? verifyPassword(password, row.password_hash) : (verifyDummy(password), false)
    if (!ok) throw new HttpError(401, 'Incorrect email or password')
    loginLimit.reset(key)
    send(c.res, 200, { user: publicUser(row) }, startSession(c, row))
  }, { body: true })

  route('POST', '/api/auth/logout', (c) => {
    destroySession(db, c.token)
    send(c.res, 200, { ok: true }, { 'Set-Cookie': sessionCookie('', false) })
  }, { body: true })

  route('GET', '/api/auth/me', (c) => send(c.res, 200, { user: c.user ? publicUser(c.user) : null }))

  // ---- products (public read, admin write)
  route('GET', '/api/products', (c) => send(c.res, 200, { products: q('SELECT * FROM products ORDER BY created_at DESC, name').all().map(productOut) }))
  route('GET', '/api/products/:id', (c) => {
    const p = productRow(c.params.id)
    if (!p) throw new HttpError(404, 'Product not found')
    send(c.res, 200, { product: productOut(p) })
  })

  const writeProduct = (id, v, create) => {
    const cols = ['category_id', 'name', 'summary', 'description', 'price_cents', 'compare_at_cents', 'stock', 'featured', 'origin', 'roast', 'process', 'altitude', 'notes', 'profile', 'sizes', 'colors', 'details', 'art', 'image']
    const val = (k) => (['notes', 'profile', 'sizes', 'colors', 'details', 'art'].includes(k) ? (v[k] == null ? null : JSON.stringify(v[k])) : v[k])
    if (create) {
      q(`INSERT INTO products (id, ${cols.join(', ')}, rating, reviews_count) VALUES (?, ${cols.map(() => '?').join(', ')}, ?, ?)`).run(id, ...cols.map(val), v.rating, v.reviews_count)
    } else {
      q(`UPDATE products SET ${cols.map((k) => `${k} = ?`).join(', ')} WHERE id = ?`).run(...cols.map(val), id)
    }
  }

  route('POST', '/api/products', (c) => {
    requireAdmin(c)
    const v = validateProduct(c.body, categories())
    let id = slug(v.name), n = 2
    while (productRow(id)) id = `${slug(v.name)}-${n++}`
    writeProduct(id, v, true)
    send(c.res, 201, { product: productOut(productRow(id)) })
  }, { body: true })

  route('PUT', '/api/products/:id', (c) => {
    requireAdmin(c)
    const cur = productRow(c.params.id)
    if (!cur) throw new HttpError(404, 'Product not found')
    const v = validateProduct({ rating: cur.rating, reviews: cur.reviews_count, ...c.body }, categories())
    writeProduct(cur.id, v, false)
    send(c.res, 200, { product: productOut(productRow(cur.id)) })
  }, { body: true })

  route('DELETE', '/api/products/:id', (c) => {
    requireAdmin(c)
    if (!productRow(c.params.id)) throw new HttpError(404, 'Product not found')
    q('DELETE FROM products WHERE id = ?').run(c.params.id)
    send(c.res, 200, { ok: true })
  }, { body: true })

  // ---- orders
  route('POST', '/api/orders', (c) => {
    if (!writeLimit.take('ord:' + c.ip)) throw new HttpError(429, 'Too many orders from this address. Try again later.')
    const customer = validateCustomer(c.body.customer)
    const payment = c.body.payment === 'Cash on delivery' ? 'Cash on delivery' : 'Card'
    const order = tx(db, () => {
      const priced = priceOrder(db, c.body.items, c.body.shippingId)
      const seq = (q('SELECT COALESCE(MAX(seq), 10000) AS m FROM orders').get().m) + 1
      const id = `EO-${seq}`
      const token = crypto.randomBytes(16).toString('hex')
      q(`INSERT INTO orders (id, seq, user_id, access_token, status, customer_name, customer_email, customer_phone, address, city, zip, payment, shipping_id, subtotal_cents, shipping_cents, tax_cents, total_cents)
         VALUES (?, ?, ?, ?, 'Processing', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
        id, seq, c.user ? c.user.id : null, token, customer.name, customer.email, customer.phone, customer.address, customer.city, customer.zip,
        payment, priced.method.id, priced.subtotal, priced.shipping, priced.tax, priced.total)
      for (const l of priced.lines) {
        q('INSERT INTO order_items (order_id, product_id, name, size, grind, color, qty, unit_price_cents) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(id, l.product.id, l.product.name, l.size, l.grind, l.color, l.qty, l.unit)
      }
      for (const [pid, qty] of priced.need) q('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?').run(qty, pid, qty)
      return id
    })
    const o = q('SELECT * FROM orders WHERE id = ?').get(order)
    send(c.res, 201, { order: orderOut(o, itemsOf(order), { withToken: true }) })
  }, { body: true })

  route('GET', '/api/orders', (c) => {
    const u = requireUser(c)
    const rows = u.role === 'admin' ? q('SELECT * FROM orders ORDER BY seq DESC').all() : q('SELECT * FROM orders WHERE user_id = ? ORDER BY seq DESC').all(u.id)
    send(c.res, 200, { orders: rows.map((o) => orderOut(o, itemsOf(o.id))) })
  })

  route('GET', '/api/orders/:id', (c) => {
    const o = q('SELECT * FROM orders WHERE id = ?').get(c.params.id)
    const token = c.url.searchParams.get('token') || ''
    const tokenOk = o && token.length === o.access_token.length && crypto.timingSafeEqual(Buffer.from(token), Buffer.from(o.access_token))
    const allowed = o && (tokenOk || (c.user && (c.user.role === 'admin' || c.user.id === o.user_id)))
    if (!allowed) throw new HttpError(o && !c.user ? 401 : 404, o && !c.user ? 'Please sign in' : 'Order not found') // same answer for "missing" and "not yours"
    send(c.res, 200, { order: orderOut(o, itemsOf(o.id)) })
  })

  route('PATCH', '/api/orders/:id', (c) => {
    requireAdmin(c)
    const status = c.body.status
    if (!STATUSES.includes(status)) throw new HttpError(422, 'Unknown status')
    const o = q('SELECT * FROM orders WHERE id = ?').get(c.params.id)
    if (!o) throw new HttpError(404, 'Order not found')
    tx(db, () => {
      // Cancelling returns stock once; un-cancelling takes it again if available.
      if (status === 'Cancelled' && o.status !== 'Cancelled')
        for (const i of itemsOf(o.id)) if (i.product_id) q('UPDATE products SET stock = stock + ? WHERE id = ?').run(i.qty, i.product_id)
      if (o.status === 'Cancelled' && status !== 'Cancelled')
        for (const i of itemsOf(o.id)) if (i.product_id) q('UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?').run(i.qty, i.product_id)
      q('UPDATE orders SET status = ? WHERE id = ?').run(status, o.id)
    })
    send(c.res, 200, { order: orderOut(q('SELECT * FROM orders WHERE id = ?').get(o.id), itemsOf(o.id)) })
  }, { body: true })

  // ---- demo reset (admin only, and only when DEMO_MODE=true)
  route('POST', '/api/admin/reset-demo', (c) => {
    requireAdmin(c)
    if (!config.demoMode) throw new HttpError(403, 'Demo reset is disabled when DEMO_MODE is off')
    resetDemo(db)
    send(c.res, 200, { ok: true })
  }, { body: true })

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
