# Seldovia.com — front-end prototype

A high-fidelity, responsive, **multi-page** front-end prototype for **Seldovia.com** — a warm,
community-first guide to Seldovia, Alaska, on Kachemak Bay. Real estate (Seldovia Property,
Jenny Chissus, Broker/Owner) is woven in as a trusted section, present but never dominant.

This is the **design direction + working front-end**. Live MLS listings, the calendar backend,
the directory database, and forms are mocked with clearly-labeled sample data and connect to real
services in production.

## Pages

| File | Page |
|------|------|
| `index.html` | Home — hero, categories, how-it-works, testimonials, sponsors |
| `explore.html` | Explore / directory of popular places (filterable) |
| `calendar.html` | Community calendar — scrollable agenda + month view |
| `gazette.html` | The Gazette — community news/blog |
| `gallery.html` | Photo gallery |
| `real-estate.html` | Featured listings, buyer/seller info, Meet Jenny |
| `phone-book.html` | Searchable business directory |
| `bulletin.html` | Community bulletin board |
| `contact.html` | Contact form + brokerage details |

## Structure

- `styles.css` — single design system (Jenny's brand palette, light + dark themes).
- `app.js` — shared script included on every page. Injects the header/footer/nav, then renders
  whichever content containers exist on the current page. All mock data lives here in one place.
- `images/` — real Seldovia photos (harbor hero, Jenny) + Seldovia Property branding.

The shared header/footer are injected by `app.js` to keep the prototype DRY. In production these
become server/template includes or framework components.

## Brand system

| Token | Hex | Use |
|-------|-----|-----|
| Champagne Pink | `#F8E6DD` | soft section tints |
| White | `#FFFFFF` | page ground |
| Seal Brown | `#663015` | dark bands, footer, grounding |
| Artichoke Sage | `#989572` | muted meta, "open" badges |
| Barbie Pink | `#DF1284` | accent — buttons, links, active states (used sparingly) |
| Near-black | `#13020B` | headings / high-contrast text |

## Production integration points (marked `PROD:` in code)

- **Real Estate** → live listings via **Alaska MLS (IDX)**. Alaska is a non-disclosure state, so
  public prices show as "Price on request."
- **Calendar** → swap the `EVENTS` array for the real feed.
- **Phone Book** → connect the `DIRECTORY` array to the community database.
- **Gallery / cards** → replace lightweight SVG placeholders with optimized, lazy-loaded photos.
- **Forms** → wire to email/CRM.

## Deploy (GitHub Pages)

This repo is a static site — enable **Settings → Pages → Deploy from branch → `main` / root**.
`.nojekyll` is included so Pages serves files as-is.

---

Prototype for Think First Studios · client: Seldovia Property.
