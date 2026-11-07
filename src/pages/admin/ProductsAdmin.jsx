import { useMemo, useState } from 'react'
import { useStore } from '../../store'
import { CATEGORIES } from '../../data/products'
import { money } from '../../config'
import { slug } from '../../utils'
import Media from '../../components/Media'

const ART_TYPES = ['bag', 'dripper', 'kettle', 'grinder', 'scale', 'mug', 'tumbler', 'giftbox']

const blank = () => ({
  id: '',
  name: '',
  category: 'beans',
  origin: '',
  roast: 'Medium',
  process: '',
  altitude: '',
  price: 16,
  stock: 50,
  summary: '',
  description: '',
  notes: '',
  featured: false,
  artType: 'bag',
  artColor: '#1D2A4A',
})

function toForm(p) {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    origin: p.origin || '',
    roast: p.roast || 'Medium',
    process: p.process || '',
    altitude: p.altitude || '',
    price: p.sizes ? p.sizes[0].price : p.price,
    stock: p.stock,
    summary: p.summary,
    description: p.description,
    notes: (p.notes || []).join(', '),
    featured: !!p.featured,
    artType: p.art.type,
    artColor: p.art.color,
  }
}

function validate(f, existingIds, isNew) {
  const e = {}
  if (f.name.trim().length < 2) e.name = 'Enter a product name.'
  if (isNew && existingIds.includes(slug(f.name))) e.name = 'A product with this name already exists.'
  if (!(Number(f.price) > 0)) e.price = 'Enter a price above 0.'
  if (!Number.isInteger(Number(f.stock)) || Number(f.stock) < 0) e.stock = 'Enter a whole number, 0 or more.'
  if (f.summary.trim().length < 5) e.summary = 'Add a short summary.'
  return e
}

