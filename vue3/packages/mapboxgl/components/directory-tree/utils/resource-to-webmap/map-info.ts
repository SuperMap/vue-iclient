import type { ResourceDescriptor } from '../../types'
import type { MapSnapshot, SupportedFeatureType } from './types'
import { asRecord, normalizeProjection } from './shared'

const DIRECTORY_TREE_SHADOW_BASE_LAYER_FLAG = '__directoryTreeShadowBaseLayer'
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

const DEFAULT_EXTENT = {
  leftBottom: {
    x: -20037508.3427892,
    y: -20037508.3427892
  },
  rightTop: {
    x: 20037508.3427892,
    y: 20037508.3427892
  }
} as const

const DEFAULT_CENTER = {
  x: 0,
  y: 0
} as const

const DEFAULT_LEVEL = 1

export function cloneLayerInfo(layerInfo: Record<string, any>): Record<string, any> {
  return {
    ...layerInfo,
    style: layerInfo.style ? { ...layerInfo.style } : layerInfo.style,
    dataSource: layerInfo.dataSource ? { ...layerInfo.dataSource } : layerInfo.dataSource,
    themeSetting: layerInfo.themeSetting ? { ...layerInfo.themeSetting } : layerInfo.themeSetting,
    xyField: layerInfo.xyField ? { ...layerInfo.xyField } : layerInfo.xyField
  }
}

export function cloneMapInfo(mapInfo: Record<string, any>): Record<string, any> {
  return {
    ...mapInfo,
    layers: Array.isArray(mapInfo.layers) ? mapInfo.layers.map(layer => cloneLayerInfo(asRecord(layer))) : [],
    baseLayer: mapInfo.baseLayer ? cloneLayerInfo(asRecord(mapInfo.baseLayer)) : mapInfo.baseLayer,
    grid: mapInfo.grid ? { ...mapInfo.grid } : mapInfo.grid
  }
}

function buildDirectoryTreeShadowBaseLayer(
  resourceName: string,
  sourceBaseLayer?: Record<string, any>
): Record<string, any> {
  const baseLayer = sourceBaseLayer ? cloneLayerInfo(sourceBaseLayer) : {}
  const fallbackName = `__directory_tree_base__:${resourceName}`
  return {
    ...baseLayer,
    layerType: typeof baseLayer.layerType === 'string' && baseLayer.layerType ? baseLayer.layerType : 'TILE',
    name: typeof baseLayer.name === 'string' && baseLayer.name.trim() ? baseLayer.name : fallbackName,
    tileSize: typeof baseLayer.tileSize === 'number' ? baseLayer.tileSize : 256,
    visible: false,
    [DIRECTORY_TREE_SHADOW_BASE_LAYER_FLAG]: true
  }
}

export function shouldSkipDirectoryTreeShadowBaseLayer(layerInfo: Record<string, any> | undefined): boolean {
  return Boolean(layerInfo?.[DIRECTORY_TREE_SHADOW_BASE_LAYER_FLAG])
}

function normalizeLayerType(layerInfo: Record<string, any> | undefined): string | undefined {
  if (!layerInfo || typeof layerInfo.layerType !== 'string') {
    return undefined
  }
  const normalizedLayerType = layerInfo.layerType.trim().toUpperCase()
  return normalizedLayerType || undefined
}

function isVectorOverlayLayer(layerInfo: Record<string, any> | undefined): boolean {
  const layerType = normalizeLayerType(layerInfo)
  return !!layerType && VECTOR_OVERLAY_LAYER_TYPES.has(layerType)
}

function shouldPreferSnapshotProjectionForLayers(
  layers: Record<string, any>[] | undefined,
  mapSnapshot: MapSnapshot
): boolean {
  return !!mapSnapshot.projection && Array.isArray(layers) && layers.length > 0 && layers.every(isVectorOverlayLayer)
}

export function getDescriptorRaw(descriptor: ResourceDescriptor): Record<string, any> {
  return asRecord(descriptor.raw)
}

export function getPassthroughMapInfo(raw: Record<string, any>): Record<string, any> | undefined {
  return asRecord(raw.mapInfo).layers ? raw.mapInfo : asRecord(raw.dataInfo?.mapInfo).layers ? raw.dataInfo.mapInfo : undefined
}

export function getPassthroughLayerInfo(raw: Record<string, any>): Record<string, any> | undefined {
  return asRecord(raw.layerInfo).layerType ? raw.layerInfo : asRecord(raw.dataInfo?.layerInfo).layerType ? raw.dataInfo.layerInfo : undefined
}

function buildMapInfoSkeleton(resourceName: string, mapSnapshot: MapSnapshot = {}, projection?: string | null): Record<string, any> {
  const mapInfo: Record<string, any> = {
    extent: mapSnapshot.extent || DEFAULT_EXTENT,
    level: mapSnapshot.level ?? DEFAULT_LEVEL,
    center: mapSnapshot.center || DEFAULT_CENTER,
    layers: [],
    description: '',
    projection: normalizeProjection(projection ?? mapSnapshot.projection) || 'EPSG:3857',
    title: resourceName,
    version: '2.3.0',
    baseLayer: buildDirectoryTreeShadowBaseLayer(resourceName, mapSnapshot.baseLayer)
  }

  return mapInfo
}

