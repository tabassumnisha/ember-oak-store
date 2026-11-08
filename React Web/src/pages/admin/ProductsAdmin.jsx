import { useMemo, useState } from 'react'
import { useStore } from '../../store'
import { CATEGORIES } from '../../data/products'
import { money } from '../../config'
import Media from '../../components/Media'
import Editor from './ProductEditor'

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
