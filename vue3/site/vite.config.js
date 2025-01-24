import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@supermapgis/vue-iclient-mapboxgl': fileURLToPath(
        new URL('../packages/mapboxgl/components', import.meta.url)
      )
      // node_modules: fileURLToPath(new URL('../node_modules', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler', // 或 "modern"，"legacy"
        importers: [
          // ...
        ]
      }
    }
  },
  build: {
    rollupOptions: {
      // https://rollupjs.org/configuration-options/
    }
  }
})
