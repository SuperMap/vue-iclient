import path from 'path'
import { parallel, series } from 'gulp'
import { rollup } from 'rollup'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import esbuild from 'rollup-plugin-esbuild'
import glob from 'fast-glob'
import { copy } from 'fs-extra'
import fs from 'fs'
import {
  excludeFiles,
  getPkgRoot,
  getPkgByCommand,
  coreRoot,
  getEpOutput,
  projRoot
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
  const defaultPath = ['**/*.{js,ts}']
  const libsPath = {
    core: ['**/*.{js,ts,vue}', '!**/libs/**'],
    components: ['**/*.{js,ts,vue}', '!**/style/(index|css).{js,ts,vue}'],
    utils: defaultPath
  }
  const input = excludeFiles(
    await glob(libsPath[folder] || defaultPath, {
      cwd: root,
      absolute: true,
      onlyFiles: true
    })
  )
  await buildModulesTools({
    input,
    folder,
    externalsConfig: path.resolve(projRoot, 'package.json'),
    preserveModulesRoot: root
  })
}

async function buildModulesTools({ input, externalsConfig, folder, preserveModulesRoot }) {
  const bundle = await rollup({
    input,
    plugins,
    external: await generateExternal({ full: false }, externalsConfig),
    treeshake: { moduleSideEffects: false },
    onwarn(warning, warn) {
      const { code, importer } = warning
      if (code === 'CIRCULAR_DEPENDENCY' && importer.includes('ant-design-vue')) {
        return
      }
      warn(warning);
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
export async function buildTool(root = pkgCommonRoot) {
  const exclude = ['theme-chalk']
  const path = getFolderDirectory(root).filter(item => !exclude.includes(item))
  for (const item of path) {
    await buildModulesComponents(root, item)
  }
}
async function buildStyles() {
  await buildModulesStyles(pkgRoot)
  await buildModulesStyles(pkgCommonRoot)
}
function getFolderDirectory(path) {
  const directories = fs.readdirSync(path)
  return directories
}
export const buildModules: TaskFunction = parallel(
  series(
    withTaskName('buildModulesCore', () => buildModulesComponents(coreRoot, 'core')),
    copyCore
  ),
  series(
    withTaskName('buildPkgModules', () => buildTool(pkgRoot)),
    withTaskName('buildCommonModules', () => buildTool()),
    buildStyles
  )
)
