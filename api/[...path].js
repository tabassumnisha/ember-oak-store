// Vercel serverless entry for the demo. Every /api/* request lands here.
// The database lives in memory and is rebuilt from database/seed.sql when an instance starts,
// so changes made in this mode are temporary. For a real store use a Node host (see README).
process.env.DEMO_MODE ??= 'true'
process.env.STATELESS_SESSIONS = 'true'
process.env.TRUST_PROXY ??= 'true'

let handler
async function boot() {
  const { openDb, bootstrap } = await import('../server/db.js')
  const { createHandler } = await import('../server/routes.js')
  const db = openDb(':memory:')
  bootstrap(db)
  return createHandler(db)
}

export default async function (req, res) {
  handler ??= boot()
  return (await handler)(req, res)
}
