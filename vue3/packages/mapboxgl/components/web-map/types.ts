import type { PropType, DefineComponent } from 'vue'
import type { ShortEmits } from '@supermapgis/common/utils/vue-types'
import type { MapOptions } from 'vue-iclient-core/controllers/mapboxgl/WebMapViewModel'
import type { MapEventName } from 'vue-iclient-core/controllers/mapboxgl/utils/MapEvents'
import type{ Map } from 'mapbox-gl'
import { getPropsDefaults } from '@supermapgis/common/utils/vue-types'

export interface CommonControlParam {
  show?: boolean
  position?: string
  background?: string
  textColor?: string
}

export interface CardCommonParam extends CommonControlParam {
  collapsed?: boolean
  headerName?: string
}

export interface ZoomParam extends CommonControlParam {
  showZoomSlider?: boolean
}

export interface MeasureParam extends CardCommonParam {
  showUnitSelect: boolean
  distanceDefaultUnit: string
  areaDefaultUnit: string
}

export interface LegendParam extends CardCommonParam {
  layerNames: string[]
  isShowTitle: boolean
  isShowField: boolean
  mode: string
}

export interface QueryParam extends CardCommonParam {
  maxFeatures?: number
  layerStyle?: Record<string, any>
  iportalData?: Array<Record<string, any>>
  restData?: Array<Record<string, any>>
  restMap?: Array<Record<string, any>>
}

export interface SearchParam extends CommonControlParam {
  maxFeatures?: number
  layerNames?: Array<string>
  onlineLocalSearch?: Object
  iportalData?: Array<Object>
  restData?: Array<Object>
  restMap?: Array<Object>
  addressMatch?: Array<string>
}

export interface IdentifyParam {
  show: boolean
  layers: Array<Object>
  fields: Array<string>
  layerStyle: Object
  clickAreaAround: number
}

export interface LayerManageParam {
  show: boolean
  layers: Array<Object>
}

export interface ControlProps {
  panControl?: CommonControlParam
  scaleControl?: CommonControlParam
  zoomControl?: ZoomParam
  miniMapControl?: CardCommonParam
  layerListControl?: CardCommonParam
  measureControl?: MeasureParam
  legendControl?: LegendParam
  queryControl?: QueryParam
  searchControl?: SearchParam
  identifyControl?: IdentifyParam
  layerManagerControl?: LayerManageParam
}

