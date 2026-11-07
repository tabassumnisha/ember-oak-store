import { useMemo, useState } from 'react'
import { Link } from '../router'
import { useStore } from '../store'
import { STORE, money } from '../config'
import { Icon, Stars } from '../components/Icons'
import Media from '../components/Media'
import ProductCard from '../components/ProductCard'
import { REVIEW_POOL } from '../data/products'
import { TASTES, usePageTitle } from '../utils'

function roastedOn() {
  const d = new Date(Date.now() - 2 * 86400000)
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
}

export default function Home() {
  usePageTitle('')
  const { products } = useStore()
  const [taste, setTaste] = useState('bright')

  const hero = products.find((p) => p.id === 'yirgacheffe-sunrise') || products[0]
  const roasts = products.filter((p) => p.category === 'beans' && p.featured).slice(0, 4)
  const gear = products.filter((p) => p.category === 'gear' && p.stock > 0).slice(0, 3)
  const gift = products.find((p) => p.id === 'tasting-flight-box')
  const kit = products.find((p) => p.id === 'pour-over-starter-kit')
  const current = TASTES.find((t) => t.id === taste)
  const matches = useMemo(() => products.filter((p) => p.category === 'beans' && p.stock > 0 && current.test(p)).slice(0, 3), [products, current])

  return (
    <>
      <section className="hero">
        <div className="wrap hero-in">
          <div className="hero-copy">
            <h1>
              <span className="rise r1">Coffee,</span> <span className="rise r2">roasted</span> <span className="rise r3">this week.</span>
            </h1>
            <p className="hero-sub rise r4">
              Single-origin lots from six farms, roasted to order in small batches and on its way to your door within 48 hours.
            </p>
            <div className="hero-cta rise r5">
              <Link to="/shop?cat=beans" className="btn btn-brass btn-lg">
                Shop coffee
              </Link>
              {gift && (
                <Link to={`/product/${gift.id}`} className="btn btn-outline-light btn-lg">
                  Give a tasting box
                </Link>
              )}
            </div>
          </div>
          <Link to={`/product/${hero.id}`} className="hero-arch rise r3" aria-label={`${hero.name}, this week's featured roast`}>
            <Media product={hero} className="hero-art" />
            <span className="hero-tag">
              <strong>{hero.name}</strong>
              Roasted {roastedOn()}
            </span>
          </Link>
        </div>
      </section>

      <section className="trust">
        <div className="wrap trust-in">
          <p><Icon name="flame" /> Roasted to order, never stocked</p>
          <p><Icon name="truck" /> Free shipping over {money(STORE.freeShippingOver)}</p>
          <p><Icon name="leaf" /> Compostable packaging</p>
          <p><Icon name="shield" /> Fresh or replaced within 30 days</p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <h2>This week's roasts</h2>
            <Link to="/shop?cat=beans" className="text-link">
              View all coffee <Icon name="arrow" size={16} />
            </Link>
          </div>
          <div className="grid grid-4">
            {roasts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section-tint">
        <div className="wrap finder">
          <div className="finder-copy">
            <h2>Not sure where to start?</h2>
            <p className="lede">Tell us how you like your cup. We will point you to three coffees that fit.</p>
            <div className="pills" role="tablist" aria-label="Taste">
              {TASTES.map((t) => (
                <button key={t.id} role="tab" aria-selected={taste === t.id} className={`pill ${taste === t.id ? 'on' : ''}`} onClick={() => setTaste(t.id)}>
                  {t.label}
                </button>
              ))}
            </div>
            <p className="finder-blurb">{current.blurb}</p>
            <Link to={`/shop?cat=beans&taste=${taste}`} className="text-link">
              See all {current.label.toLowerCase()} coffees <Icon name="arrow" size={16} />
            </Link>
          </div>
          <div className="finder-list">
            {matches.map((p) => (
              <Link key={p.id} to={`/product/${p.id}`} className="finder-item">
                <Media product={p} className="finder-img" />
                <span>
                  <strong>{p.name}</strong>
                  <small>{p.notes.join(', ')}</small>
                </span>
                <span className="price">{money(p.sizes[0].price)}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <h2>Brew it properly</h2>
            <Link to="/shop?cat=gear" className="text-link">
              All brewing gear <Icon name="arrow" size={16} />
            </Link>
          </div>
          <div className="grid grid-3">
            {gear.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {kit && (
        <section className="feature">
          <div className="wrap feature-in">
            <div className="feature-art">
              <Media product={kit} className="feature-img" view="light" />
            </div>
            <div className="feature-copy">
              <h2>Everything for a first great cup</h2>
              <p className="lede">{kit.description}</p>
              <p className="feature-price">
                {money(kit.price)} <s className="was">{money(kit.compareAt)}</s>
              </p>
              <Link to={`/product/${kit.id}`} className="btn btn-brass btn-lg">
                See the starter kit
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <h2>What customers say</h2>
          </div>
          <div className="grid grid-3">
            {REVIEW_POOL.slice(0, 3).map((r) => (
              <figure key={r.name} className="quote">
                <Stars value={5} />
                <blockquote>
                  <strong>{r.title}</strong>
                  <p>{r.body}</p>
                </blockquote>
                <figcaption>{r.name}, verified buyer</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
