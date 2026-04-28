import type { ResourceDescriptor, ResourceLoadPlan, WmtsLayerItem } from '../../types'
import type { ResourceLoadPlanBuildOptions } from './types'
import { ResourceLoadPlanError } from './types'
import {
  asRecord,
  isDataServiceType,
  isMapServiceType,
  isVectorMapServiceType,
  normalizeBaseUrl,
  normalizeProjection,
  normalizeServiceType,
  normalizeVectorStyleUrl,
  splitUrlQuery
} from './shared'
import {
  buildChildMapInfo,
  buildMapInfoWithLayer,
  getDescriptorRaw,
  getPassthroughLayerInfo,
  getPassthroughMapInfo
} from './map-info'
import { resolvePortalDataLayer, resolveRestDataServiceLayer } from './data-layer'

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
}

function extractFirstWmsLayerInfo(metadataString: unknown): { layerName?: string; layerTitle?: string } | undefined {
  if (typeof metadataString !== 'string' || !metadataString.trim()) {
    return undefined
  }

  const normalizedMetadata = decodeXmlEntities(metadataString)
  const layerPattern =
    /<Layer\b[^>]*queryable="1"[^>]*>[\s\S]*?<Name>([^<]+)<\/Name>[\s\S]*?<Title>([^<]*)<\/Title>[\s\S]*?<\/Layer>/i
  const match = normalizedMetadata.match(layerPattern)
  if (!match) {
    return undefined
  }

  const layerName = match[1]?.trim()
  const layerTitle = match[2]?.trim()
  return {
    layerName: layerName || undefined,
    layerTitle: layerTitle || undefined
  }
}

function decodeUrlPathSegment(segment: string): string | undefined {
  const trimmed = segment.trim()
  if (!trimmed) {
    return undefined
  }

  try {
    const decoded = decodeURIComponent(trimmed).trim()
    return decoded || undefined
  } catch {
    return trimmed
  }
}

