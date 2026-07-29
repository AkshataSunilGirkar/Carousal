import Blits from '@lightningjs/blits'
import Card from './Card.js'

const STEP = 220 // card width (200) + gap (20)
const LEFT = 80 // left margin / the fixed focus slot

/**
 * A horizontal row ("rail") of cards with a label.
 *
 * Uses a STATIONARY focus model: the focus frame stays fixed over the first
 * card slot and the card strip slides underneath it, so the focused card
 * (index === `cursor`) always sits inside the frame. The frame is only shown
 * while the rail is `active`.
 */
export default Blits.Component('Rail', {
  components: { Card },
  props: ['label', 'items', 'active', { key: 'cursor', default: 0 }],
  template: `
    <Element w="1920" h="330">
      <Text
        x="80" y="4" content="$label" size="26"
        :color="$active ? '#ffffff' : '#b0b0be'"
      />

      <!-- clipped viewport: the card strip slides so the focused card lands
           at local x=0 (the fixed frame), cards to its left are clipped away -->
      <Element x="80" y="44" w="1760" h="280" clipping="true">
        <Element :x.transition="{value: 0 - $cursor * 220, duration: 250, easing: 'ease-out'}">
          <Card
            :for="(item, index) in $items"
            key="$item.id"
            x="$index * 220"
            item="$item"
            :focused="$active && $index === $cursor"
          />
        </Element>
      </Element>

      <!-- stationary focus frame over the first slot (only when active) -->
      <Element :alpha.transition="{value: $active ? 1 : 0, duration: 150}">
        <Element x="76" y="40" w="208" h="4" color="#ffffff" />
        <Element x="76" y="320" w="208" h="4" color="#ffffff" />
        <Element x="76" y="40" w="4" h="288" color="#ffffff" />
        <Element x="280" y="40" w="4" h="288" color="#ffffff" />
      </Element>
    </Element>
  `,
})
