import Blits from '@lightningjs/blits'

const SLIDE_STEP = 1800 // slide width (1760) + gap (40)

/**
 * The hero carousel shown at the top of every page.
 *
 * Renders all slides in a horizontal strip and slides between them based on
 * the `cursor` prop. Page dots at the bottom reflect the current slide.
 */
export default Blits.Component('Hero', {
  props: ['slides', 'active', { key: 'cursor', default: 0 }],
  template: `
    <Element w="1920" h="460">
      <Element :x.transition="{value: 80 - $cursor * 1800, duration: 350, easing: 'ease-in-out'}">
        <Element
          :for="(slide, index) in $slides"
          key="$slide.id"
          x="$index * 1800"
          w="1760" h="420"
          color="$slide.color"
        >
          <Text x="60" y="110" content="$slide.title" size="64" color="#ffffff" />
          <Text x="60" y="205" content="$slide.subtitle" size="28" color="#c8c8d4" />
          <Element x="60" y="300" w="200" h="60" :color="$active ? '#ffffff' : '#ffffff55'">
            <Text x="70" y="15" content="Play" size="28" color="#101018" />
          </Element>
        </Element>
      </Element>

      <!-- pagination dots -->
      <Element x="80" y="436">
        <Element
          :for="(slide, index) in $slides"
          key="$slide.id"
          x="$index * 28"
          w="18" h="18"
          :color="$index === $cursor ? '#ffffff' : '#ffffff40'"
        />
      </Element>
    </Element>
  `,
})
