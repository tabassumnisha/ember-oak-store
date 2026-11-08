# Customisation guide

| To change | Where |
|---|---|
| Store name, address, phone, email, currency | `React Web/src/config.js` |
| Tax rate, shipping prices, free-shipping threshold | `Node API/server/config.js` (cents) |
| Logo and banners | replace the files in `React Web/src/assets/images/` keeping the file names (`logo.webp` is transparent) |
| Product photos | add files to `React Web/public/products/`, then set the product's image to `/products/your-file.webp` in the admin |
| Colours, fonts, spacing | tokens at the top of `React Web/src/styles/tokens.css` |
| Page text | `React Web/src/pages/` |
| Categories | add a row in `database/schema.sql` (lookup rows at the bottom) and an entry in `CATEGORIES` in `React Web/src/data/products.js` |
| Starting data | `database/seed.sql` (demo mode only) |

## First real admin
Set `DEMO_MODE=false`, `ADMIN_EMAIL` and `ADMIN_PASSWORD` (10+ characters) in `.env`, start the server on an empty database, and sign in at `/#/admin`.

## Payments and email
`POST /api/orders` in `Node API/server/routes/orders.js` is where a payment provider call goes, after `priceOrder()` and before the insert. Use `priced.total` (cents). Never take the amount from the browser.
