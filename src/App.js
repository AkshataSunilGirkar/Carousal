import Blits from '@lightningjs/blits'
import Home from './pages/Home.js'
import Movies from './pages/Movies.js'
import Shows from './pages/Shows.js'

export default Blits.Application({
  template: `
    <Element w="1920" h="1080" color="#000000">
      <RouterView w="1920" h="1080" />
    </Element>
  `,
  routes: [
    { path: '/', component: Home },
    { path: '/movies', component: Movies },
    { path: '/shows', component: Shows },
  ],
})
