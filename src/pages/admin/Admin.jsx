import { useState } from 'react'
import { Link } from '../../router'
import { useStore } from '../../store'
import { STORE } from '../../config'
import { Icon } from '../../components/Icons'
import { usePageTitle } from '../../utils'
import Overview from './Overview'
import ProductsAdmin from './ProductsAdmin'
import OrdersAdmin from './OrdersAdmin'

function Login() {
  usePageTitle('Admin sign in')
  const { login } = useStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!login(email, password)) setError('That email and password do not match. Check the demo login shown below.')
  }

  return (
    <div className="wrap page login">
      <form className="login-card" onSubmit={submit}>
        <h1>Store admin</h1>
        <p className="muted">Sign in to manage products and orders.</p>
        <div className="field">
          <label htmlFor="a-email">Email</label>
          <input id="a-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
        </div>
        <div className="field">
          <label htmlFor="a-pass">Password</label>
          <input id="a-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </div>
        {error && (
          <p className="err" role="alert">
            {error}
          </p>
        )}
        <button className="btn btn-dark btn-block" type="submit">
          Sign in
        </button>
        <p className="notice">
          Demo login: <code>{STORE.admin.email}</code> / <code>{STORE.admin.password}</code>
        </p>
      </form>
    </div>
  )
}

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'chart' },
  { id: 'products', label: 'Products', icon: 'box' },
  { id: 'orders', label: 'Orders', icon: 'bag' },
  { id: 'settings', label: 'Settings', icon: 'gear' },
]

function Settings() {
  const { resetDemo, logout } = useStore()
  return (
    <div className="panel">
      <h2>Settings</h2>
      <dl className="specs">
        <div><dt>Store name</dt><dd>{STORE.name}</dd></div>
        <div><dt>Currency</dt><dd>{STORE.currency}</dd></div>
        <div><dt>Tax rate</dt><dd>{(STORE.taxRate * 100).toFixed(0)}%</dd></div>
        <div><dt>Free shipping over</dt><dd>${STORE.freeShippingOver}</dd></div>
      </dl>
      <p className="muted">Edit these values in <code>src/config.js</code>.</p>
      <div className="btn-row">
        <button className="btn btn-outline" onClick={resetDemo}>
          Restore demo data
        </button>
        <button className="btn btn-dark" onClick={logout}>
          Sign out
        </button>
      </div>
    </div>
  )
}

// NOTE: this panel is a front-end demo. The session flag lives in the browser, so it is not real access control.
// Before production, protect these screens and every write with server-side authentication and roles.
export default function Admin({ tab = 'overview' }) {
  const { admin, logout } = useStore()
  usePageTitle('Admin')
  if (!admin) return <Login />
  const current = TABS.some((t) => t.id === tab) ? tab : 'overview'
  return (
    <div className="wrap page admin">
      <aside className="admin-nav" aria-label="Admin">
        <p className="admin-title">Admin</p>
        {TABS.map((t) => (
          <Link key={t.id} to={`/admin/${t.id}`} className={current === t.id ? 'on' : ''} aria-current={current === t.id ? 'page' : undefined}>
            <Icon name={t.icon} size={18} /> {t.label}
          </Link>
        ))}
        <button className="admin-out" onClick={logout}>
          <Icon name="logout" size={18} /> Sign out
        </button>
      </aside>
      <section className="admin-main">
        {current === 'overview' && <Overview />}
        {current === 'products' && <ProductsAdmin />}
        {current === 'orders' && <OrdersAdmin />}
        {current === 'settings' && <Settings />}
      </section>
    </div>
  )
}
