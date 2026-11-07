import { STORE } from '../config'

const NAMES = [
  ['Marta Kowalski', 'marta.k@example.com', 'Portland, OR'],
  ['Daniel Reyes', 'd.reyes@example.com', 'Austin, TX'],
  ['Priya Shah', 'priya.s@example.com', 'Seattle, WA'],
  ['Tomás Vega', 'tomas.v@example.com', 'Denver, CO'],
  ['Hannah Lindqvist', 'hannah.l@example.com', 'Minneapolis, MN'],
  ['Omar Haddad', 'omar.h@example.com', 'Chicago, IL'],
  ['Chloe Bennett', 'chloe.b@example.com', 'Brooklyn, NY'],
  ['Kenji Mori', 'kenji.m@example.com', 'San Diego, CA'],
]
const STATUSES = ['Delivered', 'Delivered', 'Delivered', 'Shipped', 'Roasting', 'Processing']

// Small deterministic generator so the demo dashboard always looks the same.
function rng(seed) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

export function buildSeedOrders(products) {
  const rand = rng(2026)
  const sellable = products.filter((p) => p.stock > 0)
  const orders = []
  const now = Date.now()
  for (let i = 0; i < 22; i++) {
    const daysAgo = Math.floor((i / 22) * 13) + (rand() < 0.3 ? 0 : 0)
    const when = new Date(now - daysAgo * 86400000 - Math.floor(rand() * 40000000))
    const person = NAMES[Math.floor(rand() * NAMES.length)]
    const lineCount = 1 + Math.floor(rand() * 3)
    const items = []
    for (let l = 0; l < lineCount; l++) {
      const p = sellable[Math.floor(rand() * sellable.length)]
      const size = p.sizes ? p.sizes[rand() < 0.75 ? 0 : 1] : null
      items.push({
        productId: p.id,
        name: p.name,
        size: size ? size.label : null,
        grind: p.sizes ? 'Whole bean' : null,
        qty: 1 + Math.floor(rand() * 2),
        price: size ? size.price : p.price,
      })
    }
    const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0)
    const shipping = subtotal >= STORE.freeShippingOver ? 0 : STORE.shipping[0].price
    const tax = +(subtotal * STORE.taxRate).toFixed(2)
    orders.push({
      id: `EO-${10480 - i}`,
      createdAt: when.toISOString(),
      customer: { name: person[0], email: person[1], city: person[2] },
      items,
      subtotal,
      shipping,
      tax,
      total: +(subtotal + shipping + tax).toFixed(2),
      payment: rand() < 0.8 ? 'Card' : 'Cash on delivery',
      status: daysAgo > 5 ? 'Delivered' : STATUSES[Math.floor(rand() * STATUSES.length)],
    })
  }
  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