export function buildMapInfoWithLayer(
  resourceName: string,
  layerInfo: Record<string, any>,
  mapSnapshot: MapSnapshot = {}
): Record<string, any> {
  const nextLayerInfo = cloneLayerInfo(layerInfo)
  const projection = shouldPreferSnapshotProjectionForLayers([nextLayerInfo], mapSnapshot)
    ? normalizeProjection(mapSnapshot.projection)
    : normalizeProjection(nextLayerInfo.projection ?? mapSnapshot.projection)
  const mapInfo = buildMapInfoSkeleton(resourceName, mapSnapshot, projection)
  mapInfo.layers = [nextLayerInfo]
  return mapInfo
}

export function buildChildMapInfo(resourceName: string, mapInfo: Record<string, any>, mapSnapshot: MapSnapshot = {}): Record<string, any> {
  const nextMapInfo = cloneMapInfo(mapInfo)
  const existingBaseLayer = nextMapInfo.baseLayer && typeof nextMapInfo.baseLayer === 'object' ? nextMapInfo.baseLayer : undefined
  nextMapInfo.extent = nextMapInfo.extent || mapSnapshot.extent || DEFAULT_EXTENT
  nextMapInfo.level = nextMapInfo.level ?? mapSnapshot.level ?? DEFAULT_LEVEL
  nextMapInfo.center = nextMapInfo.center || mapSnapshot.center || DEFAULT_CENTER
  nextMapInfo.projection = (
    shouldPreferSnapshotProjectionForLayers(nextMapInfo.layers, mapSnapshot)
      ? normalizeProjection(mapSnapshot.projection)
      : normalizeProjection(nextMapInfo.projection ?? mapSnapshot.projection)
  ) || 'EPSG:3857'
  nextMapInfo.title = nextMapInfo.title || resourceName
  nextMapInfo.version = nextMapInfo.version || '2.3.0'
  nextMapInfo.baseLayer = buildDirectoryTreeShadowBaseLayer(resourceName, existingBaseLayer || mapSnapshot.baseLayer)
  return nextMapInfo
}

export function createMapSnapshot({
  map,
  webmap,
  fallbackProjection
}: {
  map?: any
  webmap?: any
  fallbackProjection?: string | null
} = {}): MapSnapshot {
  const mapCrs = map?.getCRS?.()
  const projection =
    normalizeProjection(mapCrs) ||
    normalizeProjection(mapCrs?.wkt) ||
    normalizeProjection(mapCrs?.epsgCode) ||
    normalizeProjection(mapCrs?.code) ||
    normalizeProjection(webmap?.webMapInfo?.projection) ||
    normalizeProjection(webmap?._handler?.webMapInfo?.projection) ||
    normalizeProjection(webmap?.mapId?.projection) ||
    normalizeProjection(fallbackProjection) ||
    undefined

  const bounds = map?.getBounds?.()
  const boundsArray = bounds?.toArray?.()
  const extent =
    Array.isArray(boundsArray) && boundsArray.length === 2
      ? {
          leftBottom: {
            x: boundsArray[0][0],
            y: boundsArray[0][1]
          },
          rightTop: {
            x: boundsArray[1][0],
            y: boundsArray[1][1]
          }
        }
      : undefined

  const centerLike = map?.getCenter?.()
  const centerArray = centerLike?.toArray?.()
  const center =
    Array.isArray(centerArray) && centerArray.length >= 2
      ? {
          x: centerArray[0],
          y: centerArray[1]
        }
      : centerLike && Number.isFinite(centerLike.lng) && Number.isFinite(centerLike.lat)
        ? {
            x: centerLike.lng,
            y: centerLike.lat
          }
        : centerLike && Number.isFinite(centerLike.x) && Number.isFinite(centerLike.y)
          ? {
              x: centerLike.x,
              y: centerLike.y
            }
          : undefined

  const baseLayer =
    webmap?.mapId?.baseLayer ||
    webmap?.webMapInfo?.baseLayer ||
    webmap?._handler?.webMapInfo?.baseLayer ||
    undefined

  return {
    projection,
    extent,
    center,
    level: typeof map?.getZoom?.() === 'number' ? map.getZoom() : undefined,
    baseLayer
  }
}

export function buildMinimalVectorStyle(featureType: SupportedFeatureType): Record<string, any> {
  if (featureType === 'POINT') {
    return {
      type: 'BASIC_POINT',
      radius: 6,
      fillColor: '#4fcfff',
      fillOpacity: 0.9,
      strokeColor: '#ffffff',
      strokeWidth: 1,
      strokeOpacity: 1
    }
  }
  if (featureType === 'LINE') {
    return {
      type: 'LINE',
      strokeColor: '#01ffff',
      strokeWidth: 2,
      strokeOpacity: 1,
      lineDash: 'solid'
    }
  }
  return {
    type: 'POLYGON',
    fillColor: '#4fcfff',
    fillOpacity: 0.4,
    strokeColor: '#01ffff',
    strokeWidth: 1,
    strokeOpacity: 1,
    lineDash: 'solid'
  }
}
