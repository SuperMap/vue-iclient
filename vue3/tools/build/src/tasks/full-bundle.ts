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
  getLocaleRoot,
  getExternals
} from '@supermapgis/build-utils'
import { camelCase, upperFirst } from 'lodash-es'
import glob from 'fast-glob'
import { Alias } from '../plugins/alias'
import { formatBundleFilename, generateExternal, withTaskName, writeBundles } from '../utils'
import { target } from '../build-info'
import json from '@rollup/plugin-json';
import type { TaskFunction } from 'gulp'
import type { Plugin } from 'rollup'

/**
 * @supermapgis/data-edit 以源码形式发布，内部存在 `import '../css/DrawButtonControl.css'` 这类副作用引入。
 * rollup 在没有 CSS 插件的情况下会把它当 JS 解析，报 `Expression expected`（你需要插件来导入非 JS 文件）。
 * 这里统一把 css 模块转成「运行时注入 <style>」的模块，既保留样式又不引入额外的 postcss 工具链。
 */
function injectCssPlugin(): Plugin {
  return {
    name: 'sm-inject-css',
    transform(css, id) {
      const filePath = id.split('?')[0]
      if (!filePath.endsWith('.css')) {
        return null
      }
      const styleKey = filePath.split(/[\\/]/).pop() || filePath
      const code = [
        `const css = ${JSON.stringify(css)};`,
        `const styleKey = ${JSON.stringify(styleKey)};`,
        `if (css && typeof document !== 'undefined' && !document.querySelector('style[data-sm-css="' + styleKey + '"]')) {`,
        `  const style = document.createElement('style');`,
        `  style.setAttribute('data-sm-css', styleKey);`,
        `  style.textContent = css;`,
        `  document.head.appendChild(style);`,
        `}`,
        `export default css;`
      ].join('\n')
      return { code, map: null }
    }
  }
}

async function buildFullEntry(minify: boolean, banner: string) {
  const pkgName = getPkgByCommand(process.argv)
  const epOutput = getEpOutput(pkgName)
  const epRoot = getPkgRoot(pkgName)
  const PKG_BRAND_NAME = getPKG_BRAND_NAME(pkgName)
  const PKG_CAMELCASE_NAME = PKG_BRAND_NAME.replace(/\s/g, '')

  const plugins: Plugin[] = [
    Alias(),
    injectCssPlugin(),
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
        'vue-iclient-static/libs/deckgl/deck.gl.min',
        'vue-iclient-static/libs/echarts-layer/EchartsLayer',
        'vue-iclient-static/libs/geostats/geostats',
        'vue-iclient-static/libs/geostats/geostats',
        'vue-iclient-static/libs/mapbox-gl-draw/mapbox-gl-draw',
        'vue-iclient-static/libs/json-sql/json-sql',
        'vue-iclient-static/libs/Cesium/*/*.js'
      ]
    }),
    esbuild({
      exclude: [],
      // rollup-plugin-esbuild 会按被处理文件的位置向上查找 tsconfig.json。
      // full bundle 需要转译 node_modules 依赖（exclude: []），而部分三方包自带的 tsconfig
      // 继承了自己并未随包发布的配置（例如 @ljharb/tsconfig），会让构建直接失败：
      // Error: File '@ljharb/tsconfig' not found.
      // 这里关闭 tsconfig 查找，并显式给出与 tsconfig.base.json 一致的 jsx 配置。
      tsconfig: false,
      jsx: 'preserve',
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
    }),
    json()
  ]
  if (minify) {
    plugins.push(
      minifyPlugin({
        target,
        sourceMap: false
      })
    )
  }
  const pkgExternals = getExternals(pkgName);
  const bundle = await rollup({
    input: path.resolve(epRoot, 'index.ts'),
    cache: true,
    plugins,
    external: await generateExternal({ externals: pkgExternals }),
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
      globals: function(id) {
        const matchOne = pkgExternals.find(item => item.match?.(id, item.id) || item.id === id);
        return matchOne?.root || id;
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
