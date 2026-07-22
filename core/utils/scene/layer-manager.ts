import { FeatureService } from '@supermapgis/iclient-common/iServer/FeatureService'
import { GetFeaturesBySQLParameters } from '@supermapgis/iclient-common/iServer/GetFeaturesBySQLParameters'
import { flyToCamera, getSuperMap3DCartesian3, type FlyToOptions, type ScenePosition } from './fly-to-camera'

export const layerTypes = ['terrain', 's3m', 'map', 'data', '3dtiles'] as const

export type LayerType = (typeof layerTypes)[number]

export interface LayerCameraConfig {
  position: ScenePosition
  hpr?: FlyToOptions['hpr']
  duration?: number
}

export interface LayerCheckData {
  id?: string
  name?: string
  key?: string
  type?: LayerType | string
  autoLocate?: boolean
  locateParams?: string | LayerCameraConfig | null
  subdomains?: string | string[]
  source?: string
  resourceId?: string
  config?: Record<string, any>
  [key: string]: any
}

export interface LayerCheckOptions {
  onS3MTilesLayerLoaded?: (layer: any, data: LayerCheckData) => void
  [key: string]: any
}

export interface LayerManagerContext {
  viewer: any
  manager: LayerManager
}

export const layerLifecyclePhases = ['before-load', 'loaded', 'data-change', 'before-remove'] as const

export type LayerLifecyclePhase = (typeof layerLifecyclePhases)[number]

export interface LayerDataFrontHandlers {
  mode: 'front'
  queryFun: () => Promise<LayerDataResult>
}

export interface LayerDataRequest {
  data: LayerCheckData
  options: LayerCheckOptions
  mode: 'front'
}

export interface LayerDataResult {
  featureCollection: GeoJSON.FeatureCollection
  totalCount?: number
  meta?: Record<string, any>
}

export interface LayerLifecycleRuntime {
  manager?: any
  layer?: any
  layers?: any[]
  mode?: 'front'
  handlers?: LayerDataFrontHandlers | null
  dataResult?: LayerDataResult | null
}

export interface LayerLifecyclePayload {
  phase: LayerLifecyclePhase
  type?: LayerCheckData['type']
  data: LayerCheckData
  config: Record<string, any>
  options: LayerCheckOptions
  runtime: LayerLifecycleRuntime
}

export const layerCustomActions = ['toggle', 'update', 'locate', 'dispose-all'] as const

export type LayerCustomAction = (typeof layerCustomActions)[number]

export interface LayerCustomActionPayload {
  action: LayerCustomAction
  data?: LayerCheckData
  checked?: boolean
  options?: LayerCheckOptions
}

export type LayerCustomActionResult = boolean | { handled?: boolean } | void

export interface LayerManagerExtension {
  /** Loads non-REST front data. The core renders the returned FeatureCollection. */
  loadDataFeatures?: (
    request: LayerDataRequest,
    context: LayerManagerContext
  ) => LayerDataResult | void | Promise<LayerDataResult | void>
  /** Takes ownership of custom loading actions, including back data layers. */
  customLayerAction?: (
    payload: LayerCustomActionPayload,
    context: LayerManagerContext
  ) => LayerCustomActionResult | Promise<LayerCustomActionResult>
  /** Observes lifecycle phases for layers created by the core. */
  onLayerLifecycle?: (
    payload: LayerLifecyclePayload,
    context: LayerManagerContext
  ) => void | Promise<void>
}

export interface LayerManagerOptions {
  extension?: LayerManagerExtension
}

function getSuperMap3D() {
  const SuperMap3D = (window as any)?.SuperMap3D
  if (!SuperMap3D) {
    throw new Error('SuperMap3D is not available')
  }
  return SuperMap3D
}

function isObject(value: unknown): value is Record<string, any> {
  return value !== null && typeof value === 'object'
}

const MAX_FEATURES_COUNT = 30000
const FRONT_CLUSTER = 1
const BACK_CLUSTER = 2

function getFeatureCollection(features: GeoJSON.Feature[]) {
  return {
    type: 'FeatureCollection',
    features
  } as GeoJSON.FeatureCollection
}

function getFeatureGeometryType(featureCollection: GeoJSON.FeatureCollection) {
  const firstFeature = featureCollection?.features?.find(item => item?.geometry?.type)
  return firstFeature?.geometry?.type || ''
}

function getFeatureCoordinates(feature: GeoJSON.Feature) {
  return (feature?.geometry as any)?.coordinates
}

function getSuperMap3DColor(color?: any, fallback = '#ffffff') {
  const SuperMap3D = getSuperMap3D()
  let nextColor = color
  if (typeof nextColor === 'undefined' || nextColor === null || nextColor === '') {
    nextColor = fallback
  }
  if (typeof nextColor === 'string') {
    return SuperMap3D.Color.fromCssColorString(nextColor)
  }
  if (typeof nextColor === 'function') {
    return nextColor()
  }
  return nextColor
}

function getSuperMap3DDistanceDisplayCondition(range?: [number, number] | number[]) {
  const SuperMap3D = getSuperMap3D()
  if (!range || !Array.isArray(range) || range.length < 2 || !SuperMap3D.DistanceDisplayCondition) {
    return undefined
  }
  return new SuperMap3D.DistanceDisplayCondition(Number(range[0]) || 0, Number(range[1]) || Number.MAX_VALUE)
}

function getViewerCamera(viewer: any) {
  return viewer?.camera || viewer?.scene?.camera
}

function setLayerFeatureData(
  entity: any,
  data: LayerCheckData,
  props: Record<string, any>
) {
  if (!entity) {
    return
  }
  entity.___layerFeatureData = {
    layerId: String(data.id || ''),
    data,
    props
  }
}

function getDefaultColorByIndex(index: number) {
  const colors = [
    '#3b82f6',
    '#f97316',
    '#10b981',
    '#ef4444',
    '#8b5cf6',
    '#eab308',
    '#06b6d4',
    '#84cc16'
  ]
  return colors[index % colors.length]
}

function getIcon(option: Record<string, any> = {}) {
  const iconScale = option.scale || 1
  let icon = option.url
  let width = 32
  let height = 32
  if (option.url) {
    width = option.width || width
    height = option.height || height
  } else {
    icon = null
    height = 40
    width = 24
  }
  return {
    url: icon,
    height: height * iconScale,
    width: width * iconScale
  }
}

function parseLayerCameraConfig(
  locateParams: LayerCheckData['locateParams']
): LayerCameraConfig | null {
  if (!locateParams) {
    return null
  }
  if (typeof locateParams === 'string') {
    try {
      const parsed = JSON.parse(locateParams)
      return isObject(parsed) ? (parsed as LayerCameraConfig) : null
    } catch (error) {
      return null
    }
  }
  if (isObject(locateParams)) {
    return locateParams as LayerCameraConfig
  }
  return null
}

function loadByJsonConfig(imageLayerManager: any, config: Record<string, any>) {
  const SuperMap3D = getSuperMap3D()
  let options: Record<string, any>
  config.type = config.type || 'supermap'
  switch (config.type) {
    case 'arcgis':
    case 'arcgis4490':
    case 'bing':
    case 'wms':
    case 'tianditu':
    case 'url':
    case 'wmts': {
      let tilingScheme: any
      if (config.crs === '3857') {
        tilingScheme = {
          numberOfLevelZeroTilesX: 1,
          numberOfLevelZeroTilesY: 1
        }
        if (config.rectangle) {
          tilingScheme = Object.assign(
            {
              rectangleSouthwestInMeters: new SuperMap3D.Cartesian2(
                config.rectangle.south,
                config.rectangle.west
              ),
              rectangleNortheastInMeters: new SuperMap3D.Cartesian2(
                config.rectangle.north,
                config.rectangle.east
              )
            },
            tilingScheme
          )
        }
        tilingScheme = new SuperMap3D.WebMercatorTilingScheme(tilingScheme)
        options = Object.assign(
          {
            tilingScheme
          },
          config
        )
        delete options.rectangle
      } else {
        tilingScheme = {
          numberOfLevelZeroTilesX: 2,
          numberOfLevelZeroTilesY: 1
        }
        if (config.rectangle) {
          tilingScheme = Object.assign(
            {
              rectangle: SuperMap3D.Rectangle.fromDegrees(
                config.rectangle.west,
                config.rectangle.south,
                config.rectangle.east,
                config.rectangle.north
              )
            },
            tilingScheme
          )
        }
        tilingScheme = new SuperMap3D.GeographicTilingScheme(tilingScheme)
        options = Object.assign(
          {
            tilingScheme
          },
          config
        )
      }

      switch (config.type) {
        case 'wmts':
          options.tileMatrixLabels =
            options.tileMatrixLabels ||
            (() => {
              const labels = []
              for (let i = 0; i < 20; i++) {
                labels.push(i + 1)
              }
              return labels
            })()
          break
        case 'wms': {
          const defaultParams = SuperMap3D.WebMapServiceImageryProvider.DefaultParameters
          let params: Record<string, any> = {
            transparent: true
          }
          Object.keys(defaultParams).forEach(key => {
            if (options[key]) {
              params[key] = options[key]
            }
            delete options[key]
          })
          if (options.params) {
            params = Object.assign(params, JSON.parse(options.params))
          }
          delete options.params
          options.parameters = params
          delete options.rectangle
          break
        }
        case 'url': {
          const zoomOffset =
            typeof options.zoomOffset === 'undefined' || options.zoomOffset === null ? 1 : options.zoomOffset
          if (zoomOffset !== 0 && typeof options.url === 'string' && options.url.indexOf('{z}') > -1) {
            options.url = options.url.replace('{z}', '{sz}')
            options.customTags = {
              sz: (_imageryProvider: any, _x: number, _y: number, level: number) => level + zoomOffset
            }
          }
          break
        }
        default:
      }
      break
    }
    case 'single':
    case 'supermap':
    default:
      options = config
      break
  }

  config.minimumLevel = 0
  if (config.type === 'arcgis4490') {
    return imageLayerManager.imageryLayers.addImageryProvider(
      new SuperMap3D.CGCS2000MapServerImageryProvider({
        url: options.url,
        enablePickFeatures: false
      })
    )
  }

  if (typeof config.type === 'string' && config.type.indexOf('arcgis') === 0) {
    options.enablePickFeatures = false
  }
  if (config.header) {
    config.customRequestHeaders = JSON.parse(config.header)
  }

  const layer = imageLayerManager.add(options, config.type)
  if (config.type === 'supermap') {
    layer.imageryProvider.readyPromise.then(() => {
      layer.imageryProvider._maximumLevel = config.maximumLevel
      layer.imageryProvider._minimumLevel = 0
    })
  }
  return layer
}

