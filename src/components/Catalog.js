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
      // stats
      fps: 0,
      workMs: 0,
      active: true,
    }
  },
  hooks: {
    // Lightning only renders when the scene changes. When idle it runs a
    // self-paced housekeeping loop whose timing is jittery, so we must NOT
    // report that as FPS or work. `idle(true)` fires on going idle,
    // `idle(false)` on becoming active again.
    idle(isIdle) {
      this.active = !isIdle
      if (isIdle) {
        // Nothing is being rendered -> no work is being done.
        this.workMs = 0
        this._wAcc = 0
        this._wFrames = 0
      }
    },
    // Accumulate real main-thread work per frame: the time from the start of a
    // frame (frameTick, emitted before updates/render) until that frame's
    // render task finishes, captured in a microtask that runs after the task.
    frameTick() {
      const t0 = performance.now()
      Promise.resolve().then(() => {
        this._wAcc = (this._wAcc || 0) + (performance.now() - t0)
        this._wFrames = (this._wFrames || 0) + 1
      })
    },
    // Roll up both stats once per FPS window (~500ms) so the readout is stable.
    // FPS comes straight from the renderer; work is the averaged per-frame
    // main-thread time, lightly smoothed to remove frame-to-frame jitter.
    fpsUpdate(fps) {
      if (!this.active) return // ignore idle-loop samples
      this.fps = fps
      const avg = this._wFrames ? this._wAcc / this._wFrames : 0
      this._wAcc = 0
      this._wFrames = 0
      // exponential smoothing (70% previous, 30% new)
      this.workMs = Math.round((this.workMs * 0.7 + avg * 0.3) * 100) / 100
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
      return `FPS  ${this.fps}`
    },
    fpsColor() {
      if (this.fps >= 50) return '#6fcf97'
      if (this.fps >= 30) return '#f2c94c'
      return '#eb5757'
    },
    msText() {
      return `${this.workMs} ms work${this.active ? '' : ' · idle'}`
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

      <!-- minimal stats overlay: FPS + frame time -->
      <Element x="1620" y="26" w="276" h="104" color="#000000cc">
        <Text x="22" y="18" :content="$fpsText" size="32" :color="$fpsColor" />
        <Text x="22" y="64" :content="$msText" size="22" color="#b0b0be" />
      </Element>
    </Element>
  `,
})