export const webMapProps = () => ({
  mapId: {
    type: [String, Number, Object],
    default: undefined
  },
  target: {
    type: String,
    default: 'map'
  },
  serverUrl: {
    type: String,
    default: 'https://www.supermapol.com'
  },
  accessToken: {
    type: String,
    default: undefined
  },
  accessKey: {
    type: String,
    default: undefined
  },
  tiandituKey: {
    type: String,
    default: undefined
  },
  bingMapsKey: {
    type: String,
    default: undefined
  },
  googleMapsAPIKey: {
    type: String,
    default: undefined
  },
  googleMapsLanguage: {
    type: String,
    default: 'zh-CN'
  },
  withCredentials: {
    type: Boolean,
    default: false
  },
  excludePortalProxyUrl: {
    type: Boolean,
    default: undefined
  },
  isSuperMapOnline: {
    type: Boolean,
    default: undefined
  },
  proxy: {
    type: [String, Boolean],
    default: undefined
  },
  defaultLoading: {
    type: Boolean,
    default: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  background: {
    type: String,
    default: undefined
  },
  iportalServiceProxyUrlPrefix: {
    type: String,
    default: undefined
  },
  mapOptions: {
    type: Object,
    default: undefined
  },
  autoresize: {
    type: Boolean,
    default: true
  },
  keepBounds: {
    type: Boolean,
    default: false
  },
  panControl: {
    type: Object,
    default: (): CommonControlParam => {
      return { show: false, position: 'top-left' }
    }
  },
  scaleControl: {
    type: Object,
    default: (): CommonControlParam => {
      return { show: false, position: 'bottom-left' }
    }
  },
  zoomControl: {
    type: Object,
    default: (): ZoomParam => {
      return { show: false, position: 'top-left' }
    }
  },
  miniMapControl: {
    type: Object,
    default: (): CardCommonParam => {
      return { show: false, position: 'bottom-right' }
    }
  },
  layerListControl: {
    type: Object,
    default: (): CardCommonParam => {
      return { show: false, position: 'top-right' }
    }
  },
  measureControl: {
    type: Object,
    default: (): MeasureParam => {
      return {
        show: false,
        position: 'top-right',
        showUnitSelect: true,
        distanceDefaultUnit: 'kilometers',
        areaDefaultUnit: 'kilometers'
      }
    }
  },
  legendControl: {
    type: Object,
    default: (): LegendParam => {
      return {
        show: false,
        position: 'bottom-left',
        layerNames: [],
        isShowTitle: false,
        isShowField: false,
        mode: 'simple'
      }
    }
  },
  queryControl: {
    type: Object,
    default: (): QueryParam => {
      return {
        show: false,
        position: 'top-right'
      }
    }
  },
  searchControl: {
    type: Object,
    default: (): SearchParam => {
      return {
        show: false,
        position: 'top-right'
      }
    }
  },
  identifyControl: {
    type: Object,
    default: (): IdentifyParam => {
      return {
        show: false,
        layers: [],
        fields: [],
        layerStyle: {},
        clickAreaAround: 5
      }
    }
  },
  layerManagerControl: {
    type: Object,
    default: (): LayerManageParam => {
      return {
        show: false,
        layers: []
      }
    }
  },
  tileTransformRequest: {
    type: Function as PropType<(url: string, request: any) => string>,
    default: undefined
  }
})

// export type WebMapProps = Partial<ExtractPropTypes<ReturnType<typeof webMapProps>>>
export type WebMapProps = {
  mapId?: string | number | Record<string, any>
  target?: string
  serverUrl?: string
  accessToken?: string
  accessKey?: string
  tiandituKey?: string
  bingMapsKey?: string
  googleMapsAPIKey?: string
  googleMapsLanguage?: string
  withCredentials?: boolean
  excludePortalProxyUrl?: boolean
  isSuperMapOnline?: boolean
  proxy?: boolean | string
  defaultLoading?: boolean
  loading?: boolean
  background?: string
  iportalServiceProxyUrlPrefix?: string
  mapOptions?: MapOptions
  autoresize?: boolean
  keepBounds?: boolean
  panControl?: CommonControlParam
  scaleControl?: CommonControlParam
  zoomControl?: ZoomParam
  miniMapControl?: CardCommonParam
  layerListControl?: CardCommonParam
  measureControl?: MeasureParam
  legendControl?: LegendParam
  queryControl?: QueryParam
  searchControl?: SearchParam
  identifyControl?: IdentifyParam
  layerManagerControl?: LayerManageParam
  tileTransformRequest?: (url: string) => Object
}

export const webMapPropsDefault = getPropsDefaults<WebMapProps>(webMapProps())

export type LoadEvent = {
  map: mapboxgl.Map
}

export type GetMapFailedEvent = {
  error: any
}

export type GetLayerDatasourceFailedEvent = {
  error: any
  layer: any
  map: any
}

export type MapEventHandler = {
  map: Map
  component: DefineComponent<{}, {}, any>
  mapboxEvent: { type: string; [key: string]: any }
  [key: string]: any
}

export type MapEventHandlers = {
  [K in MapEventName]: [MapEventHandler]
}

export interface WebMapEmitsMap extends MapEventHandlers {
  load: [LoadEvent]
  getMapFailed: [GetMapFailedEvent]
  getLayerDatasourceFailed: [GetLayerDatasourceFailedEvent]
}

export type WebMapEmits = ShortEmits<WebMapEmitsMap>

export default webMapProps
