import { config } from './config.js'
import { HttpError } from './http.js'

const GRINDS = ['Whole bean', 'Espresso', 'Filter', 'French press']
const j = (s) => (s ? JSON.parse(s) : null)

// Database row -> the JSON shape the front end uses (dollars, not cents).
export function productOut(r) {
  const sizes = j(r.sizes)
  return {
    id: r.id, name: r.name, category: r.category_id, summary: r.summary, description: r.description,
    price: r.price_cents / 100, compareAt: r.compare_at_cents == null ? undefined : r.compare_at_cents / 100,
    stock: r.stock, rating: r.rating, reviews: r.reviews_count, featured: !!r.featured, created: r.created_at,
    origin: r.origin ?? undefined, roast: r.roast ?? undefined, process: r.process ?? undefined, altitude: r.altitude ?? undefined,
    notes: j(r.notes) ?? undefined, profile: j(r.profile) ?? undefined,
    sizes: sizes ? sizes.map((s) => ({ label: s.label, price: s.price_cents / 100 })) : undefined,
    colors: j(r.colors) ?? undefined, details: j(r.details) ?? undefined, art: j(r.art), image: r.image ?? undefined,
  }
}

export function orderOut(o, items, { withToken = false } = {}) {
  return {
    id: o.id, createdAt: o.created_at.replace(' ', 'T') + 'Z', status: o.status, payment: o.payment, shippingId: o.shipping_id,
    customer: { name: o.customer_name, email: o.customer_email, phone: o.customer_phone, address: o.address, city: o.city, zip: o.zip },
    items: items.map((i) => ({ productId: i.product_id, name: i.name, size: i.size, grind: i.grind, color: i.color, qty: i.qty, price: i.unit_price_cents / 100 })),
    subtotal: o.subtotal_cents / 100, shipping: o.shipping_cents / 100, tax: o.tax_cents / 100, total: o.total_cents / 100,
    ...(withToken ? { accessToken: o.access_token } : {}),
  }
}

// Prices an order from what is in the database. Client-supplied prices are never read.
export function priceOrder(db, items, shippingId) {
  if (!Array.isArray(items) || items.length === 0 || items.length > 30) throw new HttpError(400, 'Your bag is empty')
  const method = config.store.shipping.find((s) => s.id === shippingId) || config.store.shipping[0]
  const lines = []
  const need = new Map()
  for (const it of items) {
    const qty = Number(it?.qty)
    if (!Number.isInteger(qty) || qty < 1 || qty > 20) throw new HttpError(400, 'Invalid quantity')
    const p = db.prepare('SELECT * FROM products WHERE id = ?').get(String(it.productId))
    if (!p) throw new HttpError(409, 'An item in your bag is no longer available')
    const sizes = j(p.sizes)
    let unit = p.price_cents, size = null, grind = null, color = null
    if (sizes) {
      const s = sizes.find((x) => x.label === it.size) || sizes[0]
      unit = s.price_cents; size = s.label
      grind = GRINDS.includes(it.grind) ? it.grind : GRINDS[0]
    }
    const colors = j(p.colors)
    if (colors) color = (colors.find((c) => c.label === it.color) || colors[0]).label
    need.set(p.id, (need.get(p.id) || 0) + qty)
    lines.push({ product: p, size, grind, color, qty, unit })
  }
  for (const [id, qty] of need) {
    const p = lines.find((l) => l.product.id === id).product
    if (p.stock < qty) throw new HttpError(409, p.stock === 0 ? `${p.name} is sold out` : `Only ${p.stock} of ${p.name} left`)
  }
  const subtotal = lines.reduce((s, l) => s + l.unit * l.qty, 0)
  const shipping = method.id === 'standard' && subtotal >= config.store.freeShippingOverCents ? 0 : method.priceCents
  const tax = Math.round(subtotal * config.store.taxRate)
  return { lines, need, method, subtotal, shipping, tax, total: subtotal + shipping + tax }
}
