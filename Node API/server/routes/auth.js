import { config } from '../config.js'
import { HttpError, send } from '../http.js'
import { hashPassword, verifyPassword, verifyDummy, createSession, destroySession, sessionCookie } from '../auth.js'
import { validateRegister } from '../validate.js'

const publicUser = (u) => ({ id: u.id, email: u.email, name: u.name, role: u.role })

export function authRoutes({ db, q, route, loginLimit, writeLimit }) {
  // ---- auth
  const startSession = (c, user) => {
    const token = createSession(db, user.id)
    const secure = config.cookieSecure || c.req.headers['x-forwarded-proto'] === 'https'
    return { 'Set-Cookie': sessionCookie(token, secure) }
  }
  route('POST', '/api/auth/register', (c) => {
    if (!writeLimit.take('reg:' + c.ip)) throw new HttpError(429, 'Too many attempts. Try again later.')
    const v = validateRegister(c.body)
    if (q('SELECT 1 FROM users WHERE email = ?').get(v.email)) throw new HttpError(409, 'An account with this email already exists', { email: 'Already registered' })
    const r = q("INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, 'customer')").run(v.email, v.name, hashPassword(v.password))
    const user = { id: Number(r.lastInsertRowid), email: v.email, name: v.name, role: 'customer' }
    send(c.res, 201, { user: publicUser(user) }, startSession(c, user))
  }, { body: true })

  route('POST', '/api/auth/login', (c) => {
    const email = String(c.body.email || '').trim().toLowerCase().slice(0, 160)
    const password = String(c.body.password || '').slice(0, 200)
    const key = `${c.ip}|${email}`
    if (!loginLimit.take(key)) throw new HttpError(429, 'Too many sign-in attempts. Try again in 15 minutes.')
    const row = q('SELECT * FROM users WHERE email = ?').get(email)
    const ok = row ? verifyPassword(password, row.password_hash) : (verifyDummy(password), false)
    if (!ok) throw new HttpError(401, 'Incorrect email or password')
    loginLimit.reset(key)
    send(c.res, 200, { user: publicUser(row) }, startSession(c, row))
  }, { body: true })

  route('POST', '/api/auth/logout', (c) => {
    destroySession(db, c.token)
    send(c.res, 200, { ok: true }, { 'Set-Cookie': sessionCookie('', false) })
  }, { body: true })

  route('GET', '/api/auth/me', (c) => send(c.res, 200, { user: c.user ? publicUser(c.user) : null }))

}
