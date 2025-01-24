import { getPkgByCommand, getPKGNAME, PKG_PREFIX } from '@supermapgis/build-utils'

import type { Plugin } from 'rollup'

const pkgName = getPkgByCommand(process.argv)
const PKG_NAME = getPKGNAME(pkgName)
export function Alias(): Plugin {
  const themeChalk = 'theme-chalk'
  const sourceThemeChalk = `${PKG_PREFIX}/${themeChalk}` as const
  const bundleThemeChalk = `${PKG_NAME}/${themeChalk}` as const

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
