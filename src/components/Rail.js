import Blits from '@lightningjs/blits'
import Card from './Card.js'

const STEP = 220 // card width (200) + gap (20)
const LEFT = 80 // left margin of the rail
const VIEWPORT = 1920 - LEFT - 40 // usable horizontal space

/**
 * A horizontal row ("rail") of cards with a label.
 *
 * Owns its own horizontal scroll offset, derived from the `cursor` prop
 * (the index of the focused card). It only highlights a card when the rail
 * itself is `active`.
 */
export default Blits.Component('Rail', {
  components: { Card },
  props: ['label', 'items', 'active', { key: 'cursor', default: 0 }],
  computed: {
    // How far to slide the card strip so the focused card stays in view.
    scroll() {
      const maxScroll = Math.max(0, this.items.length * STEP - VIEWPORT)
      const target = Math.max(0, (this.cursor - 1) * STEP)
      return Math.min(target, maxScroll)
    },
  },
  template: `
    <Element w="1920" h="330">
      <Text
        x="80" y="0" content="$label" size="26"
        :color="$active ? '#ffffff' : '#b0b0be'"
      />
      <Element :x.transition="{value: 80 - $scroll, duration: 250, easing: 'ease-out'}" y="44">
        <Card
          :for="(item, index) in $items"
          key="$item.id"
          x="$index * 220"
          item="$item"
          :focused="$active && $index === $cursor"
        />
      </Element>
    </Element>
  `,
})
