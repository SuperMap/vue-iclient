import { getPkgByCommand, getPKG_NAME, PKG_PREFIX } from '@supermapgis/build-utils'

import type { Plugin } from 'rollup'

const pkgName = getPkgByCommand(process.argv)
const PKG_NAME = getPKG_NAME(pkgName)
export function Alias(): Plugin {
  const themeChalk = 'theme-chalk'
  const sourceThemeChalk = `${PKG_PREFIX}/${pkgName}/${themeChalk}` as const
  const bundleThemeChalk = `${PKG_PREFIX}/${PKG_NAME}/${themeChalk}` as const

  return {
    name: 'alias-plugin',
    resolveId(id) {
      if (!id.startsWith(sourceThemeChalk)) return
      return {
        id: id.replaceAll(sourceThemeChalk, bundleThemeChalk),
        external: 'absolute'
      }
    }
  }
}
