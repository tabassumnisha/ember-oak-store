// Run with: npm test   (Node 22.13+; uses an in-memory database, nothing on disk is touched)
import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import { openDb, bootstrap } from '../server/db.js'
import { createApp } from '../server/index.js'

let server, base, db
const ADMIN = { email: 'admin@emberoak.demo', password: 'Admin#Demo2026' }
const CUSTOMER = { email: 'customer@emberoak.demo', password: 'Customer#Demo2026' }

before(async () => {
  db = openDb(':memory:')
  bootstrap(db)
  server = createApp(db)
  await new Promise((r) => server.listen(0, '127.0.0.1', r))
  base = `http://127.0.0.1:${server.address().port}`
})
after(() => server.close())

async function call(method, path, { body, cookie } = {}) {
  const res = await fetch(base + path, {
    method, redirect: 'manual',
    headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...(cookie ? { cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  return { status: res.status, json: text ? JSON.parse(text) : null, cookie: (res.headers.get('set-cookie') || '').split(';')[0] }
}
const login = async (who) => (await call('POST', '/api/auth/login', { body: who })).cookie

const order = (items, extra = {}) => ({
  items, shippingId: 'standard', payment: 'Card',
  customer: { name: 'Test Buyer', email: 'buyer@example.com', phone: '555', address: '1 Main St', city: 'Portland', zip: '97201' }, ...extra,
})

test('catalogue is public and includes the photo catalogue', async () => {
  const r = await call('GET', '/api/products')
  assert.equal(r.status, 200)
  assert.equal(r.json.products.length, 19)
  assert.ok(r.json.products.find((p) => p.id === 'gooseneck-kettle').image)
})

test('login: wrong password and unknown email are both rejected with the same message', async () => {
  const a = await call('POST', '/api/auth/login', { body: { email: ADMIN.email, password: 'wrong-password' } })
  const b = await call('POST', '/api/auth/login', { body: { email: 'nobody@example.com', password: 'wrong-password' } })
  assert.equal(a.status, 401); assert.equal(b.status, 401)
  assert.equal(a.json.error, b.json.error)
})

test('session cookie is HttpOnly and /me reflects the signed-in role', async () => {
  const r = await call('POST', '/api/auth/login', { body: CUSTOMER })
  assert.equal(r.status, 200)
  const raw = await fetch(base + '/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(CUSTOMER) })
  assert.match(raw.headers.get('set-cookie'), /HttpOnly/)
  assert.match(raw.headers.get('set-cookie'), /SameSite=Lax/)
  const me = await call('GET', '/api/auth/me', { cookie: r.cookie })
  assert.equal(me.json.user.role, 'customer')
  assert.equal((await call('GET', '/api/auth/me')).json.user, null)
})

test('product writes: 401 without login, 403 for customers, allowed for admin', async () => {
  const p = { name: 'Test Dripper', category: 'gear', price: 25, stock: 5, summary: 's', description: 'd' }
  assert.equal((await call('POST', '/api/products', { body: p })).status, 401)
  const cust = await login(CUSTOMER)
  assert.equal((await call('POST', '/api/products', { body: p, cookie: cust })).status, 403)
  assert.equal((await call('PUT', '/api/products/gooseneck-kettle', { body: p, cookie: cust })).status, 403)
  assert.equal((await call('DELETE', '/api/products/gooseneck-kettle', { body: {}, cookie: cust })).status, 403)
  const admin = await login(ADMIN)
  const made = await call('POST', '/api/products', { body: p, cookie: admin })
  assert.equal(made.status, 201)
  assert.equal(made.json.product.price, 25)
  const upd = await call('PUT', `/api/products/${made.json.product.id}`, { body: { ...p, price: 30 }, cookie: admin })
  assert.equal(upd.json.product.price, 30)
  assert.equal((await call('DELETE', `/api/products/${made.json.product.id}`, { body: {}, cookie: admin })).status, 200)
})

test('product validation rejects bad input', async () => {
  const admin = await login(ADMIN)
  const bad = await call('POST', '/api/products', { body: { name: '', category: 'nope', price: -4, stock: 1.5 }, cookie: admin })
  assert.equal(bad.status, 422)
})

test('order management is admin only; customers only see their own orders', async () => {
  assert.equal((await call('GET', '/api/orders')).status, 401)
  const cust = await login(CUSTOMER), admin = await login(ADMIN)
  const mine = await call('GET', '/api/orders', { cookie: cust })
  assert.equal(mine.json.orders.length, 3)
  const all = await call('GET', '/api/orders', { cookie: admin })
  assert.equal(all.json.orders.length, 22)
  const someoneElses = all.json.orders.find((o) => o.customer.email !== CUSTOMER.email)
  assert.equal((await call('GET', `/api/orders/${someoneElses.id}`, { cookie: cust })).status, 404)
  assert.equal((await call('PATCH', `/api/orders/${mine.json.orders[0].id}`, { body: { status: 'Shipped' }, cookie: cust })).status, 403)
  const ok = await call('PATCH', `/api/orders/${mine.json.orders[0].id}`, { body: { status: 'Shipped' }, cookie: admin })
  assert.equal(ok.json.order.status, 'Shipped')
  assert.equal((await call('PATCH', `/api/orders/${mine.json.orders[0].id}`, { body: { status: 'Bogus' }, cookie: admin })).status, 422)
})

test('prices come from the database: tampered client prices are ignored', async () => {
  const before = (await call('GET', '/api/products/house-blend-no1')).json.product
  const r = await call('POST', '/api/orders', { body: order([{ productId: 'house-blend-no1', qty: 2, size: '250 g', price: 0.01, unitPrice: 0.01 }], { total: 0.01, subtotal: 0.01 }) })
  assert.equal(r.status, 201)
  const o = r.json.order
  assert.equal(o.items[0].price, before.sizes[0].price)
  assert.equal(o.subtotal, before.sizes[0].price * 2)
  assert.equal(o.tax, Math.round(o.subtotal * 7) / 100)
  assert.equal(o.total, +(o.subtotal + o.shipping + o.tax).toFixed(2))
  assert.ok(o.accessToken)
})

test('ordering reduces stock; overselling and bad quantities are refused', async () => {
  const stock = async () => (await call('GET', '/api/products/gooseneck-kettle')).json.product.stock
  const s0 = await stock()
  assert.equal((await call('POST', '/api/orders', { body: order([{ productId: 'gooseneck-kettle', qty: 3 }]) })).status, 201)
  assert.equal(await stock(), s0 - 3)
  assert.equal((await call('POST', '/api/orders', { body: order([{ productId: 'gooseneck-kettle', qty: 999 }]) })).status, 400)
  assert.equal((await call('POST', '/api/orders', { body: order([{ productId: 'gooseneck-kettle', qty: 20 }, { productId: 'gooseneck-kettle', qty: 20 }]) })).status, 409)
  assert.equal((await call('POST', '/api/orders', { body: order([{ productId: 'does-not-exist', qty: 1 }]) })).status, 409)
  assert.equal(await stock(), s0 - 3)
})

test('cancelling an order returns the stock', async () => {
  const admin = await login(ADMIN)
  const stock = async () => (await call('GET', '/api/products/emerald-moka-pot')).json.product.stock
  const s0 = await stock()
  const o = (await call('POST', '/api/orders', { body: order([{ productId: 'emerald-moka-pot', qty: 2 }]) })).json.order
  assert.equal(await stock(), s0 - 2)
  await call('PATCH', `/api/orders/${o.id}`, { body: { status: 'Cancelled' }, cookie: admin })
  assert.equal(await stock(), s0)
})

test('guest order page needs the access token', async () => {
  const o = (await call('POST', '/api/orders', { body: order([{ productId: 'house-blend-no1', qty: 1 }]) })).json.order
  assert.equal((await call('GET', `/api/orders/${o.id}`)).status, 401)
  assert.equal((await call('GET', `/api/orders/${o.id}?token=wrong`)).status, 401)
  const ok = await call('GET', `/api/orders/${o.id}?token=${o.accessToken}`)
  assert.equal(ok.status, 200)
  assert.equal(ok.json.order.accessToken, undefined)
})

test('registration creates a customer and never an admin', async () => {
  const r = await call('POST', '/api/auth/register', { body: { name: 'New Person', email: 'new@example.com', password: 'longenough1', role: 'admin' } })
  assert.equal(r.status, 201)
  assert.equal(r.json.user.role, 'customer')
  assert.equal((await call('POST', '/api/auth/register', { body: { name: 'Dup', email: 'NEW@example.com', password: 'longenough1' } })).status, 409)
  assert.equal((await call('POST', '/api/auth/register', { body: { name: 'Short', email: 'x@example.com', password: 'short' } })).status, 422)
})

test('CSRF: cross-origin and non-JSON writes are blocked', async () => {
  const admin = await login(ADMIN)
  const x = await fetch(base + '/api/admin/reset-demo', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://evil.example', cookie: admin }, body: '{}' })
  assert.equal(x.status, 403)
  const y = await fetch(base + '/api/admin/reset-demo', { method: 'POST', headers: { 'content-type': 'text/plain', cookie: admin }, body: '{}' })
  assert.equal(y.status, 415)
})

test('logout destroys the session', async () => {
  const c = await login(CUSTOMER)
  await call('POST', '/api/auth/logout', { body: {}, cookie: c })
  assert.equal((await call('GET', '/api/auth/me', { cookie: c })).json.user, null)
})

test('login is rate limited after repeated failures', async () => {
  let last
  for (let i = 0; i < 12; i++) last = await call('POST', '/api/auth/login', { body: { email: 'brute@example.com', password: 'nope-nope' } })
  assert.equal(last.status, 429)
})

test('demo reset restores the sample data (admin only)', async () => {
  const admin = await login(ADMIN), cust = await login(CUSTOMER)
  assert.equal((await call('POST', '/api/admin/reset-demo', { body: {}, cookie: cust })).status, 403)
  assert.equal((await call('POST', '/api/admin/reset-demo', { body: {}, cookie: admin })).status, 200)
  assert.equal((await call('GET', '/api/orders', { cookie: admin })).json.orders.length, 22)
  assert.equal((await call('GET', '/api/auth/me', { cookie: admin })).json.user.role, 'admin') // still signed in
})

test('unknown API routes return JSON 404', async () => {
  const r = await call('GET', '/api/nope')
  assert.equal(r.status, 404)
})

test('stateless sessions (serverless demo mode) work across a fresh database instance', async () => {
  process.env.STATELESS_SESSIONS = 'true'
  try {
    const r = await call('POST', '/api/auth/login', { body: ADMIN })
    assert.equal(r.status, 200)
    assert.equal((await call('GET', '/api/auth/me', { cookie: r.cookie })).json.user.role, 'admin')
    const tampered = r.cookie.replace(/.$/, (c) => (c === 'a' ? 'b' : 'a'))
    assert.equal((await call('GET', '/api/auth/me', { cookie: tampered })).json.user, null)
    assert.equal((await call('POST', '/api/products', { body: {}, cookie: tampered })).status, 401)
  } finally {
    delete process.env.STATELESS_SESSIONS
  }
})
