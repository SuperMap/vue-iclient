import type {
  DisabledReasonCode,
  ResourceDescriptor,
  RestDataDatasourceDirectoryRaw,
  RestDataDatasetRef,
  RestDataServiceDirectoryRaw,
  RestMapCollectionItem,
  RestMapServiceCollectionRaw,
  RestMapServiceMapRaw,
  ResourceType,
  RuntimeTreeNode,
  ServiceType
} from '../types'
import { DIRECTORY_TREE_SERVICE_TYPES } from '../types'
import {
  ResourceLoadPlanError,
  resolvePortalDataLayer,
  resolveRestDataServiceLayer
} from '../utils/resource-to-webmap'
import {
  appendPath,
  asRecord,
  defaultFetcher,
  isDataServiceType,
  isMapServiceType,
  isVectorMapServiceType,
  normalizeBaseUrl,
  normalizeProjection,
  normalizeServiceType,
  normalizeVectorStyleUrl
} from '../utils/resource-to-webmap/shared'

export interface ResourceResolveContext {
  mapProjection?: string | null
  mapTarget?: string
}

export interface ResourceResolverFetch {
  (url: string): Promise<any>
}

export interface ResourceResolverOptions {
  iportalUrl: string
  fetcher?: ResourceResolverFetch
  serviceProxyUrlPrefix?: string
}

interface ResourceDetailFetchResult {
  detail?: Record<string, any>
  detailUrl?: string
  error?: unknown
}

interface RestMapServerResolution {
  mode: 'single' | 'collection'
  serverUrl?: string
  mapItems?: RestMapCollectionItem[]
  probeError?: unknown
}

interface RestMapInfoResolution {
  serverUrl: string
  detailUrl?: string
  mapInfo?: Record<string, any>
  projection: string | null
  error?: unknown
}

const VECTOR_OVERLAY_LAYER_TYPES = new Set([
  'VECTOR',
  'UNIQUE',
  'RANGE',
  'HEAT',
  'MARKER',
  'MIGRATION',
  'RANK_SYMBOL',
  'DATAFLOW_POINT_TRACK',
  'DATAFLOW_HEAT'
])

function projectionsMatch(resourceProjection: string | null, mapProjection?: string | null): boolean {
  if (!resourceProjection || !mapProjection) {
    return true
  }

  const normalizedResourceProjection = normalizeProjection(resourceProjection)
  const normalizedMapProjection = normalizeProjection(mapProjection)
  if (!normalizedResourceProjection || !normalizedMapProjection) {
    return resourceProjection.trim() === mapProjection.trim()
  }

  return normalizedResourceProjection === normalizedMapProjection
}

function getRawResourceType(node: RuntimeTreeNode): ResourceType {
  return ((node.raw as Record<string, any>)?.resourceType || 'SERVICE') as ResourceType
}

function getResourceId(node: RuntimeTreeNode): string | number {
  const raw = node.raw as Record<string, any>
  return raw.resourceId ?? raw.id
}

function shouldHydrateFromResourceDetail(node: RuntimeTreeNode): boolean {
  return node.sourceType === 'resource-directory'
}

function isSupportedServiceType(serviceType: string | undefined): serviceType is ServiceType {
  return Boolean(serviceType && DIRECTORY_TREE_SERVICE_TYPES.includes(serviceType as ServiceType))
}

function pickFirstUrl(candidates: unknown[]): string | undefined {
  const url = candidates.find(candidate => typeof candidate === 'string' && candidate.trim())
  return typeof url === 'string' ? url.trim() : undefined
}

function normalizeServiceProxyUrlPrefix(serviceProxyUrlPrefix: unknown): string | undefined {
  if (typeof serviceProxyUrlPrefix !== 'string') {
    return undefined
  }
  const trimmed = serviceProxyUrlPrefix.trim()
  if (!trimmed || !/\/portalproxy(?:\/|$)/i.test(trimmed)) {
    return undefined
  }
  return trimmed.replace(/\/+$/, '')
}

function applyServiceProxyUrlPrefix(url: string | undefined, serviceProxyUrlPrefix: unknown): string | undefined {
  if (!url) {
    return undefined
  }

  const normalizedPrefix = normalizeServiceProxyUrlPrefix(serviceProxyUrlPrefix)
  if (!normalizedPrefix || url.startsWith(normalizedPrefix)) {
    return url
  }

  try {
    const parsedUrl = new URL(url)
    const pathname = parsedUrl.pathname.replace(/^\/+/, '')
    return `${normalizedPrefix}/${pathname}${parsedUrl.search}${parsedUrl.hash}`
  } catch {
    return url
  }
}

function splitUrlQuery(url: string): { base: string; query: string } {
  const index = url.indexOf('?')
  if (index < 0) {
    return {
      base: url,
      query: ''
    }
  }

  return {
    base: url.slice(0, index),
    query: url.slice(index + 1)
  }
}

function appendQueryParam(url: string, name: string, value: string): string {
  const { base, query } = splitUrlQuery(url)
  const searchParams = new URLSearchParams(query)
  searchParams.set(name, value)
  const nextQuery = searchParams.toString()
  return nextQuery ? `${base}?${nextQuery}` : base
}

