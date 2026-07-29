import Blits from '@lightningjs/blits'
import Hero from './Hero.js'
import Rail from './Rail.js'
import { MENU } from '../lib/data.js'

const HERO_BLOCK = 500 // hero height (460) + gap
const RAIL_BLOCK = 330 // per-rail vertical step
const CONTENT_TOP = 150 // y offset below the fixed top menu

/**
 * The shared page layout: a fixed top menu, a hero carousel and a vertical
 * list of rails. Owns ALL focus / key handling for a page.
 *
 * Focus model — a single `row` index:
 *   row 0        -> top menu
 *   row 1        -> hero carousel
 *   row 2 .. N   -> rail (rail index = row - 2)
 */
export default Blits.Component('Catalog', {
  components: { Hero, Rail },
  props: ['title', 'hero', 'rails', 'page'],
  state() {
    return {
      menu: MENU,
      row: 1, // start focused on the hero
      menuIndex: Math.max(
        0,
        MENU.findIndex((m) => m.page === this.page)
      ),
      heroCursor: 0,
      // NB: Blits calls state() once at setup time with no props (to discover
      // the state keys), so guard against `rails` being undefined here.
      railCursors: (this.rails || []).map(() => 0),
    }
  },
  computed: {
    totalRows() {
      return 2 + this.rails.length
    },
    // Vertical scroll of the hero + rails container.
    contentY() {
      if (this.row <= 1) return 0
      const railIndex = this.row - 2
      return -Math.max(0, railIndex * RAIL_BLOCK)
    },
    // Merge focus state into each rail for the template.
    railViews() {
      const activeRail = this.row - 2
      return this.rails.map((rail, i) => ({
        id: rail.id,
        label: rail.label,
        items: rail.items,
        active: i === activeRail,
        cursor: this.railCursors[i],
      }))
    },
  },
  methods: {
    setRailCursor(i, value) {
      this.railCursors = this.railCursors.map((c, idx) => (idx === i ? value : c))
    },
  },
  input: {
    up() {
      if (this.row > 0) this.row = this.row - 1
    },
    down() {
      if (this.row < this.totalRows - 1) this.row = this.row + 1
    },
    left() {
      if (this.row === 0) {
        if (this.menuIndex > 0) this.menuIndex = this.menuIndex - 1
      } else if (this.row === 1) {
        if (this.heroCursor > 0) this.heroCursor = this.heroCursor - 1
      } else {
        const i = this.row - 2
        if (this.railCursors[i] > 0) this.setRailCursor(i, this.railCursors[i] - 1)
      }
    },
    right() {
      if (this.row === 0) {
        if (this.menuIndex < this.menu.length - 1) this.menuIndex = this.menuIndex + 1
      } else if (this.row === 1) {
        if (this.heroCursor < this.hero.length - 1) this.heroCursor = this.heroCursor + 1
      } else {
        const i = this.row - 2
        if (this.railCursors[i] < this.rails[i].items.length - 1) {
          this.setRailCursor(i, this.railCursors[i] + 1)
        }
      }
    },
    enter() {
      if (this.row === 0) {
        const target = this.menu[this.menuIndex]
        if (target && target.page !== this.page) {
          this.$router.to(target.path)
        }
      }
    },
    back() {
      if (this.row > 0) this.row = 0
    },
  },
  template: `
    <Element w="1920" h="1080" color="#0a0a0f">
      <!-- scrolling content: hero + rails -->
      <Element :y.transition="{value: 150 + $contentY, duration: 300, easing: 'ease-out'}">
        <Hero slides="$hero" :cursor="$heroCursor" :active="$row === 1" />
        <Element y="500">
          <Rail
            :for="(rail, index) in $railViews"
            key="$rail.id"
            y="$index * 330"
            label="$rail.label"
            items="$rail.items"
            :active="$rail.active"
            :cursor="$rail.cursor"
          />
        </Element>
      </Element>

      <!-- fixed top menu -->
      <Element w="1920" h="120" color="#0a0a0ff2">
        <Text x="80" y="42" content="$title" size="30" color="#6f6f82" />
        <Element x="360" y="42">
          <Element :for="(m, index) in $menu" key="$m.path" x="$index * 170">
            <Text
              content="$m.label"
              size="30"
              :color="($row === 0 && $index === $menuIndex) ? '#ffffff' : ($m.page === $page ? '#c0c0ff' : '#8a8a9a')"
            />
            <Element
              y="42" w="90" h="4"
              :color="($row === 0 && $index === $menuIndex) ? '#ffffff' : ($m.page === $page ? '#5b5bff' : '#00000000')"
            />
          </Element>
        </Element>
      </Element>
    </Element>
  `,
})
