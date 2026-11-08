import { useEffect, useState } from 'react'
import { Link } from '../router'
import { api } from '../api'
import { money } from '../config'
import { Icon } from '../components/Icons'
import { fmtDate, usePageTitle } from '../utils'
import NotFound from './NotFound'
import lightBg from '../assets/images/bg-light.webp'

export default function Order({ id, token }) {
  usePageTitle('Order confirmed')
  const [o, setO] = useState(null)
  const [state, setState] = useState('loading')

  useEffect(() => {
    setState('loading')
    api('GET', `/orders/${encodeURIComponent(id)}${token ? `?token=${encodeURIComponent(token)}` : ''}`)
      .then((d) => { setO(d.order); setState('ready') })
      .catch((e) => setState(e.status === 401 ? 'signin' : 'missing'))
  }, [id, token])

  if (state === 'loading') return <div className="wrap page empty" role="status"><p className="muted">Loading your order…</p></div>
  if (state === 'signin')
    return (
      <div className="wrap page empty">
        <h1>Sign in to see this order</h1>
        <p className="muted">Orders can be opened from the link in your confirmation or from your account.</p>
        <Link to="/account/login" className="btn btn-dark">Sign in</Link>
      </div>
    )
  if (state === 'missing' || !o) return <NotFound />
  return (
    <div className="photo-light" style={{ backgroundImage: `url(${lightBg})` }}>
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
          Placed {fmtDate(o.createdAt)}. Payment: {o.payment}. Status: {o.status}.
        </p>
      </div>
      <Link to="/shop" className="btn btn-dark">
        Continue shopping
      </Link>
    </div>
    </div>
  )
}
