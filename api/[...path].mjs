// Vercel serverless entry for the demo. Every /api/* request lands here.
// The database lives in memory and is rebuilt from database/seed.sql when an instance starts,
// so changes made in this mode are temporary. For a real store use a Node host (see README).
process.env.DEMO_MODE ??= 'true'
process.env.STATELESS_SESSIONS = 'true'
process.env.TRUST_PROXY ??= 'true'
// Nothing to configure for the demo: when SESSION_SECRET is not set, derive it from this project's own Vercel id
// (not stored in the repo). Every serverless instance then signs sessions and derives the demo passwords the same way.
// The demo sign-in page shows the resulting demo logins. Set SESSION_SECRET / DEMO_*_PASSWORD yourself to choose them.
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
  handler ??= boot()
  return (await handler)(req, res)
}
