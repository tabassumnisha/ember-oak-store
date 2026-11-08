import fs from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { config } from './config.js'
import { hashPassword } from './auth.js'

const read = (f) => fs.readFileSync(path.join(config.root, 'database', f), 'utf8')

export function openDb(file = config.dbPath) {
  if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true })
  const db = new DatabaseSync(file)
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;')
  db.exec(read('schema.sql'))
  return db
}

export function tx(db, fn) {
  db.exec('BEGIN IMMEDIATE')
  try {
    const out = fn()
    db.exec('COMMIT')
    return out
  } catch (e) {
    db.exec('ROLLBACK')
    throw e
  }
}

const count = (db, t) => db.prepare(`SELECT COUNT(*) AS c FROM ${t}`).get().c

// Called once at start-up. Demo mode loads the sample data into an empty database.
// Production mode creates a single admin from ADMIN_EMAIL / ADMIN_PASSWORD and nothing else.
export function bootstrap(db) {
  if (config.demoMode) {
    if (count(db, 'users') === 0 && count(db, 'products') === 0) tx(db, () => db.exec(read('seed.sql')))
    return
  }
  if (count(db, 'users') === 0) {
    if (!config.adminEmail || config.adminPassword.length < 10) {
      console.warn('[ember-oak] No users yet. Set ADMIN_EMAIL and an ADMIN_PASSWORD of 10+ characters to create the first admin.')
      return
    }
    db.prepare("INSERT INTO users (email, name, password_hash, role) VALUES (?, 'Store Admin', ?, 'admin')").run(config.adminEmail, hashPassword(config.adminPassword))
    console.log(`[ember-oak] Created admin ${config.adminEmail}`)
  }
}

// Demo mode only: wipe orders, products and visitor accounts, then reload the sample data.
export function resetDemo(db) {
  tx(db, () => {
    db.exec('DELETE FROM order_items; DELETE FROM orders; DELETE FROM products; DELETE FROM users WHERE id NOT IN (1, 2);')
    db.exec(read('seed.sql'))
  })
}
