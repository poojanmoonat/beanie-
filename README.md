# Knot & Loom — Beanie Landing Page Prototype

A fast, mobile-first, framework-free landing page (`index.html`, `style.css`, `script.js`, `/images`) with live color-swatch switching, a persistent shopping bag drawer, email discount capture, and WhatsApp order checkout.

## Folder Structure

```
/
├── index.html        # Semantic page markup (9 sections + cart drawer)
├── style.css         # Mobile-first CSS design system & responsive layout
├── script.js         # Product catalog, swatches, cart, WhatsApp link & FAQ
├── images/           # Generated hero, product colorways, and lifestyle photos
│   ├── hero.jpg
│   ├── beanie-black.jpg
│   ├── beanie-charcoal.jpg
│   ├── beanie-beige.jpg
│   ├── beanie-maroon.jpg
│   └── lifestyle-1.jpg ... lifestyle-4.jpg
```

## 1. Replace Generated Images with Real Photos

Keep the same filenames inside `/images/` (or update the filenames in `index.html` and `script.js`):

- **Hero photo**: replace `images/hero.jpg` (recommended `4:3` or `16:9`, ~1200px wide, compressed `.jpg` or `.webp`).
- **Product color shots**: replace `images/beanie-black.jpg`, `images/beanie-charcoal.jpg`, `images/beanie-beige.jpg`, and `images/beanie-maroon.jpg` using consistent studio lighting and framing (`4:3` ratio).
- **Lifestyle gallery**: replace `images/lifestyle-1.jpg` through `images/lifestyle-4.jpg`.

## 2. Edit Brand Copy, Prices, & WhatsApp Number

- **WhatsApp number, currency, shipping threshold, & products**: open `script.js` and edit `STORE_CONFIG`, `COLOR_VARIANTS`, and `PRODUCTS` at the top of the file.
  - Set `whatsappNumber` to your number with country code and no `+` sign (for example, `'919876543210'`).
  - Update `price`, `name`, or `material` inside `PRODUCTS`.
- **Headlines, trust bar, reviews, & FAQ**: edit the text directly in `index.html`.
- **Colors & fonts**: edit the `:root` CSS variables at the top of `style.css`.

## 3. Deploy Free to Netlify or Vercel

### Option A: Drag-and-Drop (Zero Build Step)
1. Gather `index.html`, `style.css`, `script.js`, and the `images/` folder into one folder.
2. Go to [Netlify Drop](https://app.netlify.com/drop) and drag the folder in—your site goes live in seconds.

### Option B: Git Deploy (Vercel or Netlify)
1. Push this repository to GitHub.
2. Import the repository in **Vercel** or **Netlify**.
3. If deploying directly as static files, set Build Command to empty (or `npm run build` with Output Directory `dist` if using the included Vite config).
