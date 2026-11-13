import { useState } from 'react'
import { Link, navigate } from '../router'
import { useStore } from '../store'
import { money } from '../config'
import { fmtDate, usePageTitle } from '../utils'

function DemoLogins({ role, onPick, onSignIn, busy }) {
  const { demoAccounts } = useStore()
  const list = demoAccounts.filter((a) => !role || a.role === role)
  if (list.length === 0) return null
  return (
    <div className="notice demo-logins">
      <strong>Demo access</strong>
      {list.map((a) => (
        <div key={a.email} className="demo-acct">
          <span className="demo-role">{a.role === 'admin' ? 'Admin' : 'Customer'}</span>
          <span>Email <code>{a.email}</code></span>
          <span>Password <code>{a.password}</code></span>
          <span className="demo-actions">
            <button type="button" className="btn btn-brass btn-sm" disabled={busy} onClick={() => onSignIn(a)}>
              {busy ? 'Signing in…' : `Sign in as ${a.role === 'admin' ? 'Admin' : 'Customer'}`}
            </button>
            <button type="button" className="link-btn" onClick={() => onPick(a)}>
              Fill in
            </button>
          </span>
        </div>
      ))}
    </div>
  )
}

export function SignInForm({ title = 'Sign in', intro, role, next = '/account' }) {
  const { login, demoLogin } = useStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const signIn = async (mail, pass, to) => {
    setBusy(true)
    setError('')
    try {
      await login(mail, pass)
      navigate(to)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }
  const quickSignIn = async (a) => {
    setBusy(true)
    setError('')
    try {
      await demoLogin(a.role)
      navigate(a.role === 'admin' ? '/admin' : next)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }
  const submit = (e) => {
    e.preventDefault()
    signIn(email, password, next)
  }

  return (
    <form className="login-card" onSubmit={submit}>
      <h1>{title}</h1>
      {intro && <p className="muted">{intro}</p>}
      <div className="field">
        <label htmlFor="s-email">Email</label>
        <input id="s-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
      </div>
      <div className="field">
        <label htmlFor="s-pass">Password</label>
        <input id="s-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
      </div>
      {error && <p className="err" role="alert">{error}</p>}
      <button className="btn btn-dark btn-block" type="submit" disabled={busy}>
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
      <DemoLogins role={role} busy={busy} onPick={(a) => { setEmail(a.email); setPassword(a.password) }} onSignIn={quickSignIn} />
      {!role && (
        <p className="muted small">
          New here? <Link to="/account/register">Create an account</Link>
        </p>
      )}
    </form>
  )
}

function Register() {
  const { register } = useStore()
  const [f, setF] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setErrors({})
    try {
      await register(f.name, f.email, f.password)
      navigate('/account')
    } catch (err) {
      setErrors({ ...err.fields, form: err.message })
    } finally {
      setBusy(false)
    }
  }
  const Field = ({ id, label, type = 'text', auto }) => (
    <div className={`field ${errors[id] ? 'bad' : ''}`}>
      <label htmlFor={`r-${id}`}>{label}</label>
      <input id={`r-${id}`} type={type} value={f[id]} onChange={(e) => set(id, e.target.value)} autoComplete={auto} required />
      {errors[id] && <p className="err">{errors[id]}</p>}
    </div>
  )
  return (
    <form className="login-card" onSubmit={submit} noValidate>
      <h1>Create account</h1>
      <p className="muted">Track your orders and check out faster.</p>
      <Field id="name" label="Full name" auto="name" />
      <Field id="email" label="Email" type="email" auto="email" />
      <Field id="password" label="Password (8+ characters)" type="password" auto="new-password" />
      {errors.form && !errors.email && !errors.password && !errors.name && <p className="err" role="alert">{errors.form}</p>}
      <button className="btn btn-dark btn-block" type="submit" disabled={busy}>
        {busy ? 'Creating…' : 'Create account'}
      </button>
      <p className="muted small">
        Already registered? <Link to="/account/login">Sign in</Link>
      </p>
    </form>
  )
}

function Overview() {
  const { user, orders, logout } = useStore()
  return (
    <div className="wrap page">
      <div className="page-head">
        <h1>My account</h1>
        <p className="muted">
          {user.name}, {user.email}
        </p>
      </div>
      <div className="btn-row">
        {user.role === 'admin' && (
          <Link to="/admin" className="btn btn-dark">
            Open admin
          </Link>
        )}
        <button className="btn btn-outline" onClick={async () => { await logout(); navigate('/') }}>
          Sign out
        </button>
      </div>
      <h2 className="acct-h">{user.role === 'admin' ? 'All orders' : 'My orders'}</h2>
      {orders.length === 0 ? (
        <div className="empty">
          <p className="muted">No orders yet.</p>
          <Link to="/shop" className="btn btn-dark">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Items</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, user.role === 'admin' ? 8 : 50).map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link to={`/order/${o.id}`}>{o.id}</Link>
                  </td>
                  <td>{fmtDate(o.createdAt)}</td>
                  <td>{o.items.reduce((s, i) => s + i.qty, 0)}</td>
                  <td>{o.status}</td>
                  <td>{money(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function Account({ view }) {
  const { user } = useStore()
  usePageTitle(view === 'register' ? 'Create account' : user ? 'My account' : 'Sign in')
  if (view === 'register' && !user) return <div className="wrap page login"><Register /></div>
  if (!user)
    return (
      <div className="wrap page login">
        <SignInForm intro="Sign in to see your orders." />
      </div>
    )
  return <Overview />
}
