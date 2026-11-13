// Vercel serverless entry for the DEMO site. Every /api/* request lands here.
// The database lives in memory and is rebuilt from database/seed.sql when an instance starts,
// so changes made in this mode are temporary. For a real store use a Node host (see README).
process.env.DEMO_MODE ??= 'true'
process.env.STATELESS_SESSIONS = 'true'
process.env.TRUST_PROXY ??= 'true'
// Demo logins. They are public on purpose (the sign-in page shows them) and exist only on this demo host.
// A fixed pair means the listing, the sign-in buttons and every serverless instance always agree.
// Override in the host's settings with DEMO_*_PASSWORD. A real store never uses this file.
process.env.DEMO_ADMIN_PASSWORD ||= 'Admin#Demo2026'
process.env.DEMO_CUSTOMER_PASSWORD ||= 'Customer#Demo2026'
// Signing key for the demo cookies: SESSION_SECRET if set, otherwise derived from this project's own Vercel id,
// so every serverless instance signs and verifies the same way.
if (!process.env.SESSION_SECRET && process.env.VERCEL_PROJECT_ID) {
  const { createHash } = await import('node:crypto')
  process.env.SESSION_SECRET = createHash('sha256').update('ember-oak|' + process.env.VERCEL_PROJECT_ID).digest('hex')
}

let handler
async function boot() {
  const { openDb, bootstrap } = await import('../Node API/server/db.js')
  const { createHandler } = await import('../Node API/server/routes.js')
  const db = openDb(':memory:')
  bootstrap(db)
  return createHandler(db)
}

export default async function (req, res) {
  try {
    handler ??= boot().catch((e) => { handler = undefined; throw e }) // a failed start is retried on the next request
    const h = await handler
    let timer
    const timeout = new Promise((_, rej) => { timer = setTimeout(() => rej(new Error('timeout')), 8000) })
    try { return await Promise.race([h(req, res), timeout]) } finally { clearTimeout(timer) }
  } catch (e) {
    console.error('[ember-oak] api error', e)
    if (!res.headersSent) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
    }
    res.end(JSON.stringify({ error: `The demo server could not finish this request (${String(e?.message || e).slice(0, 80)}). Please try again.` }))
  }
}
