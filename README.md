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

TV apps are driven by a remote D-pad / arrow keys:

- **D-pad / Arrow keys** — move focus (menu ↔ hero ↔ rails, and left/right within a row)
- **Enter / OK** — on the top menu, navigate to the selected page
- **Back / Return** — jump focus back to the top menu (Backspace on a keyboard;
  the Samsung `10009` and LG webOS `461` remote keys are also mapped, see
  `keymap` in [src/index.js](src/index.js))

Focus starts on the hero carousel. Press **Up** to reach the menu, **Down** to
move into the rails.

### Stationary focus

The rails use a **stationary focus** model common on TVs: the white focus frame
stays fixed over the first card slot and the cards slide underneath it, so the
focused card is always framed in the same place. The frame only appears on the
active rail.

### Stats overlay

A live overlay in the top-right corner shows three numbers, using the **exact
same formulas as the JSTV perf HUD** so measurements are directly comparable
between the two apps:

- **FPS** = `1000 / frameMsAvg` (colour-coded: green ≥ 50, amber ≥ 30, red below).
- **frame ms** = time between the start of consecutive frames (`now − prevNow`),
  smoothed with an EMA.
- **work ms** = main-thread time spent on update + render each frame
  (`afterRender − beforeRender`), smoothed with an EMA.

Both raw samples are smoothed with an exponential moving average
(`avg += (sample − avg) × α`, `α = 0.05`, ≈ 20-frame window). The samples are
collected every frame via the `frameTick` hook (the "after render" timestamp is
taken in a microtask that runs once the frame's render task completes), while
the displayed values are refreshed at most every 250 ms.

> Note: Lightning renders on-change, so when the app is idle `frame ms` reflects
> the renderer's idle-loop cadence rather than a 60 fps draw loop — expected for
> a render-on-change engine. During activity (scrolling/animation) the numbers
> line up with a continuously-rendering app. `work ms` is CPU/main-thread only;
> GPU execution time isn't included.

## Deploying to GitHub Pages

A 404 for `…github.io/src/index.js` means the **source** was published instead
of the built app — i.e. Pages is serving the repo root's dev `index.html`
(which references `/src/index.js`). GitHub Pages must serve the production
build (`dist/`), whose `index.html` loads hashed, relative assets (`./assets/…`).

**Do not** push `dist/` to your `main` branch root — that mixes build output
with source and won't fix the setting. Use one of these instead.

### Option A — GitHub Actions (recommended)

This repo includes [.github/workflows/deploy.yml](.github/workflows/deploy.yml),
which builds and publishes `dist/` on every push. Enable it once:

1. Commit everything (including `package-lock.json`) and push to `main`/`master`.
2. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

> If Pages is still set to *"Deploy from a branch → main → / (root)"*, that is
> exactly what produces the `/src/index.js` 404 — switch the Source to
> **GitHub Actions**.

### Option B — manual publish of `dist/`

Publishes only the built files to a separate `gh-pages` branch:

```bash
npm run deploy
```

Then set **Settings → Pages → Source: Deploy from a branch → `gh-pages` → `/ (root)`**.

Either way: routing uses the URL hash (`#/movies`), so deep links and refreshes
work on static hosting without server rewrites, and `base: './'` in
[vite.config.js](vite.config.js) keeps asset paths relative so it works under
the `username.github.io/<repo>/` sub-path.

## Running on a TV

The build in `dist/` is a plain static bundle and runs in a TV browser. To
sideload onto a device, package `dist/` as the app root:

- **LG webOS** — an `.ipk` via the `ares-*` CLI
- **Samsung Tizen** — a `.wgt` via the Tizen Studio CLI

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
