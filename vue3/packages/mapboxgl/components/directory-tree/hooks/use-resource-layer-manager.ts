import { FetchRequest } from '@supermapgis/iclient-common/util/FetchRequest'
import WebMapViewModel from 'vue-iclient-controllers-mapboxgl/src/WebMapViewModel'
import { vertifyEpsgCode } from 'vue-iclient-core/utils/iServerRestService'
import mapEvent from 'vue-iclient-core/types/map-event'
import proj4 from 'proj4'
import type { DisabledReasonCode, ResourceDescriptor, ResourceLoadPlan } from '../types'
import {
  buildResourceLoadPlan,
  createMapSnapshot,
  shouldSkipDirectoryTreeShadowBaseLayer,
  type ResourceLoadPlanBuildOptions,
  type ResourceToWebMapFetch
} from '../utils/resource-to-webmap'
import { defaultDirectoryTreeFetcher } from '../utils/fetcher'

export interface ResourceLayerManagerContext {
  map?: any
  mapTarget?: string
  webmap?: any
}

export interface ResourceLayerManagerOptions {
  iportalUrl: string
  withCredentials?: boolean
  fetcher?: ResourceToWebMapFetch
  buildLoadPlan?: (
    descriptor: ResourceDescriptor,
    options: ResourceLoadPlanBuildOptions
  ) => Promise<ResourceLoadPlan>
  mapEvent?: Pick<typeof mapEvent, 'setWebMap' | 'deleteWebMap'>
  WebMapViewModelClass?: new (mapId: any, options?: Record<string, any>, mapOptions?: Record<string, any>) => any
}

interface CachedResourceItem {
  webMap: any
  mapTarget: string
}

interface PendingLoad {
  cancelled: boolean
  mapTarget?: string
  promise: Promise<any>
}

export class ResourceLayerManagerError extends Error {
  reason: DisabledReasonCode

  constructor(reason: DisabledReasonCode, message?: string) {
    super(message || reason)
    this.name = 'ResourceLayerManagerError'
    this.reason = reason
  }
}

const BUILT_IN_PROJECTIONS = new Set(['EPSG:3857', 'EPSG:4326', 'EPSG:4490', 'EPSG:4214', 'EPSG:4610'])
const STRUCTURED_DATA_REQUEST_LIMIT = 5000
const STRUCTURED_DATA_ITEMS_URL_PATTERN = /\/structureddata\/ogc-features\/collections\/all\/items\.json(?:\?|$)/i

