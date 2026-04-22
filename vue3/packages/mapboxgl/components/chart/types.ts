import type { PropType } from 'vue'
import type { MapGetterProps, ThemeProps, TimerProps } from '@supermapgis/common/utils/index.common'
import type { CardProps, ControlProps } from '@supermapgis/mapboxgl/utils'
import { getPropsDefaults, mapGetterProps, themeProps } from '@supermapgis/common/utils/index.common'
import { cardProps, controlProps } from '@supermapgis/mapboxgl/utils'

// 图表组件类型定义
export interface ChartProps extends CardProps, ControlProps, ThemeProps, MapGetterProps, TimerProps {
  iconClass?: string
  dataset?: any
  datasetOptions?: any[]
  colorGroup?: any[]
  thresholdConfig?: any[]
  options?: any
  seriesType?: string
  xFieldDecimals?: number
  isGradient?: boolean
  background?: string
  autoresize?: boolean
  theme?: any
  initOptions?: any
  group?: string
  manualUpdate?: boolean
  autoPlay?: boolean
  associatedMap?: boolean
  highlightOptions?: any[]
  highlightColor?: string
  isShow?: boolean
}

export const chartProps = () => ({
  iconClass: {
    type: String as PropType<string>,
    default: 'sm-components-icon-chart'
  },
  dataset: {
    type: Object as PropType<any>,
    default: () => null
  },
  datasetOptions: {
    type: Array as PropType<any[]>,
    default: () => null
  },
  colorGroup: {
    type: Array as PropType<any[]>,
    default: () => []
  },
  thresholdConfig: {
    type: Array as PropType<any[]>,
    default: () => []
  },
  options: {
    type: Object as PropType<any>,
    default: () => ({})
  },
  seriesType: {
    type: String,
    default: ''
  },
  xFieldDecimals: {
    type: Number,
    default: -1
  },
  isGradient: {
    type: Boolean,
    default: false
  },
  background: {
    type: String,
    default: ''
  },
  autoresize: {
    type: Boolean,
    default: true
  },
  theme: {
    type: Object as PropType<any>,
    default: undefined
  },
  initOptions: {
    type: Object as PropType<any>,
    default: undefined
  },
  group: {
    type: String,
    default: ''
  },
  manualUpdate: {
    type: Boolean,
    default: false
  },
  autoPlay: {
    type: Boolean,
    default: false
  },
  associatedMap: {
    type: Boolean,
    default: false
  },
  highlightOptions: {
    type: Array as PropType<any[]>,
    default: () => []
  },
  highlightColor: {
    type: String,
    default: '#01ffff'
  },
  isShow: {
    type: Boolean,
    default: true
  }
})

export const chartPropsDefault = getPropsDefaults<ChartProps>(
  Object.assign(cardProps(), controlProps(), themeProps(), mapGetterProps(), chartProps())
)

export interface ChartEmits {
  (event: 'legendselectchanged', params: any): void
  (event: 'legendselected', params: any): void
  (event: 'legendunselected', params: any): void
  (event: 'legendscroll', params: any): void
  (event: 'datazoom', params: any): void
  (event: 'datarangeselected', params: any): void
  (event: 'timelinechanged', params: any): void
  (event: 'timelineplaychanged', params: any): void
  (event: 'restore', params: any): void
  (event: 'dataviewchanged', params: any): void
  (event: 'magictypechanged', params: any): void
  (event: 'geoselectchanged', params: any): void
  (event: 'geoselected', params: any): void
  (event: 'geounselected', params: any): void
  (event: 'pieselectchanged', params: any): void
  (event: 'pieselected', params: any): void
  (event: 'pieunselected', params: any): void
  (event: 'mapselectchanged', params: any): void
  (event: 'mapselected', params: any): void
  (event: 'mapunselected', params: any): void
  (event: 'axisareaselected', params: any): void
  (event: 'focusnodeadjacency', params: any): void
  (event: 'unfocusnodeadjacency', params: any): void
  (event: 'brush', params: any): void
  (event: 'brushselected', params: any): void
  (event: 'rendered', params: any): void
  (event: 'finished', params: any): void
  (event: 'click', params: any): void
  (event: 'dblclick', params: any): void
  (event: 'mouseover', params: any): void
  (event: 'mouseout', params: any): void
  (event: 'mousemove', params: any): void
  (event: 'mousedown', params: any): void
  (event: 'mouseup', params: any): void
  (event: 'globalout', params: any): void
  (event: 'contextmenu', params: any): void
  (event: 'load', params: any): void
}

export const chartEmits = [
  'legendselectchanged',
  'legendselected',
  'legendunselected',
  'legendscroll',
  'datazoom',
  'datarangeselected',
  'timelinechanged',
  'timelineplaychanged',
  'restore',
  'dataviewchanged',
  'magictypechanged',
  'geoselectchanged',
  'geoselected',
  'geounselected',
  'pieselectchanged',
  'pieselected',
  'pieunselected',
  'mapselectchanged',
  'mapselected',
  'mapunselected',
  'axisareaselected',
  'focusnodeadjacency',
  'unfocusnodeadjacency',
  'brush',
  'brushselected',
  'rendered',
  'finished',
  'click',
  'dblclick',
  'mouseover',
  'mouseout',
  'mousemove',
  'mousedown',
  'mouseup',
  'globalout',
  'contextmenu'
]

export default chartProps


