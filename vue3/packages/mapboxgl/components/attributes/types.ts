import type { PropType } from 'vue'
import type { TableProps } from 'ant-design-vue'
import type { MapGetterProps, MapGetterEvents, ShortEmits, ThemeProps } from '@supermapgis/common/utils/index.common'
import { getPropsDefaults, mapGetterProps, themeProps } from '@supermapgis/common/utils/index.common'
import CircleStyle from 'vue-iclient-core/controllers/mapboxgl/types/CircleStyle'
import FillStyle from 'vue-iclient-core/controllers/mapboxgl/types/FillStyle'
import LineStyle from 'vue-iclient-core/controllers/mapboxgl/types/LineStyle'

export interface PaginationParams {
  defaultCurrent?: number
  current?: number
  pageSize?: number
  total?: number
}

export interface FieldConfigParams {
  title?: string
  value: string
  visible?: boolean
  align?: string
  filterMultiple?: boolean
  onFilter?: Function
  onFilterDropdownVisibleChange?: Function
  sorter?: Function | boolean
  defaultSortOrder?: string
  width?: string | number
  search?: boolean
  customCell?: Function
  customHeaderCell?: Function
}

export interface AssociateWithMapParams {
  enabled?: boolean
  zoomToFeature?: boolean
  centerToFeature?: boolean
}

export interface StatisticsParams {
  showTotal?: boolean
  showSelect?: boolean
}

export interface TableParams {
  showBorder?: boolean
  showHeader?: boolean
  showRowSelection?: boolean
  pagination?: PaginationParams
}

export interface ToolbarParams {
  enabled?: boolean
  showZoomToFeature?: boolean
  showClearSelected?: boolean
  showColumnsControl?: boolean
  showRefresh?: boolean
}

export interface ColoumParams {
  value?: string
  title?: string
  visible?: boolean
  dataIndex?: string
}

export const attributesProps = () => ({
  layerName: {
    type: String,
    default: ''
  },
  customRow: {
    type: Function as PropType<TableProps['customRow']>,
    default: () => () => {}
  },
  customHeaderRow: {
    type: Function as PropType<TableProps['customHeaderRow']>,
    default: () => () => {}
  },
  title: {
    type: String,
    default: ''
  },
  dataset: {
    type: Object,
    default: null
  },
  lazy: {
    type: Boolean,
    default: true
  },
  associateWithMap: {
    type: Object as () => AssociateWithMapParams,
    default: () => ({
      enabled: true,
      zoomToFeature: false,
      centerToFeature: false
    })
  },
  fieldConfigs: {
    type: Array as () => FieldConfigParams[],
    default: () => []
  },
  table: {
    type: Object as () => TableParams,
    default: () => ({
      showHeader: true,
      showBorder: true,
      showRowSelection: true,
      pagination: {}
    })
  },
  toolbar: {
    type: Object as () => ToolbarParams,
    default: () => ({
      enabled: true,
      showZoomToFeature: true,
      showClearSelected: true,
      showColumnsControl: true,
      showRefresh: true
    })
  },
  layerStyle: {
    type: Object,
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
  statistics: {
    type: Object as () => StatisticsParams,
    default: () => ({ showTotal: true, showSelect: true })
  }
})


// export type AttributesProps = Partial<ExtractPropTypes<ReturnType<typeof attributesProps>>>
export interface AttributesProps extends ThemeProps, MapGetterProps {
  layerName?: string
  customRow?: TableProps['customRow']
  customHeaderRow?: TableProps['customHeaderRow']
  title?: string
  dataset?: Record<string, any>
  lazy?: boolean
  associateWithMap?: AssociateWithMapParams
  fieldConfigs?: FieldConfigParams[]
  table?: TableParams
  toolbar?: ToolbarParams
  layerStyle?: {
    line: LineStyle
    circle: CircleStyle
    fill: FillStyle
    stokeLine: LineStyle
  }
  statistics?: StatisticsParams
  mapTarget?: string
}

export const attributesPropsDefault = getPropsDefaults<AttributesProps>(
  Object.assign(themeProps(), mapGetterProps(), attributesProps())
)

export type ChangeEvent = {
  pagination: any
}

type RowSelectParams = [newSelectedRowKeys: number[]]
type ChangeParams = [
  pagination: { current: number },
  filters: any,
  newSorter: any,
  currentDataSource: { currentDataSource: any }
]

export type AttributesEvents = {
  rowSelect: RowSelectParams
  change: ChangeParams
} & MapGetterEvents

export type AttributesEmits = ShortEmits<AttributesEvents>
