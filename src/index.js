import Blits from '@lightningjs/blits'
import App from './App.js'

Blits.Launch(App, 'app', {
  w: 1920,
  h: 1080,
  debugLevel: 1,
  // Emit an FPS sample twice a second (used by the stats overlay).
  fpsInterval: 500,
  // TV remote D-pad support. Arrow keys + Enter already map by default (both
  // by key name and keyCode 37-40/13, which most TV D-pads send). These add
  // the platform-specific "Back"/"Return" buttons so the app is TV-ready.
  keymap: {
    10009: 'back', // Tizen (Samsung) RETURN
    461: 'back', // webOS (LG) BACK
    GoBack: 'back',
    BrowserBack: 'back',
    XF86Back: 'back',
  },
})
