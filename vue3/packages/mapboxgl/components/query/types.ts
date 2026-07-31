import type { PropType } from 'vue'
import type { MapGetterProps, MapGetterEvents, ShortEmits, ThemeProps } from '@supermapgis/common/utils/index.common'
import type { CardProps, ControlProps } from '@supermapgis/mapboxgl/utils'
import type { PopupConfig, PopupInfo } from '@supermapgis/mapboxgl/components/popup-content/types'
import type {
  HighlightStyle,
  MapSelectionChangedEmit,
  PopupFieldsInfo
} from 'vue-iclient-controllers-mapboxgl/src/LayerHighlightViewModel'
import type { QueryResultParams, QueryResultEvent, QueryBoundsType, QueryParameter } from 'vue-iclient-controllers-mapboxgl/src/QueryViewModel'
import type { PopupStyle } from '@supermapgis/mapboxgl/components/layer-highlight/types'
import { getPropsDefaults, mapGetterProps, themeProps } from '@supermapgis/common/utils/index.common'
import { getDefaultLayerStyle } from 'vue-iclient-controllers-mapboxgl/src/types'
import { cardProps, controlProps } from '@supermapgis/mapboxgl/utils'

export { PopupStyle, PopupFieldsInfo, MapSelectionChangedEmit, QueryResultParams, QueryResultEvent }


export interface QueryResult extends Omit<QueryResultParams, 'result'> {
  result: GeoJSON.Feature['properties'][]
}

export interface QueryJobItem {
  spaceFilter: QueryBoundsType
  queryParameter: QueryParameter & {
    fields?: PopupFieldsInfo[]
    identifyField?: string
    popupInfo?: PopupInfo
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
    default: () => getDefaultLayerStyle()
  },
  highlightStyle: {
    type: Object as PropType<HighlightStyle>,
    default: () => getDefaultLayerStyle('#01ffff')
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
  popupConfig: {
    type: Object as PropType<PopupConfig>,
    default: () => ({
      maxHeight: '394px',
      maxWidth: '280px',
      autoResize: true,
      valueWordWrap: 'wrap'
    })
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
  popupConfig?: PopupConfig
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

export type QueryEvents = {
  'query-succeeded': [QueryResultEvent]
  'query-failed': [QueryFailedEvent]
  datachange: [DataChangeEvent]
} & MapGetterEvents

export type QueryEmits = ShortEmits<QueryEvents>

export default queryProps
