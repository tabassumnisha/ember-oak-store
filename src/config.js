// Change these values to rebrand the whole store.
export const STORE = {
  name: 'Ember & Oak',
  tagline: 'Coffee, roasted this week.',
  email: 'hello@emberoak.demo',
  phone: '+1 (555) 014-2290',
  address: '14 Foundry Lane, Portland, OR',
  currency: 'USD',
  locale: 'en-US',
  taxRate: 0.07, // 7% tax on the order subtotal
  freeShippingOver: 45, // free standard shipping above this subtotal
  shipping: [
    { id: 'standard', label: 'Standard (3–5 days)', price: 5.9 },
    { id: 'express', label: 'Express (1–2 days)', price: 14 },
  ],
  // Demo admin login. Replace with real authentication before going live.
  admin: { email: 'admin@emberoak.demo', password: 'admin123' },
}

const fmt = new Intl.NumberFormat(STORE.locale, {
  style: 'currency',
  currency: STORE.currency,
})
export const money = (n) => fmt.format(n)
