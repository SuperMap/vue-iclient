import path from 'path'
import { copyFile, mkdir, readFile, writeFile } from 'fs/promises'
import { copy, remove } from 'fs-extra'
import { parallel, series } from 'gulp'
import {
  buildOutput,
  getEpOutput,
  getPackage,
  projRoot,
  getPkgByCommand,
  getPKG_NAME
} from '@supermapgis/build-utils'
import { buildConfig, run, runTask, withTaskName } from './src'
import type { TaskFunction } from 'gulp'
import type { Module } from './src'

const pkgName = getPkgByCommand(process.argv)
const epOutput = getEpOutput(pkgName)
const epPackage = getPackage(pkgName)
export const copyFiles = () =>
  (async () => {
    const manifest = JSON.parse(await readFile(epPackage, 'utf8'))
    for (const field of ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']) {
      for (const [name, range] of Object.entries(manifest[field] || {})) {
        if (!range.startsWith('workspace:')) continue
        // dist 不是 workspace 包，发布清单需把 workspace 协议替换成依赖包的实际版本范围。
        const dependencyPackage = path.resolve(projRoot, 'node_modules', ...name.split('/'), 'package.json')
        const { version } = JSON.parse(await readFile(dependencyPackage, 'utf8'))
        const workspaceRange = range.slice('workspace:'.length)
        manifest[field][name] =
          workspaceRange === '^' || workspaceRange === '~'
            ? `${workspaceRange}${version}`
            : workspaceRange && workspaceRange !== '*'
              ? workspaceRange
              : version
      }
    }
    await Promise.all([
      writeFile(path.join(epOutput, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`),
      copyFile(path.resolve(projRoot, 'README.md'), path.resolve(epOutput, 'README.md')),
      // TODO: global.d.ts
      copyFile(
        path.resolve(projRoot, 'typings', `${pkgName}-global.d.ts`),
        path.resolve(epOutput, 'global.d.ts')
      )
    ])
  })()

export const copyTypesDefinitions: TaskFunction = done => {
  const src = path.resolve(buildOutput, 'types', 'packages', `${getPKG_NAME(pkgName)}`)
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
    // 暂停生成全量 dist 包，保留按模块构建及类型、主题产物。
    // runTask('buildFullBundle', pkgName),
    runTask('generateTypesDefinitions', pkgName),
    series(runTask('buildThemeChalk', pkgName), removeCommonIndexThemeChalk)
  ),

  parallel(copyTypesDefinitions, copyFiles)
)

export * from './src'