function extractWmsLayerNameFromServiceUrl(serverUrl: unknown): string | undefined {
  if (typeof serverUrl !== 'string' || !serverUrl.trim()) {
    return undefined
  }

  const { base } = splitUrlQuery(serverUrl.trim())
  const normalizedBase = base.replace(/\/+$/, '')
  const match = normalizedBase.match(/\/wms(?:\d+)?\/([^/?#]+)$/i)
  if (!match?.[1]) {
    return undefined
  }

  return decodeUrlPathSegment(match[1])
}

function extractWmtsInfoFromThumbnailUrl(
  mapThumbnail: unknown
): { layer?: string; tileMatrixSet?: string } | undefined {
  if (typeof mapThumbnail !== 'string' || !mapThumbnail.trim()) {
    return undefined
  }

  const normalizedThumbnail = mapThumbnail.trim()
  let pathname = normalizedThumbnail

  try {
    pathname = new URL(normalizedThumbnail).pathname
  } catch {
    pathname = normalizedThumbnail.split('?')[0]
  }

  const segments = pathname.split('/').filter(Boolean)
  const defaultIndex = segments.findIndex(segment => segment === 'default')
  if (defaultIndex <= 0 || defaultIndex + 1 >= segments.length) {
    return undefined
  }

  const layer = decodeUrlPathSegment(segments[defaultIndex - 1])
  const tileMatrixSet = decodeUrlPathSegment(segments[defaultIndex + 1])
  if (!layer && !tileMatrixSet) {
    return undefined
  }

  return {
    layer,
    tileMatrixSet
  }
}

export function appendWmtsCapabilitiesQuery(url: string): string {
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}REQUEST=GetCapabilities&SERVICE=WMTS&VERSION=1.0.0`
}

export async function fetchWmtsCapabilitiesText(
  serverUrl: string,
  options: Partial<Pick<ResourceLoadPlanBuildOptions, 'withCredentials' | 'iportalUrl'>>
): Promise<string | undefined> {
  if (typeof fetch !== 'function') {
    return undefined
  }

  const response = await fetch(appendWmtsCapabilitiesQuery(serverUrl), {
    credentials: options.withCredentials === false ? 'same-origin' : 'include'
  })
  if (!response.ok) {
    return undefined
  }
  return response.text()
}

function extractXmlText(xml: string, tagName: string): string | undefined {
  const pattern = new RegExp(`<(?:[\\w-]+:)?${tagName}\\b[^>]*>([\\s\\S]*?)<\\/(?:[\\w-]+:)?${tagName}>`, 'i')
  const matched = xml.match(pattern)
  const value = matched?.[1]?.trim()
  return value ? decodeXmlEntities(value) : undefined
}

function extractXmlTexts(xml: string, tagName: string): string[] {
  const pattern = new RegExp(`<(?:[\\w-]+:)?${tagName}\\b[^>]*>([\\s\\S]*?)<\\/(?:[\\w-]+:)?${tagName}>`, 'gi')
  const values: string[] = []
  let matched = pattern.exec(xml)
  while (matched) {
    const value = matched[1]?.trim()
    if (value) {
      values.push(decodeXmlEntities(value))
    }
    matched = pattern.exec(xml)
  }
  return values
}

function normalizeWmtsCrs(value: string | undefined): string {
  return (value || '').toUpperCase()
}

function normalizeWmtsWellKnownScaleSet(value: string | undefined): string {
  return (value || '').toUpperCase()
}

const ICLIENT_DEFAULT_WELL_KNOWN_SCALE_SETS = [
  'GOOGLECRS84QUAD',
  'GOOGLEMAPSCOMPATIBLE',
  'URN:OGC:DEF:WKSS:OGC:1.0:GOOGLEMAPSCOMPATIBLE',
  'URN:OGC:DEF:WKSS:OGC:1.0:GOOGLECRS84QUAD'
]

const ICLIENT_SCALE_DENOMINATORS_3857 = [
  559082264.0287178, 279541132.0143589, 139770566.00717944, 69885283.00358972, 34942641.50179486, 17471320.75089743,
  8735660.375448715, 4367830.1877243575, 2183915.0938621787, 1091957.5469310894, 545978.7734655447, 272989.38673277234,
  136494.69336638617, 68247.34668319309, 34123.67334159654, 17061.83667079827, 8530.918335399136, 4265.459167699568,
  2132.729583849784, 1066.364791924892, 533.182395962446, 266.591197981223, 133.2955989906115
]

const ICLIENT_SCALE_DENOMINATORS_4326 = [
  559082264.0287176, 279541132.0143588, 139770566.0071794, 69885283.0035897, 34942641.50179485, 17471320.750897426,
  8735660.375448713, 4367830.187724357, 2183915.0938621783, 1091957.5469310891, 545978.7734655446, 272989.3867327723,
  136494.69336638614, 68247.34668319307, 34123.673341596535, 17061.836670798268, 8530.918335399134, 4265.459167699567,
  2132.7295838497835, 1066.3647919248917, 533.1823959624459, 266.59119798122293, 133.29559899061147
]

function isIClientDefaultWellKnownScaleSet(wellKnownScaleSet: string | undefined): boolean {
  return ICLIENT_DEFAULT_WELL_KNOWN_SCALE_SETS.includes(normalizeWmtsWellKnownScaleSet(wellKnownScaleSet))
}

function isGoogleMapsCompatibleTileMatrixSet(tileMatrixSet: string, wellKnownScaleSet?: string): boolean {
  const normalizedWellKnownScaleSet = normalizeWmtsWellKnownScaleSet(wellKnownScaleSet)
  return normalizedWellKnownScaleSet.includes('GOOGLEMAPSCOMPATIBLE') || /GOOGLEMAPSCOMPATIBLE/i.test(tileMatrixSet)
}

function isGoogleCrs84QuadTileMatrixSet(tileMatrixSet: string, wellKnownScaleSet?: string): boolean {
  const normalizedWellKnownScaleSet = normalizeWmtsWellKnownScaleSet(wellKnownScaleSet)
  return normalizedWellKnownScaleSet.includes('GOOGLECRS84QUAD') || /GOOGLECRS84QUAD/i.test(tileMatrixSet)
}

function numberEqual(num1: unknown, num2: unknown, precision = 10E-6): boolean {
  return Math.abs(Number(num1) - Number(num2)) <= precision
}

function isSameWmtsTopLeftCorner(topLeftCorner: string | undefined, projection: string): boolean {
  const values = topLeftCorner?.split(/\s+/)
  if (!values || values.length < 2) {
    return false
  }

  const expected = projection === 'EPSG:3857' ? [-2.0037508342789248e7, 2.0037508342789087e7] : [-180, 90]
  return (
    numberEqual(values[0], expected[0]) &&
    numberEqual(values[1], expected[1])
  ) || (
    numberEqual(values[0], expected[1]) &&
    numberEqual(values[1], expected[0])
  )
}

function isIClientSupportedTileMatrixSet(matrixSetBlock: string | undefined, projection: string): boolean {
  if (!matrixSetBlock) {
    return false
  }
  const wellKnownScaleSet = extractXmlText(matrixSetBlock, 'WellKnownScaleSet')
  if (isIClientDefaultWellKnownScaleSet(wellKnownScaleSet)) {
    return true
  }

  const defaultScaleDenominators = projection === 'EPSG:3857' ? ICLIENT_SCALE_DENOMINATORS_3857 : ICLIENT_SCALE_DENOMINATORS_4326
  const tileMatrixBlocks = matrixSetBlock.match(/<TileMatrix\b[^>]*>[\s\S]*?<\/TileMatrix>/gi) || []
  return tileMatrixBlocks.some(tileMatrixBlock => {
    const identifier = Number(extractXmlText(tileMatrixBlock, 'Identifier'))
    const defaultScaleDenominator = defaultScaleDenominators[identifier]
    if (!Number.isFinite(identifier) || !defaultScaleDenominator) {
      return false
    }
    return (
      isSameWmtsTopLeftCorner(extractXmlText(tileMatrixBlock, 'TopLeftCorner'), projection) &&
      numberEqual(defaultScaleDenominator, Number.parseFloat(extractXmlText(tileMatrixBlock, 'ScaleDenominator') || ''))
    )
  })
}

function pickWmtsTileMatrixSet(
  tileMatrixSets: string[],
  matrixSetCrsMap: Map<string, string>,
  matrixSetWellKnownScaleSetMap: Map<string, string>,
  matrixSetBlockMap: Map<string, string>,
  targetProjection?: string | null
) {
  const normalizedProjection = normalizeProjection(targetProjection)
  if (normalizedProjection === 'EPSG:3857') {
    const matched = tileMatrixSets.find(tileMatrixSet => {
      const crs = normalizeWmtsCrs(matrixSetCrsMap.get(tileMatrixSet))
      return (crs.includes('3857') || isGoogleMapsCompatibleTileMatrixSet(tileMatrixSet, matrixSetWellKnownScaleSetMap.get(tileMatrixSet))) &&
        isIClientSupportedTileMatrixSet(matrixSetBlockMap.get(tileMatrixSet), normalizedProjection)
    })
    if (matched) {
      return matched
    }
    return undefined
  }

  if (normalizedProjection === 'EPSG:4326') {
    const googleCrs84Quad = tileMatrixSets.find(tileMatrixSet =>
      isGoogleCrs84QuadTileMatrixSet(tileMatrixSet, matrixSetWellKnownScaleSetMap.get(tileMatrixSet)) &&
      isIClientSupportedTileMatrixSet(matrixSetBlockMap.get(tileMatrixSet), normalizedProjection)
    )
    if (googleCrs84Quad) {
      return googleCrs84Quad
    }

    const matched = tileMatrixSets.find(tileMatrixSet => {
      const crs = normalizeWmtsCrs(matrixSetCrsMap.get(tileMatrixSet))
      return (crs.includes('4326') || crs.includes('CRS84')) &&
        isIClientSupportedTileMatrixSet(matrixSetBlockMap.get(tileMatrixSet), normalizedProjection)
    })
    if (matched) {
      return matched
    }
    return undefined
  }

  return tileMatrixSets[0]
}

export function resolveWmtsTargetProjection(serviceInfo: Record<string, any>, options: ResourceLoadPlanBuildOptions): string | null {
  const mapProjection = normalizeProjection(options.mapSnapshot?.projection)
  const serviceProjection =
    normalizeProjection(serviceInfo.projection) ||
    normalizeProjection(serviceInfo.baseProjection) ||
    normalizeProjection(serviceInfo.epsgCode) ||
    normalizeProjection(serviceInfo.prjCoordSys) ||
    normalizeProjection(serviceInfo.metadata?.refSysInfo?.refSysID) ||
    normalizeProjection(serviceInfo.metadata?.refSysInfo?.mdCoRefSys?.refSysID)

  return mapProjection || serviceProjection
}

function createWmtsLayerItem(
  layerBlock: string,
  matrixSetCrsMap: Map<string, string>,
  matrixSetWellKnownScaleSetMap: Map<string, string>,
  matrixSetBlockMap: Map<string, string>,
  targetProjection?: string | null
): WmtsLayerItem | undefined {
  const layer = extractXmlText(layerBlock, 'Identifier')
  if (!layer) {
    return undefined
  }

  const layerTitle = extractXmlText(layerBlock, 'Title')
  const tileMatrixSets = extractXmlTexts(layerBlock, 'TileMatrixSet')
  const tileMatrixSet = pickWmtsTileMatrixSet(
    tileMatrixSets,
    matrixSetCrsMap,
    matrixSetWellKnownScaleSetMap,
    matrixSetBlockMap,
    targetProjection
  )

  return {
    name: layerTitle || layer,
    layer,
    layerID: layerTitle || layer,
    tileMatrixSet
  }
}

export function extractWmtsLayerItemsFromCapabilities(
  capabilitiesText: string,
  targetProjection?: string | null
): WmtsLayerItem[] {
  const layerBlocks = capabilitiesText.match(/<Layer\b[^>]*>[\s\S]*?<\/Layer>/gi) || []
  const matrixSetBlocks = capabilitiesText.match(/<TileMatrixSet\b[^>]*>[\s\S]*?<\/TileMatrixSet>/gi) || []
  const matrixSetCrsMap = new Map<string, string>()
  const matrixSetWellKnownScaleSetMap = new Map<string, string>()
  const matrixSetBlockMap = new Map<string, string>()

  matrixSetBlocks.forEach(matrixSetBlock => {
    const identifier = extractXmlText(matrixSetBlock, 'Identifier')
    const supportedCrs = extractXmlText(matrixSetBlock, 'SupportedCRS')
    const wellKnownScaleSet = extractXmlText(matrixSetBlock, 'WellKnownScaleSet')
    if (identifier) {
      matrixSetBlockMap.set(identifier, matrixSetBlock)
      if (supportedCrs) {
        matrixSetCrsMap.set(identifier, supportedCrs)
      }
      if (wellKnownScaleSet) {
        matrixSetWellKnownScaleSetMap.set(identifier, wellKnownScaleSet)
      }
    }
  })

  return layerBlocks
    .map(layerBlock =>
      createWmtsLayerItem(
        layerBlock,
        matrixSetCrsMap,
        matrixSetWellKnownScaleSetMap,
        matrixSetBlockMap,
        targetProjection
      )
    )
    .filter((item): item is WmtsLayerItem => !!item)
}

function pickWmtsLayerBlock(
  layerBlocks: string[],
  descriptorName: string,
  targetProjection?: string | null
): string | undefined {
  const exactMatchedLayerBlock = layerBlocks.find(layerBlock => {
    const identifier = extractXmlText(layerBlock, 'Identifier')
    const title = extractXmlText(layerBlock, 'Title')
    return identifier === descriptorName || title === descriptorName
  })
  if (exactMatchedLayerBlock) {
    return exactMatchedLayerBlock
  }

  if (normalizeProjection(targetProjection) === 'EPSG:4326') {
    const projectionMatchedLayerBlock = layerBlocks.find(layerBlock => {
      const identifier = extractXmlText(layerBlock, 'Identifier') || ''
      const title = extractXmlText(layerBlock, 'Title') || ''
      return /(^|[_-])4326($|[_-])/i.test(identifier) || /(^|[_-])4326($|[_-])/i.test(title)
    })
    if (projectionMatchedLayerBlock) {
      return projectionMatchedLayerBlock
    }
  }

  return layerBlocks[0]
}

function extractWmtsInfoFromCapabilities(
  capabilitiesText: string,
  descriptorName: string,
  targetProjection?: string | null
): { layer?: string; layerID?: string; tileMatrixSet?: string; name: string } | undefined {
  const layerBlocks = capabilitiesText.match(/<Layer\b[^>]*>[\s\S]*?<\/Layer>/gi) || []
  const matrixSetBlocks = capabilitiesText.match(/<TileMatrixSet\b[^>]*>[\s\S]*?<\/TileMatrixSet>/gi) || []
  const matrixSetCrsMap = new Map<string, string>()
  const matrixSetWellKnownScaleSetMap = new Map<string, string>()
  const matrixSetBlockMap = new Map<string, string>()

  matrixSetBlocks.forEach(matrixSetBlock => {
    const identifier = extractXmlText(matrixSetBlock, 'Identifier')
    const supportedCrs = extractXmlText(matrixSetBlock, 'SupportedCRS')
    const wellKnownScaleSet = extractXmlText(matrixSetBlock, 'WellKnownScaleSet')
    if (identifier) {
      matrixSetBlockMap.set(identifier, matrixSetBlock)
      if (supportedCrs) {
        matrixSetCrsMap.set(identifier, supportedCrs)
      }
      if (wellKnownScaleSet) {
        matrixSetWellKnownScaleSetMap.set(identifier, wellKnownScaleSet)
      }
    }
  })

  const matchedLayerBlock = pickWmtsLayerBlock(layerBlocks, descriptorName, targetProjection)

  if (!matchedLayerBlock) {
    return undefined
  }

  const layerItem = createWmtsLayerItem(
    matchedLayerBlock,
    matrixSetCrsMap,
    matrixSetWellKnownScaleSetMap,
    matrixSetBlockMap,
    targetProjection
  )
  if (!layerItem?.layer && !layerItem?.tileMatrixSet) {
    return undefined
  }

  return {
    layer: layerItem.layer,
    layerID: layerItem.layerID,
    tileMatrixSet: layerItem.tileMatrixSet,
    name: layerItem.name || descriptorName
  }
}

function pickPreferredWmtsMapInfo(serviceInfo: Record<string, any>, descriptorName: string): Record<string, any> | undefined {
  const mapInfos = Array.isArray(serviceInfo.mapInfos) ? serviceInfo.mapInfos : []
  if (mapInfos.length === 0) {
    return undefined
  }

  return (
    mapInfos.find((mapInfo: Record<string, any>) => mapInfo?.mapTitle === descriptorName || mapInfo?.name === descriptorName) ||
    mapInfos.find((mapInfo: Record<string, any>) => typeof mapInfo?.mapTitle === 'string' || typeof mapInfo?.mapThumbnail === 'string') ||
    mapInfos[0]
  )
}

function pickNonEmptyString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }
  return undefined
}

function normalizeWmsRequestedLayers(serviceInfo: Record<string, any>, metadataLayerName?: string, urlLayerName?: string): string[] {
  if (Array.isArray(serviceInfo.layers)) {
    return serviceInfo.layers.filter((layer: unknown) => typeof layer === 'string' && layer.trim())
  }
  if (Array.isArray(serviceInfo.layerNames)) {
    return serviceInfo.layerNames.filter((layer: unknown) => typeof layer === 'string' && layer.trim())
  }

  const fallbackLayer = pickNonEmptyString(metadataLayerName, serviceInfo.layerID, urlLayerName)
  return fallbackLayer ? [fallbackLayer] : []
}

async function resolveWmtsLayerMetadata(
  serviceInfo: Record<string, any>,
  descriptorName: string,
  serverUrl: string,
  options: ResourceLoadPlanBuildOptions
): Promise<{ layer?: string; layerID?: string; tileMatrixSet?: string; name: string }> {
  const preferredMapInfo = pickPreferredWmtsMapInfo(serviceInfo, descriptorName)
  const thumbnailInfo = extractWmtsInfoFromThumbnailUrl(preferredMapInfo?.mapThumbnail)
  const layer = pickNonEmptyString(
    serviceInfo.layer,
    thumbnailInfo?.layer,
    preferredMapInfo?.layer,
    preferredMapInfo?.mapTitle,
    preferredMapInfo?.name
  )
  const layerID = pickNonEmptyString(
    serviceInfo.layerID,
    preferredMapInfo?.mapTitle,
    preferredMapInfo?.name,
    thumbnailInfo?.layer,
    layer
  )
  const tileMatrixSet = pickNonEmptyString(
    serviceInfo.tileMatrixSet,
    preferredMapInfo?.tileMatrixSet,
    thumbnailInfo?.tileMatrixSet
  )
  const targetProjection = resolveWmtsTargetProjection(serviceInfo, options)

  if (layer && tileMatrixSet && !targetProjection) {
    return {
      layer,
      layerID: layerID || layer,
      tileMatrixSet,
      name: layerID || layer || descriptorName
    }
  }

  try {
    const capabilitiesText = await fetchWmtsCapabilitiesText(serverUrl, options)
    const capabilitiesInfo = capabilitiesText
      ? extractWmtsInfoFromCapabilities(capabilitiesText, descriptorName, targetProjection)
      : undefined
    if (capabilitiesInfo) {
      return {
        layer: capabilitiesInfo.layer || layer,
        layerID: layerID || capabilitiesInfo.layerID || capabilitiesInfo.layer,
        tileMatrixSet: capabilitiesInfo.tileMatrixSet || tileMatrixSet,
        name: layerID || layer || capabilitiesInfo.name
      }
    }
  } catch {
    // Keep the original metadata result when WMTS capabilities cannot be read.
  }

  return {
    layer,
    layerID,
    tileMatrixSet,
    name: layerID || layer || descriptorName
  }
}

export function buildMapLoadPlan(
  descriptor: ResourceDescriptor,
  options: ResourceLoadPlanBuildOptions
): ResourceLoadPlan {
  if (descriptor.resourceId == null) {
    throw new ResourceLoadPlanError('load-failed', `Missing map id for ${descriptor.key}`)
  }

  return {
    kind: 'map-id',
    mapId: descriptor.resourceId,
    serverUrl: normalizeBaseUrl(options.iportalUrl),
    withCredentials: options.withCredentials
  }
}

export async function buildPassthroughLoadPlan(
  descriptor: ResourceDescriptor,
  options: ResourceLoadPlanBuildOptions
): Promise<ResourceLoadPlan | undefined> {
  const raw = getDescriptorRaw(descriptor)
  const mapInfo = getPassthroughMapInfo(raw)
  if (mapInfo) {
    return {
      kind: 'webmap-object',
      mapInfo: buildChildMapInfo(descriptor.name, mapInfo, options.mapSnapshot),
      serverUrl: normalizeBaseUrl(options.iportalUrl),
      withCredentials: options.withCredentials
    }
  }

  const layerInfo = getPassthroughLayerInfo(raw)
  if (layerInfo) {
    return {
      kind: 'webmap-object',
      mapInfo: buildMapInfoWithLayer(descriptor.name, layerInfo, options.mapSnapshot),
      serverUrl: normalizeBaseUrl(options.iportalUrl),
      withCredentials: options.withCredentials
    }
  }

  return undefined
}

export async function buildServiceLoadPlan(
  descriptor: ResourceDescriptor,
  options: ResourceLoadPlanBuildOptions
): Promise<ResourceLoadPlan> {
  const serviceType =
    descriptor.serviceType ||
    getDescriptorRaw(descriptor).serviceInfo?.type ||
    getDescriptorRaw(descriptor).serviceInfo?.serviceType
  const normalizedServiceType = normalizeServiceType(serviceType)
  const raw = getDescriptorRaw(descriptor)
  const serviceInfo = asRecord(raw.serviceInfo)
  const serverUrl = descriptor.serverUrl || serviceInfo.url || serviceInfo.address

  if (isMapServiceType(normalizedServiceType)) {
    if (!serverUrl) {
      throw new ResourceLoadPlanError('load-failed', `Missing map url for ${descriptor.key}`)
    }
    const layerInfo = {
      layerType: 'TILE',
      visible: true,
      name: descriptor.name,
      url: serverUrl
    }
    return {
      kind: 'webmap-object',
      mapInfo: buildMapInfoWithLayer(descriptor.name, layerInfo, options.mapSnapshot),
      serverUrl: normalizeBaseUrl(options.iportalUrl),
      withCredentials: options.withCredentials
    }
  }

  if (normalizedServiceType === 'WMS') {
    if (!serverUrl) {
      throw new ResourceLoadPlanError('load-failed', `Missing WMS url for ${descriptor.key}`)
    }
    const metadataLayerInfo = extractFirstWmsLayerInfo(serviceInfo.metadataString)
    const urlLayerName = extractWmsLayerNameFromServiceUrl(serverUrl)
    const requestedLayers = normalizeWmsRequestedLayers(serviceInfo, metadataLayerInfo?.layerName, urlLayerName)
    if (!requestedLayers.length) {
      throw new ResourceLoadPlanError('load-failed', `Missing WMS layer metadata for ${descriptor.key}`)
    }
    const layerID = pickNonEmptyString(
      serviceInfo.layerID,
      metadataLayerInfo?.layerTitle,
      requestedLayers[0],
      urlLayerName
    )
    const layerTitle = pickNonEmptyString(
      metadataLayerInfo?.layerTitle,
      layerID,
      descriptor.name,
      requestedLayers[0]
    )
    const layerInfo = {
      layerType: 'WMS',
      visible: true,
      name: layerTitle,
      url: serverUrl,
      layers: requestedLayers,
      layerID
    }
    return {
      kind: 'webmap-object',
      mapInfo: buildMapInfoWithLayer(descriptor.name, layerInfo, options.mapSnapshot),
      serverUrl: normalizeBaseUrl(options.iportalUrl),
      withCredentials: options.withCredentials
    }
  }

  if (normalizedServiceType === 'WMTS') {
    if (!serverUrl) {
      throw new ResourceLoadPlanError('load-failed', `Missing WMTS url for ${descriptor.key}`)
    }
    const wmtsLayerMetadata = await resolveWmtsLayerMetadata(serviceInfo, descriptor.name, serverUrl, options)
    const wmtsRequestLayer = wmtsLayerMetadata.layer || wmtsLayerMetadata.layerID
    if (!wmtsRequestLayer) {
      throw new ResourceLoadPlanError('load-failed', `Missing WMTS layer metadata for ${descriptor.key}`)
    }
    if (!wmtsLayerMetadata.tileMatrixSet) {
      throw new ResourceLoadPlanError('load-failed', `Unsupported WMTS tileMatrixSet for ${descriptor.key}`)
    }
    const displayLayerName = descriptor.name || wmtsLayerMetadata.name || wmtsRequestLayer
    const displayLayerId = `${displayLayerName}_${descriptor.resourceId}`
    const layerInfo = {
      layerType: 'WMTS',
      visible: true,
      name: displayLayerName,
      url: serverUrl,
      layer: wmtsRequestLayer,
      layerID: displayLayerId,
      tileMatrixSet: wmtsLayerMetadata.tileMatrixSet,
      requestEncoding: serviceInfo.requestEncoding || 'KVP',
      dpi: serviceInfo.dpi || 90.7142857142857
    }
    return {
      kind: 'webmap-object',
      mapInfo: buildMapInfoWithLayer(descriptor.name, layerInfo, options.mapSnapshot),
      serverUrl: normalizeBaseUrl(options.iportalUrl),
      withCredentials: options.withCredentials
    }
  }

  if (isDataServiceType(normalizedServiceType)) {
    const layerInfo = await resolveRestDataServiceLayer(descriptor, options)
    return {
      kind: 'webmap-object',
      mapInfo: buildMapInfoWithLayer(descriptor.name, layerInfo, options.mapSnapshot),
      serverUrl: normalizeBaseUrl(options.iportalUrl),
      withCredentials: options.withCredentials
    }
  }

  if (isVectorMapServiceType(normalizedServiceType)) {
    const styleUrl = normalizeVectorStyleUrl(serverUrl)
    if (!styleUrl) {
      throw new ResourceLoadPlanError('load-failed', `Missing vector style url for ${descriptor.key}`)
    }
    const layerInfo = {
      layerType: 'MAPBOXSTYLE',
      visible: true,
      name: descriptor.name,
      dataSource: {
        type: 'EXTERNAL',
        url: styleUrl
      }
    }
    return {
      kind: 'webmap-object',
      mapInfo: buildMapInfoWithLayer(descriptor.name, layerInfo, options.mapSnapshot),
      serverUrl: normalizeBaseUrl(options.iportalUrl),
      withCredentials: options.withCredentials
    }
  }

  if (normalizedServiceType === 'ARCGIS_REST_VECTORTILE_SERVICE') {
    const styleUrl = normalizeVectorStyleUrl(serverUrl)
    if (!styleUrl) {
      throw new ResourceLoadPlanError('load-failed', `Missing ArcGIS vector style url for ${descriptor.key}`)
    }
    const layerInfo = {
      layerType: 'MAPBOXSTYLE',
      visible: true,
      name: descriptor.name,
      dataSource: {
        type: 'ARCGIS_VECTORTILE',
        url: styleUrl
      }
    }
    return {
      kind: 'webmap-object',
      mapInfo: buildMapInfoWithLayer(descriptor.name, layerInfo, options.mapSnapshot),
      serverUrl: normalizeBaseUrl(options.iportalUrl),
      withCredentials: options.withCredentials
    }
  }

  throw new ResourceLoadPlanError('unsupported-service-type', `Unsupported service type for ${descriptor.key}`)
}

export async function buildDataLoadPlan(
  descriptor: ResourceDescriptor,
  options: ResourceLoadPlanBuildOptions
): Promise<ResourceLoadPlan> {
  let layerInfo: Record<string, any>

  if (isDataServiceType(normalizeServiceType(descriptor.serviceType)) && descriptor.serverUrl) {
    try {
      layerInfo = await resolveRestDataServiceLayer(descriptor, options)
    } catch {
      layerInfo = await resolvePortalDataLayer(descriptor, options)
    }
  } else {
    layerInfo = await resolvePortalDataLayer(descriptor, options)
  }

  return {
    kind: 'webmap-object',
    mapInfo: buildMapInfoWithLayer(descriptor.name, layerInfo, options.mapSnapshot),
    serverUrl: normalizeBaseUrl(options.iportalUrl),
    withCredentials: options.withCredentials
  }
}

export async function buildResourceLoadPlan(
  descriptor: ResourceDescriptor,
  options: ResourceLoadPlanBuildOptions
): Promise<ResourceLoadPlan> {
  if (descriptor.resourceType === 'MAP') {
    return buildMapLoadPlan(descriptor, options)
  }

  const passthroughLoadPlan = await buildPassthroughLoadPlan(descriptor, options)
  if (passthroughLoadPlan) {
    return passthroughLoadPlan
  }

  if (descriptor.resourceType === 'SERVICE') {
    return buildServiceLoadPlan(descriptor, options)
  }
  if (descriptor.resourceType === 'DATA') {
    return buildDataLoadPlan(descriptor, options)
  }

  throw new ResourceLoadPlanError('unsupported-resource-type', `Unsupported resource type for ${descriptor.key}`)
}
