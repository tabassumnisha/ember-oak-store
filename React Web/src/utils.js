import { useEffect } from 'react'
import { STORE } from './config'

export const cx = (...a) => a.filter(Boolean).join(' ')

export const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export const fmtDay = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

export const isNew = (iso, days = 45) => Date.now() - new Date(iso).getTime() < days * 86400000

export const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${STORE.name}` : `${STORE.name} | ${STORE.tagline}`
  }, [title])
}

export const lowestPrice = (p) => (p.sizes ? Math.min(...p.sizes.map((s) => s.price)) : p.price)

// Deterministic pick so a product always shows the same sample reviews.
export function hash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}

export const TASTES = [
  { id: 'bright', label: 'Bright and fruity', blurb: 'Juicy acidity, floral and citrus notes. Best brewed as filter coffee.', test: (p) => p.profile.acidity >= 4 },
  { id: 'sweet', label: 'Sweet and smooth', blurb: 'Caramel, honey and stone fruit with low bitterness. Easy in any brewer.', test: (p) => p.profile.sweetness >= 4 && p.profile.acidity <= 3 && p.profile.body <= 4 },
  { id: 'bold', label: 'Dark and bold', blurb: 'Full body, cocoa and toasted nuts. Made for espresso and milk.', test: (p) => p.profile.body >= 4 },
]
