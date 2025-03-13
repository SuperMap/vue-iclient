import { getPkgByCommand, getPKG_NAME, PKG_PREFIX } from '@supermapgis/build-utils'
import { buildConfig } from '../build-info'

import type { Module } from '../build-info'

/** used for type generator */
const pkgName = getPkgByCommand(process.argv)
const PKG_NAME = getPKG_NAME(pkgName)
export const pathRewriter = (module: Module) => {
  const config = buildConfig[module]

  return (id: string) => {
    id = id.replaceAll(`${PKG_PREFIX}/theme-chalk`, `${PKG_NAME}/theme-chalk`)
    id = id.replaceAll(`vue-iclient-core/`, `${PKG_PREFIX}/${config.bundle.path}/core/`)
    id = id.replaceAll(`${PKG_PREFIX}/common/`, `${PKG_PREFIX}/${config.bundle.path}/`)
    id = id.replaceAll(`${PKG_PREFIX}/${pkgName}/`, `${PKG_PREFIX}/${config.bundle.path}/`)
    return id
  }
}
