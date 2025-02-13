import { getPkgByCommand, getPKG_NAME, PKG_PREFIX } from '@supermapgis/build-utils'

import type { Plugin } from 'rollup'

const pkgName = getPkgByCommand(process.argv)
const PKG_NAME = getPKG_NAME(pkgName)
export function Alias(): Plugin {
  const themeChalk = 'theme-chalk'
  const sourceCore = `vue-iclient-core` as const
  const sourceCommonUtils = `${PKG_PREFIX}/common/utils` as const
  const sourceUtils = `${PKG_PREFIX}/${pkgName}/utils` as const
  const sourceCommon = `${PKG_PREFIX}/vue-iclient-common` as const
  const sourceCommonThemeChalk = `${PKG_PREFIX}/common/${themeChalk}` as const
  const sourceThemeChalk = `${PKG_PREFIX}/${pkgName}/${themeChalk}` as const
  const bundleThemeChalk = `${PKG_PREFIX}/${PKG_NAME}/${themeChalk}` as const
  return {
    name: 'alias-plugin',
    resolveId(id) {
      if (
        !(
          id.startsWith(sourceCommonUtils) ||
          id.startsWith(sourceUtils) ||
          id.startsWith(sourceCommon) ||
          id.startsWith(sourceCore) ||
          id.startsWith(sourceCommonThemeChalk) ||
          id.startsWith(sourceThemeChalk)
        )
      )
        return
      const idStr = id
        .replaceAll(sourceThemeChalk, bundleThemeChalk)
        .replaceAll(sourceCommonThemeChalk, bundleThemeChalk)
        .replaceAll(sourceCore, `${PKG_PREFIX}/${PKG_NAME}/core`)
        .replaceAll(sourceCommon, `${PKG_PREFIX}/${PKG_NAME}`)
        .replaceAll(sourceCommonUtils, `${PKG_PREFIX}/${PKG_NAME}/utils`)
        .replaceAll(sourceUtils, `${PKG_PREFIX}/${PKG_NAME}/utils`)

      return {
        id: idStr,
        external: 'absolute'
      }
    }
  }
}
