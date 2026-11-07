import { useEffect, useRef, useState } from 'react'
import { Link, navigate, buildQuery } from '../router'
import { useStore } from '../store'
import { STORE, money } from '../config'
import { Icon } from './Icons'
import Media from './Media'

export function QtyStepper({ value, onChange, min = 0, max = 20, label = 'Quantity' }) {
  return (
    <div className="qty" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Decrease quantity">
        <Icon name="minus" size={16} />
      </button>
      <span aria-live="polite">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        <Icon name="plus" size={16} />
      </button>
    </div>
  )
}

const NAV = [
  { to: '/shop?cat=beans', label: 'Coffee' },
  { to: '/shop?cat=gear', label: 'Brewing gear' },
  { to: '/shop?cat=cups', label: 'Cups and mugs' },
  { to: '/shop?cat=gifts', label: 'Gifts' },
  { to: '/info/about', label: 'Our story' },
]

export function Header() {
  const { totals, wishlist, setDrawerOpen } = useStore()
  const [open, setOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const [q, setQ] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (searching) inputRef.current?.focus()
  }, [searching])

  const submit = (e) => {
    e.preventDefault()
    navigate(`/shop${buildQuery({ q: q.trim() })}`)
    setSearching(false)
    setOpen(false)
  }

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <div className="announce">
        <span>Roasted to order and shipped within 48 hours</span>
        <span className="announce-2">Free standard shipping over {money(STORE.freeShippingOver)}</span>
      </div>
      <header className="header">
        <div className="wrap header-in">
          <button className="icon-btn only-mobile" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Menu">
            <Icon name={open ? 'close' : 'menu'} />
          </button>
          <Link to="/" className="logo" aria-label={`${STORE.name} home`}>
            Ember <span className="amp">&amp;</span> Oak
          </Link>
          <nav className={`nav ${open ? 'open' : ''}`} aria-label="Main">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="header-tools">
            {searching ? (
              <form className="search" onSubmit={submit} role="search">
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search coffee and gear"
                  aria-label="Search the store"
                  onKeyDown={(e) => e.key === 'Escape' && setSearching(false)}
                />
                <button type="button" className="icon-btn" onClick={() => setSearching(false)} aria-label="Close search">
                  <Icon name="close" size={18} />
                </button>
              </form>
            ) : (
              <button className="icon-btn" onClick={() => setSearching(true)} aria-label="Search">
                <Icon name="search" />
              </button>
            )}
            <Link to="/wishlist" className="icon-btn" aria-label={`Wishlist, ${wishlist.length} saved`}>
              <Icon name="heart" />
              {wishlist.length > 0 && <span className="dot">{wishlist.length}</span>}
            </Link>
            <button className="icon-btn" onClick={() => setDrawerOpen(true)} aria-label={`Open bag, ${totals.count} items`}>
              <Icon name="bag" />
              {totals.count > 0 && <span className="dot">{totals.count}</span>}
            </button>
          </div>
        </div>
      </header>
    </>
  )
}

