import type { Pkg } from './paths'
import { upperFirst } from 'lodash-unified'

export const PKG_PREFIX = '@supermapgis'
export const getPKG_NAME = (name: Pkg) => `vue-iclient-${name}`
export const getPKG_BRAND_NAME = (name: Pkg) => `Vue iClient ${upperFirst(name)}`
