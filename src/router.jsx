import { useEffect, useState } from 'react'

// Tiny hash router: #/shop?cat=beans  ->  { path: '/shop', query: { cat: 'beans' } }
function parse() {
  const raw = window.location.hash.replace(/^#/, '') || '/'
  const [path, qs = ''] = raw.split('?')
  const query = Object.fromEntries(new URLSearchParams(qs))
  return { path: path || '/', query }
}

export function useRoute() {
  const [route, setRoute] = useState(parse)
  useEffect(() => {
    const onChange = () => {
      setRoute(parse())
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

export function navigate(to) {
  window.location.hash = to
}

export function buildQuery(obj) {
  const qs = new URLSearchParams(
    Object.entries(obj).filter(([, v]) => v !== '' && v != null && v !== 'all')
  ).toString()
  return qs ? `?${qs}` : ''
}

export function Link({ to, children, ...rest }) {
  return (
    <a href={`#${to}`} {...rest}>
      {children}
    </a>
  )
}