export function CartDrawer() {
  const { drawerOpen, setDrawerOpen, cartLines, totals, setQty, quote } = useStore()
  const closeRef = useRef(null)
  const q = quote()
  const remaining = Math.max(0, STORE.freeShippingOver - totals.subtotal)
  const pct = Math.min(100, (totals.subtotal / STORE.freeShippingOver) * 100)

  useEffect(() => {
    if (!drawerOpen) return
    closeRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && setDrawerOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [drawerOpen, setDrawerOpen])

  // Close the bag when the visitor navigates to another page.
  useEffect(() => {
    const onNav = () => setDrawerOpen(false)
    window.addEventListener('hashchange', onNav)
    return () => window.removeEventListener('hashchange', onNav)
  }, [setDrawerOpen])

  if (!drawerOpen) return null
  const close = () => setDrawerOpen(false)

  return (
    <div className="drawer-wrap">
      <div className="scrim" onClick={close} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Your bag">
        <div className="drawer-head">
          <h2>Your bag</h2>
          <button ref={closeRef} className="icon-btn" onClick={close} aria-label="Close bag">
            <Icon name="close" />
          </button>
        </div>

        {cartLines.length === 0 ? (
          <div className="drawer-empty">
            <p>Your bag is empty.</p>
            <Link to="/shop" className="btn btn-dark" onClick={close}>
              Shop coffee
            </Link>
          </div>
        ) : (
          <>
            <div className="ship-bar">
              <p>
                {remaining > 0 ? (
                  <>
                    Add <strong>{money(remaining)}</strong> for free shipping
                  </>
                ) : (
                  <strong>Your order ships free</strong>
                )}
              </p>
              <div className="bar">
                <span style={{ width: `${pct}%` }} />
              </div>
            </div>
            <ul className="lines">
              {cartLines.map((l) => (
                <li key={l.key} className="line">
                  <Media product={l.product} color={l.color} className="line-img" />
                  <div className="line-main">
                    <Link to={`/product/${l.id}`} onClick={close} className="line-name">
                      {l.product.name}
                    </Link>
                    <p className="line-opt">{[l.size, l.grind, l.color && l.product.colors?.find((c) => c.value === l.color)?.label].filter(Boolean).join(', ')}</p>
                    <div className="line-foot">
                      <QtyStepper value={l.qty} onChange={(n) => setQty(l.key, n)} label={`Quantity of ${l.product.name}`} />
                      <span className="price">{money(l.total)}</span>
                    </div>
                  </div>
                  <button className="link-btn" onClick={() => setQty(l.key, 0)} aria-label={`Remove ${l.product.name}`}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <div className="drawer-foot">
              <div className="sum-row">
                <span>Subtotal</span>
                <strong>{money(q.subtotal)}</strong>
              </div>
              <p className="muted small">Shipping and tax are calculated at checkout.</p>
              <Link to="/checkout" className="btn btn-brass btn-block" onClick={close}>
                Checkout
              </Link>
              <button className="link-btn center" onClick={close}>
                Continue shopping
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}

export function Toast() {
  const { toast } = useStore()
  if (!toast) return null
  return (
    <div className="toast" role="status" key={toast.id}>
      <Icon name="check" size={16} /> {toast.message}
    </div>
  )
}

export function Footer() {
  const { notify } = useStore()
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div>
          <p className="logo logo-light">
            Ember <span className="amp">&amp;</span> Oak
          </p>
          <p className="footer-about">Small-lot coffee, roasted to order in {STORE.address.split(', ').slice(-2).join(', ')}.</p>
        </div>
        <nav aria-label="Shop">
          <h4>Shop</h4>
          <Link to="/shop?cat=beans">Coffee</Link>
          <Link to="/shop?cat=gear">Brewing gear</Link>
          <Link to="/shop?cat=cups">Cups and mugs</Link>
          <Link to="/shop?cat=gifts">Gifts and sets</Link>
        </nav>
        <nav aria-label="Help">
          <h4>Help</h4>
          <Link to="/info/delivery">Delivery and returns</Link>
          <Link to="/info/contact">Contact</Link>
          <Link to="/info/about">Our story</Link>
          <Link to="/admin">Store admin</Link>
        </nav>
        <form
          className="news"
          onSubmit={(e) => {
            e.preventDefault()
            e.currentTarget.reset()
            notify('Thanks. You are on the list.')
          }}
        >
          <h4>New roasts, first</h4>
          <label className="sr" htmlFor="news-email">
            Email address
          </label>
          <div className="news-row">
            <input id="news-email" type="email" required placeholder="Email address" autoComplete="email" />
            <button className="btn btn-brass" type="submit">
              Subscribe
            </button>
          </div>
        </form>
      </div>
      <div className="wrap footer-base">
        <span>Demo store. Products, prices, orders and reviews are sample content.</span>
        <span>© 2026 {STORE.name}</span>
      </div>
    </footer>
  )
}
