import type { PropType } from 'vue'
import type { MapGetterProps, MapGetterEvents, ShortEmits, ThemeProps } from '@supermapgis/common/utils/index.common'
import type { ControlProps } from '@supermapgis/mapboxgl/utils'
import type { RestMapInfo, RestDataInfo, FetchDataBase, OnlineLocalSearch } from 'vue-iclient-core/controllers/mapboxgl/SearchViewModel'
import { getPropsDefaults, mapGetterProps, themeProps } from '@supermapgis/common/utils/index.common'
import { controlProps } from '@supermapgis/mapboxgl/utils'



export interface PointInfo {
  useDefaultAttribute?: boolean
  attribute?: string
  attributeValue: any
}

export interface PointData {
  coordinates: GeoJSON.Position
  info: PointInfo[]
}

export const searchProps = () => ({
  maxFeatures: {
    type: [Number, String],
    default: 8
  },
  layerNames: {
    type: Array
  },
  onlineLocalSearch: {
    type: Object as PropType<OnlineLocalSearch>,
    default() {
      return {
        enable: true,
        city: '北京市'
      }
    }
  },
  restMap: {
    type: Array as PropType<RestMapInfo[]>,
    default: () => []
  },
  restData: {
    type: Array as PropType<RestDataInfo[]>,
    default: () => []
  },
  iportalData: {
    type: Array as PropType<FetchDataBase[]>,
    default: () => []
  },
  addressMatch: {
    type: Array as PropType<FetchDataBase[]>,
    default: () => []
  },
  mode: {
    type: String,
    default: 'control',
    validator(mode) {
      return ['control', 'toolBar'].includes(mode)
    }
  },
  openSearchSuggestion: {
    type: Boolean,
    default: false
  },
  alwaysCenter: {
    type: Boolean,
    default: true
  },
  showTitle: {
    type: Boolean,
    default: true
  },
  showResult: {
    type: Boolean,
    default: true
  },
  resultRender: {
    type: Function
  },
  collapsed: {
    // 是否折叠组件
    type: Boolean,
    default: false
  },
  splitLine: {
    type: Boolean,
    default: true
  }
})

// export type SearchProps = Partial<ExtractPropTypes<ReturnType<typeof searchProps>>>
export interface SearchProps extends ControlProps, ThemeProps, MapGetterProps {
  maxFeatures?: number | string
  layerNames?: string[]
  onlineLocalSearch?: OnlineLocalSearch
  restMap?: RestMapInfo[]
  restData?: RestDataInfo[]
  iportalData?: FetchDataBase[]
  addressMatch?: FetchDataBase[]
  mode?: 'control' | 'toolBar'
  openSearchSuggestion?: boolean
  alwaysCenter?: boolean
  showTitle?: boolean
  showResult?: boolean
  resultRender?: ((data: any) => void) | undefined
  collapsed?: boolean
  splitLine?: boolean
}

export const searchPropsDefault = getPropsDefaults<SearchProps>(
  Object.assign(themeProps(), controlProps(), mapGetterProps(), searchProps())
)

export interface SearchResult {
  source: string
  result: (GeoJSON.Feature & { filterVal?: string; name?: string; address?: string })[]
}

export type SearchSucceededEvent = {
  searchResult: SearchResult[]
}

export type SearchFailedEvent = {
  sourceName: string
  error: string
}

export type SearchEvents = {
  'search-succeeded': [SearchSucceededEvent]
  'search-failed': [SearchFailedEvent]
  'search-selected-info': [Record<string, any>]
  'clear-search-result': []
} & MapGetterEvents

export type SearchEmits = ShortEmits<SearchEvents>

export default searchProps
