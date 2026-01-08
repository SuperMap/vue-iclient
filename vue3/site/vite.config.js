import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  define: {
    global: 'window'
  },
  plugins: [vue(), vueJsx(), vueDevTools()],

  resolve: {
    alias: {
      '@supermapgis/mapboxgl': fileURLToPath(new URL('../packages/mapboxgl', import.meta.url)),
      '@supermapgis/common': fileURLToPath(new URL('../packages/common', import.meta.url)),
      'vue-iclient-core': fileURLToPath(new URL('../../core', import.meta.url)),
      'vue-iclient-static': fileURLToPath(new URL('../../static', import.meta.url)),
      'vue-iclient-controllers-mapboxgl': fileURLToPath(new URL('../../controllers/mapboxgl', import.meta.url)),
      // static/libs/EchartsLayer.js  require('echarts) 找不到echarts
      'echarts': fileURLToPath(new URL('../node_modules/echarts', import.meta.url)),
      'mapbox-gl': fileURLToPath(new URL('../../static/libs/mapboxgl/mapbox-gl-enhance', import.meta.url)),
      // node_modules: fileURLToPath(new URL('../node_modules', import.meta.url))
    }
  },
  server: {
    fs: {
      allow: [
        // 添加包含字体文件的目录
        fileURLToPath(new URL('../../static/assets/iconfont', import.meta.url)),
        fileURLToPath(new URL('../', import.meta.url))
      ]
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
      'vue-iclient-static/libs/mapboxgl/mapbox-gl-enhance',
      'vue-iclient-static/libs/echarts-layer/EchartsLayer',
      'vue-iclient-static/libs/mapbox-gl-draw/mapbox-gl-draw',
      'mapbox-gl'
    ]
  },
  build: {
    commonjsOptions: {
      include: [
        'vue-iclient-static/libs/mapboxgl/mapbox-gl-enhance',
        'vue-iclient-static/libs/echarts-layer/EchartsLayer',
        'vue-iclient-static/libs/mapbox-gl-draw/mapbox-gl-draw',
        'mapbox-gl'
      ]
    },
    rollupOptions: {
      // https://rollupjs.org/configuration-options/
    }
  }
})
