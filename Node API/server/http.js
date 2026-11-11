import fs from 'node:fs'
import path from 'node:path'
import { config } from './config.js'

export class HttpError extends Error {
  constructor(status, message, fields) { super(message); this.status = status; this.fields = fields }
}

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8',
}

export const SECURITY_HEADERS = {
  'Content-Security-Policy':
    "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

export function send(res, status, body, headers = {}) {
  const payload = body === undefined ? '' : JSON.stringify(body)
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...SECURITY_HEADERS, ...headers })
  res.end(payload)
}

export function readJson(req, limit = 100_000) {
  return new Promise((resolve, reject) => {
    if (!(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) return reject(new HttpError(415, 'Send JSON with Content-Type: application/json'))
    // Some serverless hosts (Vercel) read and parse the body before the handler runs, so the stream has already
    // ended and will never emit 'end'. Use their parsed copy when it is there.
    if (req.body !== undefined && req.body !== null) {
      try {
        const b = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : req.body
        return resolve(typeof b === 'string' ? (b ? JSON.parse(b) : {}) : b)
      } catch { return reject(new HttpError(400, 'Invalid JSON')) }
    }
    if (req.readableEnded) return resolve({})
    let size = 0
    const chunks = []
    req.on('data', (c) => {
      size += c.length
      if (size > limit) { reject(new HttpError(413, 'Request too large')); req.destroy() } else chunks.push(c)
    })
    req.on('end', () => {
      try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}) } catch { reject(new HttpError(400, 'Invalid JSON')) }
    })
    req.on('error', reject)
  })
}

// CSRF guard for state-changing requests: JSON only (enforced in readJson) plus an Origin check.
export function checkOrigin(req) {
  const origin = req.headers.origin
  if (!origin) return
  let host
  try { host = new URL(origin).host } catch { throw new HttpError(403, 'Bad origin') }
  const own = req.headers['x-forwarded-host'] && config.trustProxy ? req.headers['x-forwarded-host'] : req.headers.host
  if (host !== own && !config.allowedOrigins.includes(origin)) throw new HttpError(403, 'Cross-site request blocked')
}

export function serveStatic(req, res) {
  const url = new URL(req.url, 'http://x')
  let rel = decodeURIComponent(url.pathname)
  if (rel.includes('\0')) return send(res, 400, { error: 'Bad request' })
  let file = path.join(config.staticDir, path.normalize(rel))
  if (!file.startsWith(config.staticDir)) return send(res, 403, { error: 'Forbidden' })
  let st = fs.existsSync(file) && fs.statSync(file)
  if (st && st.isDirectory()) { file = path.join(file, 'index.html'); st = fs.existsSync(file) && fs.statSync(file) }
  if (!st) {
    if (path.extname(rel)) return send(res, 404, { error: 'Not found' })
    file = path.join(config.staticDir, 'index.html')
    st = fs.existsSync(file) && fs.statSync(file)
    if (!st) return send(res, 503, { error: 'Front end not built. Run "npm run build" first.' })
  }
  const ext = path.extname(file)
  const hashed = /[\\/]assets[\\/]/.test(file)
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Content-Length': st.size,
    'Cache-Control': ext === '.html' ? 'no-cache' : hashed ? 'public, max-age=31536000, immutable' : 'public, max-age=86400',
    ...SECURITY_HEADERS,
  })
  if (req.method === 'HEAD') return res.end()
  fs.createReadStream(file).pipe(res)
}
