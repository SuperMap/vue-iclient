import type { Pkg } from './paths'

export const REPO_OWNER = 'vue-iclient-mapboxgl'
export const REPO_NAME = 'vue-iclient-mapboxgl'
export const REPO_PATH = `${REPO_OWNER}/${REPO_NAME}`
export const REPO_BRANCH = 'dev'
export const PKG_PREFIX = '@supermapgis'
export const PKG_BRAND_NAME = 'Vue iClient Mapboxgl'
export const PKG_CAMELCASE_NAME = 'VueiClientMapboxgl'
export const PKG_CAMELCASE_LOCAL_NAME = 'VueiClientMapboxglLocale'
export const getPKGNAME = (name: Pkg) => `vue-iclient-${name}`
