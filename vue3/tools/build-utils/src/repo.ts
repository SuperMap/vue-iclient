import type { Pkg } from './paths'
import { upperFirst } from 'lodash-es'
import { getPackage } from './paths'
import { getPackageName } from './pkg'

export const PKG_PREFIX = '@supermapgis'

export const getPKG_NAME = (pkgName: Pkg) => {
  const epPackage = getPackage(pkgName)
  const name = getPackageName(epPackage)
  return name.split('/')[1]
}
export const getPKG_BRAND_NAME = (name: Pkg) => `Vue iClient ${upperFirst(name)}`
