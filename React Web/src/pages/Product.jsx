import { useEffect, useMemo, useState } from 'react'
import { Link } from '../router'
import { useStore, unitPrice } from '../store'
import { GRINDS, CATEGORIES, REVIEW_POOL } from '../data/products'
import { money, STORE } from '../config'
import { Icon, Stars } from '../components/Icons'
import Media from '../components/Media'
import ProductCard from '../components/ProductCard'
import QtyStepper from '../components/QtyStepper'
import { hash, usePageTitle } from '../utils'
import NotFound from './NotFound'

const VIEWS = [
  { id: 'main', label: 'Front' },
  { id: 'close', label: 'Close-up' },
  { id: 'light', label: 'On white' },
]

function Profile({ profile }) {
  const rows = [
    ['Acidity', profile.acidity],
    ['Body', profile.body],
    ['Sweetness', profile.sweetness],
  ]
  return (
    <dl className="profile">
      {rows.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>
            <span className="meter" role="img" aria-label={`${v} out of 5`}>
              {[1, 2, 3, 4, 5].map((i) => (
                <i key={i} className={i <= v ? 'on' : ''} />
              ))}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  )
}

export default function Product({ id }) {
  const { products, status, findProduct, addToCart, wishlist, toggleWish } = useStore()
  const p = findProduct(id)
  usePageTitle(p?.name)

  const [size, setSize] = useState(null)
  const [grind, setGrind] = useState('Whole bean')
  const [color, setColor] = useState(null)
  const [qty, setQty] = useState(1)
  const [view, setView] = useState('main')
  const [tab, setTab] = useState('about')

  useEffect(() => {
    if (!p) return
    setSize(p.sizes?.[0]?.label ?? null)
    setGrind('Whole bean')
    setColor(p.colors?.[0]?.value ?? null)
    setQty(1)
    setView('main')
    setTab('about')
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const related = useMemo(() => (p ? products.filter((x) => x.id !== p.id && x.category === p.category).slice(0, 4) : []), [products, p])

  if (!p) return status === 'ready' ? <NotFound /> : null

  const price = unitPrice(p, size)
  const saved = wishlist.includes(p.id)
  const soldOut = p.stock <= 0
  const cat = CATEGORIES.find((c) => c.id === p.category)
  const reviews = [0, 1, 2].map((i) => REVIEW_POOL[(hash(p.id) + i) % REVIEW_POOL.length])
  const colorLabel = p.colors?.find((c) => c.value === color)?.label

  return (
    <div className="wrap page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/shop">Shop</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/shop?cat=${p.category}`}>{cat?.label}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{p.name}</span>
      </nav>

      <div className="pdp">
        <div className="gallery">
          <div className="gallery-main">
            <Media product={p} color={color} view={view} className="gallery-img" />
          </div>
          {!p.image && (
            <div className="thumbs" role="group" aria-label="Product views">
              {VIEWS.map((v) => (
                <button key={v.id} className={`thumb ${view === v.id ? 'on' : ''}`} onClick={() => setView(v.id)} aria-label={v.label} aria-pressed={view === v.id}>
                  <Media product={p} color={color} view={v.id} className="thumb-img" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pdp-info">
          {p.origin && (
            <p className="origin">
              {p.origin === 'Blend' || p.origin === 'Decaf' ? p.origin : `${p.origin}, ${p.altitude}`}
              {p.process ? `, ${p.process.toLowerCase()}` : ''}
            </p>
          )}
          <h1>{p.name}</h1>
          <a href="#reviews" className="rate rate-lg" onClick={(e) => { e.preventDefault(); document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' }) }}>
            <Stars value={p.rating} />
            <span>
              {p.rating.toFixed(1)} ({p.reviews} reviews)
            </span>
          </a>
          <p className="pdp-price">
            {money(price)}
            {p.compareAt && <s className="was">{money(p.compareAt)}</s>}
          </p>
          <p className="lede">{p.summary}</p>

          {p.notes && (
            <ul className="notes" aria-label="Tasting notes">
              {p.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          )}

          {p.sizes && (
            <fieldset className="opt">
              <legend>Size</legend>
              <div className="opt-row">
                {p.sizes.map((s) => (
                  <label key={s.label} className={`opt-pill ${size === s.label ? 'on' : ''}`}>
                    <input type="radio" name="size" checked={size === s.label} onChange={() => setSize(s.label)} />
                    {s.label}
                    <small>{money(s.price)}</small>
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          {p.sizes && (
            <fieldset className="opt">
              <legend>Grind</legend>
              <div className="opt-row">
                {GRINDS.map((g) => (
                  <label key={g} className={`opt-pill ${grind === g ? 'on' : ''}`}>
                    <input type="radio" name="grind" checked={grind === g} onChange={() => setGrind(g)} />
                    {g}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          {p.colors && (
            <fieldset className="opt">
              <legend>
                Colour: <span className="muted">{colorLabel}</span>
              </legend>
              <div className="opt-row">
                {p.colors.map((c) => (
                  <label key={c.value} className={`swatch ${color === c.value ? 'on' : ''}`} title={c.label}>
                    <input type="radio" name="color" checked={color === c.value} onChange={() => setColor(c.value)} aria-label={c.label} />
                    <span style={{ background: c.value }} />
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <div className="buy">
            <QtyStepper value={qty} onChange={setQty} min={1} max={Math.max(1, Math.min(20, p.stock))} />
            <button className="btn btn-dark btn-lg grow" disabled={soldOut} onClick={() => addToCart(p, { size, grind: p.sizes ? grind : undefined, color: color || undefined, qty })}>
              {soldOut ? 'Sold out' : `Add to bag, ${money(price * qty)}`}
            </button>
            <button className={`icon-btn square ${saved ? 'on' : ''}`} onClick={() => toggleWish(p.id)} aria-pressed={saved} aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}>
              <Icon name="heart" />
            </button>
          </div>
          {!soldOut && p.stock <= 20 && <p className="stock-note">Only {p.stock} left in this batch.</p>}
          {soldOut && <p className="stock-note">This item is sold out. Save it to your wishlist and check back soon.</p>}

          <ul className="perks">
            <li>
              <Icon name="truck" size={18} /> Ships within 48 hours. Free over {money(STORE.freeShippingOver)}.
            </li>
            <li>
              <Icon name="shield" size={18} /> {p.sizes ? 'Fresh or replaced within 30 days.' : '30-day returns on unused items.'}
            </li>
          </ul>
        </div>
      </div>

      <div className="tabs">
        <div role="tablist" className="tab-list">
          {[
            ['about', 'About'],
            ['details', p.sizes ? 'Coffee details' : 'Details'],
            ['shipping', 'Shipping'],
          ].map(([k, l]) => (
            <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
              {l}
            </button>
          ))}
        </div>
        <div className="tab-body" role="tabpanel">
          {tab === 'about' && <p>{p.description}</p>}
          {tab === 'details' && (
            <div className="detail-cols">
              {p.sizes ? (
                <>
                  <dl className="specs">
                    <div><dt>Origin</dt><dd>{p.origin}</dd></div>
                    <div><dt>Process</dt><dd>{p.process}</dd></div>
                    <div><dt>Altitude</dt><dd>{p.altitude}</dd></div>
                    <div><dt>Roast</dt><dd>{p.roast}</dd></div>
                  </dl>
                  <Profile profile={p.profile} />
                </>
              ) : (
                <ul className="spec-list">
                  {p.details.map((d) => (
                    <li key={d}>
                      <Icon name="check" size={16} /> {d}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {tab === 'shipping' && (
            <p>
              Orders ship within 48 hours. Standard delivery takes 3 to 5 days and is free over {money(STORE.freeShippingOver)}. Express takes 1 to 2 days. Coffee is roasted after you order, so it arrives at its best.
            </p>
          )}
        </div>
      </div>

      <section id="reviews" className="reviews">
        <h2>Reviews</h2>
        <div className="grid grid-3">
          {reviews.map((r, i) => (
            <figure key={i} className="quote">
              <Stars value={5} />
              <blockquote>
                <strong>{r.title}</strong>
                <p>{r.body}</p>
              </blockquote>
              <figcaption>{r.name}, verified buyer</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {related.length > 0 && (
        <section className="related">
          <h2>You may also like</h2>
          <div className="grid grid-4">
            {related.map((r) => (
              <ProductCard key={r.id} product={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
