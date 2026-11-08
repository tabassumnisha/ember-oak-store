# Database access rules

SQLite file, schema in `database/schema.sql` (idempotent, applied on every start by `server/db.js`). Diagram: `docs/erd.md`.

## Query safety
- Every query uses prepared statements with bound parameters. The only dynamic SQL is the column list of product insert/update (`routes/products.js`), built from a fixed whitelist of column names, never from request keys, and a table-name check in `db.js` (`count`).
- Money is integer cents. Prices, tax, shipping and stock are computed from database rows inside one `BEGIN IMMEDIATE` transaction (`routes/orders.js`).

## Who can read or write what
| Data | Access |
|---|---|
| `users`, `sessions` | Only the auth routes. Passwords are scrypt hashes, session tokens are stored as sha256 |
| `products` | Public read. Create, update, delete: admin only |
| `orders`, `order_items` | Create: anyone (guest checkout, see `ALLOW_GUEST_CHECKOUT`). Read: the owner, an admin, or whoever holds the order's private `access_token`. Status change: admin only |
| Demo reset | Admin only, demo mode only |

## Constraints and indexes
- `UNIQUE` email (case-insensitive); `CHECK` lists for `role`, `status`, `payment`; `stock >= 0`, money `>= 0`, `qty > 0`; foreign keys on.
- Indexes: `sessions(user_id)`, `sessions(expires_at)`, `products(category_id)`, `orders(user_id)`, `orders(created_at)`, `orders(status)`, `orders(seq)` unique, `order_items(order_id)`, `order_items(product_id)`.
- Stock cannot go negative: the update only succeeds when enough stock remains, otherwise the order is rolled back with 409.
