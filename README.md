# Basic Carousel App (LightningJS / Blits)

A small [Blits](https://lightningjs.io/) (LightningJS 3) TV-style app with three
pages — **Home**, **Movies** and **Shows** — each showing a **hero carousel**
and **10 rails of 15 cards**.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed URL (defaults to http://localhost:8080).

## Scripts

| Script            | Description                        |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Start the Vite dev server          |
| `npm run build`   | Build a production bundle to `dist/` |
| `npm run preview` | Preview the production build       |

## Controls

TV apps are driven by a remote / arrow keys:

- **Arrow keys** — move focus (menu ↔ hero ↔ rails, and left/right within a row)
- **Enter** — on the top menu, navigate to the selected page
- **Backspace** — jump focus back to the top menu

Focus starts on the hero carousel. Press **Up** to reach the menu, **Down** to
move into the rails.

## Project structure

```
src/
  index.js              # Blits.Launch entry point
  App.js                # Application shell + router (routes -> pages)
  lib/
    data.js             # Mock hero/rails/cards data generator + menu
  pages/
    Home.js             # Route pages — each loads its data and renders Catalog
    Movies.js
    Shows.js
  components/
    Catalog.js          # Shared page layout + all focus / key handling
    Hero.js             # Hero carousel (sliding strip of slides + dots)
    Rail.js             # A horizontal row of cards with its own scroll
    Card.js             # A single poster card
```

### How it fits together

- `App.js` registers three routes, one per page. Blits' `RouterView` mounts the
  matching page and hands it focus.
- Each **page** is a thin wrapper that loads its data via `getPageData()` and
  delegates focus to a shared **`Catalog`** component.
- **`Catalog`** owns the whole screen and all navigation. It tracks a single
  `row` index (0 = menu, 1 = hero, 2+ = rails) plus per-row cursors, and scrolls
  the content vertically as focus moves down.
- **`Hero`**, **`Rail`** and **`Card`** are presentational: they receive their
  data and an `active` / `cursor` / `focused` flag and animate accordingly.

The data is mock content generated deterministically in `src/lib/data.js` — no
backend is involved.
