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
    visualizer({
      filename: 'dist/stats.html',
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
        manualChunks(id) {
          if (id.includes('node_modules/firebase/') || id.includes('node_modules/@firebase/')) {
            return 'firebase'
          }
          if (id.includes('node_modules/reka-ui/')) {
            return 'reka-ui'
          }
          if (id.includes('node_modules/@vueuse/')) {
            return 'vueuse'
          }
          if (id.includes('node_modules/@lucide/')) {
            return 'lucide'
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
