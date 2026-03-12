# South Sanctuary — Build Plan
**Site:** 230 S Canby, Portland, OR
**Concept:** A marketing site to romance the home + an estate sale e-commerce experience
**URL (interim):** south-sanctuary.vercel.app → eventually 230SCanby.com

---

## Navigation Structure
```
STORY  |  GALLERY  |  ESTATE SALE  |  CONTACT
```

---

## ✅ Phase 0 — Infrastructure (Complete)
- [x] Next.js 15 project with TypeScript, Tailwind, App Router
- [x] GitHub repo: `github.com/mciulis/south-sanctuary`
- [x] Vercel deployment connected
- [x] Supabase project created (`south-sanctuary`, us-west-1)
- [x] DB schema: `products`, `product_images`, `reservations`
- [x] shadcn/ui initialized
- [x] Packages: `@supabase/supabase-js`, `react-photo-album`, `yet-another-react-lightbox`

---

## Phase 1 — Design System & Site Shell
**Goal:** Every subsequent phase builds on a consistent visual foundation.

### 1.1 Design Tokens (globals.css + tailwind.config)
- Color palette: warm cream background, olive/taupe accent, near-black footer
- Typography scale: large display serif + small body sans-serif
- Spacing and container widths

### 1.2 Font Selection
- Display: Cormorant Garamond or Playfair Display (large editorial headlines, italic variant for emphasis)
- Body: Inter or DM Sans (small, airy body copy)

### 1.3 Nav Component (`src/components/layout/Nav.tsx`)
- Minimal top bar, small-caps links
- Sticky on scroll
- Mobile: hamburger → slide-out sheet

### 1.4 Footer Component (`src/components/layout/Footer.tsx`)
- Dark background (near-black)
- Large faded ghost headline: "SOUTH SANCTUARY"
- Sitemap links (Story, Gallery, Estate Sale, Contact)
- Address: 230 S Canby, Portland, OR

### 1.5 Page Layout Wrapper (`src/components/layout/PageLayout.tsx`)
- Nav + children + Footer

---

## Phase 2 — Story Page (Home Page)
**Route:** `/` (home)
**Goal:** Romanticize the home. Make someone feel something before they see the price.

### Sections (top to bottom):
1. **Hero** — Full-bleed photo, large serif headline (2–3 words), small subtitle
2. **Intro** — 2–3 sentence evocative paragraph about the sanctuary feeling
3. **The Setting** — Dead-end street, wooded forest, creek, buried utilities, privacy
4. **The Arrival** — Glass railings, the descent to the main floor, light through 11 south-facing windows
5. **The Living Spaces** — Family room, bonus room (the "middle room"), fireplaces
6. **The Kitchen** — Island, fireside kitchen, westward window, dining table
7. **The Deck** — 850 sqft, multi-tiered, gas line, water access, recently renovated
8. **The Master Suite** — Bedroom, private deck, Bratislava-inspired bathroom
9. **The Details** — Spanish tile roof, 2-car garage, woodworking shop, smart home
10. **Transition CTA** — "Everything inside has a story too." → link to Estate Sale

*Layout inspiration: alternating image-left/image-right, editorial text blocks, generous whitespace — adapted from Selene template.*

---

## Phase 3 — Gallery Page
**Route:** `/gallery`
**Goal:** Immersive photo experience of the home.

### 3.1 Photo Storage
- Upload all ~36 home photos to Supabase Storage bucket: `home-photos`
- Organize with metadata (room label, caption)

### 3.2 Gallery Grid (`react-photo-album`)
- Masonry layout — varied photo sizes, organic feel
- Small room label beneath each photo (à la Selene template)
- Responsive: 3-col desktop, 2-col tablet, 1-col mobile

### 3.3 Lightbox (`yet-another-react-lightbox`)
- Click any photo to open full-screen
- Caption / room name overlay
- Arrow navigation + keyboard support
- Optional: story captions (longer evocative text per photo)

### 3.4 Video
- Video hosted externally (YouTube unlisted or similar)
- Embedded section below gallery grid with tasteful framing

---

## Phase 4 — Data Seeding (Estate Sale)
**Goal:** Get all 75 products into Supabase with photos accessible.

### 4.1 Enrich CSV Data
- Parse brand from item names → `brand` field
- Assign category to each item → `category` field
  - Categories: Lamp, Bed, Sofa, Chair, Coffee Table, Dining Table, Side Table, Dresser, Nightstand, Bookcase, Mirror, Rug, Ottoman, Stool, Plant, Crib, Mattress, Credenza, Storage, Outdoor, Tray, Other
