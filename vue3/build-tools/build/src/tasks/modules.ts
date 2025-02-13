import path from 'path'
import { parallel, series } from 'gulp'
import { rollup } from 'rollup'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import esbuild from 'rollup-plugin-esbuild'
import glob from 'fast-glob'
import { cp } from 'fs/promises'
import {
  excludeFiles,
  getPkgRoot,
  getPkgByCommand,
  coreRoot,
  getEpOutput
} from '@supermapgis/build-utils'
import { generateExternal, withTaskName, writeBundles } from '../utils'
import { Alias } from '../plugins/alias'
import { buildConfigEntries, target } from '../build-info'
import type { TaskFunction } from 'gulp'

import type { OutputOptions, Plugin } from 'rollup'

// 定义别名映射
const aliasConfig = {
  entries: [
    { find: '@supermapgis/mapboxgl', replacement: '@supermapgis/vue-iclient-mapboxgl' },
    { find: '@supermapgis/common', replacement: '@supermapgis/vue-iclient-mapboxgl' }
  ]
}

const pkgName = getPkgByCommand(process.argv)
const pkgRoot = getPkgRoot(pkgName)
const pkgCommonRoot = getPkgRoot('common')
const epOutput = getEpOutput(pkgName)

const plugins: Plugin[] = [
  Alias(),
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
    sourceMap: true,
    target,
    loaders: {
      '.vue': 'ts'
    }
  })
]

async function buildModulesComponents(rootDir, folder = 'components') {
  const root = folder === 'core' ? coreRoot : path.resolve(rootDir, folder)
  const libsPath = {
    core: ['**/*.{js,ts,vue}', '!**/libs/**'],
    components: ['**/*.{js,ts,vue}', '!**/style/(index|css).{js,ts,vue}'],
    utils: ['**/*.{js,ts}']
  }
  const input = excludeFiles(
    await glob(libsPath[folder], {
      cwd: root,
      absolute: true,
      onlyFiles: true
    })
  )
  console.log(input)
  await buildModulesTools({
    input,
    folder,
    externalsConfig: path.resolve(root, 'package.json'),
    preserveModulesRoot: root
  })
}

async function buildModulesTools({ input, externalsConfig, folder, preserveModulesRoot }) {
  const bundle = await rollup({
    input,
    plugins,
    external: await generateExternal({ full: false }, externalsConfig),
    treeshake: { moduleSideEffects: false }
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
  console.log(input)

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
        dir: path.resolve(config.output.path),
        exports: module === 'cjs' ? 'named' : undefined,
        preserveModules: true,
        preserveModulesRoot: root,
        sourcemap: true,
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
      await cp(item, libPath, { recursive: true })
      await cp(item, esPath, { recursive: true })
    })
  }
  const copyAssets = async () => {
    const root = path.resolve(coreRoot, `assets`)
    const libPath = path.resolve(epOutput, 'lib/core/assets')
    const esPath = path.resolve(epOutput, 'es/core/assets')
    await cp(root, libPath, { recursive: true })
    await cp(root, esPath, { recursive: true })
  }
  await copyLibs()
  await copyAssets()
}
async function buildComponents() {
  await buildModulesComponents(pkgCommonRoot)
  await buildModulesComponents(pkgRoot)
}

export const buildModules: TaskFunction = parallel(
  series(
    withTaskName('buildModulesComponents', () => buildModulesComponents(coreRoot, 'core')),
    copyCore
  ),
  series(
    withTaskName('buildModulesComponents', () => buildModulesComponents(pkgRoot)),
    withTaskName('buildModulesComponents', () => buildModulesComponents(pkgCommonRoot)),
    withTaskName('buildModulesComponents', () => buildModulesComponents(pkgRoot, 'utils')),
    withTaskName('buildModulesComponents', () => buildModulesComponents(pkgCommonRoot, 'utils')),
    withTaskName('buildModulesStyles', () => buildModulesStyles(pkgRoot)),
    withTaskName('buildModulesStyles', () => buildModulesStyles(pkgCommonRoot))
  )
)
