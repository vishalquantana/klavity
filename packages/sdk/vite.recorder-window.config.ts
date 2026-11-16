import { defineConfig } from 'vite'
import { resolve } from 'path'

// The "Record me" recorder WINDOW (served at /recorder-window, script at /recorder-window.js). Separate IIFE
// so the widget bundle doesn't grow; it reuses the same @klavity/core recorder engine.
// Run with: npx vite build --config vite.recorder-window.config.ts
export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/recorder-window.ts'),
      name: 'KlavityRecorderWindow',
      formats: ['iife'],
      fileName: () => 'klavity-recorder-window.iife.js',
    },
  },
})
