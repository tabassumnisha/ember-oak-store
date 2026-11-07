import { useState } from 'react'
import { useStore } from '../store'
import { STORE, money } from '../config'
import { usePageTitle } from '../utils'
import NotFound from './NotFound'

export default function Info({ slug }) {
  const { notify } = useStore()
  const [sent, setSent] = useState(false)
  const titles = { about: 'Our story', delivery: 'Delivery and returns', contact: 'Contact' }
  usePageTitle(titles[slug])
  if (!titles[slug]) return <NotFound />

  return (
    <div className="wrap page prose">
      <h1>{titles[slug]}</h1>

      {slug === 'about' && (
        <>
          <p className="lede">Ember &amp; Oak is a fictional roastery created for this demo store. Replace this page with your own story.</p>
          <p>
            We buy small lots from farms we can name, roast them in batches of 12 kilos and ship within 48 hours. Every bag carries its roast date, because freshness is the whole point.
          </p>
          <p>
            Edit the copy, products and prices in <code>src/config.js</code> and <code>src/data/products.js</code>, or connect the store to your own catalogue API.
          </p>
        </>
      )}

      {slug === 'delivery' && (
        <>
          <h2>Delivery</h2>
          <p>
            Orders ship within 48 hours of being placed. Standard delivery takes 3 to 5 days and costs {money(STORE.shipping[0].price)}, or is free on orders over {money(STORE.freeShippingOver)}. Express delivery takes 1 to 2 days and costs {money(STORE.shipping[1].price)}.
          </p>
          <h2>Returns</h2>
          <p>
            If your coffee is not fresh, tell us within 30 days and we will send a replacement. Unused gear and cups can be returned within 30 days for a refund of the item price.
          </p>
        </>
      )}

      {slug === 'contact' && (
        <>
          <p className="lede">
            {STORE.email}, {STORE.phone}. {STORE.address}.
          </p>
          {sent ? (
            <p className="notice">Message sent. We reply within one business day.</p>
          ) : (
            <form
              className="contact"
              onSubmit={(e) => {
                e.preventDefault()
                setSent(true)
                notify('Message sent')
              }}
            >
              <div className="field">
                <label htmlFor="c-name">Name</label>
                <input id="c-name" required autoComplete="name" />
              </div>
              <div className="field">
                <label htmlFor="c-email">Email</label>
                <input id="c-email" type="email" required autoComplete="email" />
              </div>
              <div className="field">
                <label htmlFor="c-msg">How can we help?</label>
                <textarea id="c-msg" rows="5" required />
              </div>
              <button className="btn btn-dark" type="submit">
                Send message
              </button>
            </form>
          )}
        </>
      )}
    </div>
  )
}
