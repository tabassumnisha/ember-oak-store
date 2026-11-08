import { HttpError } from './http.js'

const str = (v, max, field, { required = true } = {}) => {
  const s = typeof v === 'string' ? v.trim() : ''
  if (!s && required) throw new HttpError(422, `${field} is required`, { [field]: 'Required' })
  if (s.length > max) throw new HttpError(422, `${field} is too long`, { [field]: `At most ${max} characters` })
  return s || null
}
const cents = (v, field) => {
  const n = Number(v)
  if (!Number.isFinite(n) || n < 0 || n > 100000) throw new HttpError(422, `${field} must be between 0 and 100000`, { [field]: 'Invalid amount' })
  return Math.round(n * 100)
}
const list = (v, max, itemMax, field) => {
  if (v == null) return null
  if (!Array.isArray(v) || v.length > max) throw new HttpError(422, `${field} is invalid`)
  const out = v.map((x) => str(x, itemMax, field, { required: false })).filter(Boolean)
  return out.length ? out : null
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function validateRegister(b) {
  const name = str(b.name, 80, 'name')
  const email = str(b.email, 160, 'email').toLowerCase()
  if (!EMAIL_RE.test(email)) throw new HttpError(422, 'Enter a valid email address', { email: 'Enter a valid email address' })
  const password = typeof b.password === 'string' ? b.password : ''
  if (password.length < 8 || password.length > 200) throw new HttpError(422, 'Password must be 8 to 200 characters', { password: 'Use at least 8 characters' })
  return { name, email, password }
}

export function validateCustomer(c = {}) {
  const email = str(c.email, 160, 'email').toLowerCase()
  if (!EMAIL_RE.test(email)) throw new HttpError(422, 'Enter a valid email address', { email: 'Enter a valid email address' })
  return {
    name: str(c.name, 80, 'name'), email, phone: str(c.phone, 40, 'phone', { required: false }),
    address: str(c.address, 160, 'address'), city: str(c.city, 80, 'city'), zip: str(c.zip, 20, 'zip'),
  }
}

export function validateProduct(b, categories) {
  if (!b || typeof b !== 'object') throw new HttpError(400, 'Invalid product')
  const category = str(b.category, 40, 'category')
  if (!categories.includes(category)) throw new HttpError(422, 'Unknown category', { category: 'Unknown category' })
  let sizes = null
  if (b.sizes != null) {
    if (!Array.isArray(b.sizes) || b.sizes.length === 0 || b.sizes.length > 6) throw new HttpError(422, 'sizes is invalid')
    sizes = b.sizes.map((s) => ({ label: str(s?.label, 30, 'size'), price_cents: cents(s?.price, 'size price') }))
  }
  const colors = b.colors == null ? null : (Array.isArray(b.colors) && b.colors.length <= 8
    ? b.colors.map((c) => ({ label: str(c?.label, 30, 'color'), value: /^#[0-9a-fA-F]{6}$/.test(c?.value) ? c.value : '#888888' }))
    : (() => { throw new HttpError(422, 'colors is invalid') })())
  const price_cents = sizes ? sizes[0].price_cents : cents(b.price, 'price')
  const compare = b.compareAt === '' || b.compareAt == null || b.compareAt === 0 ? null : cents(b.compareAt, 'compareAt')
  const stock = Number(b.stock)
  if (!Number.isInteger(stock) || stock < 0 || stock > 100000) throw new HttpError(422, 'Stock must be a whole number', { stock: 'Whole number, 0 or more' })
  let image = null
  if (b.image) {
    image = str(b.image, 300, 'image')
    if (!/^\/[\w./-]+$/.test(image) || image.includes('..')) throw new HttpError(422, 'Image must be a path such as /products/name.webp', { image: 'Use a path like /products/name.webp' })
  }
  const art = b.art && typeof b.art === 'object' && JSON.stringify(b.art).length < 600 ? b.art : { type: 'kettle', color: '#1D2A4A' }
  const profile = b.profile && typeof b.profile === 'object'
    ? Object.fromEntries(['acidity', 'body', 'sweetness'].map((k) => [k, Math.min(5, Math.max(1, Math.round(Number(b.profile[k]) || 3)))]))
    : null
  return {
    category_id: category, name: str(b.name, 120, 'name'), summary: str(b.summary, 200, 'summary'), description: str(b.description, 2000, 'description'),
    price_cents, compare_at_cents: compare, stock, featured: b.featured ? 1 : 0,
    origin: str(b.origin, 60, 'origin', { required: false }), roast: str(b.roast, 40, 'roast', { required: false }),
    process: str(b.process, 40, 'process', { required: false }), altitude: str(b.altitude, 40, 'altitude', { required: false }),
    notes: list(b.notes, 8, 40, 'notes'), profile, sizes, colors, details: list(b.details, 10, 80, 'details'), art, image,
    rating: Math.min(5, Math.max(0, Number(b.rating) || 0)), reviews_count: Math.max(0, Math.min(1e6, Math.round(Number(b.reviews) || 0))),
  }
}
