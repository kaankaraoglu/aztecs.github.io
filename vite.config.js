import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    ViteImageOptimizer({
      png: { quality: 80 },
      jpeg: { quality: 80 },
      jpg: { quality: 80 },
      webp: { quality: 82 },
    }),
    // Opt-in only (`npm run build:analyze`). Writing into dist/ meant the
    // ~900 KB module map was swept into the gh-pages deploy and served publicly.
    process.env.ANALYZE &&
      visualizer({
        filename: 'stats.html',
        gzipSize: true,
        brotliSize: true,
      }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Firebase only. Chunking reka-ui / @lucide / @vueuse by hand merged
        // route-only UI code into chunks the entry statically depends on, so
        // Vite preloaded them on first paint; leaving them to Rollup lets each
        // lazy route pull only what it actually imports.
        manualChunks(id) {
          if (id.includes('node_modules/firebase/') || id.includes('node_modules/@firebase/')) {
            return 'firebase'
          }
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test/setup.js'],
    exclude: ['**/node_modules/**', '**/dist/**', '.claude/**'],
  },
})
