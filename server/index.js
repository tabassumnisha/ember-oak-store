import http from 'node:http'
import { config } from './config.js'
import { openDb, bootstrap } from './db.js'
import { createHandler } from './routes.js'
import { serveStatic, send } from './http.js'

export function createApp(db) {
  const api = createHandler(db)
  return http.createServer((req, res) => {
    if (req.url.startsWith('/api/')) return api(req, res)
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error: 'Method not allowed' })
    try { serveStatic(req, res) } catch (e) { console.error(e); send(res, 500, { error: 'Something went wrong' }) }
  })
}

// Run directly: node server/index.js
if (import.meta.url === `file://${process.argv[1]}`) {
  const db = openDb()
  bootstrap(db)
  createApp(db).listen(config.port, config.host, () =>
    console.log(`[ember-oak] http://localhost:${config.port}  (demo mode ${config.demoMode ? 'ON' : 'off'})`))
}
