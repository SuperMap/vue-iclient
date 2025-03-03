import { getPkgByCommand, getPKG_NAME, PKG_PREFIX } from '@supermapgis/build-utils'
import type { Plugin } from 'rollup'

const pkgName = getPkgByCommand(process.argv)
const PKG_NAME = getPKG_NAME(pkgName)
export function Alias(): Plugin {
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

export const copyCoreLibs = {
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
