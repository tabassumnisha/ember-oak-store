import { Link } from '../router'
import { usePageTitle } from '../utils'

export default function NotFound() {
  usePageTitle('Page not found')
  return (
    <div className="wrap page empty">
      <h1>We could not find that page</h1>
      <p className="muted">The link may be old, or the product may have been removed.</p>
      <Link to="/shop" className="btn btn-dark">
        Browse the shop
      </Link>
    </div>
  )
}
