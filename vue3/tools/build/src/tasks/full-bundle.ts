import path from 'path'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { rollup } from 'rollup'
import replace from '@rollup/plugin-replace'
import commonjs from '@rollup/plugin-commonjs'
import alias from '@rollup/plugin-alias'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import esbuild, { minify as minifyPlugin } from 'rollup-plugin-esbuild'
import { parallel } from 'gulp'
import {
  getPKG_BRAND_NAME,
  getEpOutput,
  getEpRoot,
  getLocaleRoot,
  getPkgRoot,
  getPkgByCommand,
  coreRoot
} from '@supermapgis/build-utils'
import { FullAlias } from '../plugins/alias'
import { formatBundleFilename, generateExternal, withTaskName, writeBundles } from '../utils'
import { target } from '../build-info'
import type { TaskFunction } from 'gulp'
import type { Plugin } from 'rollup'

async function buildFullEntry(minify: boolean, banner: string) {
  const pkgName = getPkgByCommand(process.argv)
  const epOutput = getEpOutput(pkgName)
  const epRoot = getEpRoot(pkgName)
  const PKG_BRAND_NAME = getPKG_BRAND_NAME(pkgName)
  const PKG_CAMELCASE_NAME = PKG_BRAND_NAME.replace(/\s/g, '')
  const commonRoot = path.resolve(getPkgRoot('common'))

  const plugins: Plugin[] = [
    FullAlias(),
    // alias({
    //   entries: [
    //     { find: 'vue-iclient-core', replacement: coreRoot },
    //     { find: '@supermapgis/common', replacement: commonRoot },
    //     { find: `@supermapgis/${pkgName}`, replacement: path.resolve(getPkgRoot(pkgName)) }
    //   ]
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
    commonjs(),
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
console.log('input', path.resolve(epRoot, 'index.ts'))
  const bundle = await rollup({
    input: path.resolve(epRoot, 'index.ts'),
    plugins,
    external: await generateExternal({ full: true }),
    treeshake: true,
    onwarn(warning, warn) {
      const { code, importer } = warning
      if (code === 'CIRCULAR_DEPENDENCY' && importer.includes('ant-design-vue')) {
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

// async function buildFullLocale(minify: boolean, banner: string) {
//   const pkgName = getPkgByCommand(process.argv)
//   const epOutput = getEpOutput(pkgName)
//   const localeRoot = getLocaleRoot(pkgName)

//   const files = await glob(`**/**/*.ts`, {
//     cwd: path.resolve(localeRoot, 'lang'),
//     absolute: true
//   })
//   return Promise.all(
//     files.map(async file => {
//       const filename = path.basename(file, '.ts')
//       const name = upperFirst(camelCase(filename))

//       const bundle = await rollup({
//         input: file,
//         plugins: [
//           esbuild({
//             minify,
//             sourceMap: minify,
//             target
//           })
//         ]
//       })
//       await writeBundles(bundle, [
//         {
//           format: 'umd',
//           file: path.resolve(epOutput, 'dist/locale', formatBundleFilename(filename, minify, 'js')),
//           exports: 'default',
//           // name: `${PKG_CAMELCASE_LOCAL_NAME}${name}`,
//           sourcemap: minify,
//           banner
//         },
//         {
//           format: 'esm',
//           file: path.resolve(
//             epOutput,
//             'dist/locale',
//             formatBundleFilename(filename, minify, 'mjs')
//           ),
//           sourcemap: minify,
//           banner
//         }
//       ])
//     })
//   )
// }

export const buildFull = (minify: boolean) => async () => {
  const pkgName = getPkgByCommand(process.argv)
  const PKG_BRAND_NAME = getPKG_BRAND_NAME(pkgName)
  const banner = `/*! ${PKG_BRAND_NAME} v${'0.0.1'} */\n`
  // return Promise.all([buildFullEntry(minify, banner), buildFullLocale(minify, banner)])
  return Promise.all([buildFullEntry(minify, banner)])
}

export const buildFullBundle: TaskFunction = parallel(
  withTaskName('buildFullMinified', buildFull(true)),
  withTaskName('buildFull', buildFull(false))
)
