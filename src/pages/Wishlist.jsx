import { Link } from '../router'
import { useStore } from '../store'
import ProductCard from '../components/ProductCard'
import { usePageTitle } from '../utils'

export default function Wishlist() {
  usePageTitle('Wishlist')
  const { products, wishlist } = useStore()
  const list = wishlist.map((id) => products.find((p) => p.id === id)).filter(Boolean)
  return (
    <div className="wrap page">
      <div className="page-head">
        <h1>Wishlist</h1>
        <p className="muted">{list.length} saved</p>
      </div>
      {list.length === 0 ? (
        <div className="empty">
          <h2>Nothing saved yet</h2>
          <p className="muted">Tap the heart on any product to keep it here.</p>
          <Link to="/shop" className="btn btn-dark">
            Browse the shop
          </Link>
        </div>
      ) : (
        <div className="grid grid-4">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
