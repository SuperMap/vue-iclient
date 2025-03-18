import path from 'path'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { rollup } from 'rollup'
import replace from '@rollup/plugin-replace'
import commonjs from '@rollup/plugin-commonjs'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import esbuild, { minify as minifyPlugin } from 'rollup-plugin-esbuild'
import { series } from 'gulp'
import {
  getPKG_BRAND_NAME,
  getEpOutput,
  getPkgRoot,
  getPkgByCommand,
  getLocaleRoot
} from '@supermapgis/build-utils'
import { camelCase, upperFirst } from 'lodash-es'
import glob from 'fast-glob'
import { Alias } from '../plugins/alias'
import { formatBundleFilename, generateExternal, withTaskName, writeBundles } from '../utils'
import { target } from '../build-info'
import type { TaskFunction } from 'gulp'
import type { Plugin } from 'rollup'

async function buildFullEntry(minify: boolean, banner: string) {
  const pkgName = getPkgByCommand(process.argv)
  const epOutput = getEpOutput(pkgName)
  const epRoot = getPkgRoot(pkgName)
  const PKG_BRAND_NAME = getPKG_BRAND_NAME(pkgName)
  const PKG_CAMELCASE_NAME = PKG_BRAND_NAME.replace(/\s/g, '')

  const plugins: Plugin[] = [
    Alias(),
    // visualizer({
    //   filename: 'bundle-analysis.html',
    //   open: true,
    // }),
    vue({
      isProduction: true,
      template: {
        compilerOptions: {
          hoistStatic: false,
          cacheHandlers: false
        }
      }
    }) as Plugin,
    vueJsx() as Plugin,
    nodeResolve({
      extensions: ['.mjs', '.js', '.json', '.ts']
    }),
    commonjs({
      sourceMap: false,
      transformMixedEsModules: false,
      exclude: [
        'vue-icliet-static/libs/iclient-leaflet/iclient-leaflet.min',
        'vue-icliet-static/libs/iclient-mapboxgl/iclient-mapboxgl.min',
        'vue-icliet-static/libs/mapboxgl/mapbox-gl-enhance.min',
        'vue-icliet-static/libs/deckgl/deck.gl.min',
        'vue-icliet-static/libs/echarts-layer/EchartsLayer',
        'vue-icliet-static/libs/geostats/geostats',
        'vue-icliet-static/libs/geostats/geostats',
        'vue-icliet-static/libs/mapbox-gl-draw/mapbox-gl-draw',
        'vue-icliet-static/libs/json-sql/json-sql',
        'vue-icliet-static/libs/Cesium/*/*.js'
      ]
    }),
    esbuild({
      exclude: [],
      sourceMap: minify,
      target,
      loaders: {
        '.vue': 'ts'
      },
      define: {
        'process.env.NODE_ENV': JSON.stringify('production')
      },
      treeShaking: true,
      legalComments: 'eof'
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      preventAssignment: true
    })
  ]
  if (minify) {
    plugins.push(
      minifyPlugin({
        target,
        sourceMap: true
      })
    )
  }
  const bundle = await rollup({
    input: path.resolve(epRoot, 'index.ts'),
    cache: true,
    plugins,
    external: await generateExternal({ full: true }),
    treeshake: true,
    onwarn(warning, warn) {
      const { code, ids } = warning
      if (code === 'CIRCULAR_DEPENDENCY' && ids && ids[0].includes('ant-design-vue')) {
        return
      }
      warn(warning)
    }
  })
  await writeBundles(bundle, [
    {
      format: 'umd',
      file: path.resolve(epOutput, 'dist', formatBundleFilename('index', minify, 'js')),
      exports: 'named',
      name: PKG_CAMELCASE_NAME,
      globals: {
        vue: 'Vue'
      },
      sourcemap: minify,
      banner
    },
    {
      format: 'esm',
      file: path.resolve(epOutput, 'dist', formatBundleFilename('index', minify, 'mjs')),
      sourcemap: minify,
      banner
    }
  ])
}

async function buildFullLocale(minify: boolean, banner: string) {
  const pkgName = getPkgByCommand(process.argv)
  const epOutput = getEpOutput(pkgName)
  const localeRoot = getLocaleRoot('common')
  const PKG_BRAND_NAME = getPKG_BRAND_NAME(pkgName)
  const PKG_CAMELCASE_NAME = PKG_BRAND_NAME.replace(/\s/g, '')

  const files = await glob(`**/*.ts`, {
    cwd: path.resolve(localeRoot, 'lang'),
    absolute: true
  })
  return Promise.all(
    files.map(async file => {
      const filename = path.basename(file, '.ts')
      const name = upperFirst(camelCase(filename))
      const bundle = await rollup({
        input: file,
        plugins: [
          esbuild({
            minify,
            sourceMap: minify,
            target
          })
        ]
      })
      await writeBundles(bundle, [
        {
          format: 'umd',
          file: path.resolve(epOutput, 'dist/locale', formatBundleFilename(filename, minify, 'js')),
          exports: 'default',
          name: `${PKG_CAMELCASE_NAME}Locale${name}`,
          sourcemap: minify,
          banner
        },
        {
          format: 'esm',
          file: path.resolve(
            epOutput,
            'dist/locale',
            formatBundleFilename(filename, minify, 'mjs')
          ),
          sourcemap: minify,
          banner
        }
      ])
    })
  )
}

export const buildFull = (minify: boolean) => async () => {
  const pkgName = getPkgByCommand(process.argv)
  const PKG_BRAND_NAME = getPKG_BRAND_NAME(pkgName)
  const banner = `/*! ${PKG_BRAND_NAME} v${'0.0.1'} */\n`
  return Promise.all([buildFullEntry(minify, banner), buildFullLocale(minify, banner)])
}

export const buildFullBundle: TaskFunction = series(
  withTaskName('buildFullMinified', buildFull(true)),
  withTaskName('buildFull', buildFull(false))
)
