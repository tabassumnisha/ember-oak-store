import { useRoute } from './router'
import { Header, Footer, CartDrawer, Toast } from './components/Layout'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Product from './pages/Product'
import Checkout from './pages/Checkout'
import Order from './pages/Order'
import Wishlist from './pages/Wishlist'
import Info from './pages/Info'
import Admin from './pages/admin/Admin'
import NotFound from './pages/NotFound'

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
      return <Order id={seg[1]} />
    case 'wishlist':
      return <Wishlist />
    case 'info':
      return <Info slug={seg[1]} />
    case 'admin':
      return <Admin tab={seg[1]} />
    default:
      return <NotFound />
  }
}

export default function App() {
  const { path, query } = useRoute()
  return (
    <>
      <Header />
      <main id="main">
        <Page path={path} query={query} />
      </main>
      <Footer />
      <CartDrawer />
      <Toast />
    </>
  )
}
