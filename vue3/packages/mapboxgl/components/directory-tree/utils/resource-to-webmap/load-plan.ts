import type { ResourceDescriptor, ResourceLoadPlan } from '../../types'
import type { ResourceLoadPlanBuildOptions } from './types'
import { ResourceLoadPlanError } from './types'
import {
  asRecord,
  isDataServiceType,
  isMapServiceType,
  isVectorMapServiceType,
  normalizeBaseUrl,
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
  } catch (_error) {
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

function hasRestDataLikeDataService(raw: Record<string, any>): boolean {
  const dataInfo = asRecord(raw.dataInfo)
  const dataItemServices = Array.isArray(dataInfo.dataItemServices) ? dataInfo.dataItemServices : []
  return dataItemServices.some((service: Record<string, any>) =>
    isDataServiceType(normalizeServiceType(service?.type ?? service?.serviceType))
  )
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
    const requestedLayers = Array.isArray(serviceInfo.layers)
      ? serviceInfo.layers
      : Array.isArray(serviceInfo.layerNames)
        ? serviceInfo.layerNames
        : metadataLayerInfo?.layerName
          ? [metadataLayerInfo.layerName]
          : [urlLayerName || serviceInfo.layerID || descriptor.name]
    const layerTitle = serviceInfo.layerID || metadataLayerInfo?.layerTitle || urlLayerName || descriptor.name
    const layerInfo = {
      layerType: 'WMS',
      visible: true,
      name: layerTitle,
      url: serverUrl,
      layers: requestedLayers,
      layerID: layerTitle
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
    const layerInfo = {
      layerType: 'WMTS',
      visible: true,
      name: descriptor.name,
      url: serverUrl,
      layer: serviceInfo.layer || descriptor.name,
      layerID: serviceInfo.layerID || descriptor.name,
      tileMatrixSet: serviceInfo.tileMatrixSet || 'Custom_China',
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
  const raw = getDescriptorRaw(descriptor)
  let layerInfo: Record<string, any>

  if (
    (isDataServiceType(normalizeServiceType(descriptor.serviceType)) ||
      hasRestDataLikeDataService(raw) ||
      (typeof descriptor.serverUrl === 'string' && /\/rest\/data(?:\/|$|\?)/i.test(descriptor.serverUrl))) &&
    descriptor.serverUrl
  ) {
    try {
      layerInfo = await resolveRestDataServiceLayer(descriptor, options)
    } catch (_error) {
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
