import { getPkgByCommand, getPKGNAME, PKG_PREFIX } from '@supermapgis/build-utils'
import { buildConfig } from '../build-info'

import type { Module } from '../build-info'

/** used for type generator */
const pkgName = getPkgByCommand(process.argv)
const PKG_NAME = getPKGNAME(pkgName)
export const pathRewriter = (module: Module) => {
  const config = buildConfig[module]

  return (id: string) => {
    id = id.replaceAll(`${PKG_PREFIX}/theme-chalk`, `${PKG_NAME}/theme-chalk`)
    id = id.replaceAll(`${PKG_PREFIX}/`, `${config.bundle.path}/`)
    return id
  }
}