function getViewerCameraHeight(viewer: any) {
  if (typeof viewer?.getCameraHeight === 'function') {
    return Number(viewer.getCameraHeight())
  }
  const camera = getViewerCamera(viewer)
  const height = camera?.positionCartographic?.height
  return Number.isFinite(Number(height)) ? Number(height) : null
}

function ensureEntityPrototype() {
  const SuperMap3D = getSuperMap3D()
  const Entity = SuperMap3D.Entity?.prototype
  if (!Entity || Entity.__layerAligned__) {
    return
  }

  Entity.addEvents = function (options: Record<string, any> = {}, scope?: any) {
    const target = scope || this
    this.onClick = options.onClick && options.onClick.bind(target, options.data)
    this.onRightClick = options.onRightClick && options.onRightClick.bind(target, options.data)
    this.onHover = options.onHover && options.onHover.bind(target, options.data)
    this.onLeftUp = options.onLeftUp && options.onLeftUp.bind(target, options.data)
    this.onLeftDown = options.onLeftDown && options.onLeftDown.bind(target, options.data)
    this.onRightUp = options.onRightUp && options.onRightUp.bind(target, options.data)
    this.onRightDown = options.onRightDown && options.onRightDown.bind(target, options.data)
    this.onDoubleClick = options.onDoubleClick && options.onDoubleClick.bind(target, options.data)
    return this
  }

  Entity.addPoint = function (position: ScenePosition, options: Record<string, any> = {}) {
    options = Object.assign({ color: '#ffffff' }, options)
    options.color = getSuperMap3DColor(options.color, '#ffffff')
    if (options.distanceDisplayCondition) {
      options.distanceDisplayCondition = getSuperMap3DDistanceDisplayCondition(options.distanceDisplayCondition)
    }
    if (options.outlineColor) {
      options.outlineColor = getSuperMap3DColor(options.outlineColor)
    }
    if (position) {
      position = getSuperMap3DCartesian3(position)
    }
    this.position = position || this.position
    this.point = options
    return this
  }

  Entity.addMarker = function (position: ScenePosition, options: Record<string, any> = {}) {
    const ratio = Number(SuperMap3D.defaults?.ratio) || 1
    options = Object.assign(
      {
        url: null,
        height: 30,
        width: 30,
        scale: 1,
        align: 'center',
        heightReference: SuperMap3D.HeightReference?.NONE,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        labelText: '',
        labelAlign: 'right',
        labelOutline: false,
        labelOutlineWidth: 2,
        labelOutlineColor: '',
        labelColor: '#fff',
        labelFontSize: 14,
        labelFontFamily: 'MicrosoftYaHei',
        labelBackgroundPadding: [10, 10],
        labelOffsetX: 0,
        labelOffsetY: 0
      },
      options
    )
    if (ratio !== 1) {
      options.height = options.height * ratio
      options.width = options.width * ratio
      options.labelFontSize = options.labelFontSize * ratio
      options.labelOutlineWidth = options.labelOutlineWidth * ratio
      options.labelBackgroundPadding = options.labelBackgroundPadding.map((item: number) => item * ratio)
      options.labelOffsetX = options.labelOffsetX * ratio
      options.labelOffsetY = options.labelOffsetY * ratio
    }

    let verticalOrigin = SuperMap3D.VerticalOrigin.CENTER
    switch (options.align) {
      case 'bottom':
        verticalOrigin = SuperMap3D.VerticalOrigin.BOTTOM
        break
      case 'top':
        verticalOrigin = SuperMap3D.VerticalOrigin.TOP
        break
      default:
        verticalOrigin = SuperMap3D.VerticalOrigin.CENTER
    }

    const entityOptions: Record<string, any> = {
      position: getSuperMap3DCartesian3(position)
    }

    if (options.url) {
      entityOptions.billboard = {
        height: options.height,
        width: options.width,
        scale: options.scale,
        image: options.url,
        verticalOrigin,
        heightReference: options.heightReference,
        horizontalOrigin: SuperMap3D.HorizontalOrigin.CENTER,
        disableDepthTestDistance: options.disableDepthTestDistance,
        distanceDisplayCondition: getSuperMap3DDistanceDisplayCondition(options.distanceDisplayCondition)
      }
    }

    if (options.labelText) {
      entityOptions.label = {
        fillColor: getSuperMap3DColor(options.labelColor),
        outlineColor: getSuperMap3DColor(options.labelOutlineColor || '#000'),
        outlineWidth: options.labelOutlineWidth,
        style: options.labelOutline ? SuperMap3D.LabelStyle.FILL_AND_OUTLINE : SuperMap3D.LabelStyle.FILL,
        text: options.labelText,
        font: `${options.labelFontSize * 4}px ${options.labelFontFamily}`,
        scale: 1 / 4,
        backgroundPadding: Array.isArray(options.labelBackgroundPadding)
          ? new SuperMap3D.Cartesian2(options.labelBackgroundPadding[0], options.labelBackgroundPadding[1])
          : options.labelBackgroundPadding,
        pixelOffset: new SuperMap3D.Cartesian2(options.width / 2 + 10 + options.labelOffsetX, options.labelOffsetY),
        verticalOrigin: SuperMap3D.VerticalOrigin.CENTER,
        horizontalOrigin: SuperMap3D.HorizontalOrigin.LEFT,
        heightReference: options.heightReference,
        disableDepthTestDistance: options.disableDepthTestDistance,
        distanceDisplayCondition: getSuperMap3DDistanceDisplayCondition(options.distanceDisplayCondition)
      }
      if (options.labelBackgroundColor) {
        entityOptions.label.showBackground = true
        entityOptions.label.backgroundColor = getSuperMap3DColor(options.labelBackgroundColor)
      }
      if (options.url) {
        const labelOffsetX = options.width / 2 + options.labelFontSize / 2 + 2 + options.labelOffsetX
        const labelOffsetY = options.height / 2 + options.labelFontSize / 2 + 2 + options.labelOffsetY
        if (options.align === 'center') {
          entityOptions.label.verticalOrigin = SuperMap3D.VerticalOrigin.CENTER
        } else if (options.align === 'top') {
          entityOptions.label.verticalOrigin = SuperMap3D.VerticalOrigin.TOP
        } else if (options.align === 'bottom') {
          entityOptions.label.verticalOrigin = SuperMap3D.VerticalOrigin.BOTTOM
        }
        if (options.labelAlign === 'right') {
          entityOptions.label.pixelOffset = new SuperMap3D.Cartesian2(labelOffsetX, options.labelOffsetY)
          entityOptions.label.horizontalOrigin = SuperMap3D.HorizontalOrigin.LEFT
        } else if (options.labelAlign === 'left') {
          entityOptions.label.pixelOffset = new SuperMap3D.Cartesian2(-labelOffsetX, options.labelOffsetY)
          entityOptions.label.horizontalOrigin = SuperMap3D.HorizontalOrigin.RIGHT
        } else if (options.labelAlign === 'top') {
          entityOptions.label.pixelOffset = new SuperMap3D.Cartesian2(options.labelOffsetX, -labelOffsetY)
          entityOptions.label.horizontalOrigin = SuperMap3D.HorizontalOrigin.CENTER
        } else if (options.labelAlign === 'bottom') {
          entityOptions.label.pixelOffset = new SuperMap3D.Cartesian2(options.labelOffsetX, labelOffsetY)
          entityOptions.label.horizontalOrigin = SuperMap3D.HorizontalOrigin.CENTER
        }
      } else {
        entityOptions.label.pixelOffset = new SuperMap3D.Cartesian2(options.labelOffsetX, options.labelOffsetY)
        if (options.labelAlign === 'right') {
          entityOptions.label.horizontalOrigin = SuperMap3D.HorizontalOrigin.LEFT
        } else if (options.labelAlign === 'left') {
          entityOptions.label.horizontalOrigin = SuperMap3D.HorizontalOrigin.RIGHT
        } else {
          entityOptions.label.horizontalOrigin = SuperMap3D.HorizontalOrigin.CENTER
        }
        entityOptions.label.verticalOrigin = SuperMap3D.VerticalOrigin.CENTER
      }
    }

    this.position = entityOptions.position
    if (entityOptions.billboard) {
      this.billboard = entityOptions.billboard
    }
    if (entityOptions.label) {
      this.label = entityOptions.label
    }
    return this.addEvents(options)
  }

  Entity.addPolyline = function (positions: ScenePosition[], options: Record<string, any> = {}) {
    options = Object.assign({ material: '#ffffff' }, options)
    options.material = getSuperMap3DColor(options.material)
    if (options.distanceDisplayCondition) {
      options.distanceDisplayCondition = getSuperMap3DDistanceDisplayCondition(options.distanceDisplayCondition)
    }
    options.positions = positions.map(item => getSuperMap3DCartesian3(item))
    this.polyline = options
    return this
  }

  Entity.addPolygon = function (positions: ScenePosition[], options: Record<string, any> = {}) {
    options = Object.assign({ material: '#ffffff' }, options)
    options.material = getSuperMap3DColor(options.material)
    if (options.distanceDisplayCondition) {
      options.distanceDisplayCondition = getSuperMap3DDistanceDisplayCondition(options.distanceDisplayCondition)
    }
    if (options.outlineColor) {
      options.outlineColor = getSuperMap3DColor(options.outlineColor)
    }
    options.hierarchy = positions.map(item => getSuperMap3DCartesian3(item))
    if (options.positions) {
      delete options.positions
    }
    this.polygon = options
    return this
  }

  Entity.addModel = function (position: ScenePosition, options: Record<string, any> = {}) {
    options = Object.assign({}, options)
    if (options.distanceDisplayCondition) {
      options.distanceDisplayCondition = getSuperMap3DDistanceDisplayCondition(options.distanceDisplayCondition)
    }
    if (options.color) {
      options.color = getSuperMap3DColor(options.color)
    }
    if (position) {
      position = getSuperMap3DCartesian3(position)
    }
    this.position = position || this.position
    this.model = options
    return this
  }

  Entity.__layerAligned__ = true
}

function getNewEntity() {
  const SuperMap3D = getSuperMap3D()
  ensureEntityPrototype()
  return new SuperMap3D.Entity()
}