function decodeUrlPathSegment(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function extractRestMapNameFromUrl(address: string | undefined): string | undefined {
  if (!address) {
    return undefined
  }

  const normalizedBase = splitUrlQuery(address).base.replace(/\/+$/, '')
  const matched = normalizedBase.match(/\/rest\/maps\/([^/?#]+?)(?:\.json)?$/i)
  if (!matched?.[1]) {
    return undefined
  }

  return decodeUrlPathSegment(matched[1])
}

function isExplicitRestMapUrl(address: string | undefined): boolean {
  return Boolean(extractRestMapNameFromUrl(address))
}

function extractRestjsrMapNameFromUrl(address: string | undefined): string | undefined {
  if (!address) {
    return undefined
  }

  const normalizedBase = splitUrlQuery(address).base.replace(/\/+$/, '')
  const matched = normalizedBase.match(/\/vectortile\/maps\/([^/?#]+?)(?:\/style\.json|\.json)?$/i)
  if (!matched?.[1]) {
    return undefined
  }

  return decodeUrlPathSegment(matched[1])
}

function isExplicitRestjsrMapUrl(address: string | undefined): boolean {
  return Boolean(extractRestjsrMapNameFromUrl(address))
}

function isRestjsrServiceUrl(address: string | undefined): boolean {
  if (!address) {
    return false
  }

  const normalizedBase = splitUrlQuery(address).base.replace(/\/+$/, '')
  return (
    /\/restjsr$/i.test(normalizedBase) ||
    /\/restjsr\.json$/i.test(normalizedBase) ||
    /\/restjsr\/v\d+\/vectortile(?:\/maps(?:\/[^/?#]+)?)?$/i.test(normalizedBase) ||
    /\/restjsr\/v\d+\/vectortile\/maps\/[^/?#]+\/style\.json$/i.test(normalizedBase)
  )
}

function getProjectionEpsgCode(projection: string | null | undefined): number | undefined {
  const normalizedProjection = normalizeProjection(projection)
  const matched = normalizedProjection?.match(/^EPSG:(\d+)$/i)
  if (!matched?.[1]) {
    return undefined
  }

  const epsgCode = Number.parseInt(matched[1], 10)
  return Number.isInteger(epsgCode) && epsgCode > 0 ? epsgCode : undefined
}

function buildRestjsrMapPath(restServiceUrl: string | undefined, mapName: string | undefined): string | undefined {
  if (!restServiceUrl || !mapName) {
    return undefined
  }

  const trimmedMapName = mapName.trim()
  if (!trimmedMapName) {
    return undefined
  }

  const { base, query } = splitUrlQuery(restServiceUrl)
  const normalizedBase = base.replace(/\/+$/, '')
  let mapBase: string | undefined

  if (/\/restjsr\/v\d+\/vectortile$/i.test(normalizedBase)) {
    mapBase = `${normalizedBase}/maps/${encodeURIComponent(trimmedMapName)}`
  } else if (/\/restjsr\/v\d+\/vectortile\/maps$/i.test(normalizedBase)) {
    mapBase = `${normalizedBase}/${encodeURIComponent(trimmedMapName)}`
  }

  if (!mapBase) {
    return undefined
  }

  return query ? `${mapBase}?${query}` : mapBase
}

function normalizeRestMapCollectionItems(
  items: unknown,
  serviceProxyUrlPrefix?: string,
  restServiceUrl?: string
): RestMapCollectionItem[] {
  if (!Array.isArray(items)) {
    return []
  }

  return items
    .map((item: Record<string, any>) => {
      const name =
        (typeof item?.name === 'string' && item.name.trim()) ||
        (typeof item?.mapTitle === 'string' && item.mapTitle.trim()) ||
        undefined
      const path = applyServiceProxyUrlPrefix(
        pickFirstUrl([item?.path, item?.url, item?.mapUrl]) || buildRestjsrMapPath(restServiceUrl, name),
        serviceProxyUrlPrefix
      )
      const resolvedName = name || extractRestMapNameFromUrl(path) || extractRestjsrMapNameFromUrl(path) || undefined
      if (!path || !resolvedName) {
        return undefined
      }

      return {
        name: resolvedName,
        path
      }
    })
    .filter((item): item is RestMapCollectionItem => !!item)
}

function isRestMapServiceMapRaw(raw: Record<string, any>): raw is RestMapServiceMapRaw {
  return raw.type === 'rest-map-service-map'
}

function isRestMapDynamicProjectionAllowed(
  mapInfo: Record<string, any> | undefined,
  targetProjection: string | null | undefined
): boolean {
  const targetEpsgCode = getProjectionEpsgCode(targetProjection)
  if (!mapInfo || !targetEpsgCode) {
    return false
  }

  const dynamicPrjCoordSyses = Array.isArray(mapInfo.dynamicPrjCoordSyses) ? mapInfo.dynamicPrjCoordSyses : []
  return dynamicPrjCoordSyses.some((item: Record<string, any>) => {
    if (!item || typeof item !== 'object') {
      return false
    }
    if (item.type === 'PCS_ALL') {
      return true
    }

    return normalizeProjection(item) === `EPSG:${targetEpsgCode}`
  })
}

function createRestMapProjectedUrl(serverUrl: string, targetProjection: string | null | undefined): string {
  const epsgCode = getProjectionEpsgCode(targetProjection)
  if (!epsgCode) {
    return serverUrl
  }

  return appendQueryParam(serverUrl, 'prjCoordSys', JSON.stringify({ epsgCode }))
}

function extractRestMapExtent(mapInfo: Record<string, any> | undefined) {
  const bounds = asRecord(mapInfo?.bounds)
  if (!bounds.leftBottom || !bounds.rightTop) {
    return undefined
  }

  return {
    leftBottom: bounds.leftBottom,
    rightTop: bounds.rightTop
  }
}

function buildRestMapLayerInfo(
  serverUrl: string,
  mapInfo: Record<string, any> | undefined,
  fallbackName: string,
  projection: string | null
): Record<string, any> {
  const layerInfo: Record<string, any> = {
    layerType: 'TILE',
    visible: true,
    name: mapInfo?.name || fallbackName,
    url: serverUrl
  }

  const extent = extractRestMapExtent(mapInfo)
  if (extent) {
    layerInfo.extent = extent
  }
  if (Array.isArray(mapInfo?.visibleScales)) {
    layerInfo.visibleScales = mapInfo.visibleScales
  }
  if (typeof mapInfo?.coordUnit === 'string' && mapInfo.coordUnit.trim()) {
    layerInfo.coordUnit = mapInfo.coordUnit
  }
  if (projection) {
    layerInfo.projection = projection
  }

  return layerInfo
}

function createRestMapInfoUrl(serverUrl: string): string {
  const { base, query } = splitUrlQuery(serverUrl)
  const normalizedBase = /\.(?:r?json)$/i.test(base) ? base : `${base.replace(/\/+$/, '')}.json`
  return query ? `${normalizedBase}?${query}` : normalizedBase
}

function createRestMapCollectionUrl(address: string): string {
  const { base, query } = splitUrlQuery(address)
  const normalizedBase = base.replace(/\/+$/, '')
  let collectionBase = normalizedBase

  if (/\/rest\/maps(?:\.json)?$/i.test(normalizedBase)) {
    collectionBase = normalizedBase.replace(/\/rest\/maps(?:\.json)?$/i, '/rest/maps.json')
  } else if (!/\/maps\.json$/i.test(normalizedBase)) {
    collectionBase = `${normalizedBase}/maps.json`
  }

  return query ? `${collectionBase}?${query}` : collectionBase
}

async function fetchRestMapInfo(
  serverUrl: string,
  targetProjection: string | null | undefined,
  fetcher: ResourceResolverFetch
): Promise<RestMapInfoResolution> {
  const detailUrl = createRestMapInfoUrl(serverUrl)

  try {
    const baseMapInfo = asRecord(await fetcher(detailUrl))
    let resolvedServerUrl = serverUrl
    let resolvedDetailUrl = detailUrl
    let resolvedMapInfo = baseMapInfo
    let resolvedProjection = findProjection(baseMapInfo)

    if (
      targetProjection &&
      (!resolvedProjection || !projectionsMatch(resolvedProjection, targetProjection)) &&
      isRestMapDynamicProjectionAllowed(baseMapInfo, targetProjection)
    ) {
      const projectedServerUrl = createRestMapProjectedUrl(serverUrl, targetProjection)
      const projectedDetailUrl = createRestMapInfoUrl(projectedServerUrl)

      try {
        const projectedMapInfo = asRecord(await fetcher(projectedDetailUrl))
        const projectedProjection = findProjection(projectedMapInfo)
        if (projectedProjection && projectionsMatch(projectedProjection, targetProjection)) {
          resolvedServerUrl = projectedServerUrl
          resolvedDetailUrl = projectedDetailUrl
          resolvedMapInfo = projectedMapInfo
          resolvedProjection = projectedProjection
        }
      } catch (_error) {
        // Keep the base map metadata when the dynamic projection probe fails.
      }
    }

    return {
      serverUrl: resolvedServerUrl,
      detailUrl: resolvedDetailUrl,
      mapInfo: resolvedMapInfo,
      projection: resolvedProjection
    }
  } catch (error) {
    return {
      serverUrl,
      detailUrl,
      projection: null,
      error
    }
  }
}

function getServiceMetadataUrl(detail: Record<string, any> | undefined): string | undefined {
  if (!detail) {
    return undefined
  }
  return pickFirstUrl([
    detail.metadata?.distInfo?.onLineSrc?.linkage,
    detail.metadata?.distInfo?.onLineSrc?.url
  ])
}

function getServiceUrlCandidates(
  raw: Record<string, any>,
  serviceInfo: Record<string, any> | undefined,
  preferDetail: boolean
): unknown[] {
  if (preferDetail) {
    return [
      serviceInfo?.proxiedUrl,
      serviceInfo?.address,
      serviceInfo?.serverUrl,
      getServiceMetadataUrl(serviceInfo),
      serviceInfo?.url,
      raw.proxiedUrl,
      raw.address,
      raw.url,
      raw.serverUrl
    ]
  }

  return [
    raw.url,
    raw.serverUrl,
    raw.proxiedUrl,
    raw.address,
    serviceInfo?.proxiedUrl,
    serviceInfo?.address,
    serviceInfo?.serverUrl,
    serviceInfo?.url,
    getServiceMetadataUrl(serviceInfo)
  ]
}

function findFirstLayerUrl(detail: Record<string, any> | undefined): string | undefined {
  if (!detail) {
    return undefined
  }
  const layers = Array.isArray(detail.layers)
    ? detail.layers
    : Array.isArray(detail.content?.layers)
      ? detail.content.layers
      : []
  return pickFirstUrl(layers.map((layer: Record<string, any>) => layer?.url))
}

function findProjection(detail: Record<string, any> | undefined): string | null {
  if (!detail) {
    return null
  }
  return normalizeProjection(
    detail.projection ??
      detail.baseProjection ??
      detail.epsgCode ??
      detail.prjCoordSys ??
      detail.prjCoordSys?.epsgCode ??
      detail.prjCoordSys?.projection ??
      detail.content?.projection ??
      detail.content?.baseProjection ??
      detail.content?.epsgCode ??
      detail.content?.prjCoordSys ??
      detail.dataMetaInfo?.epsgCode ??
      detail.metadata?.refSysInfo?.refSysID ??
      detail.metadata?.refSysInfo?.mdCoRefSys?.refSysID
  )
}

function getPassthroughMapInfo(raw: Record<string, any>): Record<string, any> | undefined {
  const mapInfo = asRecord(raw.mapInfo)
  if (Array.isArray(mapInfo.layers)) {
    return mapInfo
  }

  const nestedMapInfo = asRecord(raw.dataInfo?.mapInfo)
  return Array.isArray(nestedMapInfo.layers) ? nestedMapInfo : undefined
}

function getPassthroughLayerInfo(raw: Record<string, any>): Record<string, any> | undefined {
  const layerInfo = asRecord(raw.layerInfo)
  if (layerInfo.layerType) {
    return layerInfo
  }

  const nestedLayerInfo = asRecord(raw.dataInfo?.layerInfo)
  return nestedLayerInfo.layerType ? nestedLayerInfo : undefined
}

function getPassthroughProjection(raw: Record<string, any>): string | null {
  const mapInfo = getPassthroughMapInfo(raw)
  if (mapInfo) {
    return findProjection(mapInfo)
  }

  const layerInfo = getPassthroughLayerInfo(raw)
  if (!layerInfo) {
    return null
  }

  return normalizeProjection(layerInfo.projection ?? layerInfo.baseProjection ?? layerInfo.epsgCode)
}

function normalizeLayerType(layerInfo: Record<string, any> | undefined): string | undefined {
  if (!layerInfo || typeof layerInfo.layerType !== 'string') {
    return undefined
  }
  const normalizedLayerType = layerInfo.layerType.trim().toUpperCase()
  return normalizedLayerType || undefined
}

function isTransformableVectorLayer(layerInfo: Record<string, any> | undefined): boolean {
  const layerType = normalizeLayerType(layerInfo)
  return !!layerType && VECTOR_OVERLAY_LAYER_TYPES.has(layerType)
}

function canPassthroughUseProjectionTransform(raw: Record<string, any>): boolean {
  const mapInfo = getPassthroughMapInfo(raw)
  if (mapInfo) {
    return Array.isArray(mapInfo.layers) && mapInfo.layers.length > 0 && mapInfo.layers.every(isTransformableVectorLayer)
  }

  return isTransformableVectorLayer(getPassthroughLayerInfo(raw))
}

function canDescriptorUseProjectionTransform(
  resourceType: ResourceType,
  serviceType: string | undefined,
  raw: Record<string, any>
): boolean {
  if (canPassthroughUseProjectionTransform(raw)) {
    return true
  }
  if (resourceType === 'DATA') {
    return true
  }
  return isDataServiceType(normalizeServiceType(serviceType))
}

function getDataServiceInfo(detail: Record<string, any> | undefined): Record<string, any> | undefined {
  if (!detail || !Array.isArray(detail.dataItemServices)) {
    return undefined
  }

  const normalizedServices = detail.dataItemServices.filter(
    (service: Record<string, any>) => isDataServiceType(normalizeServiceType(service?.type ?? service?.serviceType))
  )
  return (
    normalizedServices.find((service: Record<string, any>) => service?.serviceStatus === 'PUBLISHED') ||
    normalizedServices[0]
  )
}

async function fetchResourceDetail(
  urls: string[],
  fetcher: ResourceResolverFetch
): Promise<ResourceDetailFetchResult> {
  let lastError: unknown
  for (const url of urls) {
    try {
      const detail = await fetcher(url)
      if (detail && typeof detail === 'object') {
        return {
          detail: detail as Record<string, any>,
          detailUrl: url
        }
      }
      return {
        detailUrl: url
      }
    } catch (error) {
      lastError = error
    }
  }
  return {
    error: lastError
  }
}

async function resolveRestMapServerUrl(
  address: string | undefined,
  fetcher: ResourceResolverFetch,
  serviceProxyUrlPrefix?: string
): Promise<RestMapServerResolution> {
  if (!address) {
    return {
      mode: 'single'
    }
  }
  const proxiedAddress = applyServiceProxyUrlPrefix(address, serviceProxyUrlPrefix)
  if (isExplicitRestMapUrl(address)) {
    return {
      mode: 'single',
      serverUrl: proxiedAddress
    }
  }

  try {
    const mapList = await fetcher(createRestMapCollectionUrl(proxiedAddress || address))
    const mapItems = normalizeRestMapCollectionItems(mapList, serviceProxyUrlPrefix, proxiedAddress || address)
    if (mapItems.length > 1) {
      return {
        mode: 'collection',
        serverUrl: proxiedAddress,
        mapItems
      }
    }
    if (mapItems.length === 1) {
      return {
        mode: 'single',
        serverUrl: mapItems[0].path
      }
    }
  } catch (error) {
    return {
      mode: 'single',
      serverUrl: proxiedAddress,
      probeError: error
    }
  }

  return {
    mode: 'single',
    serverUrl: proxiedAddress
  }
}

function normalizeRestDataUrl(address: string | undefined): string | undefined {
  if (!address) {
    return undefined
  }
  const datasetRef = parseRestDataDatasetRef(address)
  if (datasetRef) {
    return datasetRef.restDataUrl
  }
  if (/\/rest\/data(?:\/|$)/i.test(address)) {
    return address
  }
  return appendPath(address, 'data')
}

function decodeRestDataPathSegment(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function parseRestDataDatasetRef(address: string | undefined): RestDataDatasetRef | undefined {
  if (!address || typeof address !== 'string') {
    return undefined
  }

  const trimmed = address.trim()
  if (!trimmed) {
    return undefined
  }

  const matched = trimmed.match(/^(.*?\/rest\/data)\/datasources\/([^/?#]+)\/datasets\/([^/?#]+)(?:[/?#]|$)/i)
  if (!matched) {
    const datasourceMatched = trimmed.match(/^(.*?\/rest\/data)\/datasources\/([^/?#]+)(?:[/?#]|$)/i)
    if (!datasourceMatched) {
      return undefined
    }

    return {
      restDataUrl: datasourceMatched[1],
      dataSourceName: decodeRestDataPathSegment(datasourceMatched[2])
    }
  }

  return {
    restDataUrl: matched[1],
    dataSourceName: decodeRestDataPathSegment(matched[2]),
    datasetName: decodeRestDataPathSegment(matched[3])
  }
}

function pickRestDataDatasetRef(candidates: unknown[]): RestDataDatasetRef | undefined {
  for (const candidate of candidates) {
    const datasetRef = parseRestDataDatasetRef(typeof candidate === 'string' ? candidate : undefined)
    if (datasetRef) {
      return datasetRef
    }
  }
  return undefined
}

function parseRestDataServiceRootRef(address: string | undefined): { restDataUrl: string } | undefined {
  if (!address || typeof address !== 'string') {
    return undefined
  }

  const trimmed = address.trim()
  if (!trimmed) {
    return undefined
  }

  const matched = trimmed.match(/^(.*?\/rest)(?:\/data)?\/?(?:\?.*)?(?:#.*)?$/i)
  if (!matched) {
    return undefined
  }

  return {
    restDataUrl: `${matched[1]}/data`
  }
}

function pickRestDataServiceRootRef(candidates: unknown[]): { restDataUrl: string } | undefined {
  for (const candidate of candidates) {
    const serviceRootRef = parseRestDataServiceRootRef(typeof candidate === 'string' ? candidate : undefined)
    if (serviceRootRef) {
      return serviceRootRef
    }
  }
  return undefined
}

function buildRestDataDirectoryRaw({
  node,
  raw,
  resourceType,
  serviceType,
  serverUrl,
  restDataDatasetRef
}: {
  node: RuntimeTreeNode
  raw: Record<string, any>
  resourceType: ResourceType
  serviceType: string | undefined
  serverUrl: string | undefined
  restDataDatasetRef?: RestDataDatasetRef
}): RestDataServiceDirectoryRaw | RestDataDatasourceDirectoryRaw | undefined {
  if (restDataDatasetRef?.datasetName) {
    return undefined
  }

  if (restDataDatasetRef?.dataSourceName && !restDataDatasetRef.datasetName) {
    const restDataDatasourceRaw: RestDataDatasourceDirectoryRaw = {
      type: 'rest-data-datasource',
      resourceId: getResourceId(node),
      resourceType,
      serviceType,
      url: pickFirstUrl([raw.dataService?.address, raw.dataService?.url, raw.url, raw.serverUrl, raw.proxiedUrl, raw.linkPage, serverUrl]),
      restDataUrl: restDataDatasetRef.restDataUrl,
      dataSourceName: restDataDatasetRef.dataSourceName,
      originResource: raw
    }
    return restDataDatasourceRaw
  }

  const restDataServiceRootRef = pickRestDataServiceRootRef([
    raw.dataService?.address,
    raw.dataService?.url,
    raw.url,
    raw.serverUrl,
    raw.proxiedUrl,
    raw.linkPage,
    raw.dataInfo?.address,
    raw.serviceInfo?.address,
    raw.serviceInfo?.url,
    serverUrl
  ])
  if (!restDataServiceRootRef) {
    return undefined
  }

  const restDataServiceRaw: RestDataServiceDirectoryRaw = {
    type: 'rest-data-service',
    resourceId: getResourceId(node),
    resourceType,
    serviceType,
    url: pickFirstUrl([raw.dataService?.address, raw.dataService?.url, raw.url, raw.serverUrl, raw.proxiedUrl, raw.linkPage, serverUrl]),
    restDataUrl: restDataServiceRootRef.restDataUrl,
    originResource: raw
  }
  return restDataServiceRaw
}

function buildDescriptor(
  node: RuntimeTreeNode,
  overrides: Partial<ResourceDescriptor>
): ResourceDescriptor {
  const raw = (node.raw || {}) as Record<string, any>
  const resourceId = getResourceId(node)

  return {
    key: node.key,
    resourceId,
    name: node.title,
    resourceType: getRawResourceType(node),
    sourceNodeId: node.parentKey || node.key,
    overlaySupported: false,
    raw,
    ...overrides
  }
}

function hasRestDataLikeDataService(raw: Record<string, any>): boolean {
  if (pickRestDataDatasetRef([raw.url, raw.serverUrl, raw.proxiedUrl, raw.linkPage])) {
    return true
  }
  const dataInfo = asRecord(raw.dataInfo)
  const dataItemServices = Array.isArray(dataInfo.dataItemServices) ? dataInfo.dataItemServices : []
  return dataItemServices.some((service: Record<string, any>) =>
    isDataServiceType(normalizeServiceType(service?.type ?? service?.serviceType))
  )
}

function shouldTryRestDataForDataDescriptor(
  serviceType: string | undefined,
  serverUrl: string | undefined,
  raw: Record<string, any>
): boolean {
  if (isDataServiceType(serviceType)) {
    return true
  }
  if (typeof serverUrl === 'string' && /\/rest\/data(?:\/|$|\?)/i.test(serverUrl)) {
    return true
  }
  return hasRestDataLikeDataService(raw)
}

function getLoadPlanErrorReason(
  error: unknown,
  fallbackReason: DisabledReasonCode = 'load-failed'
): DisabledReasonCode {
  return error instanceof ResourceLoadPlanError ? error.reason : fallbackReason
}

function resolvePassthroughDescriptor(
  node: RuntimeTreeNode,
  raw: Record<string, any>,
  context: ResourceResolveContext,
  overrides: Partial<ResourceDescriptor>
): ResourceDescriptor | undefined {
  if (!getPassthroughMapInfo(raw) && !getPassthroughLayerInfo(raw)) {
    return undefined
  }

  const projection = getPassthroughProjection(raw) ?? normalizeProjection(overrides.projection)
  if (projection && !projectionsMatch(projection, context.mapProjection) && !canPassthroughUseProjectionTransform(raw)) {
    return buildDescriptor(node, {
      ...overrides,
      projection,
      disabledReason: 'crs-mismatch',
      raw
    })
  }

  return buildDescriptor(node, {
    ...overrides,
    projection,
    overlaySupported: true,
    raw
  })
}

async function resolveRestMapServiceDescriptor(
  node: RuntimeTreeNode,
  raw: Record<string, any>,
  context: ResourceResolveContext,
  fetcher: ResourceResolverFetch,
  serviceType: ServiceType,
  serverUrl: string,
  nextRaw: Record<string, any>
): Promise<ResourceDescriptor> {
  const mapName =
    (typeof raw.mapName === 'string' && raw.mapName.trim()) ||
    extractRestMapNameFromUrl(serverUrl) ||
    node.title
  const restMapInfo = await fetchRestMapInfo(serverUrl, context.mapProjection, fetcher)
  const projection = restMapInfo.projection
  const resolvedRaw = {
    ...nextRaw,
    mapInfo: restMapInfo.mapInfo,
    detailUrl: restMapInfo.detailUrl ?? nextRaw.detailUrl,
    ...(restMapInfo.mapInfo
      ? {
          layerInfo: buildRestMapLayerInfo(restMapInfo.serverUrl, restMapInfo.mapInfo, mapName, projection)
        }
      : {}),
    ...(restMapInfo.error ? { error: restMapInfo.error } : {})
  }
  const passthroughDescriptor = resolvePassthroughDescriptor(node, resolvedRaw, context, {
    serviceType,
    serverUrl: restMapInfo.serverUrl,
    projection
  })

  if (restMapInfo.error) {
    return buildDescriptor(node, {
      disabledReason: 'service-unavailable',
      serviceType,
      serverUrl: restMapInfo.serverUrl,
      projection,
      raw: resolvedRaw
    })
  }
  if (!projection) {
    return buildDescriptor(node, {
      disabledReason: 'missing-projection',
      serviceType,
      serverUrl: restMapInfo.serverUrl,
      projection,
      raw: resolvedRaw
    })
  }
  if (!projectionsMatch(projection, context.mapProjection)) {
    return buildDescriptor(node, {
      disabledReason: 'crs-mismatch',
      serviceType,
      serverUrl: restMapInfo.serverUrl,
      projection,
      raw: resolvedRaw
    })
  }
  if (passthroughDescriptor) {
    return passthroughDescriptor
  }

  return buildDescriptor(node, {
    serviceType,
    serverUrl: restMapInfo.serverUrl,
    projection,
    overlaySupported: true,
    raw: resolvedRaw
  })
}

async function resolveMapDescriptor(
  node: RuntimeTreeNode,
  context: ResourceResolveContext,
  fetcher: ResourceResolverFetch,
  iportalUrl: string,
  serviceProxyUrlPrefix?: string
): Promise<ResourceDescriptor> {
  const raw = (node.raw || {}) as Record<string, any>
  const resourceId = getResourceId(node)

  if (resourceId == null) {
    return buildDescriptor(node, {
      disabledReason: 'load-failed'
    })
  }

  try {
    const detailResult = await fetchResourceDetail([`${normalizeBaseUrl(iportalUrl)}/web/maps/${resourceId}.json`], fetcher)
    const mapInfo = detailResult.detail
    const projection = findProjection(mapInfo)
    const serverUrl = applyServiceProxyUrlPrefix(findFirstLayerUrl(mapInfo), serviceProxyUrlPrefix)

    if (detailResult.error || !mapInfo) {
      return buildDescriptor(node, {
        disabledReason: 'load-failed',
        serviceType: 'MAP',
        serverUrl,
        projection,
        raw: {
          ...raw,
          mapInfo,
          detailUrl: detailResult.detailUrl,
          error: detailResult.error
        }
      })
    }

    if (!projection) {
      return buildDescriptor(node, {
        disabledReason: 'missing-projection',
        serviceType: 'MAP',
        serverUrl,
        projection,
        raw: {
          ...raw,
          mapInfo,
          detailUrl: detailResult.detailUrl
        }
      })
    }
    if (!projectionsMatch(projection, context.mapProjection)) {
      return buildDescriptor(node, {
        disabledReason: 'crs-mismatch',
        serviceType: 'MAP',
        serverUrl,
        projection,
        raw: {
          ...raw,
          mapInfo,
          detailUrl: detailResult.detailUrl
        }
      })
    }

    return buildDescriptor(node, {
      serviceType: 'MAP',
      serverUrl,
      projection,
      overlaySupported: true,
      raw: {
        ...raw,
        mapInfo,
        detailUrl: detailResult.detailUrl
      }
    })
  } catch (error) {
    return buildDescriptor(node, {
      disabledReason: 'load-failed',
      raw: {
        ...raw,
        error
      }
    })
  }
}

async function resolveDataDescriptor(
  node: RuntimeTreeNode,
  context: ResourceResolveContext,
  fetcher: ResourceResolverFetch,
  iportalUrl: string,
  serviceProxyUrlPrefix?: string
): Promise<ResourceDescriptor> {
  const raw = (node.raw || {}) as Record<string, any>
  const resourceId = getResourceId(node)
  const explicitRestDataDatasetRef = asRecord(raw.restDataDatasetRef)
  const rawRestDataDatasetRef =
    typeof explicitRestDataDatasetRef.dataSourceName === 'string' && explicitRestDataDatasetRef.dataSourceName.trim()
      ? {
          restDataUrl: String(explicitRestDataDatasetRef.restDataUrl ?? '').trim(),
          dataSourceName: explicitRestDataDatasetRef.dataSourceName.trim(),
          datasetName:
            typeof explicitRestDataDatasetRef.datasetName === 'string' && explicitRestDataDatasetRef.datasetName.trim()
              ? explicitRestDataDatasetRef.datasetName.trim()
              : undefined
        }
      : undefined
  const preferDetail = shouldHydrateFromResourceDetail(node)
  const shouldFetchDetail =
    resourceId != null &&
    !rawRestDataDatasetRef?.datasetName &&
    (preferDetail || !(raw.mapInfo || raw.layerInfo))
  const detailResult: ResourceDetailFetchResult =
    shouldFetchDetail && resourceId != null
      ? await fetchResourceDetail([`${normalizeBaseUrl(iportalUrl)}/web/datas/${resourceId}.json`], fetcher)
      : {}
  const dataInfo = detailResult.detail
  const dataService = getDataServiceInfo(dataInfo)
  const restDataDatasetRef =
    rawRestDataDatasetRef ||
    pickRestDataDatasetRef(
      preferDetail
        ? [dataService?.address, dataService?.url, dataInfo?.address, raw.url, raw.serverUrl, raw.proxiedUrl, raw.linkPage]
        : [raw.url, raw.serverUrl, raw.proxiedUrl, raw.linkPage, dataService?.address, dataService?.url, dataInfo?.address]
    )
  const isDatasetLevelRestDataRef = Boolean(restDataDatasetRef?.datasetName)
  const serviceType = normalizeServiceType(
    preferDetail
      ? (isDatasetLevelRestDataRef ? 'DATASET' : undefined) ??
          dataService?.type ??
          dataService?.serviceType ??
          raw.serviceType ??
          raw.type ??
          ((raw.url ?? raw.serverUrl)?.includes('/rest/data') ? 'DATA' : undefined)
      : raw.serviceType ??
          raw.type ??
          (isDatasetLevelRestDataRef ? 'DATASET' : undefined) ??
          dataService?.type ??
          dataService?.serviceType ??
          ((raw.url ?? raw.serverUrl)?.includes('/rest/data') ? 'DATA' : undefined)
  )
  const directServerUrl =
    preferDetail
      ? normalizeRestDataUrl(pickFirstUrl([dataService?.address, dataService?.url, dataInfo?.address])) ||
        pickFirstUrl([raw.url, raw.serverUrl, raw.proxiedUrl, raw.linkPage])
      : pickFirstUrl([raw.url, raw.serverUrl, raw.proxiedUrl, raw.linkPage]) ||
        normalizeRestDataUrl(pickFirstUrl([dataService?.address, dataService?.url, dataInfo?.address]))
  const serverUrl =
    applyServiceProxyUrlPrefix(
      isDataServiceType(serviceType) ? normalizeRestDataUrl(directServerUrl) || directServerUrl : directServerUrl,
      serviceProxyUrlPrefix
    )
  const projection = normalizeProjection(
    preferDetail
      ? dataInfo?.projection ?? dataInfo?.epsgCode ?? dataInfo?.dataMetaInfo?.epsgCode ?? raw.projection ?? raw.epsgCode
      : raw.projection ?? raw.epsgCode ?? dataInfo?.projection ?? dataInfo?.epsgCode ?? dataInfo?.dataMetaInfo?.epsgCode
  )
  const nextRaw = {
    ...raw,
    dataInfo,
    dataService,
    detailUrl: detailResult.detailUrl,
    ...(restDataDatasetRef ? { restDataDatasetRef } : {})
  }
  const restDataDirectoryRaw = buildRestDataDirectoryRaw({
    node,
    raw: nextRaw,
    resourceType: 'DATA',
    serviceType,
    serverUrl,
    restDataDatasetRef
  })
  if (restDataDirectoryRaw) {
    return buildDescriptor(node, {
      serviceType,
      serverUrl,
      projection,
      raw: {
        ...nextRaw,
        ...restDataDirectoryRaw
      }
    })
  }

  const passthroughDescriptor = resolvePassthroughDescriptor(node, nextRaw, context, {
    serviceType,
    serverUrl,
    projection
  })

  if (shouldFetchDetail && (detailResult.error || (preferDetail && !dataInfo))) {
    return (
      resolvePassthroughDescriptor(
        node,
        {
          ...nextRaw,
          error: detailResult.error
        },
        context,
        {
          serviceType,
          serverUrl,
          projection
        }
      ) ||
      buildDescriptor(node, {
        disabledReason: 'load-failed',
        serviceType,
        serverUrl,
        projection,
        raw: {
          ...nextRaw,
          error: detailResult.error
        }
      })
    )
  }

  if (passthroughDescriptor) {
    return passthroughDescriptor
  }

  if (
    projection &&
    !projectionsMatch(projection, context.mapProjection) &&
    !canDescriptorUseProjectionTransform('DATA', serviceType, nextRaw)
  ) {
    return buildDescriptor(node, {
      disabledReason: 'crs-mismatch',
      serviceType,
      serverUrl,
      projection,
      raw: nextRaw
    })
  }

  const descriptor = buildDescriptor(node, {
    serviceType,
    serverUrl,
    projection,
    raw: nextRaw
  })

  const tryResolvePortalData = async () => {
    await resolvePortalDataLayer(descriptor, {
      iportalUrl,
      fetcher
    })
    return buildDescriptor(node, {
      serviceType,
      serverUrl,
      projection,
      overlaySupported: true,
      raw: descriptor.raw
    })
  }

  const tryResolveRestData = async () => {
    await resolveRestDataServiceLayer(descriptor, {
      iportalUrl,
      fetcher
    })
    return buildDescriptor(node, {
      serviceType,
      serverUrl,
      projection,
      overlaySupported: true,
      raw: descriptor.raw
    })
  }

  if (shouldTryRestDataForDataDescriptor(serviceType, serverUrl, nextRaw) && serverUrl) {
    try {
      return await tryResolveRestData()
    } catch (restError) {
      if (isDatasetLevelRestDataRef) {
        return buildDescriptor(node, {
          disabledReason: getLoadPlanErrorReason(restError, 'unsupported-resource-type'),
          serviceType,
          serverUrl,
          projection,
          raw: {
            ...nextRaw,
            error: restError
          }
        })
      }
      try {
        return await tryResolvePortalData()
      } catch (portalError) {
        return buildDescriptor(node, {
          disabledReason: getLoadPlanErrorReason(portalError, getLoadPlanErrorReason(restError, 'unsupported-resource-type')),
          serviceType,
          serverUrl,
          projection,
          raw: {
            ...nextRaw,
            error: portalError
          }
        })
      }
    }
  }

  try {
    return await tryResolvePortalData()
  } catch (error) {
    return buildDescriptor(node, {
      disabledReason: getLoadPlanErrorReason(error, 'unsupported-resource-type'),
      serviceType,
      serverUrl,
      projection,
      raw: {
        ...nextRaw,
        error
      }
    })
  }
}

async function resolveServiceDescriptor(
  node: RuntimeTreeNode,
  context: ResourceResolveContext,
  fetcher: ResourceResolverFetch,
  iportalUrl: string,
  serviceProxyUrlPrefix?: string
): Promise<ResourceDescriptor> {
  const raw = (node.raw || {}) as Record<string, any>
  const resourceId = getResourceId(node)
  const restMapServiceRaw = isRestMapServiceMapRaw(raw) ? (raw as RestMapServiceMapRaw & Record<string, any>) : undefined
  const restMapOriginResource = isRestMapServiceMapRaw(raw) ? asRecord(raw.originResource) : undefined
  const embeddedServiceInfo = asRecord(raw.serviceInfo)
  const inheritedServiceInfo =
    Object.keys(embeddedServiceInfo).length > 0 ? embeddedServiceInfo : asRecord(restMapOriginResource?.serviceInfo)
  const detailResourceId =
    !isRestMapServiceMapRaw(raw) ? resourceId : (restMapOriginResource?.resourceId ?? restMapOriginResource?.id)
  const shouldFetchDetail = detailResourceId != null && !isRestMapServiceMapRaw(raw)
  const detailResult: ResourceDetailFetchResult =
    shouldFetchDetail && detailResourceId != null
      ? await fetchResourceDetail([`${normalizeBaseUrl(iportalUrl)}/web/services/${detailResourceId}.json`], fetcher)
      : {}
  const serviceInfo = detailResult.detail || inheritedServiceInfo
  const preferResolvedDetail = Boolean(detailResult.detail)
  const baseServiceType = normalizeServiceType(
    preferResolvedDetail
      ? detailResult.detail?.type ?? detailResult.detail?.serviceType ?? raw.type ?? raw.serviceType
      : raw.serviceType ??
          raw.type ??
          inheritedServiceInfo?.type ??
          inheritedServiceInfo?.serviceType ??
          detailResult.detail?.type ??
          detailResult.detail?.serviceType
  )
  const directServiceUrl = restMapServiceRaw
    ? pickFirstUrl([
        restMapServiceRaw.url,
        restMapServiceRaw.serverUrl,
        restMapServiceRaw.proxiedUrl,
        inheritedServiceInfo?.proxiedUrl,
        inheritedServiceInfo?.address,
        inheritedServiceInfo?.serverUrl,
        inheritedServiceInfo?.url,
        restMapOriginResource?.url,
        restMapOriginResource?.serverUrl,
        restMapOriginResource?.proxiedUrl,
        restMapOriginResource?.address
      ])
    : pickFirstUrl(getServiceUrlCandidates(raw, serviceInfo, preferResolvedDetail))
  const proxiedServiceUrl = applyServiceProxyUrlPrefix(directServiceUrl, serviceProxyUrlPrefix)
  const restjsrDetected = [
    raw.url,
    raw.serverUrl,
    raw.proxiedUrl,
    raw.address,
    raw.linkPage,
    directServiceUrl,
    proxiedServiceUrl,
    serviceInfo?.address,
    serviceInfo?.url,
    serviceInfo?.proxiedUrl
  ].some(candidate => isRestjsrServiceUrl(typeof candidate === 'string' ? candidate : undefined))
  const serviceType = restjsrDetected ? 'VECTOR_MAP' : baseServiceType
  const directProjection =
    findProjection(preferResolvedDetail ? detailResult.detail : undefined) ||
    (preferResolvedDetail
      ? normalizeProjection(raw.projection ?? raw.epsgCode)
      : normalizeProjection(raw.projection ?? raw.epsgCode) ||
        findProjection(serviceInfo) ||
        normalizeProjection(inheritedServiceInfo?.projection ?? inheritedServiceInfo?.epsgCode))
  const projection =
    (isMapServiceType(serviceType) ? directProjection : null) ||
    normalizeProjection(
      !isMapServiceType(serviceType) && !isVectorMapServiceType(serviceType)
        ? directProjection ?? context.mapProjection
        : directProjection
    )
  const restjsrMapItems = restjsrDetected
    ? normalizeRestMapCollectionItems(serviceInfo?.mapInfos, serviceProxyUrlPrefix, proxiedServiceUrl)
    : []
  const restMapServerResolution =
    isMapServiceType(serviceType)
      ? await resolveRestMapServerUrl(proxiedServiceUrl, fetcher, serviceProxyUrlPrefix)
      : undefined
  const restDataDatasetRef = isDataServiceType(serviceType)
    ? pickRestDataDatasetRef(
        [raw.url, raw.serverUrl, raw.proxiedUrl, raw.linkPage, serviceInfo?.address, serviceInfo?.url, serviceInfo?.proxiedUrl]
      )
    : undefined
  const detailServiceType = normalizeServiceType(detailResult.detail?.type ?? detailResult.detail?.serviceType)
  const serverUrl =
    isMapServiceType(serviceType)
      ? restMapServerResolution?.serverUrl
      : isDataServiceType(serviceType)
        ? normalizeRestDataUrl(proxiedServiceUrl)
        : restjsrDetected && restjsrMapItems.length === 1 && !isExplicitRestjsrMapUrl(proxiedServiceUrl)
          ? restjsrMapItems[0].path
        : isVectorMapServiceType(serviceType) || serviceType === 'ARCGIS_REST_VECTORTILE_SERVICE'
          ? normalizeVectorStyleUrl(proxiedServiceUrl)
        : proxiedServiceUrl
  const nextRaw = {
    ...raw,
    serviceInfo,
    detailUrl: detailResult.detailUrl ?? raw.detailUrl,
    ...(restjsrMapItems.length > 0 ? { mapItems: restjsrMapItems } : {}),
    ...(restDataDatasetRef ? { restDataDatasetRef } : {}),
    ...(detailResult.error ? { error: detailResult.error } : {})
  }
  const restDataDirectoryRaw =
    isDataServiceType(serviceType) && (Boolean(restDataDatasetRef) || isDataServiceType(detailServiceType))
    ? buildRestDataDirectoryRaw({
        node,
        raw: nextRaw,
        resourceType: getRawResourceType(node),
        serviceType,
        serverUrl,
        restDataDatasetRef
      })
    : undefined
  if (restDataDirectoryRaw) {
    return buildDescriptor(node, {
      serviceType,
      serverUrl,
      projection,
      raw: {
        ...nextRaw,
        ...restDataDirectoryRaw
      }
    })
  }

  const passthroughDescriptor = resolvePassthroughDescriptor(node, nextRaw, context, {
    serviceType,
    serverUrl,
    projection
  })

  if (shouldFetchDetail && detailResult.error && passthroughDescriptor) {
    return passthroughDescriptor
  }

  if (passthroughDescriptor) {
    return passthroughDescriptor
  }

  if (!serviceType || !isSupportedServiceType(serviceType)) {
    return buildDescriptor(node, {
      disabledReason: 'unsupported-service-type',
      serviceType,
      serverUrl,
      projection,
      raw: nextRaw
    })
  }

  if (serviceInfo?.offline === true || raw.offline === true) {
    return buildDescriptor(node, {
      disabledReason: 'service-unavailable',
      serviceType,
      serverUrl,
      projection,
      raw: nextRaw
    })
  }

  if (restjsrDetected && restjsrMapItems.length > 1 && !isExplicitRestjsrMapUrl(proxiedServiceUrl)) {
    const collectionServiceType = serviceType as RestMapServiceCollectionRaw['serviceType']
    const collectionRaw: RestMapServiceCollectionRaw = {
      type: 'rest-map-service-collection',
      resourceId: detailResourceId ?? resourceId,
      resourceType: getRawResourceType(node),
      serviceType: collectionServiceType,
      restServiceUrl: proxiedServiceUrl || '',
      mapItems: restjsrMapItems,
      originResource: nextRaw
    }

    return buildDescriptor(node, {
      serviceType,
      serverUrl: proxiedServiceUrl,
      projection,
      raw: {
        ...nextRaw,
        ...collectionRaw
      }
    })
  }

  if (isMapServiceType(serviceType) && restMapServerResolution?.mode === 'collection') {
    const collectionServiceType = serviceType as RestMapServiceCollectionRaw['serviceType']
    const collectionRaw: RestMapServiceCollectionRaw = {
      type: 'rest-map-service-collection',
      resourceId: detailResourceId ?? resourceId,
      resourceType: getRawResourceType(node),
      serviceType: collectionServiceType,
      restServiceUrl: restMapServerResolution.serverUrl || proxiedServiceUrl || '',
      mapItems: restMapServerResolution.mapItems || [],
      originResource: nextRaw
    }

    return buildDescriptor(node, {
      serviceType,
      serverUrl: restMapServerResolution.serverUrl,
      raw: {
        ...nextRaw,
        ...collectionRaw
      }
    })
  }

  if (restMapServerResolution?.probeError) {
    return buildDescriptor(node, {
      disabledReason: 'service-unavailable',
      serviceType,
      serverUrl,
      projection,
      raw: {
        ...nextRaw,
        error: restMapServerResolution.probeError
      }
    })
  }

  if (isMapServiceType(serviceType)) {
    if (!serverUrl) {
      return buildDescriptor(node, {
        disabledReason: 'load-failed',
        serviceType,
        projection,
        raw: nextRaw
      })
    }

    return resolveRestMapServiceDescriptor(node, raw, context, fetcher, serviceType, serverUrl, nextRaw)
  }

  if (isDataServiceType(serviceType)) {
    const restDataDescriptor = buildDescriptor(node, {
      serviceType,
      serverUrl,
      projection,
      raw: nextRaw
    })

    try {
      await resolveRestDataServiceLayer(restDataDescriptor, {
        iportalUrl,
        fetcher
      })
    } catch (error) {
      return buildDescriptor(node, {
        disabledReason: getLoadPlanErrorReason(error, 'unsupported-service-type'),
        serviceType,
        serverUrl,
        projection,
        raw: {
          ...nextRaw,
          error
        }
      })
    }
  }

  if (!serverUrl) {
    return buildDescriptor(node, {
      disabledReason: 'load-failed',
      serviceType,
      projection,
      raw: {
        ...nextRaw
      }
    })
  }
  if (!projection) {
    return buildDescriptor(node, {
      disabledReason: 'missing-projection',
      serviceType,
      serverUrl,
      projection,
      raw: {
        ...nextRaw
      }
    })
  }
  if (
    !projectionsMatch(projection, context.mapProjection) &&
    !canDescriptorUseProjectionTransform('SERVICE', serviceType, nextRaw)
  ) {
    return buildDescriptor(node, {
      disabledReason: 'crs-mismatch',
      serviceType,
      serverUrl,
      projection,
      raw: {
        ...nextRaw
      }
    })
  }

  return buildDescriptor(node, {
    serviceType,
    serverUrl,
    projection,
    overlaySupported: true,
    raw: nextRaw
  })
}

export function useResourceResolver(options: ResourceResolverOptions) {
  const fetcher = options.fetcher || defaultFetcher

  async function resolveResourceNode(
    node: RuntimeTreeNode,
    context: ResourceResolveContext = {}
  ): Promise<ResourceDescriptor> {
    const resourceType = getRawResourceType(node)

    if (resourceType === 'MAP') {
      return resolveMapDescriptor(node, context, fetcher, options.iportalUrl, options.serviceProxyUrlPrefix)
    }
    if (resourceType === 'DATA') {
      return resolveDataDescriptor(node, context, fetcher, options.iportalUrl, options.serviceProxyUrlPrefix)
    }
    return resolveServiceDescriptor(node, context, fetcher, options.iportalUrl, options.serviceProxyUrlPrefix)
  }

  function getCheckFailure(
    descriptor: ResourceDescriptor,
    context: Pick<ResourceResolveContext, 'mapTarget'>
  ): DisabledReasonCode | undefined {
    if (!context.mapTarget) {
      return 'missing-map-target'
    }
    return descriptor.disabledReason
  }

  return {
    normalizeProjection,
    resolveResourceNode,
    getCheckFailure
  }
}
