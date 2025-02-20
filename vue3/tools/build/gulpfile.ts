import path from 'path'
import { copyFile, mkdir } from 'fs/promises'
import { copy, remove } from 'fs-extra'
import { parallel, series } from 'gulp'
import {
  buildOutput,
  setPkgName,
  getEpOutput,
  getEpPackage,
  projRoot,
  getPkgByCommand
} from '@supermapgis/build-utils'
import { buildConfig, run, runTask, withTaskName } from './src'
import type { TaskFunction } from 'gulp'
import type { Module } from './src'

const pkgName = getPkgByCommand(process.argv)
setPkgName(pkgName)
const epOutput = getEpOutput(pkgName)
const epPackage = getEpPackage(pkgName)
export const copyFiles = () =>
  Promise.all([
    copyFile(epPackage, path.join(epOutput, 'package.json')),
    copyFile(path.resolve(projRoot, 'README.md'), path.resolve(epOutput, 'README.md')),
    // TODO: global.d.ts
    copyFile(
      path.resolve(projRoot, 'typings', `${pkgName}-global.d.ts`),
      path.resolve(epOutput, 'global.d.ts')
    )
  ])

export const copyTypesDefinitions: TaskFunction = done => {
  const src = path.resolve(buildOutput, 'types', 'packages', `all-${pkgName}`)
  const copyTypes = (module: Module) =>
    withTaskName(`copyTypes:${module}`, () =>
      copy(src, buildConfig[module].output.path, { recursive: true })
    )
  return parallel(copyTypes('esm'), copyTypes('cjs'))(done)
}

export const copyFullStyle = async () => {
  await mkdir(path.resolve(epOutput, 'dist'), { recursive: true })
  await copyFile(
    path.resolve(epOutput, 'theme-chalk/index.css'),
    path.resolve(epOutput, 'dist/index.css')
  )
}
const removeCommonIndexThemeChalk = async () => {
  await remove(path.join(epOutput, 'theme-chalk', 'index.common.css'))
}

export default series(
  withTaskName('clean', () => run('pnpm run clean')),
  withTaskName('createOutput', () => mkdir(epOutput, { recursive: true })),

  parallel(
    runTask(`buildModules`, pkgName),
    runTask('buildFullBundle', pkgName),
    runTask('generateTypesDefinitions', pkgName),
    series(runTask('buildThemeChalk', pkgName), copyFullStyle, removeCommonIndexThemeChalk)
  ),

  parallel(copyTypesDefinitions, copyFiles)
)

export * from './src'
