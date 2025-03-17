import { resolve } from 'path'
import { getPKG_NAME } from './repo'

type Pkg = 'mapboxgl' | 'leaflet'

export type { Pkg }
export const rootDir = resolve(__dirname, '..', '..', '..', '..')
export const coreRoot = resolve(rootDir, 'core')

export const projRoot = resolve(__dirname, '..', '..', '..')
export const getPkgRoot = (pkg: Pkg | 'common') => resolve(projRoot, 'packages', pkg)
export const getLocaleRoot = (pkg: Pkg | 'common') => resolve(getPkgRoot(pkg), 'locale')
export const getCompRoot = (pkg: Pkg) => resolve(getPkgRoot(pkg), 'components')
export const getUtilsRoot = (pkg: Pkg) => resolve(getPkgRoot(pkg), 'utils')
export const getThemeRoot = (pkg: Pkg | 'common') => resolve(getPkgRoot(pkg), 'theme-chalk')

export const buildRoot = resolve(projRoot, 'tools', 'build')

/** `/dist` */
export const buildOutput = resolve(projRoot, 'dist')
/** `/dist/vue3-iclient-mapboxgl` */
export const getEpOutput = (pkg: Pkg) => resolve(buildOutput, getPKG_NAME(pkg))

export const projPackage = resolve(projRoot, 'package.json')
export const getPackage = (pkg: Pkg) => resolve(getPkgRoot(pkg), 'package.json')
export const getCompPackage = (pkg: Pkg) => resolve(getCompRoot(pkg), 'package.json')
export const getThemePackage = (pkg: Pkg) => resolve(getThemeRoot(pkg), 'package.json')
