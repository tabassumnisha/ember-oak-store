# API reference

Base path `/api`. All bodies are JSON (`Content-Type: application/json`). The session is an HttpOnly cookie named `eo_session`, set by login or register. Money is in dollars in responses. Errors look like `{ "error": "message", "fields": { "email": "reason" } }`.

State-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`) must be JSON and, when the browser sends an `Origin` header, it must match the server's host.

| Method and path | Who | Purpose |
|---|---|---|
| `GET /api/health` | public | `{ ok, demoMode }` for load balancers |
| `GET /api/config` | public | Tax rate, shipping methods, free-shipping threshold; demo logins only in demo mode |
| `POST /api/auth/register` | public | Create a customer account `{ name, email, password }` (8+ characters). Role is always `customer` |
| `POST /api/auth/login` | public | `{ email, password }`. 10 attempts per 15 minutes per address and email |
| `POST /api/auth/logout` | public | Ends the session |
| `GET /api/auth/me` | public | `{ user }` or `{ user: null }` |
| `GET /api/products` | public | All products |
| `GET /api/products/:id` | public | One product |
| `POST /api/products` | **admin** | Create a product |
| `PUT /api/products/:id` | **admin** | Replace a product's editable fields |
| `DELETE /api/products/:id` | **admin** | Delete a product (past order lines keep their copied name and price) |
| `POST /api/orders` | public | Place an order `{ items: [{ productId, qty, size?, grind?, color? }], customer, payment, shippingId }`. Prices come from the database. Returns the order with a private `accessToken` |
| `GET /api/orders` | signed in | Customer: own orders. Admin: all orders |
| `GET /api/orders/:id` | owner, admin, or `?token=` | One order. Anyone else gets 404 |
| `PATCH /api/orders/:id` | **admin** | `{ status }`: Processing, Roasting, Shipped, Delivered, Cancelled. Cancelling returns stock |
| `POST /api/admin/reset-demo` | **admin**, demo mode only | Reload the sample data |

## Status codes
`200` ok, `201` created, `400` bad request, `401` not signed in, `403` wrong role or cross-site request, `404` not found, `409` conflict (duplicate email, sold out), `413` body too large, `415` not JSON, `422` validation failed, `429` rate limited.

## Rules the server enforces
- A customer sending `role: "admin"` at registration is ignored.
- Order totals are recomputed from the database: client prices are never read.
- Stock is decremented inside a transaction, so two buyers cannot both take the last item.
- Order lookup by id returns the same 404 for "missing" and "not yours".
