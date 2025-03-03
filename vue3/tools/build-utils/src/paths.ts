import { resolve } from 'path'

type Pkg = 'mapboxgl' | 'leaflet'

let pkgName: Pkg = 'leaflet'

export type { Pkg }
const setPkgName = (val: Pkg) => {
  pkgName = val
}
const getPkgName = () => {
  return pkgName
}
export { setPkgName, getPkgName }
export const rootDir = resolve(__dirname, '..', '..', '..', '..')
export const coreRoot = resolve(rootDir, 'core')

export const projRoot = resolve(__dirname, '..', '..', '..')
export const getPkgRoot = (pkg: Pkg | 'common') => resolve(projRoot, 'packages', pkg)
export const getLocaleRoot = (pkg: Pkg | 'common') => resolve(getPkgRoot(pkg), 'locale')
export const getCompRoot = (pkg: Pkg) => resolve(getPkgRoot(pkg), 'components')
export const getUtilsRoot = (pkg: Pkg) => resolve(getPkgRoot(pkg), 'utils')
export const getThemeRoot = (pkg: Pkg | 'common') => resolve(getPkgRoot(pkg), 'theme-chalk')
export const getEpRoot = (pkg: Pkg) => resolve(getPkgRoot(pkg), `vue-iclient-${pkg}`)

export const buildRoot = resolve(projRoot, 'tools', 'build')

/** `/dist` */
export const buildOutput = resolve(projRoot, 'dist')
/** `/dist/vue-iclient-mapboxgl` */
export const getEpOutput = (pkg: Pkg) => resolve(buildOutput, `vue-iclient-${pkg}`)

export const projPackage = resolve(projRoot, 'package.json')
export const getCompPackage = (pkg: Pkg) => resolve(getCompRoot(pkg), 'package.json')
export const getThemePackage = (pkg: Pkg) => resolve(getThemeRoot(pkg), 'package.json')
export const getEpPackage = (pkg: Pkg) => resolve(getEpRoot(pkg), 'package.json')