function initCluster(dataSource: any, viewer: any, options: Record<string, any> = {}) {
  const SuperMap3D = getSuperMap3D()
  const clusterOptions = Object.assign({}, options)
  if (clusterOptions.enabled !== undefined) {
    dataSource.clustering.enabled = clusterOptions.enabled
  }
  if (clusterOptions.pixelRange !== undefined) {
    dataSource.clustering.pixelRange = clusterOptions.pixelRange
  }
  if (clusterOptions.minimumClusterSize !== undefined) {
    dataSource.clustering.minimumClusterSize = clusterOptions.minimumClusterSize
  }
  if (clusterOptions.clusterBillboards !== undefined) {
    dataSource.clustering.clusterBillboards = clusterOptions.clusterBillboards
  }
  if (clusterOptions.clusterLabels !== undefined) {
    dataSource.clustering.clusterLabels = clusterOptions.clusterLabels
  }
  if (clusterOptions.clusterPoints !== undefined) {
    dataSource.clustering.clusterPoints = clusterOptions.clusterPoints
  }
  dataSource.clustering.clusterEvent.addEventListener((entities: any[], cluster: any) => {
    if (clusterOptions.clusterEvent) {
      clusterOptions.clusterEvent(entities, cluster)
      return
    }
    cluster.label.show = false
    cluster.billboard.show = true
    clusterOptions.billboard = clusterOptions.billboard || {}
    cluster.billboard.verticalOrigin = SuperMap3D.VerticalOrigin.BOTTOM
    if (typeof clusterOptions.billboard.image === 'string') {
      cluster.billboard.image = clusterOptions.billboard.image
    }
    cluster.billboard.width = clusterOptions.billboard.width || 40
    cluster.billboard.height = clusterOptions.billboard.height || 40
    cluster.billboard.disableDepthTestDistance = Number.POSITIVE_INFINITY
    clusterOptions.onCluster =
      clusterOptions.onCluster ||
      function (clusteredEntities: any[], clusterBillboard: any) {
        clusterBillboard.billboard.onClick = function () {
          viewer?.fitTarget?.(clusteredEntities)
        }
      }
    if (typeof clusterOptions.onCluster === 'function') {
      clusterOptions.onCluster(entities, cluster)
    }
  })
}

class EntitiesLayer {
  viewer: any
  options: Record<string, any>
  dataSource: any
  entities: any
  coverUtil: any
  _cameraMoveEndEvent: (() => void) | null

  constructor(viewer: any, options: Record<string, any> = {}) {
    const SuperMap3D = getSuperMap3D()
    const cover = Object.assign(
      {
        enabled: false,
        minCameraHeight: -1000,
        width: 30,
        height: 30,
        judgeCallback: null
      },
      options.cover
    )
    this.viewer = viewer
    this.options = Object.assign(
      {},
      {
        name: 'defaultName',
        cover,
        cluster: {
          enabled: false,
          pixelRange: 40,
          minCameraHeight: undefined,
          minimumClusterSize: 2,
          clusterBillboards: true,
          clusterLabels: true,
          clusterPoints: true,
          billboard: {
            width: 40,
            height: 40,
            color: '#3BCD8D',
            verticalOrigin: SuperMap3D.VerticalOrigin.BOTTOM,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          }
        }
      },
      options
    )
    this.dataSource = new SuperMap3D.CustomDataSource(this.options.name)
    this.viewer.dataSources.add(this.dataSource)
    this.entities = this.dataSource.entities
    this.coverUtil = null
    this._cameraMoveEndEvent = null
    initCluster(this.dataSource, this.viewer, this.options.cluster)
    this._addCameraEvent()
  }

  addMarker(position: ScenePosition, options: Record<string, any> = {}) {
    const entity = getNewEntity()
    entity.addMarker(position, options)
    return this.entities.add(entity)
  }

  addEntity(entity: any, options: Record<string, any> = {}) {
    entity = this.entities.add(entity)
    return entity.addEvents(options, entity)
  }

  addPolyline(positions: ScenePosition[], options: Record<string, any> = {}) {
    const entity = getNewEntity()
    entity.addPolyline(positions, options)
    entity.addEvents(options)
    return this.entities.add(entity)
  }

  addPolygon(positions: ScenePosition[], options: Record<string, any> = {}) {
    const entity = getNewEntity()
    entity.addPolygon(positions, options)
    entity.addEvents(options)
    return this.entities.add(entity)
  }

  addModel(position: ScenePosition, options: Record<string, any> = {}) {
    const entity = getNewEntity()
    entity.addModel(position, options)
    entity.addEvents(options)
    return this.entities.add(entity)
  }

  addPoint(position: ScenePosition, options: Record<string, any> = {}) {
    const entity = getNewEntity()
    entity.addPoint(position, options)
    entity.addEvents(options)
    return this.entities.add(entity)
  }

  addGeoJSON(data: GeoJSON.FeatureCollection, options: Record<string, any> = {}) {
    const SuperMap3D = getSuperMap3D()
    options = Object.assign(
      {
        stroke: SuperMap3D.Color.BLACK,
        fill: SuperMap3D.Color.RED,
        strokeWidth: 3,
        markerSymbol: '?'
      },
      options
    )
    if (options.stroke) {
      options.stroke = getSuperMap3DColor(options.stroke)
    }
    if (options.fill) {
      options.fill = getSuperMap3DColor(options.fill)
    }
    if (options.markerColor) {
      options.markerColor = getSuperMap3DColor(options.markerColor)
    }
    return new Promise<any[]>(resolve => {
      const dataSourcePromise = SuperMap3D.GeoJsonDataSource.load(data, options)
      dataSourcePromise.then((geoJsonDataSource: any) => {
        geoJsonDataSource.entities.values.map((entity: any) => {
          this.add(entity)
        })
        resolve(geoJsonDataSource.entities.values)
      })
    })
  }

  add(entity: any) {
    return this.entities.add(entity)
  }

  getById(id: string) {
    return this.entities.getById(id)
  }

  removeById(id: string) {
    return this.entities.removeById(id)
  }

  contains(entity: any) {
    return this.entities.contains(entity)
  }

  remove(entity: any) {
    return this.entities.remove(entity)
  }

  removeAll() {
    this.entities.removeAll()
  }

  getValues() {
    return this.entities.values
  }

  show() {
    this.entities.show = true
  }

  hide() {
    this.entities.show = false
  }

  showAll() {
    this.entities.show = true
    this.getValues().map((entity: any) => {
      entity.show = true
    })
  }

  setVisibility(callback: (entity: any) => boolean) {
    const visibleEntities: any[] = []
    this.getValues().map((entity: any) => {
      entity.show = callback(entity)
      if (entity.show) {
        visibleEntities.push(entity)
      }
    })
    return visibleEntities
  }

  enableCluster(enabled: boolean) {
    this.dataSource.clustering.enabled = enabled
  }

  _addCameraEvent() {
    if (!this._isNeedClusterCameraEvent() && !this._isNeedCoverCameraEvent()) {
      return
    }
    this._cameraMoveEndEvent = this._cameraEvent.bind(this)
    if (typeof this.viewer.addCameraMoveEndEvent === 'function') {
      this.viewer.addCameraMoveEndEvent(this._cameraMoveEndEvent)
    }
  }

  _removeCameraEvent() {
    if (this._cameraMoveEndEvent && typeof this.viewer.removeCameraMoveEndEvent === 'function') {
      this.viewer.removeCameraMoveEndEvent(this._cameraMoveEndEvent)
    }
  }

  _isNeedClusterCameraEvent() {
    return !!(this.options.cluster && this.options.cluster.enabled && this.options.cluster.minCameraHeight !== undefined)
  }

  _isNeedCoverCameraEvent() {
    return !!(this.options.cover && this.options.cover.enabled)
  }

  _cameraEvent() {
    if (this._isNeedClusterCameraEvent()) {
      const cameraHeight = getViewerCameraHeight(this.viewer)
      if (cameraHeight !== null) {
        this.enableCluster(cameraHeight > this.options.cluster.minCameraHeight)
      }
    }
    if (this._isNeedCoverCameraEvent()) {
      this.getValues().map((entity: any) => {
        entity.show = true
      })
    }
  }

  fireCameraEvent() {
    this._cameraEvent()
  }

  destroy() {
    if (this.dataSource) {
      this.viewer.dataSources.remove(this.dataSource)
      this.dataSource = null
    }
  }

  isDestroyed() {
    return this.dataSource === null
  }
}

class ThreeDTilesManager {
  viewer: any
  tileset: any
  destroyed: boolean

  constructor(viewer: any) {
    this.viewer = viewer
    this.tileset = null
    this.destroyed = false
  }

  add(url: string, options: Record<string, any> = {}) {
    const SuperMap3D = getSuperMap3D()
    this.destroyed = false
    options.maximumScreenSpaceError = 0.5
    options.skipLevelOfDetail = true
    return SuperMap3D.Cesium3DTileset.fromUrl(url, options).then((tileset: any) => {
      if (this.tileset) {
        this.viewer.scene.primitives.remove(this.tileset)
      }
      this.tileset = tileset
      if (this.destroyed) {
        return null
      }
      this.viewer.scene.primitives.add(tileset)
      return tileset
    })
  }

  getTileset() {
    return this.tileset
  }

  remove() {
    this.destroyed = true
    if (this.tileset) {
      this.viewer.scene.primitives.remove(this.tileset)
      this.tileset = null
    }
  }
}

class SceneImageryLayerManager {
  viewer: any
  imageryLayers: any

  constructor(viewer: any) {
    this.viewer = viewer
    this.imageryLayers = viewer?.scene?.imageryLayers || viewer?.imageryLayers
  }

  add(options: Record<string, any>, type?: string) {
    const SuperMap3D = getSuperMap3D()
    let provider
    switch (type) {
      case 'arcgis':
        provider = new SuperMap3D.ArcGisMapServerImageryProvider(options)
        break
      case 'bing':
        provider = new SuperMap3D.BingMapsImageryProvider(options)
        break
      case 'supermap':
        provider = new SuperMap3D.SuperMapImageryProvider(options)
        break
      case 'wms':
        provider = new SuperMap3D.WebMapServiceImageryProvider(options)
        break
      case 'wmts':
        provider = new SuperMap3D.WebMapTileServiceImageryProvider(options)
        break
      case 'single':
        provider = new SuperMap3D.SingleTileImageryProvider(options)
        break
      case 'tianditu':
        provider = new SuperMap3D.TiandituImageryProvider(options)
        break
      case 'url':
        provider = new SuperMap3D.UrlTemplateImageryProvider(options)
        break
      default:
        provider = new SuperMap3D.SuperMapImageryProvider(options)
        break
    }
    return this.imageryLayers.addImageryProvider(provider)
  }

