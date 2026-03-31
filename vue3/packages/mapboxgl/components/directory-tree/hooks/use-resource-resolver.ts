import type {
  DisabledReasonCode,
  ResourceDescriptor,
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
  serverUrl?: string
  probeError?: unknown
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
      detail.content?.projection ??
      detail.content?.baseProjection ??
      detail.content?.epsgCode ??
      detail.dataMetaInfo?.epsgCode
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
    return {}
  }
  const proxiedAddress = applyServiceProxyUrlPrefix(address, serviceProxyUrlPrefix)
  if (/\/rest\/maps\//i.test(address)) {
    return {
      serverUrl: proxiedAddress
    }
  }

  try {
    const mapList = await fetcher(appendPath(proxiedAddress || address, 'maps.json'))
    if (Array.isArray(mapList) && mapList.length > 0) {
      return {
        serverUrl: applyServiceProxyUrlPrefix(
          pickFirstUrl([mapList[0]?.path, mapList[0]?.url, proxiedAddress || address]),
          serviceProxyUrlPrefix
        )
      }
    }
  } catch (error) {
    return {
      serverUrl: proxiedAddress,
      probeError: error
    }
  }

  return {
    serverUrl: proxiedAddress
  }
}

function normalizeRestDataUrl(address: string | undefined): string | undefined {
  if (!address) {
    return undefined
  }
  if (/\/rest\/data(?:\/|$)/i.test(address)) {
    return address
  }
  return appendPath(address, 'data')
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
  const preferDetail = shouldHydrateFromResourceDetail(node)
  const shouldFetchDetail =
    resourceId != null &&
    (preferDetail || !(raw.mapInfo || raw.layerInfo))
  const detailResult: ResourceDetailFetchResult =
    shouldFetchDetail && resourceId != null
      ? await fetchResourceDetail([`${normalizeBaseUrl(iportalUrl)}/web/datas/${resourceId}.json`], fetcher)
      : {}
  const dataInfo = detailResult.detail
  const dataService = getDataServiceInfo(dataInfo)
  const serviceType = normalizeServiceType(
    preferDetail
      ? dataService?.type ??
          dataService?.serviceType ??
          raw.serviceType ??
          ((raw.url ?? raw.serverUrl)?.includes('/rest/data') ? 'DATA' : undefined)
      : raw.serviceType ??
          dataService?.type ??
          dataService?.serviceType ??
          ((raw.url ?? raw.serverUrl)?.includes('/rest/data') ? 'DATA' : undefined)
  )
  const directServerUrl =
    preferDetail
      ? normalizeRestDataUrl(pickFirstUrl([dataService?.address, dataInfo?.address])) ||
        pickFirstUrl([raw.url, raw.serverUrl])
      : pickFirstUrl([raw.url, raw.serverUrl]) ||
        normalizeRestDataUrl(pickFirstUrl([dataService?.address, dataInfo?.address]))
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
    detailUrl: detailResult.detailUrl
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
  const shouldFetchDetail = resourceId != null
  const detailResult: ResourceDetailFetchResult =
    shouldFetchDetail && resourceId != null
      ? await fetchResourceDetail([`${normalizeBaseUrl(iportalUrl)}/web/services/${resourceId}.json`], fetcher)
      : {}
  const serviceInfo = detailResult.detail
  const preferResolvedDetail = Boolean(serviceInfo)
  const serviceType = normalizeServiceType(
    preferResolvedDetail
      ? serviceInfo?.type ?? serviceInfo?.serviceType ?? raw.type ?? raw.serviceType
      : raw.type ?? raw.serviceType ?? serviceInfo?.type ?? serviceInfo?.serviceType
  )
  const projection =
    normalizeProjection(
      preferResolvedDetail
        ? serviceInfo?.projection ?? serviceInfo?.epsgCode ?? raw.projection ?? raw.epsgCode
        : raw.projection ?? raw.epsgCode ?? serviceInfo?.projection ?? serviceInfo?.epsgCode
    ) || normalizeProjection(context.mapProjection)
  const directServiceUrl = pickFirstUrl(getServiceUrlCandidates(raw, serviceInfo, preferResolvedDetail))
  const proxiedServiceUrl = applyServiceProxyUrlPrefix(directServiceUrl, serviceProxyUrlPrefix)
  const restMapServerResolution =
    isMapServiceType(serviceType)
      ? await resolveRestMapServerUrl(proxiedServiceUrl, fetcher, serviceProxyUrlPrefix)
      : undefined
  const serverUrl =
    isMapServiceType(serviceType)
      ? restMapServerResolution?.serverUrl
      : isDataServiceType(serviceType)
        ? normalizeRestDataUrl(proxiedServiceUrl)
        : isVectorMapServiceType(serviceType) || serviceType === 'ARCGIS_REST_VECTORTILE_SERVICE'
          ? normalizeVectorStyleUrl(proxiedServiceUrl)
        : proxiedServiceUrl
  const nextRaw = {
    ...raw,
    serviceInfo,
    detailUrl: detailResult.detailUrl,
    ...(detailResult.error ? { error: detailResult.error } : {})
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
