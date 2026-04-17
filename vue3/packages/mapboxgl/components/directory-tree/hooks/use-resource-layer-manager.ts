import WebMapViewModel from 'vue-iclient-controllers-mapboxgl/src/WebMapViewModel'
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
import { applyWebMapServicePrivatePatches } from './webmap-service-patch'

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

export interface ResourceLayerManagerOptionsUpdate {
  iportalUrl?: string
  withCredentials?: boolean
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
const RESOURCE_LOAD_TIMEOUT_MS = 15000

function normalizeBaseUrl(iportalUrl: string): string {
  return iportalUrl.endsWith('/') ? iportalUrl.slice(0, -1) : iportalUrl
}

function resolveMapLayerStyle(webmap: any) {
  return webmap?.options?.layerStyle
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

export function useResourceLayerManager(options: ResourceLayerManagerOptions) {
  const buildLoadPlan = options.buildLoadPlan || buildResourceLoadPlan
  const mapEventBridge = options.mapEvent || mapEvent
  const WebMapViewModelCtor = options.WebMapViewModelClass || WebMapViewModel
  const fetcher = options.fetcher || defaultDirectoryTreeFetcher

  const cacheMaps = new Map<string, CachedResourceItem>()
  const pendingLoads = new Map<string, PendingLoad>()
  const projectionWktCache = new Map<string, Promise<string | undefined>>()
  let currentContext: ResourceLayerManagerContext = {}
  let currentIportalUrl = options.iportalUrl
  let currentWithCredentials = options.withCredentials
  let queue = Promise.resolve()

  function updateOptions(nextOptions: ResourceLayerManagerOptionsUpdate) {
    const nextIportalUrl = nextOptions.iportalUrl ?? currentIportalUrl
    if (nextIportalUrl !== currentIportalUrl) {
      projectionWktCache.clear()
    }
    currentIportalUrl = nextIportalUrl
    currentWithCredentials = nextOptions.withCredentials ?? currentWithCredentials
  }

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
    if (currentWithCredentials != null) {
      return currentWithCredentials
    }
    if (inheritedOptions.withCredentials === true) {
      return true
    }

    // DirectoryTree always targets the current iPortal. Default to credentialed requests
    // there so private same-origin resources can reuse the browser session cookie.
    if (isSameOriginUrl(plan.serverUrl || currentIportalUrl)) {
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
      const projectionUrl = `${normalizeBaseUrl(currentIportalUrl)}/epsgcodes/${epsgCode}.json`
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
      serverUrl: plan.serverUrl || currentIportalUrl,
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
    applyWebMapServicePrivatePatches(childWebMap?._handler?.webMapService)
    return childWebMap
  }

  function waitForLoadResult(
    childWebMap: any,
    descriptor: ResourceDescriptor,
    context: ResourceLayerManagerContext,
    pendingLoad: PendingLoad
  ) {
    return new Promise<any>((resolve, reject) => {
      let settled = false
      let events: Record<string, () => void>

      const finish = (handler: () => void) => {
        if (settled) {
          return
        }
        settled = true
        cleanup()
        handler()
      }

      const timeoutId = setTimeout(() => {
        finish(() => {
          childWebMap.cleanLayers?.()
          reject(new ResourceLayerManagerError('load-failed', `Timed out loading ${descriptor.key}`))
        })
      }, RESOURCE_LOAD_TIMEOUT_MS)

      const cleanup = () => {
        clearTimeout(timeoutId)
        childWebMap.un?.(events)
      }

      events = {
        addlayerssucceeded: () => {
          finish(() => {
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
          })
        },
        projectionnotmatch: () => {
          finish(() => {
            childWebMap.cleanLayers?.()
            reject(new ResourceLayerManagerError('crs-mismatch', `Projection mismatch for ${descriptor.key}`))
          })
        },
        layerorsourcenameduplicated: () => {
          finish(() => {
            childWebMap.cleanLayers?.()
            reject(new ResourceLayerManagerError('load-failed', `Duplicate layer or source for ${descriptor.key}`))
          })
        }
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
        iportalUrl: currentIportalUrl,
        withCredentials: currentWithCredentials,
        fetcher,
        mapLayerStyle: resolveMapLayerStyle(mergedContext.webmap),
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
    for (const pendingLoad of Array.from(pendingLoads.values())) {
      if (!resolvedContext.mapTarget || pendingLoad.mapTarget === resolvedContext.mapTarget) {
        pendingLoad.cancelled = true
      }
    }

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
    updateOptions,
    applyResource,
    removeResource,
    clearResources
  }
}