  remove(layer: any) {
    this.imageryLayers?.remove?.(layer)
  }

  removeAll() {
    this.imageryLayers?.removeAll?.()
  }

  getLayers() {
    return this.imageryLayers?._layers || []
  }

  raiseToTop(layer: any) {
    this.imageryLayers?.raiseToTop?.(layer)
  }
}

class SceneS3MTilesLayerManager {
  viewer: any
  _values: any[]
  _map: Record<string, any>
  _promises: Record<string, Promise<any>>

  constructor(viewer: any) {
    this.viewer = viewer
    this._values = []
    this._map = {}
    this._promises = {}
  }

  add(url: string, options: Record<string, any> = {}) {
    const finalOptions = Object.assign({ name: this._createLayerName() }, options)
    if (this._map[finalOptions.name]) {
      throw new Error('Layer name already exists')
    }
    const promise = new Promise<any>((resolve, reject) => {
      const addOptions: Record<string, any> = {
        name: finalOptions.name
      }
      if (finalOptions.MaxHeight) {
        addOptions.MaxHeight = finalOptions.MaxHeight
      }
      if (finalOptions.MinHeight) {
        addOptions.MinHeight = finalOptions.MinHeight
      }
      if (finalOptions.layerBounds) {
        addOptions.layerBounds = finalOptions.layerBounds
      }
      if (finalOptions.WaterEffectSet) {
        addOptions.WaterEffectSet = finalOptions.WaterEffectSet
      }
      if (finalOptions.subdomainConfig) {
        addOptions.subdomainConfig = finalOptions.subdomainConfig
      }
      if (finalOptions.subdomains) {
        addOptions.subdomains = finalOptions.subdomains
      }
      this.viewer.scene
        .addS3MTilesLayerByScp(url, Object.assign(addOptions, finalOptions.options))
        .then((layer: any) => {
          this._setLayer(layer, finalOptions)
          this.addLayer(layer, finalOptions)
          resolve(layer)
        })
        .catch(reject)
    })
    this._promises[finalOptions.name] = promise
    return promise
  }

  addLayer(layer: any, options?: Record<string, any>) {
    if (this._map[layer.name]) {
      throw new Error('Layer name already exists')
    }
    this._map[layer.name] = layer
    this._values.push(layer)
    this._setLayer(layer, options)
  }

  open(url: string, options: Record<string, any> = {}) {
    const finalOptions = Object.assign({}, options)
    const openOptions: Record<string, any> = {
      autoSetView: finalOptions.autoSetView
    }
    if (finalOptions.subdomains) {
      openOptions.subdomains = finalOptions.subdomains
    }
    return this.viewer.scene
      .open(url, finalOptions.sceneName, Object.assign(openOptions, finalOptions.options))
      .then((layers: any[]) => {
        for (let i = 0; i < layers.length; i++) {
          this.addLayer(layers[i], finalOptions)
        }
        return layers
      })
  }

  getByName(name: string) {
    return this._map[name]
  }

  getPromiseByName(name: string) {
    return this._promises[name]
  }

  getValues() {
    return this._values
  }

  hideByName(name: string) {
    if (this._map[name]) {
      this._map[name].visible = false
    }
  }

  showByName(name: string) {
    if (this._map[name]) {
      this._map[name].visible = true
    }
  }

  hideAll() {
    this._values.forEach(layer => {
      layer.visible = false
    })
  }

  showAll() {
    this._values.forEach(layer => {
      layer.visible = true
    })
  }

  remove(name: string, destroy = true) {
    const layer = this._map[name]
    if (!layer) {
      return
    }
    if (getSuperMap3D().ImageryLayer && layer instanceof getSuperMap3D().ImageryLayer) {
      this.viewer.imageryLayers.remove(layer)
    } else {
      this.viewer.scene.layers.remove(name, destroy)
    }
    const index = this._values.findIndex(item => item?.name === name)
    if (index > -1) {
      this._values.splice(index, 1)
    }
    delete this._map[name]
    delete this._promises[name]
  }

  removeAll(destroy = true) {
    Object.keys(this._map).forEach(name => {
      this.remove(name, destroy)
    })
  }

  _setLayer(layer: any, options: Record<string, any> = {}) {
    if (!options) {
      return layer
    }
    layer.onClick = options.onClick && options.onClick.bind(layer, options.data, layer)
    layer.onRightClick = options.onRightClick && options.onRightClick.bind(layer, options.data, layer)
    layer.onHover = options.onHover && options.onHover.bind(layer, options.data, layer)
    layer.onLeftUp = options.onLeftUp && options.onLeftUp.bind(layer, options.data, layer)
    layer.onLeftDown = options.onLeftDown && options.onLeftDown.bind(layer, options.data, layer)
    layer.onRightUp = options.onRightUp && options.onRightUp.bind(layer, options.data, layer)
    layer.onRightDown = options.onRightDown && options.onRightDown.bind(layer, options.data, layer)
    layer.onDoubleClick = options.onDoubleClick && options.onDoubleClick.bind(layer, options.data, layer)
    return layer
  }

  _createLayerName() {
    return `scene-s3m-${Date.now()}-${Math.floor(Math.random() * 1000000)}`
  }
}

class ClusterForeManager {
  manager: LayerManager
  viewer: any
  layers: Record<string, EntitiesLayer>

  constructor(manager: LayerManager) {
    this.manager = manager
    this.viewer = manager.viewer
    this.layers = {}
  }

  getLayerById(id: string) {
    return this.layers[id]
  }

  getLayer(item: LayerCheckData) {
    const config = item.config || {}
    const icon = getIcon(config.icon || {})
    this.layers[item.id as string] =
      this.layers[item.id as string] ||
      new EntitiesLayer(this.viewer, {
        name: item.name,
        cluster: {
          enabled: config.cluster === FRONT_CLUSTER,
          minCameraHeight: 1200,
          minimumClusterSize: 2,
          clusterBillboards: true,
          clusterLabels: true,
          clusterPoints: true,
          billboard: {
            width: icon.width,
            height: icon.height,
            image: icon.url
          },
          onCluster: (entities: any[], newEntity: any) => {
            const SuperMap3D = getSuperMap3D()
            const count = entities.length
            newEntity.label.show = true
            newEntity.label.fillColor = SuperMap3D.Color.fromCssColorString('white')
            newEntity.label.showBackground = true
            newEntity.label.backgroundColor = SuperMap3D.Color.fromCssColorString('rgba(3,17,36,0.85)')
            newEntity.label.text = `${count}`
            newEntity.label.font = '32px SimHei'
            newEntity.label.scale = 0.5
            newEntity.label.pixelOffset = new SuperMap3D.Cartesian2(0, -(icon.height + 10))
            newEntity.label.backgroundPadding = new SuperMap3D.Cartesian2(10, 10)
            newEntity.label.verticalOrigin = SuperMap3D.VerticalOrigin.CENTER
            newEntity.label.horizontalOrigin = SuperMap3D.HorizontalOrigin.CENTER
            newEntity.label.disableDepthTestDistance = Number.POSITIVE_INFINITY
          }
        }
      })
    return this.layers[item.id as string]
  }

  async addLayer(
    item: LayerCheckData,
    queryFun: () => Promise<LayerDataResult>
  ) {
    const layer = this.getLayer(item)
    layer.show()
    const dataResult = await queryFun()
    const featureCollection = dataResult.featureCollection
    if (!layer.entities.show) {
      return {
        layer,
        dataResult
      }
    }
    layer.removeAll()
    if (featureCollection.features.length > 0) {
      await this._addFeatures(featureCollection, item, layer)
    }
    return {
      layer,
      dataResult
    }
  }

  async _addFeatures(
    featureCollection: GeoJSON.FeatureCollection,
    item: LayerCheckData,
    layer: EntitiesLayer
  ) {
    const geometryType = getFeatureGeometryType(featureCollection)
    if (geometryType === 'Point' || geometryType === 'MultiPoint') {
      this._renderPoints(featureCollection, item, layer)
      return
    }
    await this._renderLineOrPolygon(featureCollection, item, layer)
  }

  _renderPoints(
    featureCollection: GeoJSON.FeatureCollection,
    item: LayerCheckData,
    layer: EntitiesLayer
  ) {
    const config = item.config || {}
    const icon = getIcon(config.icon || {})
    const labelConfig = Object.assign(
      {
        field: '',
        fontSize: 14,
        maxVisibleAltitude: Number.MAX_VALUE
      },
      config.label
    )
    featureCollection.features.forEach(feature => {
      const props = feature.properties || {}
      const position = this._getPointPosition(feature, item)
      if (!position) {
        return
      }
      let entity
      if (config.model?.url) {
        let minimumPixelSize = 0
        if (typeof config.model.minimumPixelSize === 'number') {
          minimumPixelSize = (getSuperMap3D().defaults?.ratio || 1) * config.model.minimumPixelSize
        }
        entity = layer.addModel(position, {
          uri: config.model.url,
          minimumPixelSize,
          scale: config.model?.scale || 1,
          distanceDisplayCondition: getSuperMap3DDistanceDisplayCondition([0, config.model.maxVisibleAltitude])
        });
      } else {
        entity = layer.addMarker(position, {
          url: icon.url,
          width: icon.width,
          height: icon.height,
          align: 'bottom',
          labelText: labelConfig.field ? props[labelConfig.field] || '' : '',
          labelAlign: 'top',
          labelFontFamily: 'Alibaba PuHuiTi',
          labelFontSize: labelConfig.fontSize,
          labelColor: labelConfig.color || '#fff',
          labelOutline: true,
          labelOutlineColor: labelConfig.strokeColor || config.stroke || '#000',
          labelOutlineWidth: 1,
          labelOffsetX: labelConfig.field ? labelConfig.labelOffsetX || 0 : 0,
          labelOffsetY: labelConfig.field ? labelConfig.labelOffsetY || 0 : 0,
          data: props,
          disableDepthTestDistance: config.disableDepthTest ? undefined : Number.POSITIVE_INFINITY,
          heightReference: config.heightField
            ? getSuperMap3D().HeightReference.NONE
            : getSuperMap3D().HeightReference.RELATIVE_TO_GROUND
        })
      };
      (entity as any).___data = props
      setLayerFeatureData(entity, item, props as Record<string, any>)
      if (labelConfig.field && entity?.label) {
        entity.label.distanceDisplayCondition = getSuperMap3DDistanceDisplayCondition([
          0,
          labelConfig.maxVisibleAltitude
        ])
      }
      if (config.showCallout) {
        layer.addPolyline(
          [
            [position[0], position[1], 0],
            position
          ],
          {
            material: config.stroke,
            distanceDisplayCondition: getSuperMap3DDistanceDisplayCondition([0, config.calloutMaxVisibleAltitude])
          }
        )
      }
    })
  }

