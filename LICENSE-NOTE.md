# LICENSE NOTE

**Product:** Ember & Oak, full-stack coffee store (React front end, Node API, SQLite database, customer accounts and admin panel), version 2.0.0
**Licensor:** Ride Bangla Limited, Faridpur, Bangladesh, info@ridebangla.bd
**Copyright:** © 2026 Ride Bangla Limited. All rights reserved, except as expressly granted below.

This file has two parts: **Part A** is the licence for the software and design you bought. **Part B** lists every bundled asset (images, fonts, code) and who holds the rights to it.

---

## Part A: Software Licence (Standard Licence)

### 1. Definitions
- **"Software"** means all files in this package: source code, database scripts, images, documentation and the design they form.
- **"Buyer"** means the person or company that purchased the Software from the Licensor or an authorised marketplace.
- **"End Product"** means one online store, for one owner, published on one domain (a staging copy on a sub-domain is not a separate End Product).

### 2. What you may do
With one Standard Licence you may:
1. Use the Software to run **one (1) End Product**, either for yourself or for one client.
2. Modify, translate, restyle and extend the Software without limit (change colours, text, products, images, code and database).
3. Replace the sample products and images with your own and use your own name, brand and contact details.
4. Install the End Product on any hosting you control (your own VPS, a Docker host or a managed Node.js platform).
5. Keep a private backup copy of the Software.

Need more than one End Product (for example for several clients)? Purchase one licence per End Product.

### 3. What you may not do
You may **not**:
1. Resell, sublicense, rent, lend, give away or otherwise distribute the Software, or any part of it, **as a template, theme, UI kit, starter, boilerplate or source-code package**, whether modified or not.
2. Upload the Software, or a modified version of it, to a public or shared repository, marketplace, forum or file-sharing site in a form others can download and reuse.
3. Extract the bundled images, banners, product photographs or logo and redistribute them on their own (stock, wallpaper or asset packs).
4. Claim that you created the Software, or remove the copyright and licence notices from the files, `LICENSE-NOTE.md` or the source-code header comments.
5. Use the Software for unlawful, defamatory, hateful or infringing content.
6. Transfer the licence to someone else without the Licensor's written consent.

The finished End Product (your store, its content, your own products, images and text, and the data of your customers) belongs to you. Only the Software itself remains the property of the Licensor.

### 4. Ownership
The Software is licensed, not sold. The Licensor keeps all ownership and all rights not expressly granted here, including the right to reuse its own pre-existing tools, components and know-how.

### 5. Third-party components
The server uses no third-party code: only Node.js built-in modules. The front end uses React and React DOM (MIT) at runtime, and Vite with its React plugin (MIT) only to build. The Inter typeface is bundled under the SIL Open Font License 1.1. Items listed in Part B and in `THIRD_PARTY_NOTICES.md` keep their own licences, and their notices must not be removed.

### 6. Support and updates
Support and updates are provided only as described on the marketplace listing where you bought the Software or in a separate written agreement. Documentation is in `README.md`, `HowToSetup.md`, `CLAUDE.md` and `CHANGELOG.md`.

### 7. No warranty and limit of liability
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING FITNESS FOR A PARTICULAR PURPOSE. TO THE EXTENT THE LAW ALLOWS, THE LICENSOR IS NOT LIABLE FOR ANY INDIRECT OR CONSEQUENTIAL LOSS, AND ITS TOTAL LIABILITY IS LIMITED TO THE PRICE YOU PAID FOR THE SOFTWARE. You are responsible for payment processing, tax compliance, privacy law and the security of your own deployment. Nothing here limits any right you have under consumer law that cannot be excluded.

### 8. Termination
This licence ends automatically if you breach section 3. On termination you must stop using the Software and delete all copies. Sections 4 and 7 survive termination.

### 9. Governing law
This licence is governed by the laws of Bangladesh. Disputes are handled by the competent courts of Bangladesh, unless the marketplace terms where you bought the Software require otherwise.

### 10. Contact
Questions, extra licences or permission requests: **info@ridebangla.bd** (Ride Bangla Limited).

---

## Part B: Asset licensing and sources

### B1. Images
| Location | What it is | Source and rights |
|---|---|---|
| `src/assets/images/logo.webp` | Ember & Oak logo | Supplied by the Licensor, who holds the rights to use and license it. Covered by Part A. |
| `src/assets/images/*.webp` (ten files: `bg-beans`, `bg-cup`, `bg-light`, `bg-wave`, `gear`, `hero`, `kit`, `roasts`, `scene-brew`, `tasting`) | Banners and backgrounds | Supplied by the Licensor, who holds the rights to use and license them. Covered by Part A. |
| `public/products/*.webp` (thirteen files) | Product photographs of coffee bags and brewing gear | Seven supplied by the Licensor, who holds the rights to use and license them. The other six coffee-bag photos are the Licensor's bag photos with the label text changed. Covered by Part A. |
| `public/favicon.png` | Site icon | Derived from the logo. Covered by Part A. |
| SVG illustrations in `src/art.jsx` | Product drawings used when a product has no photo | Original code-drawn artwork written for this Software. Covered by Part A. |

The images show the fictional brand "Ember & Oak" only. They contain no real people and no third-party brands or trademarks. When you replace them with your own images, you are responsible for having the rights to them.

### B2. Fonts
Inter (subset, WOFF files in `src/assets/fonts/`) by The Inter Project Authors, licensed under the **SIL Open Font License 1.1** (https://openfontlicense.org). The full licence text is in `THIRD_PARTY_NOTICES.md` and must stay with the font files.

### B3. Icons
All icons are small inline SVG paths in `src/components/Icons.jsx`. There is no icon font and no external request.

### B4. Code and dependencies
- Runtime packages: `react` and `react-dom` 19.2.8 (MIT). Build packages: `vite` 7.0.0 and `@vitejs/plugin-react` 5.0.0 (MIT). Exact versions are pinned in `package.json`.
- The server (`server/`) imports only Node.js built-in modules (`node:http`, `node:sqlite`, `node:crypto`, `node:fs`, `node:path`). No CDN scripts, analytics or tracking.
- The Dockerfile uses the pinned official image `node:22.14.0-alpine3.21`. Move to a current patch release or a digest when you deploy.
- All other HTML, CSS, JavaScript and SQL were written for this Software and are covered by Part A.

### B5. Credentials and personal data
Names, phone numbers and e-mail addresses in the sample data are invented, on the reserved `.demo` and `example.com` domains. The two demo accounts in `database/seed.sql` (`admin@emberoak.demo`, `customer@emberoak.demo`) exist only for demonstration, are loaded only while `DEMO_MODE=true`, and are not real people. For a live store, set `DEMO_MODE=false`: the administrator is then created from your own `.env` and no demo account exists. The only real contact detail in the package is the Licensor's address in this file.
