import crypto from 'node:crypto'
import { tx } from '../db.js'
import { HttpError, send } from '../http.js'
import { orderOut, priceOrder } from '../pricing.js'
import { validateCustomer } from '../validate.js'

const STATUSES = ['Processing', 'Roasting', 'Shipped', 'Delivered', 'Cancelled']

export function orderRoutes({ db, q, route, requireUser, requireAdmin, writeLimit, itemsOf }) {
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

}
