import { useEffect, useRef, useState } from 'react'
import { Link, navigate, buildQuery } from '../router'
import { useStore } from '../store'
import { STORE, money } from '../config'
import { Icon } from './Icons'
import logo from '../assets/images/logo.webp'

const NAV = [
  { to: '/shop?cat=beans', label: 'Coffee' },
  { to: '/shop?cat=gear', label: 'Brewing gear' },
  { to: '/shop?cat=cups', label: 'Cups and mugs' },
  { to: '/shop?cat=gifts', label: 'Gifts' },
  { to: '/info/about', label: 'Our story' },
]

export default function Header() {
  const { totals, wishlist, setDrawerOpen, user } = useStore()
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
            <img src={logo} alt={STORE.name} width="200" height="62" />
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
            <Link to={user ? '/account' : '/account/login'} className="icon-btn" aria-label={user ? 'My account' : 'Sign in'}>
              <Icon name="user" />
            </Link>
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
