import { useMemo } from 'react'
import { Link, navigate, buildQuery } from '../router'
import { useStore } from '../store'
import { CATEGORIES } from '../data/products'
import ProductCard from '../components/ProductCard'
import { TASTES, lowestPrice, usePageTitle } from '../utils'

const SORTS = [
  { id: 'featured', label: 'Featured' },
  { id: 'new', label: 'Newest' },
  { id: 'price-asc', label: 'Price, low to high' },
  { id: 'price-desc', label: 'Price, high to low' },
  { id: 'rating', label: 'Best rated' },
]

export default function Shop({ query }) {
  const { products } = useStore()
  const { cat = 'all', origin = 'all', roast = 'all', q = '', sort = 'featured', stock = '', taste = 'all' } = query
  const catLabel = CATEGORIES.find((c) => c.id === cat)?.label
  usePageTitle(q ? `Search: ${q}` : catLabel || 'Shop all')

  const set = (patch) => navigate(`/shop${buildQuery({ ...query, ...patch })}`)

  const origins = useMemo(() => [...new Set(products.filter((p) => p.origin).map((p) => p.origin))], [products])
  const roasts = useMemo(() => [...new Set(products.filter((p) => p.roast).map((p) => p.roast))], [products])
  const showBeanFilters = cat === 'all' || cat === 'beans'

  const list = useMemo(() => {
    const t = TASTES.find((x) => x.id === taste)
    let out = products.filter((p) => {
      if (cat !== 'all' && p.category !== cat) return false
      if (origin !== 'all' && p.origin !== origin) return false
      if (roast !== 'all' && p.roast !== roast) return false
      if (stock === '1' && p.stock <= 0) return false
      if (t && !(p.profile && t.test(p))) return false
      if (q) {
        const hay = [p.name, p.summary, p.origin, p.roast, ...(p.notes || [])].join(' ').toLowerCase()
        if (!q.toLowerCase().split(/\s+/).every((w) => hay.includes(w))) return false
      }
      return true
    })
    const by = {
      featured: (a, b) => Number(b.featured) - Number(a.featured) || b.reviews - a.reviews,
      new: (a, b) => b.created.localeCompare(a.created),
      'price-asc': (a, b) => lowestPrice(a) - lowestPrice(b),
      'price-desc': (a, b) => lowestPrice(b) - lowestPrice(a),
      rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
    }
    return [...out].sort(by[sort] || by.featured)
  }, [products, cat, origin, roast, q, sort, stock, taste])

  const active = [
    cat !== 'all' && { k: 'cat', label: catLabel },
    origin !== 'all' && { k: 'origin', label: origin },
    roast !== 'all' && { k: 'roast', label: `${roast} roast` },
    taste !== 'all' && { k: 'taste', label: TASTES.find((t) => t.id === taste)?.label },
    q && { k: 'q', label: `“${q}”` },
    stock === '1' && { k: 'stock', label: 'In stock' },
  ].filter(Boolean)

  return (
    <div className="wrap page">
      <div className="page-head">
        <h1>{q ? `Results for “${q}”` : catLabel || 'All products'}</h1>
        <p className="muted">
          {list.length} {list.length === 1 ? 'product' : 'products'}
        </p>
      </div>

      <div className="shop">
        <aside className="filters" aria-label="Filters">
          <fieldset>
            <legend>Category</legend>
            {[{ id: 'all', label: 'Everything' }, ...CATEGORIES].map((c) => (
              <label key={c.id} className="check">
                <input type="radio" name="cat" checked={cat === c.id} onChange={() => set({ cat: c.id, origin: 'all', roast: 'all', taste: 'all' })} />
                <span>{c.label}</span>
              </label>
            ))}
          </fieldset>
          {showBeanFilters && (
            <>
              <fieldset>
                <legend>Taste</legend>
                {[{ id: 'all', label: 'Any' }, ...TASTES].map((t) => (
                  <label key={t.id} className="check">
                    <input type="radio" name="taste" checked={taste === t.id} onChange={() => set({ taste: t.id })} />
                    <span>{t.label}</span>
                  </label>
                ))}
              </fieldset>
              <fieldset>
                <legend>Origin</legend>
                {['all', ...origins].map((o) => (
                  <label key={o} className="check">
                    <input type="radio" name="origin" checked={origin === o} onChange={() => set({ origin: o })} />
                    <span>{o === 'all' ? 'Any origin' : o}</span>
                  </label>
                ))}
              </fieldset>
              <fieldset>
                <legend>Roast</legend>
                {['all', ...roasts].map((r) => (
                  <label key={r} className="check">
                    <input type="radio" name="roast" checked={roast === r} onChange={() => set({ roast: r })} />
                    <span>{r === 'all' ? 'Any roast' : r}</span>
                  </label>
                ))}
              </fieldset>
            </>
          )}
          <label className="check toggle">
            <input type="checkbox" checked={stock === '1'} onChange={(e) => set({ stock: e.target.checked ? '1' : '' })} />
            <span>In stock only</span>
          </label>
        </aside>

        <div>
          <div className="toolbar">
            <div className="chips">
              {active.map((a) => (
                <button key={a.k} className="chip" onClick={() => set({ [a.k]: a.k === 'stock' || a.k === 'q' ? '' : 'all' })} aria-label={`Remove filter ${a.label}`}>
                  {a.label} <span aria-hidden="true">×</span>
                </button>
              ))}
            </div>
            <label className="sort">
              <span className="sr">Sort by</span>
              <select value={sort} onChange={(e) => set({ sort: e.target.value })}>
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {list.length === 0 ? (
            <div className="empty">
              <h2>Nothing matches those filters</h2>
              <p className="muted">Remove a filter or browse everything we roast and sell.</p>
              <Link to="/shop" className="btn btn-dark">
                Clear all filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-3">
              {list.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
