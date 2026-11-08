import { useRoute } from './router'
import Header from './components/Header'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import Toast from './components/Toast'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Product from './pages/Product'
import Checkout from './pages/Checkout'
import Order from './pages/Order'
import Wishlist from './pages/Wishlist'
import Info from './pages/Info'
import Admin from './pages/admin/Admin'
import NotFound from './pages/NotFound'
import Account from './pages/Account'
import { useStore } from './store'

function Page({ path, query }) {
  const seg = path.split('/').filter(Boolean)
  switch (seg[0]) {
    case undefined:
      return <Home />
    case 'shop':
      return <Shop query={query} />
    case 'product':
      return <Product id={seg[1]} />
    case 'checkout':
      return <Checkout />
    case 'order':
      return <Order id={seg[1]} token={query.token} />
    case 'wishlist':
      return <Wishlist />
    case 'info':
      return <Info slug={seg[1]} />
    case 'account':
      return <Account view={seg[1]} />
    case 'admin':
      return <Admin tab={seg[1]} />
    default:
      return <NotFound />
  }
}

export default function App() {
  const { path, query } = useRoute()
  const first = path.split('/').filter(Boolean)[0]
  const { status, reload } = useStore()
  const needsCatalogue = !['info', 'account', 'order'].includes(first)
  return (
    <>
      <Header />
      <main id="main">
        {needsCatalogue && status === 'loading' ? (
          <div className="wrap page empty" role="status"><p className="muted">Loading the shop…</p></div>
        ) : needsCatalogue && status === 'error' ? (
          <div className="wrap page empty" role="alert">
            <h1>We could not load the shop</h1>
            <p className="muted">The server did not answer. Check that it is running, then try again.</p>
            <button className="btn btn-dark" onClick={reload}>Try again</button>
          </div>
        ) : (
          <Page path={path} query={query} />
        )}
      </main>
      <Footer cta={!['checkout', 'admin', 'order'].includes(first)} />
      <CartDrawer />
      <Toast />
    </>
  )
}
