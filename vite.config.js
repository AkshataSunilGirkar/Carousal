import { defineConfig } from 'vite'
import blits from '@lightningjs/blits/vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [blits],
  server: {
    port: 8080,
    open: false,
  },
})
