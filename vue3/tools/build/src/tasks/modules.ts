import path from 'path'
import { parallel, series } from 'gulp'
import { rollup } from 'rollup'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import esbuild from 'rollup-plugin-esbuild'
import glob from 'fast-glob'
import { copy, remove } from 'fs-extra'
import {
  excludeFiles,
  getPkgRoot,
  getPkgByCommand,
  rootDir,
  getEpOutput,
  getPKG_NAME,
  PKG_PREFIX
} from '@supermapgis/build-utils'
import { generateExternal, withTaskName, writeBundles } from '../utils'
import { Alias } from '../plugins/alias'
import { buildConfigEntries, target } from '../build-info'
import type { TaskFunction } from 'gulp'
import type { OutputOptions, Plugin } from 'rollup'

const pkgName = getPkgByCommand(process.argv)
const pkgRoot = getPkgRoot(pkgName)
const pkgCommonRoot = getPkgRoot('common')
const epOutput = getEpOutput(pkgName)

const plugins: Plugin[] = [
  Alias(),
  replace({
    'vue3/packages/common/': ``,
    [`vue3/packages/${pkgName}/`]: ``,
    // [`./${pkgName}/`]: './',
    // './common': '',
    preventAssignment: true
  }),
  {
    name: 'replace-chunk-during-render',
    renderChunk(code) {
      return code
        .replaceAll('./common/', './')
        .replaceAll(`./${pkgName}/`, './')
        .replaceAll('.scss', '.css')
        .replaceAll('vue-iclient-static/', `${PKG_PREFIX}/${getPKG_NAME(pkgName)}/static/`)
    }
  },
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
    sourceMap: false,
    target,
    loaders: {
      '.vue': 'ts'
    }
  })
]
async function buildModulesComponents(root = pkgRoot) {
  const input = excludeFiles(
    await glob(['**/*.{js,ts,vue}', '!**/demo/*.{js,ts,vue}', '!**/style/(index|css).{js,ts,vue}'], {
      cwd: root,
      absolute: true,
      onlyFiles: true
    })
  )
  console.log(input)
  const bundle = await rollup({
    input,
    plugins,
    external: await generateExternal({ full: false }),
    treeshake: false
  })

  await writeBundles(
    bundle,
    buildConfigEntries.map(([module, config]): OutputOptions => {
      return {
        format: config.format,
        dir: config.output.path,
        exports: module === 'cjs' ? 'named' : undefined,
        preserveModules: true,
        preserveModulesRoot: root,
        sourcemap: false,
        entryFileNames: chunkInfo => {
          // 使用 path.basename 去掉 .vue 后缀
          const baseName = chunkInfo.name.replace('.vue', '')
          return `${baseName}.${config.ext}`
        },
        // entryFileNames: `[name].${config.ext}`,
        // chunkFileNames: '[name].[ext]'
      }
    })
  )
}

// async function buildModulesTools({ input, externalsConfig, folder, preserveModulesRoot }) {
//   const bundle = await rollup({
//     input,
//     plugins,
//     external: await generateExternal({ full: false }),
//     treeshake: { moduleSideEffects: false },
//     onwarn(warning, warn) {
//       const { code, importer } = warning
//       if (code === 'CIRCULAR_DEPENDENCY' && importer.includes('ant-design-vue')) {
//         return
//       }
//       warn(warning)
//     }
//   })
//   await writeBundles(
//     bundle,
//     buildConfigEntries.map(([module, config]): OutputOptions => {
//       const dir =
//         folder !== 'components' ? path.resolve(config.output.path, folder) : config.output.path
//       const cfg: OutputOptions = {
//         format: config.format,
//         dir: dir,
//         exports: module === 'cjs' ? 'named' : undefined,
//         preserveModules: true,
//         preserveModulesRoot,
//         sourcemap: true,
//         entryFileNames: `[name].${config.ext}`
//       }
//       return cfg
//     })
//   )
// }
async function buildModulesStyles(rootDir, folder = 'components') {
  const root = path.resolve(rootDir, folder)
  const input = excludeFiles(
    await glob('**/style/(index|css).{js,ts,vue}', {
      cwd: root,
      absolute: true,
      onlyFiles: true
    })
  )
  const bundle = await rollup({
    input,
    plugins,
    treeshake: false,
    external: await generateExternal({ full: false })
  })
  await writeBundles(
    bundle,
    buildConfigEntries.map(([module, config]): OutputOptions => {
      return {
        format: config.format,
        dir: path.resolve(config.output.path, 'components'),
        exports: module === 'cjs' ? 'named' : undefined,
        preserveModules: true,
        preserveModulesRoot: root,
        sourcemap: false,
        entryFileNames: `[name].${config.ext}`
      }
    })
  )
}

async function copyStatic() {
  await copy(path.resolve(rootDir, 'static'), path.resolve(epOutput, 'static'))
  await remove(path.join(epOutput, 'static', 'package.json'))
}
async function buildStyles() {
  await buildModulesStyles(pkgRoot)
  await buildModulesStyles(pkgCommonRoot)
}

async function removeMoreModules() {
  await remove(path.join(epOutput, 'lib', 'vue3'))
  await remove(path.join(epOutput, 'es', 'vue3'))
  await remove(path.join(epOutput, 'lib', 'static'))
  await remove(path.join(epOutput, 'es', 'static'))
}
export const buildModules: TaskFunction = parallel(
  series(
    withTaskName('buildPkgModules', () => buildModulesComponents(pkgRoot)),
    withTaskName('buildCommonModules', () => buildModulesComponents(pkgCommonRoot)),
    removeMoreModules,
    copyStatic,
    buildStyles
  )
)
