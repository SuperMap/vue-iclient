import { FetchRequest } from '@supermapgis/iclient-common/util/FetchRequest'
import { vertifyEpsgCode } from 'vue-iclient-core/utils/iServerRestService'

const STRUCTURED_DATA_REQUEST_LIMIT = 5000
const STRUCTURED_DATA_ITEMS_URL_PATTERN = /\/structureddata\/ogc-features\/collections\/all\/items\.json(?:\?|$)/i

function isValidParentResourceId(parentResId: unknown): boolean {
  if (parentResId == null) {
    return false
  }
  if (typeof parentResId === 'string') {
    const trimmed = parentResId.trim()
    return trimmed !== '' && trimmed.toLowerCase() !== 'undefined'
  }
  return true
}

function isStructuredDataItemsUrl(url: unknown): url is string {
  return typeof url === 'string' && STRUCTURED_DATA_ITEMS_URL_PATTERN.test(url)
}

function buildStructuredDataRequestUrl(url: string, offset = 0): string {
  const [baseUrl] = url.split('?')
  const requestUrl = `${baseUrl}?limit=${STRUCTURED_DATA_REQUEST_LIMIT}`
  return offset > 0 ? `${requestUrl}&offset=${offset}` : requestUrl
}

function getStructuredDataFeatures(data: any): any[] {
  if (Array.isArray(data?.features)) {
    return data.features
  }
  return Array.isArray(data) ? data : []
}

function getProjectionCode(projection: unknown): string | undefined {
  if (typeof projection !== 'string') {
    return undefined
  }
  const trimmed = projection.trim().toUpperCase()
  const match = trimmed.match(/^EPSG:(\d+)$/)
  if (!match) {
    return undefined
  }
  const code = Number.parseInt(match[1], 10)
  return Number.isInteger(code) && code > 0 ? `EPSG:${code}` : undefined
}

function inferStructuredDataProjection(features: any[]): string | undefined {
  if (!Array.isArray(features) || !features.length) {
    return undefined
  }

  try {
    const epsgCode = vertifyEpsgCode(features[0])
    return epsgCode === 3857 ? 'EPSG:3857' : 'EPSG:4326'
  } catch {
    return undefined
  }
}

function rectifyStructuredDataLayerProjection(layer: Record<string, any> | undefined, features: any[]) {
  if (!layer) {
    return
  }

  const inferredProjection = inferStructuredDataProjection(features)
  if (!inferredProjection) {
    return
  }

  const currentProjection = getProjectionCode(layer.projection)
  if (!currentProjection) {
    layer.projection = inferredProjection
    return
  }

  if (
    (currentProjection === 'EPSG:4326' || currentProjection === 'EPSG:3857') &&
    currentProjection !== inferredProjection
  ) {
    layer.projection = inferredProjection
  }
}

function getStructuredDataMatchedCount(data: any, fallbackCount: number): number {
  const matchedCount = Number(data?.numberMatched)
  return Number.isFinite(matchedCount) && matchedCount >= 0 ? matchedCount : fallbackCount
}

async function fetchStructuredDataPage(webMapService: any, url: string): Promise<any> {
  const proxy = typeof webMapService.handleProxy === 'function' ? webMapService.handleProxy() : undefined
  const withCredentials =
    typeof webMapService.handleWithCredentials === 'function'
      ? webMapService.handleWithCredentials(proxy, url, webMapService.withCredentials)
      : webMapService.withCredentials
  const response = await FetchRequest.get(url, null, {
    withCredentials,
    proxy,
    withoutFormatSuffix: true
  })
  return response.json()
}

async function fetchStructuredDataFeatures(webMapService: any, dataSourceUrl: string): Promise<any[]> {
  const firstPage = await fetchStructuredDataPage(webMapService, buildStructuredDataRequestUrl(dataSourceUrl))
  let featureResults = getStructuredDataFeatures(firstPage)
  const matchedCount = getStructuredDataMatchedCount(firstPage, featureResults.length)
  if (matchedCount <= STRUCTURED_DATA_REQUEST_LIMIT) {
    return featureResults
  }

  for (let offset = STRUCTURED_DATA_REQUEST_LIMIT; offset < matchedCount; offset += STRUCTURED_DATA_REQUEST_LIMIT) {
    const result = await fetchStructuredDataPage(webMapService, buildStructuredDataRequestUrl(dataSourceUrl, offset))
    featureResults = featureResults.concat(getStructuredDataFeatures(result))
  }
  return featureResults
}

export function patchInvalidParentResHandling(webMapService: any): boolean {
  if (!webMapService || typeof webMapService.handleParentRes !== 'function') {
    return false
  }

  // Depends on private chain: childWebMap._handler.webMapService.handleParentRes.
  // Needed because parentResId can be invalid ("undefined"), which breaks URL handling.
  // Check WebMapService.handleParentRes first when upgrading dependencies.
  const originalHandleParentRes = webMapService.handleParentRes.bind(webMapService)
  webMapService.handleParentRes = (url: string, parentResId = webMapService.mapId, parentResType = 'MAP') => {
    if (!isValidParentResourceId(parentResId)) {
      return url
    }
    return originalHandleParentRes(url, parentResId, parentResType)
  }
  return true
}

export function patchStructuredDataFeatureLoading(webMapService: any): boolean {
  if (!webMapService || typeof webMapService._getFeaturesFromUserData !== 'function') {
    return false
  }

  // Depends on private methods: _getFeaturesFromUserData and parseGeoJsonData2Feature.
  // Needed to page all structureddata features and fix projection before conversion.
  // Check these two WebMapService methods first when upgrading dependencies.
  const originalGetFeaturesFromUserData = webMapService._getFeaturesFromUserData.bind(webMapService)
  webMapService._getFeaturesFromUserData = async (layer: Record<string, any>) => {
    const dataSourceUrl = layer?.dataSource?.url
    if (!isStructuredDataItemsUrl(dataSourceUrl)) {
      return originalGetFeaturesFromUserData(layer)
    }

    const features = await fetchStructuredDataFeatures(webMapService, dataSourceUrl)
    rectifyStructuredDataLayerProjection(layer, features)
    const parsedFeatures =
      typeof webMapService.parseGeoJsonData2Feature === 'function'
        ? webMapService.parseGeoJsonData2Feature({
            allDatas: {
              features
            }
          })
        : features
    return {
      type: 'feature',
      features: parsedFeatures
    }
  }
  return true
}

export function applyWebMapServicePrivatePatches(webMapService: any): boolean {
  const parentPatched = patchInvalidParentResHandling(webMapService)
  const structuredPatched = patchStructuredDataFeatureLoading(webMapService)
  return parentPatched || structuredPatched
}
