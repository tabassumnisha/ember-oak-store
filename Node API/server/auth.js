import crypto from 'node:crypto'
import { config } from './config.js'

const N = 16384, R = 8, P = 1, KEYLEN = 64

export function hashPassword(password) {
  const salt = crypto.randomBytes(16)
  const key = crypto.scryptSync(password, salt, KEYLEN, { N, r: R, p: P })
  return `scrypt$${N}$${R}$${P}$${salt.toString('base64')}$${key.toString('base64')}`
}

export function verifyPassword(password, stored) {
  const [alg, n, r, p, salt, hash] = String(stored).split('$')
  if (alg !== 'scrypt') return false
  const expected = Buffer.from(hash, 'base64')
  const key = crypto.scryptSync(password, Buffer.from(salt, 'base64'), expected.length, { N: +n, r: +r, p: +p })
  return crypto.timingSafeEqual(key, expected)
}

// Used so an unknown email takes as long to reject as a wrong password.
const DUMMY = hashPassword('not-a-real-password')
export const verifyDummy = (pw) => verifyPassword(pw, DUMMY)

const sha = (s) => crypto.createHash('sha256').update(s).digest('hex')
const sqlTime = (d) => d.toISOString().slice(0, 19).replace('T', ' ')
export const COOKIE = 'eo_session'

// Stateless mode (STATELESS_SESSIONS=true) is for serverless demo hosting such as Vercel, where each
// function instance has its own temporary database. The cookie is then a signed "userId.expiry.signature"
// value that any instance can verify. Use the normal database sessions on a real Node host.
const stateless = () => process.env.STATELESS_SESSIONS === 'true'
// Signing key: SESSION_SECRET if set (needed so every serverless instance agrees). Otherwise a random key that
// lives only in this process, so there is never a guessable default.
let fallbackSecret
const secret = () => {
  const s = process.env.SESSION_SECRET || config.sessionSecret
  if (s) return s
  if (!fallbackSecret) {
    fallbackSecret = crypto.randomBytes(32).toString('hex')
    console.warn('[ember-oak] SESSION_SECRET is not set: using a random key for this process. Set SESSION_SECRET so signed sessions survive restarts and work across instances.')
  }
  return fallbackSecret
}
const sign = (payload) => crypto.createHmac('sha256', secret()).update(payload).digest('base64url')

export function createSession(db, userId) {
  if (stateless()) {
    const payload = `${userId}.${Date.now() + config.statelessSessionHours * 36e5}`
    return `${payload}.${sign(payload)}`
  }
  const token = crypto.randomBytes(32).toString('base64url')
  const expires = new Date(Date.now() + config.sessionDays * 864e5)
  db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').run(sha(token), userId, sqlTime(expires))
  db.prepare("DELETE FROM sessions WHERE expires_at < datetime('now')").run()
  return token
}

export function destroySession(db, token) {
  if (!stateless() && token) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha(token))
}

export function userFromToken(db, token) {
  if (!token) return null
  if (stateless()) {
    const [id, exp, sig] = String(token).split('.')
    if (!sig || Number(exp) < Date.now()) return null
    const good = Buffer.from(sign(`${id}.${exp}`)), got = Buffer.from(sig)
    if (good.length !== got.length || !crypto.timingSafeEqual(good, got)) return null
    return db.prepare('SELECT id, email, name, role FROM users WHERE id = ?').get(Number(id)) || null
  }
  return (
    db
      .prepare(
        "SELECT u.id, u.email, u.name, u.role FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > datetime('now')"
      )
      .get(sha(token)) || null
  )
}

export function parseCookies(header = '') {
  const out = {}
  for (const part of header.split(';')) {
    const i = part.indexOf('=')
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim())
  }
  return out
}

export function sessionCookie(token, secure) {
  const maxAge = token ? config.sessionDays * 86400 : 0
  return `${COOKIE}=${token || ''}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure ? '; Secure' : ''}`
}

// Simple in-memory limiter: at most `max` hits per `windowMs` for a key.
export function makeLimiter(max, windowMs) {
  const hits = new Map()
  return {
    take(key) {
      const now = Date.now()
      const rec = (hits.get(key) || []).filter((t) => now - t < windowMs)
      if (rec.length >= max) { hits.set(key, rec); return false }
      rec.push(now); hits.set(key, rec)
      if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k)
      return true
    },
    reset(key) { hits.delete(key) },
  }
}
