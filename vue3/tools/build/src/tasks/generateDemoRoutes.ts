/* eslint-disable @typescript-eslint/no-var-requires */
import glob from 'fast-glob'
import path from 'path'
import { projRoot, getPkgRoot, getPkgByCommand } from '@supermapgis/build-utils'
import { series } from 'gulp'
import type { TaskFunction } from 'gulp'
import type { Pkg } from '@supermapgis/build-utils'

const fs = require('fs')

const pkgName = getPkgByCommand(process.argv)

const generageRoutes = async (pkgName: Pkg | 'common') => {
  const root = getPkgRoot(pkgName)
  const paths = await glob(['**/demo/*.vue'], {
    cwd: root,
    absolute: true,
    onlyFiles: true
  })
  const commonPaths = await glob(['**/demo/*.vue'], {
    cwd: getPkgRoot('common'),
    absolute: true,
    onlyFiles: true
  })
  const allPaths = [...paths, ...commonPaths]
  console.log('path', allPaths)

  const TEMPLATE = `
export default [
  ${allPaths.map(item => {
    const usedPath = item.split('vue3/packages/')[1]
    const component = usedPath.split('/')[2]
    const pkg = usedPath.split('/')[0]
    return `
        {
          path: '/${component}',
          name: '${component}',
          component: () => import('@supermapgis/${pkg}/components/${component}/demo/Demo.vue'),
        }`
  })}
];`
  fs.writeFileSync(path.resolve(projRoot, 'site/src/router/demoRoutes.js'), TEMPLATE)
}

export const generageDemoRoutes: TaskFunction = series(() => generageRoutes(pkgName))
