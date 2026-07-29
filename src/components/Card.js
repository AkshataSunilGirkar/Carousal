import Blits from '@lightningjs/blits'

/**
 * A single poster card.
 *
 * Purely presentational: it renders a coloured tile, a rating badge and a
 * title, and reacts to the `focused` prop by lifting a white border ring and
 * removing the dimming overlay.
 */
export default Blits.Component('Card', {
  props: ['item', 'focused'],
  template: `
    <Element w="200" h="280">
      <!-- focus ring -->
      <Element
        x="-4" y="-4" w="208" h="288" color="#ffffff"
        :alpha.transition="{value: $focused ? 1 : 0, duration: 150}"
      />
      <!-- poster face -->
      <Element w="200" h="280" color="$item.color" />
      <!-- dim overlay when not focused -->
      <Element
        w="200" h="280" color="#000000"
        :alpha.transition="{value: $focused ? 0 : 0.45, duration: 150}"
      />
      <!-- rating badge -->
      <Element x="146" y="12" w="46" h="26" color="#000000b0">
        <Text x="8" y="3" content="$item.badge" size="16" color="#ffffff" />
      </Element>
      <!-- title -->
      <Text x="12" y="240" w="176" content="$item.title" size="20" color="#ffffff" />
    </Element>
  `,
})
