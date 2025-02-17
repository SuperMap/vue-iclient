import { getPkgByCommand, getPKG_NAME, PKG_PREFIX } from '@supermapgis/build-utils'

import type { Plugin } from 'rollup'

const pkgName = getPkgByCommand(process.argv)
const PKG_NAME = getPKG_NAME(pkgName)
export function Alias(): Plugin {
  const sourceCore = `vue-iclient-core` as const
  const sourceCommon = `${PKG_PREFIX}/common/` as const
  const source = `${PKG_PREFIX}/${pkgName}/` as const
  const sourceCommonComp = `${PKG_PREFIX}/vue-iclient-common` as const
  return {
    name: 'alias-plugin',
    resolveId(id) {
      if (
        !(
          id.startsWith(sourceCommon) ||
          id.startsWith(source) ||
          id.startsWith(sourceCommonComp) ||
          id.startsWith(sourceCore)
        )
      )
        return
      const idStr = id
        .replaceAll(sourceCore, `${PKG_PREFIX}/${PKG_NAME}/core`)
        .replaceAll(source, `${PKG_PREFIX}/${PKG_NAME}/`)
        .replaceAll(sourceCommonComp, `${PKG_PREFIX}/${PKG_NAME}`)
        .replaceAll(sourceCommon, `${PKG_PREFIX}/${PKG_NAME}/`)

      return {
        id: idStr,
        external: 'absolute'
      }
    }
  }
}
export function FullAlias(): Plugin {
  const themeChalk = 'theme-chalk'
  const sourceCommonThemeChalk = `${PKG_PREFIX}/common/${themeChalk}` as const
  const sourceThemeChalk = `${PKG_PREFIX}/${pkgName}/${themeChalk}` as const
  const bundleThemeChalk = `${PKG_PREFIX}/${PKG_NAME}/${themeChalk}` as const
  return {
    name: 'alias-plugin',
    resolveId(id) {
      if (!(id.startsWith(sourceCommonThemeChalk) || id.startsWith(sourceThemeChalk))) return
      const idStr = id
        .replaceAll(sourceThemeChalk, bundleThemeChalk)
        .replaceAll(sourceCommonThemeChalk, bundleThemeChalk)

      return {
        id: idStr,
        external: 'absolute'
      }
    }
  }
}
