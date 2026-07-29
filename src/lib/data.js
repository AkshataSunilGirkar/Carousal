/**
 * Mock content generator.
 *
 * Produces the data for a single "catalog" page: a set of hero-carousel
 * slides plus a list of rails, where every rail holds a number of cards.
 * Everything is generated deterministically from the page id so the UI is
 * stable between reloads (no real backend involved).
 */

const CARD_COLORS = [
  '#4361ee',
  '#7209b7',
  '#f72585',
  '#3a0ca3',
  '#4cc9f0',
  '#06d6a0',
  '#ef476f',
  '#ffd166',
  '#118ab2',
  '#e76f51',
  '#8338ec',
  '#fb5607',
]

const HERO_COLORS = ['#1b263b', '#2b2d42', '#3d0e61', '#0b3d2e', '#5c1a1b']

const PAGES = {
  home: {
    title: 'Home',
    genres: ['Trending Now', 'Popular', 'New Releases', 'Because You Watched', 'Top Picks'],
    prefix: 'Featured',
  },
  movies: {
    title: 'Movies',
    genres: ['Action', 'Comedy', 'Drama', 'Sci-Fi', 'Thriller', 'Animation'],
    prefix: 'Film',
  },
  shows: {
    title: 'Shows',
    genres: ['Binge-worthy', 'Reality', 'Documentaries', 'Sitcoms', 'Crime', 'Kids'],
    prefix: 'Series',
  },
}

const RAILS_PER_PAGE = 10
const CARDS_PER_RAIL = 15
const HERO_SLIDES = 5

const pick = (list, i) => list[i % list.length]

const buildHero = (pageId, meta) =>
  Array.from({ length: HERO_SLIDES }, (_, i) => ({
    id: `${pageId}-hero-${i}`,
    title: `${meta.prefix} Spotlight ${i + 1}`,
    subtitle: `${meta.title} · Editor's pick for tonight`,
    color: pick(HERO_COLORS, i),
  }))

const buildRails = (pageId, meta) =>
  Array.from({ length: RAILS_PER_PAGE }, (_, r) => ({
    id: `${pageId}-rail-${r}`,
    label: pick(meta.genres, r) + (r >= meta.genres.length ? ` ${Math.floor(r / meta.genres.length) + 1}` : ''),
    items: Array.from({ length: CARDS_PER_RAIL }, (_, c) => ({
      id: `${pageId}-${r}-${c}`,
      title: `${meta.prefix} ${r + 1}-${c + 1}`,
      color: pick(CARD_COLORS, r * 3 + c),
      badge: `${(((r + c) % 5) + 6).toString()}.${((r * c) % 10)}`,
    })),
  }))

/**
 * @param {'home'|'movies'|'shows'} pageId
 * @returns {{ title: string, hero: Array, rails: Array }}
 */
export const getPageData = (pageId) => {
  const meta = PAGES[pageId] || PAGES.home
  return {
    title: meta.title,
    hero: buildHero(pageId, meta),
    rails: buildRails(pageId, meta),
  }
}

/** Top navigation menu shared across every page. */
export const MENU = [
  { label: 'Home', path: '/', page: 'home' },
  { label: 'Movies', path: '/movies', page: 'movies' },
  { label: 'Shows', path: '/shows', page: 'shows' },
]
