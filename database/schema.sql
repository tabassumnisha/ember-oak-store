-- Ember & Oak store schema (SQLite 3). Safe to run more than once.
-- The server applies this file automatically on start-up (server/db.js).
-- Money is stored as integer cents. Timestamps are UTC, 'YYYY-MM-DD HH:MM:SS'.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  name          TEXT    NOT NULL,
  password_hash TEXT    NOT NULL,              -- scrypt$N$r$p$salt$hash, never a plain password
  role          TEXT    NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT    PRIMARY KEY,              -- sha256 of the cookie value
  user_id    INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  expires_at TEXT    NOT NULL,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sessions_user    ON sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions (expires_at);

CREATE TABLE IF NOT EXISTS categories (
  id         TEXT    PRIMARY KEY,
  label      TEXT    NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id               TEXT    PRIMARY KEY,        -- url slug
  category_id      TEXT    NOT NULL REFERENCES categories (id) ON DELETE RESTRICT,
  name             TEXT    NOT NULL,
  summary          TEXT    NOT NULL,
  description      TEXT    NOT NULL,
  price_cents      INTEGER NOT NULL CHECK (price_cents >= 0),
  compare_at_cents INTEGER CHECK (compare_at_cents IS NULL OR compare_at_cents >= 0),
  stock            INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  rating           REAL    NOT NULL DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
  reviews_count    INTEGER NOT NULL DEFAULT 0 CHECK (reviews_count >= 0),
  featured         INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
  origin           TEXT,
  roast            TEXT,
  process          TEXT,
  altitude         TEXT,
  notes            TEXT,                       -- JSON array of strings
  profile          TEXT,                       -- JSON {acidity, body, sweetness}
  sizes            TEXT,                       -- JSON [{label, price_cents}]
  colors           TEXT,                       -- JSON [{label, value}]
  details          TEXT,                       -- JSON array of strings
  art              TEXT    NOT NULL,           -- JSON illustration settings (fallback when no image)
  image            TEXT,                       -- optional photo URL, e.g. /products/x.webp
  created_at       TEXT    NOT NULL DEFAULT (date('now'))
);
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category_id);

CREATE TABLE IF NOT EXISTS orders (
  id             TEXT    PRIMARY KEY,          -- EO-10481
  seq            INTEGER NOT NULL UNIQUE,
  user_id        INTEGER REFERENCES users (id) ON DELETE SET NULL,
  access_token   TEXT    NOT NULL,             -- lets a guest open their own confirmation page
  status         TEXT    NOT NULL DEFAULT 'Processing'
                 CHECK (status IN ('Processing', 'Roasting', 'Shipped', 'Delivered', 'Cancelled')),
  customer_name  TEXT    NOT NULL,
  customer_email TEXT    NOT NULL,
  customer_phone TEXT,
  address        TEXT,
  city           TEXT,
  zip            TEXT,
  payment        TEXT    NOT NULL CHECK (payment IN ('Card', 'Cash on delivery')),
  shipping_id    TEXT    NOT NULL DEFAULT 'standard',
  subtotal_cents INTEGER NOT NULL CHECK (subtotal_cents >= 0),
  shipping_cents INTEGER NOT NULL CHECK (shipping_cents >= 0),
  tax_cents      INTEGER NOT NULL CHECK (tax_cents >= 0),
  total_cents    INTEGER NOT NULL CHECK (total_cents >= 0),
  created_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_orders_user    ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders (created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status  ON orders (status);

CREATE TABLE IF NOT EXISTS order_items (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id         TEXT    NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_id       TEXT    REFERENCES products (id) ON DELETE SET NULL,
  name             TEXT    NOT NULL,           -- copied at purchase time
  size             TEXT,
  grind            TEXT,
  color            TEXT,
  qty              INTEGER NOT NULL CHECK (qty > 0),
  unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0)
);
CREATE INDEX IF NOT EXISTS idx_items_order   ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_items_product ON order_items (product_id);

-- Fixed lookup data (not demo content).
INSERT OR IGNORE INTO categories (id, label, sort_order) VALUES
  ('beans', 'Coffee beans', 1),
  ('gear', 'Brewing gear', 2),
  ('cups', 'Cups & mugs', 3),
  ('gifts', 'Gifts & sets', 4);