  async _renderLineOrPolygon(
    featureCollection: GeoJSON.FeatureCollection,
    item: LayerCheckData,
    layer: EntitiesLayer
  ) {
    const config = item.config || {}
    const fill = config.fill || 'rgba(0,0,255,0.2)'
    const stroke = config.stroke || 'rgba(0,0,255,1)'
    const idFiled = config.idField || 'smid'
    let fillByFieldColorConfig = config.fillByFieldColorConfig
    let fillByFieldColorFun: ((prop: Record<string, any>) => { name: string; color: string | null }) | null = null
    let fillByFieldColorMap: Record<string, string> = {}
    if (config.fillByField) {
      if (fillByFieldColorConfig?.mode === 'single') {
        if (fillByFieldColorConfig.singleConditions?.length > 0) {
          let colorMap: Record<string, string> = {}
          fillByFieldColorConfig.singleConditions.forEach((value: Record<string, any>) => {
            colorMap[value.value] = value.color
          })
          fillByFieldColorFun = prop => {
            const name = prop[fillByFieldColorConfig.conditionField]
            return {
              name,
              color: colorMap[name]
            }
          }
        } else {
          let colorMap: Record<string, string> = {}
          let index = 0
          fillByFieldColorFun = prop => {
            const value = prop[fillByFieldColorConfig.conditionField]
            let color = colorMap[value]
            if (!color) {
              color = colorMap[value] = getDefaultColorByIndex(index++)
            }
            return {
              name: value,
              color
            }
          }
        }
      } else if (fillByFieldColorConfig) {
        fillByFieldColorFun = prop => {
          const value = Number(prop[fillByFieldColorConfig.conditionField])
          for (let i = 0; i < fillByFieldColorConfig.rangeConditions.length; i++) {
            const condition = fillByFieldColorConfig.rangeConditions[i]
            if (value < condition.max && value >= condition.min) {
              return {
                name: `${condition.min}~${condition.max}`,
                color: condition.color
              }
            }
          }
          return {
            name: '其他',
            color: null
          }
        }
      }

      if (fillByFieldColorFun) {
        featureCollection.features.forEach(feature => {
          const prop = (feature.properties || {}) as Record<string, any>
          const colorConfig = fillByFieldColorFun?.(prop)
          const color = colorConfig?.color || (String(feature.geometry?.type || '').includes('Polygon') ? fill : stroke)
          fillByFieldColorMap[prop[idFiled]] = color
        })
      }
    }

    const entities = await layer.addGeoJSON(featureCollection, {
      fill: getSuperMap3DColor(fill),
      stroke: getSuperMap3DColor(stroke),
      clampToGround: true
    })
    entities.forEach(entity => {
      entity.___data = (() => {
        let props = entity.properties;
        let data = {};
        props.propertyNames.forEach(key => {
          data[key] = props[key]._value;
        });
        return data;
      })();
      const prop = entity.___data
      if (config.fillByField && fillByFieldColorMap[prop[idFiled]]) {
        if (entity.polygon) {
          entity.polygon.material = getSuperMap3DColor(fillByFieldColorMap[prop[idFiled]])
        }
        if (entity.polyline) {
          entity.polyline.material = getSuperMap3DColor(fillByFieldColorMap[prop[idFiled]])
        }
      }
      setLayerFeatureData(entity, item, prop)
    })
  }

  _getPointPosition(feature: GeoJSON.Feature, item: LayerCheckData) {
    const config = item.config || {}
    const coordinates = getFeatureCoordinates(feature)
    if (!coordinates) {
      return null
    }
    const point = Array.isArray(coordinates[0]) ? coordinates[0] : coordinates
    const props = feature.properties || {}
    const position: [number, number, number] = [Number(point[0]), Number(point[1]), Number(point[2]) || 0]
    if (config.heightField) {
      position[2] =
        (Number((props as Record<string, any>)[config.heightField]) || 0) +
        (Number(config.offsetHeight) || 0)
    }
    return position
  }

  remove(id: string) {
    const layer = this.layers[id]
    if (layer) {
      layer.removeAll()
      layer.hide()
    }
  }

  removeAll() {
    Object.keys(this.layers).forEach(key => {
      this.remove(key)
    })
  }
}

class LayerManager {
  map: Record<string, any>
  mvt: Record<string, any>
  s3m: Record<string, any>
  threeDTiles: Record<string, ThreeDTilesManager>
  layerManager: ClusterForeManager | null
  mapManager: any
  options: LayerManagerOptions
  viewer: any
  hasAddS3MTilesLayerUpdateHeightScaleEvent: boolean
  layerCheckOptionsMap: Record<string, LayerCheckOptions>
  layerLifecycleLayerStateMap: Record<string, Record<string, any>>

  constructor(viewer: any, options: LayerManagerOptions = {}) {
    if (!viewer) {
      throw new Error('viewer is required')
    }
    this.viewer = viewer
    this.options = Object.assign({}, options)
    this.map = {}
    this.mvt = {}
    this.s3m = {}
    this.threeDTiles = {}
    this.layerManager = null
    this.hasAddS3MTilesLayerUpdateHeightScaleEvent = false
    this.layerCheckOptionsMap = {}
    this.layerLifecycleLayerStateMap = {}
  }

  async check(data: LayerCheckData, checked: boolean, options: LayerCheckOptions = {}) {
    if (!data) {
      return
    }
    const dataId = String(data.id || '')
    options = Object.assign({}, this.layerCheckOptionsMap[dataId] || {}, options)
    if (checked && dataId) {
      this.layerCheckOptionsMap[dataId] = Object.assign({}, options)
    }
    this._parseSubdomains(data)
    try {
      if (checked && data.autoLocate) {
        this.locateByCamera(data)
      }

      if (await this.runCustomLayerAction({ action: 'toggle', data, checked, options })) {
        return
      }

      const type = data.type
      switch (type) {
        case 'terrain':
          await this._loadTerrain(data, checked, options)
          break
        case 's3m':
          await this._loadS3m(data, checked, options)
          break
        case 'map':
          await this._loadMap(data, checked, options)
          break
        case 'data':
          await this._loadData(data, checked, options)
          break
        case '3dtiles':
          await this._load3DTiles(data, checked, options)
          break
        default:
      }
    } finally {
      if (!checked && dataId) {
        delete this.layerCheckOptionsMap[dataId]
      }
    }
  }

  locateByCamera(data: LayerCheckData) {
    const camera = parseLayerCameraConfig(data?.locateParams)
    if (!camera) {
      if (data?.locateParams) {
        console.error(`${data?.name || data?.id || 'layer'} locateParams is invalid`)
      }
      return false
    }

    if (typeof this.viewer?.flyToCamera === 'function') {
      this.viewer.flyToCamera(camera.position, {
        duration: camera.duration || 2,
        hpr: camera.hpr
      })
      return true
    }

    flyToCamera(this.viewer, camera.position, {
      duration: camera.duration || 2,
      hpr: camera.hpr
    })
    return true
  }

  async locate(data: LayerCheckData) {
    if (!data) {
      return false
    }

    const options = this.layerCheckOptionsMap[String(data.id || '')] || {}
    if (await this.runCustomLayerAction({ action: 'locate', data, options })) {
      return true
    }

    if (this.locateByCamera(data)) {
      return true
    }

    const viewer = this.viewer
    const id = String(data.id || '')
    let layer

    switch (data.type) {
      case 'map':
        if (data.config?.type === 'mvt') {
          layer = this.mvt[id]
          if (layer?.rectangle) {
            const bounds = layer.rectangle
            viewer.scene.camera.setView({
              destination: new (getSuperMap3D().Cartesian3 as any).fromRadians(
                (bounds.east + bounds.west) * 0.5,
                (bounds.north + bounds.south) * 0.5,
                10000
              ),
              orientation: {
                heading: 0,
                roll: 0
              }
            })
            return true
          }
          return false
        }
        layer = this.map[id]
        if (typeof layer !== 'undefined') {
          viewer.flyTo(layer)
          return true
        }
        return false
      case 's3m': {
        const s3mTilesLayerManager = this.getS3mManager(id)
        layer = s3mTilesLayerManager.getValues?.()?.[0]
        if (!layer) {
          return false
        }
        if (
          layer.layerBounds?.west === 0 &&
          layer.layerBounds?.east === 0 &&
          layer.layerBounds?.south === 0 &&
          layer.layerBounds?.north === 0
        ) {
          const centerCartesianPosition = layer._position
          if (!centerCartesianPosition) {
            return false
          }
          const boundingSphere = new (getSuperMap3D().BoundingSphere as any)(centerCartesianPosition, 2000)
          viewer.scene.camera.flyToBoundingSphere(boundingSphere)
          return true
        }
        viewer.flyTo(layer)
        return true
      }
      case 'data':
        layer = this.getLayerManger().getLayerById(id)
        if (layer?.getValues) {
          viewer.flyTo(layer.getValues())
          return true
        }
        return false
      case 'terrain': {
        const terrainProvider = viewer.getTerrainProvider?.() || viewer.terrainProvider
        const bounds = terrainProvider?._bounds
        if (bounds && typeof viewer.flyToBounds === 'function') {
          viewer.flyToBounds(bounds, {
            duration: 2
          })
          return true
        }
        return false
      }
      case '3dtiles': {
        const tileset = this.threeDTiles[id]?.getTileset?.()
        if (tileset) {
          viewer.flyTo(tileset)
          return true
        }
        return false
      }
      default:
        return false
    }
  }

