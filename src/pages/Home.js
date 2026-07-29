import Blits from '@lightningjs/blits'
import Catalog from '../components/Catalog.js'
import { getPageData } from '../lib/data.js'

const data = getPageData('home')

export default Blits.Component('HomePage', {
  components: { Catalog },
  template: `
    <Element w="1920" h="1080">
      <Catalog ref="catalog" page="home" title="$title" hero="$hero" rails="$rails" />
    </Element>
  `,
  state() {
    return { title: data.title, hero: data.hero, rails: data.rails }
  },
  hooks: {
    // Hand focus down to the Catalog, both on first mount and whenever the
    // router hands focus back to this page.
    ready() {
      const catalog = this.$select('catalog')
      if (catalog) catalog.$focus()
    },
    focus() {
      const catalog = this.$select('catalog')
      if (catalog) catalog.$focus()
    },
  },
})