function normalizeBaseUrl(iportalUrl: string): string {
  return iportalUrl.endsWith('/') ? iportalUrl.slice(0, -1) : iportalUrl
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

function isSameOriginUrl(url: string | undefined): boolean {
  if (!url || typeof window === 'undefined' || !window.location?.origin) {
    return false
  }
  try {
    return new URL(url, window.location.origin).origin === window.location.origin
  } catch {
    return false
  }
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

  const requests: Promise<any>[] = []
  for (let offset = STRUCTURED_DATA_REQUEST_LIMIT; offset < matchedCount; offset += STRUCTURED_DATA_REQUEST_LIMIT) {
    requests.push(fetchStructuredDataPage(webMapService, buildStructuredDataRequestUrl(dataSourceUrl, offset)))
  }

  const results = await Promise.all(requests)
  results.forEach(result => {
    featureResults = featureResults.concat(getStructuredDataFeatures(result))
  })
  return featureResults
}

export function useResourceLayerManager(options: ResourceLayerManagerOptions) {
  const buildLoadPlan = options.buildLoadPlan || buildResourceLoadPlan
  const mapEventBridge = options.mapEvent || mapEvent
  const WebMapViewModelCtor = options.WebMapViewModelClass || WebMapViewModel
  const fetcher = options.fetcher || defaultDirectoryTreeFetcher

  const cacheMaps = new Map<string, CachedResourceItem>()
  const pendingLoads = new Map<string, PendingLoad>()
  const projectionWktCache = new Map<string, Promise<string | undefined>>()
  let currentContext: ResourceLayerManagerContext = {}
  let queue = Promise.resolve()

  function setMapContext(context: ResourceLayerManagerContext) {
    currentContext = {
      ...currentContext,
      ...context
    }
  }

  function resolveContext(context: ResourceLayerManagerContext = {}): ResourceLayerManagerContext {
    return {
      ...currentContext,
      ...context
    }
  }

  function enqueue<T>(task: () => Promise<T>): Promise<T> {
    const run = queue.then(task, task)
    queue = run.then(
      () => undefined,
      () => undefined
    )
    return run
  }

  function getInheritedWebMapOptions(context: ResourceLayerManagerContext = {}) {
    const parentOptions = context.webmap?.options || {}
    return {
      withCredentials: parentOptions.withCredentials,
      excludePortalProxyUrl: parentOptions.excludePortalProxyUrl,
      proxy: parentOptions.proxy,
      proj4: parentOptions.proj4,
      iportalServiceProxyUrlPrefix:
        parentOptions.iportalServiceProxyUrlPrefix || (typeof window !== 'undefined' ? (window as any).iportalServiceProxyUrl : undefined)
    }
  }

  function resolveChildWebMapWithCredentials(
    plan: ResourceLoadPlan,
    inheritedOptions: ReturnType<typeof getInheritedWebMapOptions>
  ) {
    if (plan.withCredentials != null) {
      return plan.withCredentials
    }
    if (options.withCredentials != null) {
      return options.withCredentials
    }
    if (inheritedOptions.withCredentials === true) {
      return true
    }

    // DirectoryTree always targets the current iPortal. Default to credentialed requests
    // there so private same-origin resources can reuse the browser session cookie.
    if (isSameOriginUrl(plan.serverUrl || options.iportalUrl)) {
      return true
    }

    return inheritedOptions.withCredentials ?? false
  }

  async function ensureProjectionRegistered(descriptor: ResourceDescriptor) {
    const projectionCode = getProjectionCode(descriptor.projection)
    if (!projectionCode || BUILT_IN_PROJECTIONS.has(projectionCode) || proj4.defs(projectionCode)) {
      return
    }

    let projectionWktPromise = projectionWktCache.get(projectionCode)
    if (!projectionWktPromise) {
      const epsgCode = projectionCode.replace(/^EPSG:/, '')
      const projectionUrl = `${normalizeBaseUrl(options.iportalUrl)}/epsgcodes/${epsgCode}.json`
      projectionWktPromise = fetcher(projectionUrl)
        .then((result: any) => (typeof result?.wkt === 'string' && result.wkt.trim() ? result.wkt : undefined))
        .catch(() => undefined)
      projectionWktCache.set(projectionCode, projectionWktPromise)
    }

    const projectionWkt = await projectionWktPromise
    if (projectionWkt && !proj4.defs(projectionCode)) {
      proj4.defs(projectionCode, projectionWkt)
    }
  }

  function createChildWebMap(plan: ResourceLoadPlan, context: ResourceLayerManagerContext) {
    const mapId = plan.kind === 'map-id' ? plan.mapId : plan.mapInfo
    const layerFilter =
      plan.kind === 'webmap-object'
        ? (((layer: Record<string, any>) => !shouldSkipDirectoryTreeShadowBaseLayer(layer)) as unknown as () => boolean)
        : undefined
    const inheritedOptions = getInheritedWebMapOptions(context)
    const childWebMapOptions: Record<string, any> = {
      serverUrl: plan.serverUrl || options.iportalUrl,
      withCredentials: resolveChildWebMapWithCredentials(plan, inheritedOptions),
      target: context.mapTarget,
      map: context.map,
      layerFilter,
      proxy: inheritedOptions.proxy,
      proj4: inheritedOptions.proj4 || proj4,
      excludePortalProxyUrl: inheritedOptions.excludePortalProxyUrl,
      iportalServiceProxyUrlPrefix: inheritedOptions.iportalServiceProxyUrlPrefix
    }
    const childWebMap = new WebMapViewModelCtor(
      mapId,
      childWebMapOptions,
      {}
    )
    const webMapService = childWebMap?._handler?.webMapService
    if (webMapService && typeof webMapService.handleParentRes === 'function') {
      const originalHandleParentRes = webMapService.handleParentRes.bind(webMapService)
      webMapService.handleParentRes = (url: string, parentResId = webMapService.mapId, parentResType = 'MAP') => {
        if (!isValidParentResourceId(parentResId)) {
          return url
        }
        return originalHandleParentRes(url, parentResId, parentResType)
      }
    }
    if (webMapService && typeof webMapService._getFeaturesFromUserData === 'function') {
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
    }
    return childWebMap
  }

  function waitForLoadResult(
    childWebMap: any,
    descriptor: ResourceDescriptor,
    context: ResourceLayerManagerContext,
    pendingLoad: PendingLoad
  ) {
    return new Promise((resolve, reject) => {
      const events = {
        addlayerssucceeded: () => {
          cleanup()
          if (pendingLoad.cancelled) {
            childWebMap.cleanLayers?.()
            reject(new ResourceLayerManagerError('load-failed', `Resource ${descriptor.key} was cancelled`))
            return
          }

          cacheMaps.set(descriptor.key, {
            webMap: childWebMap,
            mapTarget: context.mapTarget as string
          })
          mapEventBridge.setWebMap?.(context.mapTarget as string, childWebMap, descriptor.key)
          resolve(childWebMap)
        },
        projectionnotmatch: () => {
          cleanup()
          childWebMap.cleanLayers?.()
          reject(new ResourceLayerManagerError('crs-mismatch', `Projection mismatch for ${descriptor.key}`))
        },
        layerorsourcenameduplicated: () => {
          cleanup()
          childWebMap.cleanLayers?.()
          reject(new ResourceLayerManagerError('load-failed', `Duplicate layer or source for ${descriptor.key}`))
        }
      }

      const cleanup = () => {
        childWebMap.un?.(events)
      }

      childWebMap.on?.(events)
    })
  }

  async function applyResource(
    descriptor: ResourceDescriptor,
    context: ResourceLayerManagerContext = {}
  ): Promise<any> {
    const mergedContext = resolveContext(context)
    if (!mergedContext.map || !mergedContext.mapTarget) {
      throw new ResourceLayerManagerError('missing-map-target', `Missing map context for ${descriptor.key}`)
    }

    const cached = cacheMaps.get(descriptor.key)
    if (cached) {
      return cached.webMap
    }

    const pending = pendingLoads.get(descriptor.key)
    if (pending) {
      return pending.promise
    }

    const pendingLoad: PendingLoad = {
      cancelled: false,
      mapTarget: mergedContext.mapTarget,
      promise: Promise.resolve()
    }

    pendingLoad.promise = enqueue(async () => {
      if (pendingLoad.cancelled) {
        throw new ResourceLayerManagerError('load-failed', `Resource ${descriptor.key} was cancelled`)
      }

      const loadPlan = await buildLoadPlan(descriptor, {
        iportalUrl: options.iportalUrl,
        withCredentials: options.withCredentials,
        fetcher,
        mapSnapshot: createMapSnapshot({
          map: mergedContext.map,
          webmap: mergedContext.webmap,
          fallbackProjection: descriptor.projection
        })
      })

      if (pendingLoad.cancelled) {
        throw new ResourceLayerManagerError('load-failed', `Resource ${descriptor.key} was cancelled`)
      }

      await ensureProjectionRegistered(descriptor)

      const childWebMap = createChildWebMap(loadPlan, mergedContext)
      return waitForLoadResult(childWebMap, descriptor, mergedContext, pendingLoad)
    }).finally(() => {
      pendingLoads.delete(descriptor.key)
    })

    pendingLoads.set(descriptor.key, pendingLoad)
    return pendingLoad.promise
  }

  async function removeResource(resourceKey: string) {
    const pending = pendingLoads.get(resourceKey)
    if (pending) {
      pending.cancelled = true
    }

    const cached = cacheMaps.get(resourceKey)
    if (!cached) {
      return
    }

    cached.webMap.cleanLayers?.()
    mapEventBridge.deleteWebMap?.(cached.mapTarget, resourceKey)
    cacheMaps.delete(resourceKey)
  }

  async function clearResources(context: ResourceLayerManagerContext = {}) {
    const resolvedContext = resolveContext(context)
    pendingLoads.forEach((pendingLoad, resourceKey) => {
      if (!resolvedContext.mapTarget || pendingLoad.mapTarget === resolvedContext.mapTarget) {
        pendingLoad.cancelled = true
      }
    })

    for (const [resourceKey, cached] of Array.from(cacheMaps.entries())) {
      if (!resolvedContext.mapTarget || cached.mapTarget === resolvedContext.mapTarget) {
        await removeResource(resourceKey)
      }
    }
  }

  return {
    cacheMaps,
    pendingLoads,
    setMapContext,
    applyResource,
    removeResource,
    clearResources
  }
}