  async handleDataChange(data: LayerCheckData) {
    if (!data) {
      return
    }

    const dataId = String(data.id || '')
    const options = this.layerCheckOptionsMap[dataId] || {}
    if (await this.runCustomLayerAction({ action: 'update', data, options })) {
      return
    }
    if (!data.checked) {
      return
    }

    switch (data.type) {
      case 'terrain':
        await this._handleTerrainLayerDataChange(data)
        break
      case 'map':
        await this._handleMapLayerDataChange(data)
        break
      case 's3m':
        await this._handleS3MLayerDataChange(data)
        break
      case 'data':
        await this._handleDataLayerDataChange(data)
        break
      case '3dtiles':
        await this._handle3DTilesLayerDataChange(data)
        break
      default:
    }
  }

  getMapManager() {
    this.mapManager = this.mapManager || new SceneImageryLayerManager(this.viewer)
    return this.mapManager
  }

  getS3mManager(id: string) {
    this.s3m[id] = this.s3m[id] || new SceneS3MTilesLayerManager(this.viewer)
    return this.s3m[id]
  }

  getThreeDTilesManager(id: string) {
    this.threeDTiles[id] = this.threeDTiles[id] || new ThreeDTilesManager(this.viewer)
    return this.threeDTiles[id]
  }

  getContext(): LayerManagerContext {
    return {
      viewer: this.viewer,
      manager: this
    }
  }

  _getLayerLifecycleLayerState(id: string) {
    this.layerLifecycleLayerStateMap[id] = this.layerLifecycleLayerStateMap[id] || {}
    return this.layerLifecycleLayerStateMap[id]
  }

  _removeLayerLifecycleState(id: string) {
    delete this.layerLifecycleLayerStateMap[id]
  }

  _getLayerLifecyclePayload(
    phase: LayerLifecyclePhase,
    data: LayerCheckData,
    options: LayerCheckOptions,
    runtime: LayerLifecycleRuntime = {}
  ): LayerLifecyclePayload {
    const id = String(data.id || '')
    const layerState = this._getLayerLifecycleLayerState(id)
    const nextRuntime = Object.assign({}, layerState.runtime || {}, runtime)
    layerState.data = data
    layerState.type = data.type
    layerState.runtime = nextRuntime
    return {
      phase,
      type: data.type,
      data,
      config: data.config || {},
      options,
      runtime: nextRuntime
    }
  }

  async _handleLayerLifecycle(
    phase: LayerLifecyclePhase,
    data: LayerCheckData,
    options: LayerCheckOptions,
    runtime: LayerLifecycleRuntime = {}
  ) {
    const payload = this._getLayerLifecyclePayload(phase, data, options, runtime)
    if (typeof this.options.extension?.onLayerLifecycle === 'function') {
      await this.options.extension.onLayerLifecycle(payload, this.getContext())
    }
    return payload
  }

  async runCustomLayerAction(payload: LayerCustomActionPayload) {
    const action = this.options.extension?.customLayerAction
    if (!action) {
      return false
    }
    const result = await action(payload, this.getContext())
    return result === true || (typeof result === 'object' && !!result?.handled)
  }

  async _loadTerrain(data: LayerCheckData, checked: boolean, options: LayerCheckOptions) {
    const id = String(data.id || '')
    if (checked) {
      await this._handleLayerLifecycle('before-load', data, options, {
        manager: this.viewer,
        layer: this.viewer.getTerrainProvider?.() || this.viewer.terrainProvider
      })
      if (data.config?.url?.endsWith?.('/realspace')) {
        this.viewer.scene.open(data.config.url, undefined, {
          autoSetView: false,
          subdomains: data.config.subdomains
        })
      } else if (typeof this.viewer.addTerrainProvider === 'function') {
        this.viewer.addTerrainProvider(data.config)
      } else {
        const SuperMap3D = getSuperMap3D()
        this.viewer.terrainProvider = new SuperMap3D.SuperMapTerrainProvider({
          url: data.config?.url,
          ...(data.config?.isSct !== undefined ? { isSct: data.config.isSct } : {})
        })
      }
    } else {
      await this._handleLayerLifecycle('before-remove', data, options, {
        manager: this.viewer,
        layer: this.viewer.getTerrainProvider?.() || this.viewer.terrainProvider
      })
      if (typeof this.viewer.removeTerrainProvider === 'function') {
        this.viewer.removeTerrainProvider()
      } else {
        const SuperMap3D = getSuperMap3D()
        this.viewer.terrainProvider = new SuperMap3D.EllipsoidTerrainProvider()
      }
      this._removeLayerLifecycleState(id)
      return
    }
    await this._handleLayerLifecycle('loaded', data, options, {
      manager: this.viewer,
      layer: this.viewer.getTerrainProvider?.() || this.viewer.terrainProvider
    })
  }

  async _loadMap(data: LayerCheckData, checked: boolean, options: LayerCheckOptions) {
    const id = String(data.id || '')
    this.mapManager = this.getMapManager()
    if (checked) {
      await this._handleLayerLifecycle('before-load', data, options, {
        manager: this.mapManager,
        layer: data.config?.type === 'mvt' ? this.mvt[id] : this.map[id]
      })
      if (data.config?.type === 'mvt') {
        this._loadMvtMap(data)
      } else {
        this.map[id] = loadByJsonConfig(
          this.mapManager,
          Object.assign({ name: data.name }, data.config || {})
        )
        const layer = this.map[id]
        layer.zIndex = data.config?.zIndex || 999
        this._sortLayersByZIndex(this.viewer)
        this.handleImageryLayerConfig(layer, data.config || {})
      }
    } else {
      await this._handleLayerLifecycle('before-remove', data, options, {
        manager: this.mapManager,
        layer: data.config?.type === 'mvt' ? this.mvt[id] : this.map[id]
      })
      if (data.config?.type === 'mvt') {
        this._removeMvtMapById(id)
      } else {
        this.removeMapById(id)
      }
      this._removeLayerLifecycleState(id)
      return
    }
    await this._handleLayerLifecycle('loaded', data, options, {
      manager: this.mapManager,
      layer: data.config?.type === 'mvt' ? this.mvt[id] : this.map[id]
    })
  }

  async _loadS3m(data: LayerCheckData, checked: boolean, options: LayerCheckOptions) {
    this._addS3MTilesLayerUpdateHeightScaleEvent()
    const id = String(data.id || '')
    const s3mManager = this.getS3mManager(id)
    if (checked) {
      await this._handleLayerLifecycle('before-load', data, options, {
        manager: s3mManager,
        layers: s3mManager.getValues?.() || []
      })
      const config = data.config || {}
      const requestOptions: Record<string, any> = {}
      if (config.header) {
        requestOptions.customRequestHeaders = JSON.parse(config.header)
      }
      const url = config.url
      let loadPromise: Promise<any[]>
      if (typeof url === 'string' && url.endsWith('/realspace')) {
        loadPromise = s3mManager.open(url, {
          options: requestOptions,
          autoSetView: false,
          subdomains: config.subdomains
        })
      } else {
        const urls = String(url || '')
          .split(',')
          .map(item => item.trim())
          .filter(Boolean)
        loadPromise = new Promise(async resolve => {
          const layers = []
          for (let i = 0; i < urls.length; i++) {
            const currentUrl = urls[i]
            const layer = await s3mManager.add(currentUrl, {
              options: requestOptions,
              name: this._parseS3MLayerName(currentUrl),
              subdomains: config.subdomains
            })
            layers.push(layer)
          }
          resolve(layers)
        })
      }

      const layers = await loadPromise
      layers.forEach(layer => {
        options.onS3MTilesLayerLoaded?.(layer, data)
        layer.____data = data
        this.handleModelConfig(layer, config)
      })
      await this._handleLayerLifecycle('loaded', data, options, {
        manager: s3mManager,
        layers
      })
    } else {
      const layers = s3mManager.getValues?.() || []
      await this._handleLayerLifecycle('before-remove', data, options, {
        manager: s3mManager,
        layers
      })
      s3mManager.removeAll?.(true)
      this._removeLayerLifecycleState(id)
    }
  }

  async _load3DTiles(data: LayerCheckData, checked: boolean, options: LayerCheckOptions) {
    const id = String(data.id || '')
    const threeDTilesManager = this.getThreeDTilesManager(id)
    if (checked) {
      await this._handleLayerLifecycle('before-load', data, options, {
        manager: threeDTilesManager,
        layer: threeDTilesManager.getTileset?.() || null
      })
      const tileset = await threeDTilesManager.add(data.config?.url, {
        isSuperMapiServer: data.config?.isSuperMapiServer
      })
      if (tileset) {
        this._handle3DTilesModelConfig(tileset, data.config || {})
      }
      await this._handleLayerLifecycle('loaded', data, options, {
        manager: threeDTilesManager,
        layer: threeDTilesManager.getTileset?.() || tileset || null
      })
    } else {
      await this._handleLayerLifecycle('before-remove', data, options, {
        manager: threeDTilesManager,
        layer: threeDTilesManager.getTileset?.() || null
      })
      threeDTilesManager.remove()
      this._removeLayerLifecycleState(id)
    }
  }

  getLayerManger() {
    this.layerManager = this.layerManager || new ClusterForeManager(this)
    return this.layerManager
  }

  async _loadData(data: LayerCheckData, checked: boolean, options: LayerCheckOptions) {
    if (data.config?.cluster === BACK_CLUSTER) {
      console.warn('[LayerManager] data layer mode "back" must be handled by options.extension.customLayerAction.')
      return
    }
    const id = String(data.id || '')
    const manager = this.getLayerManger()

    if (checked) {
      const handlers = await this._getDataFrontHandlers(data, options)
      if (!handlers) {
        return
      }

      await this._handleLayerLifecycle('before-load', data, options, {
        manager,
        mode: 'front',
        handlers,
        layer: manager.getLayerById?.(id) || null
      })

      const { layer, dataResult } = await manager.addLayer(data, handlers.queryFun)
      const layerState = this._getLayerLifecycleLayerState(id)
      layerState.runtime = Object.assign({}, layerState.runtime || {}, {
        manager,
        mode: 'front',
        handlers,
        layer,
        dataResult
      })
      await this._handleLayerLifecycle('loaded', data, options, {
        manager,
        mode: 'front',
        handlers,
        layer,
        dataResult
      })
      return
    }

    const existingHandlers = this.layerLifecycleLayerStateMap[id]?.runtime?.handlers || null
    await this._handleLayerLifecycle('before-remove', data, options, {
      manager,
      mode: 'front',
      handlers: existingHandlers,
      layer: manager.getLayerById?.(id) || null
    })
    manager.remove(id)
    this._removeLayerLifecycleState(id)
  }

