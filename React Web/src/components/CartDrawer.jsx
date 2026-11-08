import { useEffect, useRef } from 'react'
import { Link } from '../router'
import { useStore } from '../store'
import { STORE, money } from '../config'
import { Icon } from './Icons'
import Media from './Media'
import QtyStepper from './QtyStepper'

export default function CartDrawer() {
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
