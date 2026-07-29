import Blits from '@lightningjs/blits'
import Catalog from '../components/Catalog.js'
import { getPageData } from '../lib/data.js'

const data = getPageData('movies')

export default Blits.Component('MoviesPage', {
  components: { Catalog },
  template: `
    <Element w="1920" h="1080">
      <Catalog ref="catalog" page="movies" title="$title" hero="$hero" rails="$rails" />
    </Element>
  `,
  state() {
    return { title: data.title, hero: data.hero, rails: data.rails }
  },
  hooks: {
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
