import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

const relativePath = path => {
  return fileURLToPath(new URL(path, import.meta.url))
}

export default defineConfig({
  define: {
    global: 'window'
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@supermapgis/mapboxgl': fileURLToPath(new URL('./packages/mapboxgl', import.meta.url)),
      '@supermapgis/common': fileURLToPath(new URL('./packages/common', import.meta.url)),
      'vue-iclient-core': fileURLToPath(new URL('../core', import.meta.url)),
      'vue-iclient-static': fileURLToPath(new URL('../core', import.meta.url))
    }
  },
  optimizeDeps: {
    include: [
      'vue-iclient-static/libs/iclient-common/iclient-common',
      'vue-iclient-static/libs/mapboxgl/mapbox-gl-enhance',
      'vue-iclient-static/libs/echarts-layer/EchartsLayer',
      'vue-iclient-static/libs/mapbox-gl-draw/mapbox-gl-draw'
    ]
  },
  build: {
    commonjsOptions: {
      include: [
        'vue-iclient-static/libs/iclient-common/iclient-common',
        'vue-iclient-static/libs/mapboxgl/mapbox-gl-enhance',
        'vue-iclient-static/libs/echarts-layer/EchartsLayer',
        'vue-iclient-static/libs/mapbox-gl-draw/mapbox-gl-draw'
      ]
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [relativePath('./tests/unit/setup.ts')],
    include: ['**/*.spec.[jt]s?(x)'],
    coverage: {
      all: true,
      reportsDirectory: relativePath('./tests/unit/coverage'),
      reporter: ['clover', 'json', 'lcov', 'text'],
      extension: ['.js', '.jsx', '.ts', 'tsx', '.vue'],
      include: ['packages/mapboxgl/!(theme-chalk)/**/*.{js,ts,tsx,vue}']
    },
    reporters: ['default', 'vitest-sonar-reporter'],
    outputFile: relativePath('./tests/unit/report/test-reporter.xml'),
    sonarReporterOptions: { silent: true },
    typecheck: {
      tsconfig: relativePath('./tsconfig.vitest.json')
    }
  }
})
