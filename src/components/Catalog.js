import Blits from '@lightningjs/blits'
import Hero from './Hero.js'
import Rail from './Rail.js'
import { MENU } from '../lib/data.js'

// Per-rail vertical step. Card block is ~324px tall, so this leaves a ~56px
// gap between rails. MUST match the `y="$index * 380"` in the template below.
const RAIL_BLOCK = 380

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
      // perf HUD — uses the exact same formulas as the JSTV perf HUD so the
      // two apps can be compared with identical measurements.
      fps: 0,
      frameMs: 0,
      workMs: 0,
    }
  },
  hooks: {
    // Perf HUD, matching JSTV's tick()/updatePerfHud():
    //   frameMs = now - previousNow           (time between frame starts)
    //   workMs  = afterRender - beforeRender   (update + render time)
    //   both smoothed with an EMA (alpha 0.05, ~20-frame window)
    //   fps = 1000 / frameMsAvg
    //   the displayed values are refreshed at most every 250ms
    // `frameTick` fires at the START of every frame (before update/render);
    // a microtask scheduled here runs AFTER that frame's render task, giving
    // us the "after render" timestamp.
    frameTick() {
      const now = performance.now()
      const frameMs = this._prevNow === undefined ? 0 : now - this._prevNow
      this._prevNow = now
      Promise.resolve().then(() => {
        const workMs = performance.now() - now
        const alpha = 0.05
        if (this._perfInit === true) {
          this._frameAvg += (frameMs - this._frameAvg) * alpha
          this._workAvg += (workMs - this._workAvg) * alpha
        } else {
          // first frame: seed the averages, skip EMA
          this._frameAvg = frameMs
          this._workAvg = workMs
          this._perfInit = true
        }
        // HUD refresh gate: only rewrite the displayed values every 250ms
        // (the EMA above still accumulates every frame).
        const ts = performance.now()
        if (this._lastHud === undefined || ts - this._lastHud >= 250) {
          this._lastHud = ts
          this.fps = this._frameAvg > 0 ? Math.round(1000 / this._frameAvg) : 0
          this.frameMs = Math.round(this._frameAvg * 10) / 10
          this.workMs = Math.round(this._workAvg * 10) / 10
        }
      })
    },
  },
  computed: {
    totalRows() {
      return 2 + this.rails.length
    },
    // Vertical scroll of the hero + rails container.
    contentY() {
      if (this.row <= 1) return 0
      return -Math.max(0, (this.row - 2) * RAIL_BLOCK)
    },
    fpsText() {
      return `${this.fps} FPS`
    },
    fpsColor() {
      if (this.fps >= 50) return '#6fcf97'
      if (this.fps >= 30) return '#f2c94c'
      return '#eb5757'
    },
    frameText() {
      return `frame ${this.frameMs} ms`
    },
    workText() {
      return `work ${this.workMs} ms`
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
            :for="(rail, index) in $rails"
            key="$rail.id"
            y="$index * 380"
            label="$rail.label"
            items="$rail.items"
            :active="$row - 2 === $index"
            :cursor="$railCursors[$index]"
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

      <!-- perf HUD: FPS + frame ms + work ms (same measurements as JSTV) -->
      <Element x="1600" y="26" w="296" h="150" color="#000000cc">
        <Text x="22" y="16" :content="$fpsText" size="30" :color="$fpsColor" />
        <Text x="22" y="66" :content="$frameText" size="22" color="#b0b0be" />
        <Text x="22" y="102" :content="$workText" size="22" color="#b0b0be" />
      </Element>
    </Element>
  `,
})
