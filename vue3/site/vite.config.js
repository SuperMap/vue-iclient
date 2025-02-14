import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  define: {
    global: 'window'
  },
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@supermapgis/mapboxgl/theme-chalk': fileURLToPath(
        new URL('../packages/mapboxgl/theme-chalk', import.meta.url)
      ),
      '@supermapgis/mapboxgl/utils': fileURLToPath(
        new URL('../packages/mapboxgl/utils', import.meta.url)
      ),
      '@supermapgis/common/utils': fileURLToPath(
        new URL('../packages/common/utils', import.meta.url)
      ),
      '@supermapgis/common/theme-chalk': fileURLToPath(
        new URL('../packages/common/theme-chalk', import.meta.url)
      ),
      'vue-iclient-core': fileURLToPath(
        new URL('../../core', import.meta.url)
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
  optimizeDeps: {
    include: [
      'vue-iclient-core/libs/iclient-common/iclient-common',
      'vue-iclient-core/libs/mapboxgl/mapbox-gl-enhance',
      'vue-iclient-core/libs/echarts-layer/EchartsLayer'
    ]
  },
  build: {
    commonjsOptions: {
      include: [
        'vue-iclient-core/libs/iclient-common/iclient-common',
        'vue-iclient-core/libs/mapboxgl/mapbox-gl-enhance',
        'vue-iclient-core/libs/echarts-layer/EchartsLayer'
      ]
    },
    rollupOptions: {
      // https://rollupjs.org/configuration-options/
    }
  }
})
