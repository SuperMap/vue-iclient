import type { PropType } from 'vue'
import type { ShortEmits, MapGetterProps, MapGetterEvents } from '@supermapgis/common/utils/index.common'
import type { ThemeProps } from '@supermapgis/common/components/theme/theme'
import type { CardProps, ControlProps } from '@supermapgis/mapboxgl/utils'
import type {
  HighlightStyle,
  MapSelectionChangedEmit,
  PopupFieldsInfo
} from 'vue-iclient-core/controllers/mapboxgl/LayerHighlightViewModel'
import type { PopupStyle } from '@supermapgis/mapboxgl/components/layer-highlight/types'
import { getPropsDefaults, mapGetterProps } from '@supermapgis/common/utils/index.common'
import { themeProps } from '@supermapgis/common/components/theme/theme'
import LineStyle from 'vue-iclient-core/controllers/mapboxgl/types/LineStyle'
import FillStyle from 'vue-iclient-core/controllers/mapboxgl/types/FillStyle'
import CircleStyle from 'vue-iclient-core/controllers/mapboxgl/types/CircleStyle'
import { cardProps, controlProps } from '@supermapgis/mapboxgl/utils'

export { PopupStyle, PopupFieldsInfo, MapSelectionChangedEmit }

export interface QueryResultParams {
  name: string
  result: GeoJSON.Feature[]
  fields: string[]
}

export interface QueryResultEvent {
  result: QueryResultParams
  layers: string[]
}

export interface QueryResult extends Omit<QueryResultParams, 'result'>{
  result: GeoJSON.Feature['properties'][]
}

export interface QueryJobItem {
  spaceFilter: 'currentMapBounds' | 'mapBounds'
  queryParameter: {
    queryMode: 'SQL' | 'KEYWORD'
    fields?: PopupFieldsInfo[]
    [K: string]: any
  }
}

export const queryProps = () => ({
  iconClass: {
    type: String,
    default: 'sm-components-icon-search-list'
  },
  maxFeatures: {
    type: Number,
    default: 200
  },
  layerStyle: {
    type: Object as PropType<HighlightStyle>,
    default: () => ({
      line: new LineStyle({
        'line-width': 3,
        'line-color': '#409eff',
        'line-opacity': 1
      }),
      circle: new CircleStyle({
        'circle-color': '#409eff',
        'circle-opacity': 0.6,
        'circle-radius': 8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#409eff',
        'circle-stroke-opacity': 1
      }),
      fill: new FillStyle({
        'fill-color': '#409eff',
        'fill-opacity': 0.6,
        'fill-outline-color': '#409eff'
      }),
      stokeLine: new LineStyle({
        'line-width': 3,
        'line-color': '#409eff',
        'line-opacity': 1
      })
    })
  },
  highlightStyle: {
    type: Object as PropType<HighlightStyle>,
    default: () => ({
      line: new LineStyle({
        'line-width': 3,
        'line-color': '#01ffff',
        'line-opacity': 1
      }),
      circle: new CircleStyle({
        'circle-color': '#01ffff',
        'circle-opacity': 0.6,
        'circle-radius': 8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#01ffff',
        'circle-stroke-opacity': 1
      }),
      fill: new FillStyle({
        'fill-color': '#01ffff',
        'fill-opacity': 0.6,
        'fill-outline-color': '#01ffff'
      }),
      strokeLine: new LineStyle({
        'line-width': 3,
        'line-color': '#01ffff',
        'line-opacity': 1
      })
    })
  },
  iportalData: {
    type: Array as PropType<Record<string, any>[]>,
    default: () => []
  },
  restData: {
    type: Array as PropType<Record<string, any>[]>,
    default: () => []
  },
  restMap: {
    type: Array as PropType<Record<string, any>[]>,
    default: () => []
  },
  showPopup: {
    type: Boolean,
    default: true
  },
  popupStyle: {
    type: Object as PropType<PopupStyle>,
    default: () => ({
      keyWidth: 80,
      valueWidth: 150,
      keyMaxWidth: 160,
      valueMaxWidth: 300
    })
  },
  multiSelect: {
    type: Boolean,
    default: false
  },
  clickTolerance: {
    type: Number,
    default: 5
  }
})

// export type QueryProps = Partial<ExtractPropTypes<ReturnType<typeof queryProps>>>
export interface QueryProps extends CardProps, ControlProps, ThemeProps, MapGetterProps {
  maxFeatures?: number
  layerStyle?: HighlightStyle
  highlightStyle?: HighlightStyle
  iportalData?: Record<string, any>[]
  restData?: Record<string, any>[]
  restMap?: Record<string, any>[]
  showPopup?: boolean
  popupStyle?: PopupStyle
  multiSelect?: boolean
  clickTolerance?: number
}

export const queryPropsDefault = getPropsDefaults<QueryProps>(
  Object.assign(cardProps(), controlProps(), themeProps(), mapGetterProps(), queryProps())
)

export type QuerySucceededEvent = {
  result: QueryResultEvent
  layers: string[]
}

export type QueryFailedEvent = {
  code_name: 'NO_RESULTS' | 'SEVICE_NOT_SUPPORT' | 'QUREY_FAILED'
}

export interface DataChangeEvent extends MapSelectionChangedEmit {
  layerName: string
  fields: PopupFieldsInfo[]
}

export interface QueryEvents extends MapGetterEvents {
  'query-succeeded': [QueryResultEvent]
  'query-failed': [QueryFailedEvent]
  datachange: [DataChangeEvent]
}

export type QueryEmits = ShortEmits<QueryEvents>

export default queryProps
