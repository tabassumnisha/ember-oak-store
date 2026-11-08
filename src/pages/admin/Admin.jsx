import { useState } from 'react'
import { Link } from '../../router'
import { useStore } from '../../store'
import { STORE } from '../../config'
import { SignInForm } from '../Account'
import { Icon } from '../../components/Icons'
import { usePageTitle } from '../../utils'
import Overview from './Overview'
import ProductsAdmin from './ProductsAdmin'
import OrdersAdmin from './OrdersAdmin'

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'chart' },
  { id: 'products', label: 'Products', icon: 'box' },
  { id: 'orders', label: 'Orders', icon: 'bag' },
  { id: 'settings', label: 'Settings', icon: 'gear' },
]

function Settings() {
  const { resetDemo, logout, demoMode } = useStore()
  return (
    <div className="panel">
      <h2>Settings</h2>
      <dl className="specs">
        <div><dt>Store name</dt><dd>{STORE.name}</dd></div>
        <div><dt>Currency</dt><dd>{STORE.currency}</dd></div>
        <div><dt>Tax rate</dt><dd>{(STORE.taxRate * 100).toFixed(0)}%</dd></div>
        <div><dt>Free shipping over</dt><dd>${STORE.freeShippingOver}</dd></div>
      </dl>
      <p className="muted">Tax and shipping are set on the server in <code>server/config.js</code>.</p>
      <div className="btn-row">
        {demoMode && (
          <button className="btn btn-outline" onClick={resetDemo}>
            Restore demo data
          </button>
        )}
        <button className="btn btn-dark" onClick={logout}>
          Sign out
        </button>
      </div>
    </div>
  )
}

// Access control is enforced by the server on every API call. This screen only hides what a visitor cannot use.
export default function Admin({ tab = 'overview' }) {
  const { admin, user, logout } = useStore()
  usePageTitle('Admin')
  if (!user)
    return (
      <div className="wrap page login">
        <SignInForm title="Store admin" intro="Sign in to manage products and orders." role="admin" next="/admin" />
      </div>
    )
  if (!admin)
    return (
      <div className="wrap page empty">
        <h1>Admin access only</h1>
        <p className="muted">You are signed in as {user.email}, which is a customer account.</p>
        <button className="btn btn-dark" onClick={logout}>Sign out</button>
      </div>
    )
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
