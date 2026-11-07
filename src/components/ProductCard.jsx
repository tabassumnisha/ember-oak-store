import { Link } from '../router'
import { useStore } from '../store'
import { money } from '../config'
import { Icon, Stars } from './Icons'
import Media from './Media'
import { isNew, lowestPrice } from '../utils'

export default function ProductCard({ product: p }) {
  const { wishlist, toggleWish, addToCart } = useStore()
  const saved = wishlist.includes(p.id)
  const soldOut = p.stock <= 0
  const onSale = p.compareAt && p.compareAt > p.price
  const badge = soldOut ? 'Sold out' : onSale ? 'Sale' : isNew(p.created) ? 'New' : null

  const quickAdd = () =>
    addToCart(p, {
      size: p.sizes?.[0]?.label,
      grind: p.sizes ? 'Whole bean' : undefined,
      color: p.colors?.[0]?.value,
    })

  return (
    <article className="card">
      <div className="card-media">
        <Link to={`/product/${p.id}`} aria-label={p.name} tabIndex={-1}>
          <Media product={p} color={p.colors?.[0]?.value} className="card-img" />
        </Link>
        {badge && <span className={`badge ${soldOut ? 'badge-out' : ''}`}>{badge}</span>}
        <button
          className={`wish ${saved ? 'on' : ''}`}
          onClick={() => toggleWish(p.id)}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${p.name} from wishlist` : `Save ${p.name} to wishlist`}
        >
          <Icon name="heart" size={18} />
        </button>
        <button className="quick" onClick={quickAdd} disabled={soldOut}>
          {soldOut ? 'Sold out' : 'Add to bag'}
        </button>
      </div>
      <div className="card-body">
        <h3 className="card-title">
          <Link to={`/product/${p.id}`}>{p.name}</Link>
        </h3>
        <p className="card-sub">{p.origin ? `${p.origin}, ${p.roast.toLowerCase()} roast` : p.summary}</p>
        <div className="card-row">
          <span className="price">
            {p.sizes ? 'From ' : ''}
            {money(lowestPrice(p))}
            {onSale && <s className="was">{money(p.compareAt)}</s>}
          </span>
          <span className="rate">
            <Stars value={p.rating} size={12} />
            <span className="rate-n">{p.reviews}</span>
          </span>
        </div>
      </div>
    </article>
  )
}
