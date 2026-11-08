// Front-end lookup data. The product catalogue itself lives in the database (database/seed.sql).
// `art` on each product drives the built-in SVG illustrations (see src/art.jsx).

export const ORIGIN_COLORS = {
  Ethiopia: '#E4442F',
  Colombia: '#F2B01E',
  Kenya: '#7A2F68',
  Brazil: '#2F7D4F',
  Guatemala: '#1F8A94',
  Blend: '#25325F',
  Decaf: '#E88FA3',
}

export const CATEGORIES = [
  { id: 'beans', label: 'Coffee beans' },
  { id: 'gear', label: 'Brewing gear' },
  { id: 'cups', label: 'Cups & mugs' },
  { id: 'gifts', label: 'Gifts & sets' },
]

export const GRINDS = ['Whole bean', 'Espresso', 'Filter', 'French press']

export const REVIEW_POOL = [
  { name: 'Marta K.', title: 'Best coffee we have had in months', body: 'Fresh, aromatic and exactly as described. The roast date was only three days old.' },
  { name: 'Daniel R.', title: 'Worth the switch', body: 'Moved from supermarket beans a month ago and I am not going back. Clean cup, no bitterness.' },
  { name: 'Priya S.', title: 'Packaging is lovely', body: 'Arrived quickly, sealed well, and the tasting notes on the label are spot on.' },
  { name: 'Tomás V.', title: 'Great as a gift', body: 'Bought for my brother. He asked where I found it before he finished the first bag.' },
  { name: 'Hannah L.', title: 'Dialled in on the first try', body: 'The brew guide on the card gave me a perfect cup straight away.' },
]
