# CLAUDE.md

Guidance for AI coding tools (Claude Code, Codex, Cursor) working in this repository.

## What this project is
A front-end e-commerce store for a fictional coffee roaster, "Ember & Oak", with a store admin. React 19 + Vite 7. There is no backend: data lives in `localStorage` under keys starting `emberoak.v1`.

## Commands
- `npm install` then `npm run dev` for development
- `npm run build` for production output in `dist/`
- There is no test runner or linter configured

## Architecture
- `src/main.jsx` mounts `<StoreProvider><App/></StoreProvider>`.
- `src/router.jsx` is a hash router (`#/shop?cat=beans`). `useRoute()` returns `{ path, query }`. Use `navigate(to)`, `buildQuery(obj)` and `<Link to>`. Do not add a router library.
- `src/App.jsx` maps the first path segment to a page component.
- `src/store.jsx` holds all state: products, orders, cart, wishlist, admin flag, toast. Read it with `useStore()`. Every mutation goes through a function in the context value. Persistence is the `load` and `save` helpers at the top, which is the single place to swap in an API.
- `src/config.js` holds store settings (name, tax, shipping, demo admin login) and `money()`.
- `src/data/products.js` holds the sample catalogue. `src/data/seedOrders.js` builds deterministic sample orders.
- `src/art.jsx` draws every product illustration as SVG. A product's `art` object selects the drawing and colours. A product with an `image` field shows that photo instead (see `components/Media.jsx`).
- `src/pages/` holds one component per route. `src/pages/admin/` holds the admin screens.
- `src/styles.css` is the only stylesheet. Colours, fonts and radii are CSS custom properties in `:root`.

## Data shape (product)
`id` (slug), `name`, `category` (`beans|gear|cups|gifts`), `price`, optional `compareAt`, `stock`, `summary`, `description`, `rating`, `reviews`, `featured`, `created`, `art`. Coffee products add `origin`, `roast`, `process`, `altitude`, `notes`, `profile {acidity, body, sweetness}` and `sizes [{label, price}]`. Other products add `details[]` and optionally `colors [{label, value}]`.

## Conventions
- Plain JavaScript with JSX, function components and hooks. No TypeScript, no CSS-in-JS.
- Keep files under about 300 lines. Split a page into components rather than growing it.
- Money is formatted only through `money()`. Prices are numbers in major units (dollars).
- Copy is plain, sentence case, active voice. Buttons name the action ("Add to bag", "Place order").
- Every form field needs a visible `<label>` and an inline error message. Keep focus styles visible.
- Do not use `dangerouslySetInnerHTML`. All user input is rendered as text.

## Security notes
- The admin login and session flag are a front-end demo, not access control. Do not treat `admin` state as a security boundary. When adding a backend, enforce authentication and roles on the server for every write.
- Card details are validated in `Checkout.jsx` and discarded. Never store or log them. Use a payment provider's hosted fields.
- Never commit real keys, tokens or passwords. The only credential in the repo is the documented demo admin login in `src/config.js`.

## Common tasks
- **Add a product:** use Admin, Products, or add an object to `initialProducts`. Existing browsers keep earlier data until "Restore demo data" is used.
- **Add a category:** add it to `CATEGORIES` in `src/data/products.js`. The shop filters and the header link pattern pick it up.
- **Connect a backend:** replace `load` and `save` in `src/store.jsx` and make the mutation functions call your API.
- **Re-skin:** edit the tokens at the top of `src/styles.css` and the palette in `src/art.jsx`.