  async _getDataFrontHandlers(data: LayerCheckData, options: LayerCheckOptions) {
    const config = data.config || {}
    const queryFun =
      config.type === 'rest'
        ? () => this._loadRestFeatures(data)
        : async () => {
            const loadDataFeatures = this.options.extension?.loadDataFeatures
            if (!loadDataFeatures) {
              console.warn(
                `[LayerManager] data type "${config.type}" requires options.extension.loadDataFeatures.`
              )
              return {
                featureCollection: getFeatureCollection([])
              }
            }
            const result = await loadDataFeatures(
              {
                data,
                options,
                mode: 'front'
              },
              this.getContext()
            )
            if (!result || !result.featureCollection) {
              console.warn(`[LayerManager] data type "${config.type}" did not return a featureCollection.`)
              return {
                featureCollection: getFeatureCollection([])
              }
            }
            return result
          }
    return {
      mode: 'front' as const,
      queryFun
    }
  }

  async _loadRestFeatures(data: LayerCheckData): Promise<LayerDataResult> {
    const featureCollection = await this._queryRestDataBySql(data)
    return {
      featureCollection,
      totalCount: Number((featureCollection as any).totalCount || featureCollection.features.length)
    }
  }

  async _queryRestDataBySql(data: LayerCheckData): Promise<GeoJSON.FeatureCollection> {
    const config = data.config || {}
    const idFiled = data.config?.idField || 'smid'
    const fields = [
      idFiled,
      data.config?.heightField,
      data.config?.label ? data.config.label.field : ''
    ]
      .concat(String(data.config?.initDataFields || '').trim().split(','))
      .filter(val => !!val && String(val).length > 0)

    const queryParameter: Record<string, any> = {
      name: `${config.datasetName}@${config.datasourceName}`,
      attributeFilter: config.filter || ''
    }
    if (!config.returnAllFields && String(idFiled).toLowerCase() === 'smid') {
      queryParameter.fields = fields
    }
    const params = new GetFeaturesBySQLParameters({
      queryParameter,
      datasetNames: [`${config.datasourceName}:${config.datasetName}`],
      hasGeometry: true,
      returnFeaturesOnly: false,
      targetPrj: {
        epsgCode: 4326
      },
      fromIndex: 0,
      toIndex: this._getMaxFeaturesIndex(config)
    })
    const result = await this._getFeatureService(config.url, config).getFeaturesBySQL(params)
    return this._normalizeFeatureServiceResult(result)
  }

  _getMaxFeaturesIndex(config: Record<string, any>) {
    return config.maxFeatures - 1 || MAX_FEATURES_COUNT
  }

  _getFeatureService(url: string, config: Record<string, any> = {}) {
    return new FeatureService(url, config.requestOptions || {})
  }

  _normalizeFeatureServiceResult(result: any): GeoJSON.FeatureCollection {
    const features = result?.result?.features?.features || result?.result?.features || result?.features?.features || []
    const featureCollection = getFeatureCollection(features)
    ;(featureCollection as any).totalCount =
      result?.result?.totalCount ||
      result?.totalCount ||
      result?.result?.features?.totalCount ||
      features.length
    return featureCollection
  }

  _loadMvtMap(data: LayerCheckData) {
    const id = String(data.id || '')
    let layer = this.mvt[id]
    if (!layer) {
      layer = this.viewer.scene.addVectorTilesMap({
        name: data.name,
        url: data.config?.url,
        viewer: this.viewer,
        labelDepthTestEnabled: false,
        subdomains: data.config?.subdomains
      })
      this.mvt[id] = layer
    }
    layer.show = true
  }

  _removeMvtMapById(id: string) {
    const layer = this.mvt[id]
    if (layer) {
      layer.show = false
    }
  }

  _handle3DTilesModelConfig(tileset: any, config: Record<string, any>) {
    const SuperMap3D = getSuperMap3D()
    if (config.fillForeColor) {
      tileset.style = new SuperMap3D.Cesium3DTileStyle({
        color: config.fillForeColor
      })
    }
  }

  _parseS3MLayerName(url: string) {
    const flagStr = '/rest/realspace/datas/'
    const startIndex = url.indexOf(flagStr)
    if (startIndex < 0) {
      return url
    }
    const temp = url.substring(startIndex + flagStr.length)
    let name = temp.substring(0, temp.lastIndexOf('/config'))
    if (name.indexOf('%') !== -1) {
      try {
        name = decodeURIComponent(name)
      } catch (error) {
        console.error(error)
      }
    }
    return name
  }

  _sortLayersByZIndex(viewer: any, zIndexProp = 'zIndex') {
    const layers = viewer.imageryLayers
    const zLayers: Array<{ layer: any; zIndex: number }> = []
    const nonZLayers: Array<{ layer: any }> = []

    layers._layers.forEach((layer: any) => {
      if (layer[zIndexProp] !== undefined && layer[zIndexProp] !== null) {
        zLayers.push({
          layer,
          zIndex: layer[zIndexProp]
        })
      } else {
        nonZLayers.push({
          layer
        })
      }
    })

    zLayers.sort((a, b) => a.zIndex - b.zIndex)
    const targetPositions = new Map<any, number>()
    zLayers.forEach((item, index) => {
      targetPositions.set(item.layer, index + nonZLayers.length)
    })

    zLayers.forEach(item => {
      const targetIndex = targetPositions.get(item.layer)
      const currentIndex = layers.indexOf(item.layer)
      if (currentIndex === targetIndex) {
        return
      }
      if (currentIndex < targetIndex) {
        for (let i = 0; i < targetIndex - currentIndex; i++) {
          layers.raise(item.layer)
        }
      } else {
        for (let i = 0; i < currentIndex - targetIndex; i++) {
          layers.lower(item.layer)
        }
      }
    })
  }

  _addS3MTilesLayerUpdateHeightScaleEvent() {
    if (this.hasAddS3MTilesLayerUpdateHeightScaleEvent) {
      return
    }
    this.viewer.camera?.changed?.addEventListener(() => {
      this.viewer.scene?.layers?.layerQueue?.forEach((layer: any) => {
        if (layer.____isCameraController) {
          const maxScaleHeight = 1500
          const minScaleHeight = 500
          const currentHeight = this.viewer.getCameraHeight()
          const heightScale = 1.0 - (currentHeight - minScaleHeight) / (maxScaleHeight - minScaleHeight)
          layer.heightScale = parseFloat(getSuperMap3D().Math.clamp(heightScale, 0.0, 1.0))
        }
      })
    })
    this.hasAddS3MTilesLayerUpdateHeightScaleEvent = true
  }

  handleModelConfig(layer: any, data: Record<string, any>) {
    const SuperMap3D = getSuperMap3D()

    if (data.loadPBR) {
      const name = layer.____name || layer.name
      if (data.pbrUrls) {
        try {
          const pbrUrls = JSON.parse(data.pbrUrls)
          pbrUrls[name] && layer.setPBRMaterialFromJSON(pbrUrls[name])
        } catch (error) {
          console.error(`PBR config error: ${name}`, error)
        }
      }
    }
    if (layer.style3D) {
      if (data.alpha) {
        layer.style3D.fillForeColor = new SuperMap3D.Color(1.0, 1.0, 1.0, data.alpha)
      }
      if (typeof data.fillStyle === 'number') {
        layer.style3D.fillStyle = data.fillStyle
      }
      if (typeof data.wireFrameMode === 'number') {
        layer.wireFrameMode = data.wireFrameMode
      }
      if (data.fillForeColor) {
        let color = getSuperMap3DColor(data.fillForeColor)
        if (data.alpha) {
          color = color.withAlpha(data.alpha)
        }
        layer.style3D.fillForeColor = color
      }
      if (data.lineColor) {
        layer.style3D.lineColor = getSuperMap3DColor(data.lineColor)
      }
      if (typeof data.lineWidth === 'number') {
        layer.style3D.lineWidth = data.lineWidth
      }
    }

    if (data.contrast) {
      layer.contrast = data.contrast
    }
    if (data.saturation) {
      layer.saturation = data.saturation
    }
    if (typeof data.maxVisibleAltitude === 'number') {
      layer.maxVisibleAltitude = data.maxVisibleAltitude
    }
    if (typeof data.minVisibleAltitude === 'number') {
      layer.minVisibleAltitude = data.minVisibleAltitude
    }
    if (data.useCustomAppearSetting) {
      layer.brightness = data.brightness ? (Number.isNaN(data.brightness) ? 1 : data.brightness) : 1
      layer.contrast = data.contrast ? (Number.isNaN(data.contrast) ? 1 : data.contrast) : 1
      layer.saturation = data.saturation ? (Number.isNaN(data.saturation) ? 1 : data.saturation) : 1
    }
    layer.lodRangeScale = data.lodRangeScale ? (Number.isNaN(data.lodRangeScale) ? 1 : data.lodRangeScale) : 1

    const bottomAltitudeOffset = data.bottomAltitudeOffset || 0
    if (bottomAltitudeOffset !== 0 && layer.style3D) {
      layer.style3D.bottomAltitude = (layer.style3D.bottomAltitude || 0) + bottomAltitudeOffset
      layer.refresh?.()
    }
    layer.orderIndependentTranslucency = data.oit !== false
    layer.partlyTransparent = !!data.partlyTransparent
    layer.selectEnabled = false
    layer.clearMemoryImmediately =
      typeof data.clearMemoryImmediately === 'boolean' ? data.clearMemoryImmediately : true

    if (SuperMap3D.LoadingPriorityMode && data.loadMode) {
      layer.LoadingPriority = SuperMap3D.LoadingPriorityMode[data.loadMode]
    } else if (SuperMap3D.LoadingPriorityMode) {
      layer.LoadingPriority = SuperMap3D.LoadingPriorityMode.Child_Priority_NonLinear
    }

    layer.residentRootTile = !!data.residentRootTile
    if (layer.indexedDBSetting) {
      layer.indexedDBSetting.isGeoTilesSave = !!data.isGeoTilesSave
      layer.indexedDBSetting.isAttributesSave = !!data.isAttributesSave
      layer.indexedDBSetting.isGeoTilesRootNodeSave = !!data.isGeoTilesRootNodeSave
    }

    layer.____isCameraController = data.isCameraController

    if (data.textureUVSpeedX || data.textureUVSpeedY) {
      const textureUVLayerNames = data.textureUVLayerNames
      const name = layer.____name || layer.name
      const isTarget =
        (textureUVLayerNames && textureUVLayerNames.split(',').indexOf(name) > -1) || !textureUVLayerNames
      if (isTarget) {
        layer.textureUVSpeed = new SuperMap3D.Cartesian2(
          Number(data.textureUVSpeedX) || 0,
          Number(data.textureUVSpeedY) || 0
        )
        layer.refresh?.()
      }
    }

    if (data.waterParameterEnabled && layer.waterParameter) {
      const waterLayerNames = data.waterLayerNames
      const name = layer.____name || layer.name
      const isTarget = (waterLayerNames && waterLayerNames.split(',').indexOf(name) > -1) || !waterLayerNames
      if (isTarget) {
        if (typeof data.waterbodySize === 'number') {
          layer.waterParameter.waterbodySize = data.waterbodySize
        }
        if (typeof data.waveStrength === 'number') {
          layer.waterParameter.waveStrength = data.waveStrength
        }
        if (typeof data.waveDirection === 'number') {
          layer.waterParameter.waveDirection = data.waveDirection
        }
        if (data.waterColor) {
          layer.waterParameter.color = SuperMap3D.Color.fromCssColorString(data.waterColor)
        }
        if (typeof data.waterBrightness === 'number') {
          layer.waterParameter.brightness = data.waterBrightness
        }
      }
    }
  }