- Clean up `sale_price` / `retail_price` (remove `$` and `,`)
- Handle TBD / N/A values

### 4.2 Upload Estate Sale Photos
- Source: `~/Library/CloudStorage/GoogleDrive-.../2026.02 - 230 S Canby - Estate Sale/`
- Upload to Supabase Storage bucket: `product-photos`
- Naming convention matches CSV: `[Item Name]__[N].jpeg`

### 4.3 Seed Products Table
- Write a seed script (`scripts/seed-products.ts`)
- Run once to populate all 75 items

### 4.4 Seed Product Images Table
- Match uploaded photos to product IDs
- Populate `product_images` table with sort order

---

## Phase 5 — Estate Sale: Listing Page
**Route:** `/estate-sale`
**Goal:** A beautiful, browsable product catalog.

### 5.1 Hero Header
- Large editorial headline: "THE COLLECTION" or "ESTATE SALE"
- One sentence of context copy

### 5.2 Filter Bar
- Filter chips/dropdowns: **Room** | **Brand** | **Category** | **Condition**
- Active filter badges with clear (×)
- Item count: "Showing 48 of 75 items"

### 5.3 Product Grid
- 3-col desktop, 2-col tablet, 1-col mobile
- Each card: main photo, item name, sale price, retail price (struck through), condition badge
- Status badge: Available / Reserved / Sold
- Hover state

### 5.4 Product Card Component (`src/components/estate-sale/ProductCard.tsx`)

### 5.5 Loading & Empty States
- Skeleton loading cards
- "No items match your filters" empty state

---

## Phase 6 — Estate Sale: Product Detail Page
**Route:** `/estate-sale/[id]`
**Goal:** Make someone want to own this piece.

### 6.1 Photo Gallery
- Main photo + thumbnail strip
- Lightbox for full-screen view

### 6.2 Product Info
- Item name (display name)
- Sale price (large) + retail price (small, struck through) + discount badge
- Condition badge
- Room
- Brand + link to retail URL (opens in new tab)
- Description paragraph
- Dimensions table (L × W × H)
- Units available

### 6.3 Reserve Button + Form
- "Reserve This Item" CTA button
- Opens Dialog/sheet with form: Name, Email, Phone, Message (optional)
- On submit: `units_available--`, status → "reserved" if 0 remaining
- Confirmation message: "We'll be in touch to arrange payment and pickup."

### 6.4 Back Navigation
- ← Back to Estate Sale (preserves filter state)

---

## Phase 7 — Contact Page
**Route:** `/contact`
**Goal:** Simple inquiry form for the home itself (not estate sale).

- Headline inspired by Selene: large serif, editorial
- Short paragraph inviting contact
- Form: Name, Email, Inquiry type (Viewing / General / Other), Message
- Submit → email notification to you (via Supabase Edge Function or Resend API)

---

## Phase 8 — Polish & Mobile
**Goal:** Everything looks great on every screen, loads fast.

- [ ] Audit all pages on mobile (375px)
- [ ] Image optimization — Next.js `<Image>` component throughout
- [ ] SEO: meta titles, descriptions, og:image per page
- [ ] Smooth scroll between Story sections
- [ ] Page transitions (subtle fade)
- [ ] Accessibility: focus states, alt text on all images
- [ ] 404 page

---

## Phase 9 — Launch
- [ ] Final review pass
- [ ] Connect custom domain `230SCanby.com` in Vercel
- [ ] DNS propagation check
- [ ] Share URL

---

## Key File Locations
| What | Path |
|---|---|
| Pages | `src/app/` |
| Components | `src/components/` |
| Supabase client | `src/lib/supabase.ts` |
| Types | `src/types/` |
| Seed script | `scripts/seed-products.ts` |
| Docs | `docs/` |
| Photos (home) | Dropbox: `1. Mike/2. Home/230 S Canby/Kindred Photos/` |
| Photos (estate sale) | Google Drive: `1. Facebook Marketplace/2026.02 - 230 S Canby - Estate Sale/` |

---

## Design Reference
- **Inspiration:** Selene template (Squarespace) — see `docs/selene-screenshots/`
- **Our palette:** Warm cream bg, olive/taupe accents, near-black footer
- **Our type:** Display serif (Cormorant) + body sans (Inter)
- **Tone:** See `docs/COPY.md`
