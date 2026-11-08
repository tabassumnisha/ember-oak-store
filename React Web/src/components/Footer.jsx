import { useState } from 'react'
import { Link } from '../router'
import { useStore } from '../store'
import { STORE } from '../config'
import { Icon } from './Icons'
import logo from '../assets/images/logo.webp'
import cupBg from '../assets/images/bg-cup.webp'

export default function Footer({ cta = true }) {
  const { notify } = useStore()
  return (
    <>
      {cta && (
        <section className="cta" style={{ backgroundImage: `url(${cupBg})` }}>
          <div className="wrap cta-in">
            <h2>New roasts, first.</h2>
            <p className="lede">One email when a new lot is roasted. No spam, and you can leave at any time.</p>
            <form
              className="cta-form"
              onSubmit={(e) => {
                e.preventDefault()
                e.currentTarget.reset()
                notify('Thanks. You are on the list.')
              }}
            >
              <label className="sr" htmlFor="news-email">
                Email address
              </label>
              <input id="news-email" type="email" required placeholder="Email address" autoComplete="email" />
              <button className="btn btn-brass" type="submit">
                Subscribe
              </button>
            </form>
          </div>
        </section>
      )}
      <footer className="footer">
        <div className="wrap footer-grid">
          <div>
            <img className="footer-logo" src={logo} alt={STORE.name} width="260" height="81" loading="lazy" />
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
          <div className="footer-contact">
            <h4>Visit and write</h4>
            <p>{STORE.address}</p>
            <p>{STORE.email}</p>
            <p>{STORE.phone}</p>
          </div>
        </div>
        <div className="wrap footer-base">
          <span>Demo store. Products, prices, orders and reviews are sample content.</span>
          <span>© 2026 {STORE.name}</span>
        </div>
      </footer>
    </>
  )
}
