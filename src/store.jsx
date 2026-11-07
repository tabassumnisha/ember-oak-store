import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { STORE } from './config'
import { initialProducts } from './data/products'
import { buildSeedOrders } from './data/seedOrders'

const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)

// All data lives in localStorage so the demo works with no backend.
// To go live, replace the load/save helpers with calls to your API.
const KEY = 'emberoak.v1'

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(`${KEY}.${key}`)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}
function save(key, value) {
  try {
    localStorage.setItem(`${KEY}.${key}`, JSON.stringify(value))
  } catch {
    /* storage full or blocked: the app keeps working in memory */
  }
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
  const [products, setProducts] = useState(() => load('products', initialProducts))
  const [orders, setOrders] = useState(() => load('orders', null) ?? buildSeedOrders(initialProducts))
  const [cart, setCart] = useState(() => load('cart', []))
  const [wishlist, setWishlist] = useState(() => load('wishlist', []))
  const [admin, setAdmin] = useState(() => load('admin', false))
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  useEffect(() => save('products', products), [products])
  useEffect(() => save('orders', orders), [orders])
  useEffect(() => save('cart', cart), [cart])
  useEffect(() => save('wishlist', wishlist), [wishlist])
  useEffect(() => save('admin', admin), [admin])

  const notify = useCallback((message) => {
    setToast({ message, id: Date.now() })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2600)
  }, [])

  const findProduct = useCallback((id) => products.find((p) => p.id === id), [products])

  const addToCart = useCallback(
    (product, { size, grind, color, qty = 1 } = {}) => {
      const key = lineKey(product.id, size, grind, color)
      setCart((c) => {
        const found = c.find((l) => l.key === key)
        if (found) return c.map((l) => (l.key === key ? { ...l, qty: Math.min(l.qty + qty, 20) } : l))
        return [...c, { key, id: product.id, size, grind, color, qty }]
      })
      setDrawerOpen(true)
    },
    []
  )

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

  const totals = useMemo(() => {
    const count = cartLines.reduce((s, l) => s + l.qty, 0)
    const subtotal = cartLines.reduce((s, l) => s + l.total, 0)
    return { count, subtotal }
  }, [cartLines])

  const quote = useCallback(
    (shippingId = 'standard') => {
      const { subtotal } = totals
      const method = STORE.shipping.find((s) => s.id === shippingId) || STORE.shipping[0]
      const shipping = subtotal === 0 ? 0 : method.id === 'standard' && subtotal >= STORE.freeShippingOver ? 0 : method.price
      const tax = +(subtotal * STORE.taxRate).toFixed(2)
      return { subtotal, shipping, tax, total: +(subtotal + shipping + tax).toFixed(2) }
    },
    [totals]
  )

  const placeOrder = useCallback(
    ({ customer, payment, shippingId }) => {
      const q = quote(shippingId)
      const nextNum = orders.reduce((m, o) => Math.max(m, parseInt(o.id.split('-')[1], 10) || 0), 10000) + 1
      const order = {
        id: `EO-${nextNum}`,
        createdAt: new Date().toISOString(),
        customer,
        items: cartLines.map((l) => ({
          productId: l.id,
          name: l.product.name,
          size: l.size || null,
          grind: l.grind || null,
          color: l.color || null,
          qty: l.qty,
          price: l.price,
        })),
        ...q,
        payment,
        status: 'Processing',
      }
      setOrders((o) => [order, ...o])
      // Reduce stock for what was bought.
      setProducts((ps) =>
        ps.map((p) => {
          const bought = order.items.filter((i) => i.productId === p.id).reduce((s, i) => s + i.qty, 0)
          return bought ? { ...p, stock: Math.max(0, p.stock - bought) } : p
        })
      )
      setCart([])
      return order
    },
    [cartLines, orders, quote]
  )

  const setOrderStatus = useCallback((id, status) => {
    setOrders((o) => o.map((x) => (x.id === id ? { ...x, status } : x)))
  }, [])

  const saveProduct = useCallback((product) => {
    setProducts((ps) => (ps.some((p) => p.id === product.id) ? ps.map((p) => (p.id === product.id ? product : p)) : [product, ...ps]))
  }, [])

  const deleteProduct = useCallback((id) => {
    setProducts((ps) => ps.filter((p) => p.id !== id))
    setCart((c) => c.filter((l) => l.id !== id))
    setWishlist((w) => w.filter((x) => x !== id))
  }, [])

  const resetDemo = useCallback(() => {
    setProducts(initialProducts)
    setOrders(buildSeedOrders(initialProducts))
    setCart([])
    setWishlist([])
    notify('Demo data restored')
  }, [notify])

  const value = {
    products,
    orders,
    cart,
    cartLines,
    totals,
    wishlist,
    admin,
    drawerOpen,
    toast,
    findProduct,
    addToCart,
    setQty,
    toggleWish,
    quote,
    placeOrder,
    setOrderStatus,
    saveProduct,
    deleteProduct,
    resetDemo,
    notify,
    setDrawerOpen,
    login: (email, password) => {
      const ok = email.trim().toLowerCase() === STORE.admin.email && password === STORE.admin.password
      if (ok) setAdmin(true)
      return ok
    },
    logout: () => setAdmin(false),
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
