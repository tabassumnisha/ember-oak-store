import { useState } from 'react'
import { Link, navigate } from '../router'
import { useStore } from '../store'
import { STORE, money } from '../config'
import Media from '../components/Media'
import { usePageTitle } from '../utils'

const EMPTY = { email: '', name: '', phone: '', address: '', city: '', region: '', zip: '', card: '', exp: '', cvc: '' }

// Demo-grade checks only. Replace the card section with Stripe, PayPal or your gateway before going live.
function validate(f, payment) {
  const e = {}
  if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Enter a valid email address.'
  if (f.name.trim().length < 2) e.name = 'Enter the recipient name.'
  if (f.phone.replace(/\D/g, '').length < 7) e.phone = 'Enter a phone number for the courier.'
  if (f.address.trim().length < 4) e.address = 'Enter the street address.'
  if (f.city.trim().length < 2) e.city = 'Enter the city.'
  if (f.region.trim().length < 2) e.region = 'Enter the state or region.'
  if (f.zip.trim().length < 3) e.zip = 'Enter the postal code.'
  if (payment === 'Card') {
    if (f.card.replace(/\s/g, '').length < 12) e.card = 'Enter the card number.'
    if (!/^\d{2}\s?\/\s?\d{2}$/.test(f.exp)) e.exp = 'Use MM / YY.'
    if (!/^\d{3,4}$/.test(f.cvc)) e.cvc = 'Use 3 or 4 digits.'
  }
  return e
}

function Field({ id, label, error, form, set, ...rest }) {
  return (
    <div className={`field ${error ? 'bad' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <input id={id} value={form[id]} onChange={(e) => set(id, e.target.value)} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} {...rest} />
      {error && (
        <p id={`${id}-err`} className="err">
          {error}
        </p>
      )}
    </div>
  )
}

export default function Checkout() {
  usePageTitle('Checkout')
  const { cartLines, quote, placeOrder, user } = useStore()
  const [busy, setBusy] = useState(false)
  const [serverError, setServerError] = useState('')
  const [form, setForm] = useState(() => ({ ...EMPTY, email: user?.email || '', name: user?.name || '' }))
  const [errors, setErrors] = useState({})
  const [shippingId, setShippingId] = useState('standard')
  const [payment, setPayment] = useState('Card')
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const q = quote(shippingId)

  if (cartLines.length === 0) {
    return (
      <div className="wrap page empty">
        <h1>Your bag is empty</h1>
        <p className="muted">Add something to your bag to check out.</p>
        <Link to="/shop" className="btn btn-dark">
          Shop coffee
        </Link>
      </div>
    )
  }

  const submit = (e) => {
    e.preventDefault()
    const errs = validate(form, payment)
    setErrors(errs)
    const first = Object.keys(errs)[0]
    if (first) {
      document.getElementById(first)?.focus()
      return
    }
    // Card details are validated here and then discarded. They are never stored or sent anywhere.
    setBusy(true)
    setServerError('')
    placeOrder({
      customer: { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), city: `${form.city.trim()}, ${form.region.trim()}`, address: form.address.trim(), zip: form.zip.trim() },
      payment: payment === 'Card' ? 'Card' : 'Cash on delivery',
      shippingId,
    })
      .then((order) => navigate(`/order/${order.id}?token=${order.accessToken}`))
      .catch((err) => setServerError(err.message))
      .finally(() => setBusy(false))
  }

  const fp = { form, set }
  return (
    <div className="wrap page">
      <div className="page-head">
        <h1>Checkout</h1>
      </div>
      <form className="checkout" onSubmit={submit} noValidate>
        <div className="checkout-main">
          <section>
            <h2>Contact</h2>
            <Field id="email" label="Email" type="email" autoComplete="email" error={errors.email} {...fp} />
          </section>

          <section>
            <h2>Delivery</h2>
            <div className="two">
              <Field id="name" label="Full name" autoComplete="name" error={errors.name} {...fp} />
              <Field id="phone" label="Phone" type="tel" autoComplete="tel" error={errors.phone} {...fp} />
            </div>
            <Field id="address" label="Street address" autoComplete="street-address" error={errors.address} {...fp} />
            <div className="three">
              <Field id="city" label="City" autoComplete="address-level2" error={errors.city} {...fp} />
              <Field id="region" label="State or region" autoComplete="address-level1" error={errors.region} {...fp} />
              <Field id="zip" label="Postal code" autoComplete="postal-code" error={errors.zip} {...fp} />
            </div>
          </section>

          <section>
            <h2>Shipping method</h2>
            {STORE.shipping.map((s) => {
              const free = s.id === 'standard' && quote().subtotal >= STORE.freeShippingOver
              return (
                <label key={s.id} className={`choice ${shippingId === s.id ? 'on' : ''}`}>
                  <input type="radio" name="ship" checked={shippingId === s.id} onChange={() => setShippingId(s.id)} />
                  <span>{s.label}</span>
                  <strong>{free ? 'Free' : money(s.price)}</strong>
                </label>
              )
            })}
          </section>

          <section>
            <h2>Payment</h2>
            <label className={`choice ${payment === 'Card' ? 'on' : ''}`}>
              <input type="radio" name="pay" checked={payment === 'Card'} onChange={() => setPayment('Card')} />
              <span>Credit or debit card</span>
            </label>
            {payment === 'Card' && (
              <div className="card-fields">
                <p className="notice">Demo checkout. No card is charged and card details are never stored.</p>
                <Field id="card" label="Card number" inputMode="numeric" autoComplete="off" placeholder="0000 0000 0000 0000" error={errors.card} {...fp} />
                <div className="two">
                  <Field id="exp" label="Expiry" autoComplete="off" placeholder="MM / YY" error={errors.exp} {...fp} />
                  <Field id="cvc" label="Security code" inputMode="numeric" autoComplete="off" placeholder="123" error={errors.cvc} {...fp} />
                </div>
              </div>
            )}
            <label className={`choice ${payment === 'COD' ? 'on' : ''}`}>
              <input type="radio" name="pay" checked={payment === 'COD'} onChange={() => setPayment('COD')} />
              <span>Cash on delivery</span>
            </label>
          </section>
        </div>

        <aside className="summary" aria-label="Order summary">
          <h2>Order summary</h2>
          <ul className="sum-lines">
            {cartLines.map((l) => (
              <li key={l.key}>
                <div className="sum-img">
                  <Media product={l.product} color={l.color} className="line-img" />
                  <span className="qty-dot">{l.qty}</span>
                </div>
                <div>
                  <strong>{l.product.name}</strong>
                  <small>{[l.size, l.grind].filter(Boolean).join(', ')}</small>
                </div>
                <span>{money(l.total)}</span>
              </li>
            ))}
          </ul>
          <dl className="totals">
            <div><dt>Subtotal</dt><dd>{money(q.subtotal)}</dd></div>
            <div><dt>Shipping</dt><dd>{q.shipping === 0 ? 'Free' : money(q.shipping)}</dd></div>
            <div><dt>Tax</dt><dd>{money(q.tax)}</dd></div>
            <div className="grand"><dt>Total</dt><dd>{money(q.total)}</dd></div>
          </dl>
          {serverError && <p className="err" role="alert">{serverError}</p>}
          <button className="btn btn-brass btn-lg btn-block" type="submit" disabled={busy}>
            {busy ? 'Placing order…' : 'Place order'}
          </button>
        </aside>
      </form>
    </div>
  )
}
