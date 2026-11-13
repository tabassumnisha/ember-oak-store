import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { STORE } from './config'
import { api } from './api'

const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)

// Only the bag and wishlist live in the browser. Products, orders and accounts come from the server.
const KEY = 'emberoak.v2'
const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(`${KEY}.${key}`)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}
const save = (key, value) => {
  try { localStorage.setItem(`${KEY}.${key}`, JSON.stringify(value)) } catch { /* storage blocked: keep working in memory */ }
}

export const lineKey = (id, size, grind, color) => [id, size || '', grind || '', color || ''].join('|')

export function unitPrice(product, size) {
  if (product.sizes && size) {
    const s = product.sizes.find((x) => x.label === size)
    if (s) return s.price
  }
  return product.price
}

export function StoreProvider({ children }) {
  const [products, setProducts] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [demoAccounts, setDemoAccounts] = useState([])
  const [demoMode, setDemoMode] = useState(false)
  const [, bump] = useState(0)
  const [cart, setCart] = useState(() => load('cart', []))
  const [wishlist, setWishlist] = useState(() => load('wishlist', []))
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  useEffect(() => save('cart', cart), [cart])
  useEffect(() => save('wishlist', wishlist), [wishlist])

  const notify = useCallback((message) => {
    setToast({ message, id: Date.now() })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2600)
  }, [])

  const loadProducts = useCallback(async () => {
    try {
      const d = await api('GET', '/products')
      setProducts(d.products)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [])

  const loadOrders = useCallback(async () => {
    try {
      setOrders((await api('GET', '/orders')).orders)
    } catch {
      setOrders([])
    }
  }, [])

  // First load: store rules, current session, catalogue.
  useEffect(() => {
    api('GET', '/config')
      .then((c) => {
        Object.assign(STORE, { taxRate: c.taxRate, freeShippingOver: c.freeShippingOver, shipping: c.shipping })
        setDemoAccounts(c.demoAccounts)
        setDemoMode(c.demoMode)
        bump((n) => n + 1)
      })
      .catch(() => {})
    api('GET', '/auth/me').then((d) => setUser(d.user)).catch(() => {})
    loadProducts()
  }, [loadProducts])

  useEffect(() => {
    if (user) loadOrders()
    else setOrders([])
  }, [user, loadOrders])

  const findProduct = useCallback((id) => products.find((p) => p.id === id), [products])

  const addToCart = useCallback((product, { size, grind, color, qty = 1 } = {}) => {
    const key = lineKey(product.id, size, grind, color)
    setCart((c) => {
      const found = c.find((l) => l.key === key)
      if (found) return c.map((l) => (l.key === key ? { ...l, qty: Math.min(l.qty + qty, 20) } : l))
      return [...c, { key, id: product.id, size, grind, color, qty }]
    })
    setDrawerOpen(true)
  }, [])

  const setQty = useCallback((key, qty) => {
    setCart((c) => (qty <= 0 ? c.filter((l) => l.key !== key) : c.map((l) => (l.key === key ? { ...l, qty: Math.min(qty, 20) } : l))))
  }, [])

  const toggleWish = useCallback(
    (id) => {
      const has = wishlist.includes(id)
      setWishlist((w) => (has ? w.filter((x) => x !== id) : [...w, id]))
      notify(has ? 'Removed from wishlist' : 'Saved to wishlist')
    },
    [wishlist, notify]
  )

  const cartLines = useMemo(
    () =>
      cart
        .map((l) => {
          const product = products.find((p) => p.id === l.id)
          if (!product) return null
          const price = unitPrice(product, l.size)
          return { ...l, product, price, total: price * l.qty }
        })
        .filter(Boolean),
    [cart, products]
  )

  const totals = useMemo(() => ({
    count: cartLines.reduce((s, l) => s + l.qty, 0),
    subtotal: cartLines.reduce((s, l) => s + l.total, 0),
  }), [cartLines])

  // Preview only. The server prices the real order from its own database.
  const quote = useCallback(
    (shippingId = 'standard') => {
      const { subtotal } = totals
      const method = STORE.shipping.find((s) => s.id === shippingId) || STORE.shipping[0]
      const shipping = subtotal === 0 ? 0 : method.id === 'standard' && subtotal >= STORE.freeShippingOver ? 0 : method.price
      const tax = Math.round(subtotal * STORE.taxRate * 100) / 100
      return { subtotal, shipping, tax, total: Math.round((subtotal + shipping + tax) * 100) / 100 }
    },
    [totals]
  )

  const placeOrder = useCallback(
    async ({ customer, payment, shippingId }) => {
      const d = await api('POST', '/orders', {
        customer, payment, shippingId,
        items: cartLines.map((l) => ({ productId: l.id, size: l.size, grind: l.grind, color: l.color, qty: l.qty })),
      })
      setCart([])
      loadProducts() // stock changed
      if (user) loadOrders()
      return d.order
    },
    [cartLines, user, loadProducts, loadOrders]
  )

  const login = useCallback(async (email, password) => {
    let d
    try {
      d = await api('POST', '/auth/login', { email, password })
    } catch (e) {
      if (e.status < 500) throw e // wrong password and similar: show it
      await new Promise((r) => setTimeout(r, 700)) // a server instance may have just started; try once more
      d = await api('POST', '/auth/login', { email, password })
    }
    setUser(d.user)
    return d.user
  }, [])
  const register = useCallback(async (name, email, password) => {
    const d = await api('POST', '/auth/register', { name, email, password })
    setUser(d.user)
    return d.user
  }, [])
  const logout = useCallback(async () => {
    try { await api('POST', '/auth/logout', {}) } catch { /* cookie expires anyway */ }
    setUser(null)
  }, [])

  const setOrderStatus = useCallback(async (id, st) => {
    try {
      const d = await api('PATCH', `/orders/${id}`, { status: st })
      setOrders((o) => o.map((x) => (x.id === id ? d.order : x)))
      loadProducts()
    } catch (e) { notify(e.message) }
  }, [loadProducts, notify])

  const saveProduct = useCallback(async (product, isNew) => {
    const d = isNew ? await api('POST', '/products', product) : await api('PUT', `/products/${product.id}`, product)
    setProducts((ps) => (ps.some((p) => p.id === d.product.id) ? ps.map((p) => (p.id === d.product.id ? d.product : p)) : [d.product, ...ps]))
    return d.product
  }, [])

  const deleteProduct = useCallback(async (id) => {
    try {
      await api('DELETE', `/products/${id}`, {})
      setProducts((ps) => ps.filter((p) => p.id !== id))
      setCart((c) => c.filter((l) => l.id !== id))
      setWishlist((w) => w.filter((x) => x !== id))
    } catch (e) { notify(e.message) }
  }, [notify])

  const resetDemo = useCallback(async () => {
    try {
      await api('POST', '/admin/reset-demo', {})
      await Promise.all([loadProducts(), loadOrders()])
      notify('Demo data restored')
    } catch (e) { notify(e.message) }
  }, [loadProducts, loadOrders, notify])

  const value = {
    products, status, reload: loadProducts, user, admin: user?.role === 'admin', orders, demoAccounts, demoMode,
    cart, cartLines, totals, wishlist, drawerOpen, toast,
    findProduct, addToCart, setQty, toggleWish, quote, placeOrder,
    setOrderStatus, saveProduct, deleteProduct, resetDemo, notify, setDrawerOpen, login, register, logout,
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