function Editor({ product, onClose }) {
  const { saveProduct, products, notify } = useStore()
  const isNew = !product
  const [f, setF] = useState(product ? toForm(product) : blank())
  const [errors, setErrors] = useState({})
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))
  const isBean = f.category === 'beans'

  const submit = (e) => {
    e.preventDefault()
    const errs = validate(f, products.map((p) => p.id), isNew)
    setErrors(errs)
    if (Object.keys(errs).length) return
    const price = Math.round(Number(f.price) * 100) / 100
    const base = product || { rating: 4.8, reviews: 0, created: new Date().toISOString().slice(0, 10), compareAt: undefined }
    const next = {
      ...base,
      id: product ? product.id : slug(f.name),
      name: f.name.trim(),
      category: f.category,
      price,
      stock: Number(f.stock),
      summary: f.summary.trim(),
      description: f.description.trim() || f.summary.trim(),
      featured: f.featured,
      art: { ...(product?.art || {}), type: f.artType, color: f.artColor, label: f.name.trim().split(' ').slice(0, 2).join(' '), sub: f.origin },
    }
    if (isBean) {
      const oldKg = product?.sizes?.[1]?.price
      const oldBase = product?.sizes?.[0]?.price
      const ratio = oldKg && oldBase ? oldKg / oldBase : 3.4
      Object.assign(next, {
        origin: f.origin.trim() || 'Blend',
        roast: f.roast,
        process: f.process.trim() || 'Washed',
        altitude: f.altitude.trim() || 'Various',
        notes: f.notes.split(',').map((n) => n.trim()).filter(Boolean),
        profile: product?.profile || { acidity: 3, body: 3, sweetness: 3 },
        sizes: [
          { label: '250 g', price },
          { label: '1 kg', price: Math.round(price * ratio) },
        ],
      })
    } else {
      delete next.sizes
      next.details = product?.details || ['Free 30-day returns']
    }
    saveProduct(next)
    notify(isNew ? 'Product added' : 'Product saved')
    onClose()
  }

  const Err = ({ k }) => (errors[k] ? <p className="err">{errors[k]}</p> : null)

  return (
    <div className="modal-wrap" role="dialog" aria-modal="true" aria-label={isNew ? 'Add product' : `Edit ${product.name}`}>
      <div className="scrim" onClick={onClose} />
      <form className="modal modal-wide" onSubmit={submit} noValidate>
        <div className="modal-head">
          <h2>{isNew ? 'Add product' : 'Edit product'}</h2>
          <button type="button" className="link-btn" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="form-grid">
          <div className={`field ${errors.name ? 'bad' : ''}`}>
            <label htmlFor="p-name">Name</label>
            <input id="p-name" value={f.name} onChange={(e) => set('name', e.target.value)} />
            <Err k="name" />
          </div>
          <div className="field">
            <label htmlFor="p-cat">Category</label>
            <select id="p-cat" value={f.category} onChange={(e) => set('category', e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className={`field ${errors.price ? 'bad' : ''}`}>
            <label htmlFor="p-price">{isBean ? 'Price, 250 g bag (USD)' : 'Price (USD)'}</label>
            <input id="p-price" type="number" step="0.01" min="0" value={f.price} onChange={(e) => set('price', e.target.value)} />
            <Err k="price" />
          </div>
          <div className={`field ${errors.stock ? 'bad' : ''}`}>
            <label htmlFor="p-stock">Stock</label>
            <input id="p-stock" type="number" min="0" step="1" value={f.stock} onChange={(e) => set('stock', e.target.value)} />
            <Err k="stock" />
          </div>
          {isBean && (
            <>
              <div className="field">
                <label htmlFor="p-origin">Origin</label>
                <input id="p-origin" value={f.origin} onChange={(e) => set('origin', e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="p-roast">Roast</label>
                <select id="p-roast" value={f.roast} onChange={(e) => set('roast', e.target.value)}>
                  {['Light', 'Medium', 'Medium-dark', 'Dark'].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="field wide">
                <label htmlFor="p-notes">Tasting notes (comma separated)</label>
                <input id="p-notes" value={f.notes} onChange={(e) => set('notes', e.target.value)} />
              </div>
            </>
          )}
          <div className={`field wide ${errors.summary ? 'bad' : ''}`}>
            <label htmlFor="p-sum">Short summary</label>
            <input id="p-sum" value={f.summary} onChange={(e) => set('summary', e.target.value)} />
            <Err k="summary" />
          </div>
          <div className="field wide">
            <label htmlFor="p-desc">Description</label>
            <textarea id="p-desc" rows="4" value={f.description} onChange={(e) => set('description', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="p-art">Illustration</label>
            <select id="p-art" value={f.artType} onChange={(e) => set('artType', e.target.value)}>
              {ART_TYPES.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="p-color">Illustration colour</label>
            <input id="p-color" type="color" value={f.artColor} onChange={(e) => set('artColor', e.target.value)} />
          </div>
          <label className="check wide">
            <input type="checkbox" checked={f.featured} onChange={(e) => set('featured', e.target.checked)} />
            <span>Show on the home page</span>
          </label>
        </div>
        <div className="btn-row">
          <button className="btn btn-dark" type="submit">
            {isNew ? 'Add product' : 'Save changes'}
          </button>
          <button className="btn btn-outline" type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default function ProductsAdmin() {
  const { products, deleteProduct, notify } = useStore()
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState(undefined) // undefined = closed, null = new, object = edit
  const [confirmId, setConfirmId] = useState(null)
  const list = useMemo(() => products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())), [products, q])

  return (
    <>
      <div className="admin-bar">
        <h1 className="admin-h">Products</h1>
        <div className="admin-tools">
          <label className="sr" htmlFor="p-search">
            Search products
          </label>
          <input id="p-search" className="mini-input" placeholder="Search products" value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="btn btn-dark" onClick={() => setEditing(null)}>
            Add product
          </button>
        </div>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>
                <span className="sr">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="cell-prod">
                    <Media product={p} className="line-img" />
                    <span>{p.name}</span>
                  </div>
                </td>
                <td>{CATEGORIES.find((c) => c.id === p.category)?.label}</td>
                <td>{money(p.sizes ? p.sizes[0].price : p.price)}</td>
                <td className={p.stock === 0 ? 'out' : p.stock <= 20 ? 'low' : ''}>{p.stock === 0 ? 'Sold out' : p.stock}</td>
                <td className="actions">
                  {confirmId === p.id ? (
                    <>
                      <button
                        className="link-btn danger"
                        onClick={() => {
                          deleteProduct(p.id)
                          setConfirmId(null)
                          notify('Product deleted')
                        }}
                      >
                        Confirm delete
                      </button>
                      <button className="link-btn" onClick={() => setConfirmId(null)}>
                        Keep
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="link-btn" onClick={() => setEditing(p)}>
                        Edit
                      </button>
                      <button className="link-btn danger" onClick={() => setConfirmId(p.id)}>
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="muted pad">No products match your search.</p>}
      </div>
      {editing !== undefined && <Editor product={editing} onClose={() => setEditing(undefined)} />}
    </>
  )
}
