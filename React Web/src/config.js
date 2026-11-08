// Change these values to rebrand the whole store.
export const STORE = {
  name: 'Ember & Oak',
  tagline: 'Coffee, roasted this week.',
  email: 'hello@emberoak.demo',
  phone: '+1 (555) 014-2290',
  address: '14 Foundry Lane, Portland, OR',
  currency: 'USD',
  locale: 'en-US',
  // Tax and shipping are decided by the server and filled in from /api/config at start-up (see store.jsx).
  // These zero values only show for a moment before that response arrives.
  taxRate: 0,
  freeShippingOver: 0,
  shipping: [
    { id: 'standard', label: 'Standard', price: 0 },
    { id: 'express', label: 'Express', price: 0 },
  ],
}

const fmt = new Intl.NumberFormat(STORE.locale, {
  style: 'currency',
  currency: STORE.currency,
})
export const money = (n) => fmt.format(n)