  handleImageryLayerConfig(layer: any, config: Record<string, any>) {
    const SuperMap3D = getSuperMap3D()
    const keys = ['alpha', 'brightness', 'contrast', 'saturation']
    Object.keys(config).forEach(key => {
      if (keys.includes(key)) {
        layer[key] = config[key]
      }
    })
    if (config.transparentBackColor) {
      layer.transparentBackColor = SuperMap3D.Color.fromCssColorString(config.transparentBackColor)
    }
    layer.transparentBackColorTolerance = Number(config.transparentBackColorTolerance) || 0
  }

  async _runLayerLifecycleDataChange(data: LayerCheckData, runtime: LayerLifecycleRuntime = {}) {
    const id = String(data.id || '')
    const options = Object.assign({}, this.layerCheckOptionsMap[id] || {})
    await this._handleLayerLifecycle('data-change', data, options, runtime)
  }

  async _handleTerrainLayerDataChange(data: LayerCheckData) {
    await this._runLayerLifecycleDataChange(data, {
      manager: this.viewer,
      layer: this.viewer.getTerrainProvider?.() || this.viewer.terrainProvider
    })
  }

  async _handleMapLayerDataChange(data: LayerCheckData) {
    const id = String(data.id || '')
    const layer = this.map[String(data.id || '')]
    if (!layer) {
      await this._runLayerLifecycleDataChange(data, {
        manager: this.mapManager || this.getMapManager(),
        layer: data.config?.type === 'mvt' ? this.mvt[id] : null
      })
      return
    }
    layer.alpha = this._normalizeNumber(data.config?.alpha, 1)
    layer.contrast = this._normalizeNumber(data.config?.contrast, 1)
    layer.brightness = this._normalizeNumber(data.config?.brightness, 1)
    layer.saturation = this._normalizeNumber(data.config?.saturation, 1)
    this.handleImageryLayerConfig(layer, data.config || {})
    await this._runLayerLifecycleDataChange(data, {
      manager: this.mapManager || this.getMapManager(),
      layer
    })
  }

  async _handleS3MLayerDataChange(data: LayerCheckData) {
    const id = String(data.id || '')
    const s3mManager = this.getS3mManager(id)
    const layers = s3mManager.getValues?.() || []
    layers.forEach((layer: any) => {
      if (
        !data.config?.useCustomAppearSetting &&
        (this._normalizeNumber(data.config?.contrast, 1) !== 1 ||
          this._normalizeNumber(data.config?.brightness, 1) !== 1 ||
          this._normalizeNumber(data.config?.saturation, 1) !== 1)
      ) {
        data.config = data.config || {}
        data.config.useCustomAppearSetting = true
      }

      this.handleModelConfig(layer, data.config || {})

      if (layer.style3D) {
        layer.style3D.fillForeColor = new (getSuperMap3D().Color as any)(
          1,
          1,
          1,
          this._normalizeNumber(data.config?.alpha, 1)
        )
        layer.style3D.bottomAltitude = this._normalizeNumber(data.config?.bottomAltitudeOffset, 0)
        layer.refresh?.()
      } else if (getSuperMap3D().ImageryLayer && layer instanceof getSuperMap3D().ImageryLayer) {
        layer.alpha = this._normalizeNumber(data.config?.alpha, 1)
      }

      if (!layer.waterParameter) {
        return
      }

      layer.waterParameter.brightness = this._normalizeNumber(data.config?.brightness, 1)
      if (!data.config?.waterParameterEnabled) {
        return
      }
      if (typeof data.config.waterbodySize === 'number') {
        layer.waterParameter.waterbodySize = data.config.waterbodySize
      }
      if (typeof data.config.waveStrength === 'number') {
        layer.waterParameter.waveStrength = data.config.waveStrength
      }
      if (typeof data.config.waveDirection === 'number') {
        layer.waterParameter.waveDirection = data.config.waveDirection
      }
      if (data.config.waterColor) {
        layer.waterParameter.color = getSuperMap3D().Color.fromCssColorString(data.config.waterColor)
      }
    })
    await this._runLayerLifecycleDataChange(data, {
      manager: s3mManager,
      layers
    })
  }

  async _handleDataLayerDataChange(data: LayerCheckData) {
    if (data.config?.cluster === BACK_CLUSTER) {
      console.warn('[LayerManager] data layer mode "back" must be handled by options.extension.customLayerAction.')
      return
    }
    const id = String(data.id || '')
    const options = Object.assign({}, this.layerCheckOptionsMap[id] || {})
    const manager = this.getLayerManger()
    const runtime = {
      manager,
      mode: 'front' as const,
      handlers: this.layerLifecycleLayerStateMap[id]?.runtime?.handlers || null,
      layer: manager.getLayerById?.(id) || null,
      dataResult: this.layerLifecycleLayerStateMap[id]?.runtime?.dataResult || null
    }
    if (!manager.getLayerById(id)) {
      await this._runLayerLifecycleDataChange(data, runtime)
      return
    }
    await this._loadData(data, false, options)
    await this._loadData(data, true, options)
    await this._runLayerLifecycleDataChange(data, {
      manager,
      mode: 'front',
      handlers: this.layerLifecycleLayerStateMap[id]?.runtime?.handlers || null,
      layer: manager.getLayerById?.(id) || null,
      dataResult: this.layerLifecycleLayerStateMap[id]?.runtime?.dataResult || null
    })
  }

  async _handle3DTilesLayerDataChange(data: LayerCheckData) {
    const id = String(data.id || '')
    const manager = this.getThreeDTilesManager(id)
    const tileset = manager.getTileset?.() || null
    if (tileset) {
      this._handle3DTilesModelConfig(tileset, data.config || {})
    }
    await this._runLayerLifecycleDataChange(data, {
      manager,
      layer: tileset
    })
  }

  _normalizeNumber(value: unknown, defaultValue: number) {
    const nextValue = Number(value)
    return Number.isFinite(nextValue) ? nextValue : defaultValue
  }

  _getLayerLifecycleRemoveRuntime(
    id: string,
    data: LayerCheckData,
    layerState: Record<string, any> = {}
  ): LayerLifecycleRuntime {
    switch (data.type) {
      case 'terrain':
        return {
          manager: this.viewer,
          layer: this.viewer.getTerrainProvider?.() || this.viewer.terrainProvider
        }
      case 'map':
        return {
          manager: this.mapManager || this.getMapManager(),
          layer: data.config?.type === 'mvt' ? this.mvt[id] : this.map[id]
        }
      case 's3m': {
        const manager = this.s3m[id] || null
        return {
          manager,
          layers: manager?.getValues?.() || []
        }
      }
      case 'data': {
        const manager = this.getLayerManger()
        return {
          manager,
          mode: 'front',
          handlers: layerState.runtime?.handlers || null,
          layer: manager.getLayerById?.(id) || null,
          dataResult: layerState.runtime?.dataResult || null
        }
      }
      case '3dtiles': {
        const manager = this.threeDTiles[id] || null
        return {
          manager,
          layer: manager?.getTileset?.() || null
        }
      }
      default:
        return {}
    }
  }

  removeMapById(id: string) {
    const layer = this.map[id]
    layer && this.mapManager?.remove?.(layer)
    delete this.map[id]
  }

  async removeAll() {
    await this.runCustomLayerAction({ action: 'dispose-all' })
    const lifecycleEntries = Object.entries(this.layerLifecycleLayerStateMap)

    for (const [id, layerState] of lifecycleEntries) {
      const data = layerState?.data
      if (!data) {
        continue
      }
      const options = this.layerCheckOptionsMap[id] || {}
      await this._handleLayerLifecycle(
        'before-remove',
        data,
        options,
        this._getLayerLifecycleRemoveRuntime(id, data, layerState)
      )
    }

    if (lifecycleEntries.some(([, layerState]) => layerState?.data?.type === 'terrain')) {
      if (typeof this.viewer.removeTerrainProvider === 'function') {
        this.viewer.removeTerrainProvider()
      } else {
        const SuperMap3D = getSuperMap3D()
        this.viewer.terrainProvider = new SuperMap3D.EllipsoidTerrainProvider()
      }
    }

    Object.keys(this.s3m).forEach(key => {
      const s3mManager = this.s3m[key]
      s3mManager.removeAll?.(true)
      delete this.s3m[key]
    })
    Object.keys(this.map).forEach(key => {
      const layer = this.map[key]
      layer && this.mapManager?.remove?.(layer)
      delete this.map[key]
    })
    Object.keys(this.mvt).forEach(key => {
      const layer = this.mvt[key]
      if (layer) {
        layer.show = false
      }
      delete this.mvt[key]
    })
    Object.keys(this.threeDTiles).forEach(key => {
      this.threeDTiles[key].remove()
      delete this.threeDTiles[key]
    })
    this.layerCheckOptionsMap = {}
    this.layerLifecycleLayerStateMap = {}
    this.getLayerManger().removeAll()
  }

  _parseSubdomains(data: LayerCheckData) {
    const subdomains = data.subdomains
    if (!subdomains) {
      return
    }
    data.config = data.config || {}
    if (Array.isArray(subdomains)) {
      data.config.subdomains = subdomains
      return
    }
    data.config.subdomains = subdomains
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)
  }
}

export { LayerManager }
export default LayerManager
