import { Link } from '../router'
import { useStore } from '../store'
import { money } from '../config'
import { Icon } from '../components/Icons'
import { fmtDate, usePageTitle } from '../utils'
import NotFound from './NotFound'

export default function Order({ id }) {
  usePageTitle('Order confirmed')
  const { orders } = useStore()
  const o = orders.find((x) => x.id === id)
  if (!o) return <NotFound />
  return (
    <div className="wrap page confirm">
      <div className="confirm-badge">
        <Icon name="check" size={28} stroke={2} />
      </div>
      <h1>Thank you, {o.customer.name.split(' ')[0]}</h1>
      <p className="lede">
        Order <strong>{o.id}</strong> is confirmed. We will email {o.customer.email} when your coffee has been roasted and shipped.
      </p>
      <div className="confirm-card">
        <ul className="sum-lines">
          {o.items.map((i, n) => (
            <li key={n}>
              <div>
                <strong>
                  {i.qty} × {i.name}
                </strong>
                <small>{[i.size, i.grind].filter(Boolean).join(', ')}</small>
              </div>
              <span>{money(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="totals">
          <div><dt>Subtotal</dt><dd>{money(o.subtotal)}</dd></div>
          <div><dt>Shipping</dt><dd>{o.shipping === 0 ? 'Free' : money(o.shipping)}</dd></div>
          <div><dt>Tax</dt><dd>{money(o.tax)}</dd></div>
          <div className="grand"><dt>Total</dt><dd>{money(o.total)}</dd></div>
        </dl>
        <p className="muted small">
          Placed {fmtDate(o.createdAt)}. Payment: {o.payment}.
        </p>
      </div>
      <Link to="/shop" className="btn btn-dark">
        Continue shopping
      </Link>
    </div>
  )
}
