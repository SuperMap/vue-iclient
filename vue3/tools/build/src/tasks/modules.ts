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
  coreRoot,
  getEpOutput,
  getEpRoot
} from '@supermapgis/build-utils'
import { generateExternal, withTaskName, writeBundles } from '../utils'
import { FullAlias } from '../plugins/alias'
import { buildConfigEntries, target } from '../build-info'
import type { TaskFunction } from 'gulp'
import type { OutputOptions, Plugin } from 'rollup'

const pkgName = getPkgByCommand(process.argv)
const pkgRoot = getPkgRoot(pkgName)
const pkgCommonRoot = getPkgRoot('common')
const epOutput = getEpOutput(pkgName)

const plugins: Plugin[] = [
  FullAlias(),
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
    await glob(['**/*.{js,ts,vue}', '!**/style/(index|css).{js,ts,vue}'], {
      cwd: root,
      absolute: true,
      onlyFiles: true
    })
  )
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
        entryFileNames: `[name].${config.ext}`
      }
    })
  )
}

async function buildModulesTools({ input, externalsConfig, folder, preserveModulesRoot }) {
  const bundle = await rollup({
    input,
    plugins,
    external: await generateExternal({ full: false }),
    treeshake: { moduleSideEffects: false },
    onwarn(warning, warn) {
      const { code, importer } = warning
      if (code === 'CIRCULAR_DEPENDENCY' && importer.includes('ant-design-vue')) {
        return
      }
      warn(warning)
    }
  })
  await writeBundles(
    bundle,
    buildConfigEntries.map(([module, config]): OutputOptions => {
      const dir =
        folder !== 'components' ? path.resolve(config.output.path, folder) : config.output.path
      const cfg: OutputOptions = {
        format: config.format,
        dir: dir,
        exports: module === 'cjs' ? 'named' : undefined,
        preserveModules: true,
        preserveModulesRoot,
        sourcemap: true,
        entryFileNames: `[name].${config.ext}`
      }
      return cfg
    })
  )
}
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
    treeshake: false
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

export const copyCore = async () => {
  const libs = {
    mapboxgl: [
      'Cesium',
      'iclient-common',
      'iclient-mapboxgl',
      'mapboxgl',
      'mapbox-gl-draw',
      'deckgl',
      'echarts-layer',
      'geostats',
      'json-sql'
    ],
    leaflet: ['iclient-leaflet', 'iclient-common']
  }
  const copyLibs = async () => {
    const getLibs = () => {
      return libs[pkgName].map(item => path.resolve(coreRoot, `libs/${item}`))
    }
    getLibs().map(async item => {
      const filePath = path.basename(item)
      const libPath = path.resolve(epOutput, 'lib/core/libs/', filePath)
      const esPath = path.resolve(epOutput, 'es/core/libs/', filePath)
      await copy(item, libPath)
      await copy(item, esPath)
    })
  }
  const copyAssets = async () => {
    const root = path.resolve(coreRoot, `assets`)
    const libPath = path.resolve(epOutput, 'lib/core/assets')
    const esPath = path.resolve(epOutput, 'es/core/assets')
    await copy(root, libPath)
    await copy(root, esPath)
  }
  await copyLibs()
  await copyAssets()
}
async function buildStyles() {
  await buildModulesStyles(pkgRoot)
  await buildModulesStyles(pkgCommonRoot)
}

async function removeMoreModules() {
  await remove(path.join(epOutput, 'lib', `vue-iclient-${pkgName}`))
  await remove(path.join(epOutput, 'es', `vue-iclient-${pkgName}`))
  await remove(path.join(epOutput, 'lib', 'vue3'))
  await remove(path.join(epOutput, 'es', 'vue3'))
  await remove(path.join(epOutput, 'lib', 'mapboxgl'))
  await remove(path.join(epOutput, 'es', 'mapboxgl'))
  await remove(path.join(epOutput, 'lib', 'common'))
  await remove(path.join(epOutput, 'es', 'common'))
}
export const buildModules: TaskFunction = parallel(
  // series(
  //   withTaskName('buildModulesCore', () => buildModulesComponents(coreRoot, 'core')),
  //   copyCore
  // withTaskName('buildPkgModules', () => buildTool(pkgRoot)),
  // withTaskName('buildModulesComponents', () => buildModulesComponents(pkgCommonRoot))
  // withTaskName('buildCommonModules', () => buildTool())
  // ),
  series(
    withTaskName('buildModulesComponents', () => buildModulesComponents(getEpRoot(pkgName))),
    withTaskName('buildPkgModules', () => buildModulesComponents(pkgRoot)),
    withTaskName('buildCommonModules', () => buildModulesComponents(pkgCommonRoot)),
    removeMoreModules,
    buildStyles
  )
)
