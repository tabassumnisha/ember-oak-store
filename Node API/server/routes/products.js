import { HttpError, send } from '../http.js'
import { productOut } from '../pricing.js'
import { validateProduct } from '../validate.js'

const slug = (s) => s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').slice(0, 60) || 'product'

export function productRoutes({ q, route, requireAdmin, categories, productRow }) {
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

}
