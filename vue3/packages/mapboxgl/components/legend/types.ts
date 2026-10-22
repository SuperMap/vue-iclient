import type { PropType } from 'vue'
import type {
  MapGetterProps,
  MapGetterEvents,
  ShortEmits,
  ThemeProps
} from '@supermapgis/common/utils/index.common'
import type { ControlPosition } from 'vue-iclient-controllers-mapboxgl/src/utils/MapControl'
import type { CardProps, ControlProps } from '@supermapgis/mapboxgl/utils'
import { getPropsDefaults, mapGetterProps, themeProps } from '@supermapgis/common/utils/index.common'
import { cardProps, controlProps } from '@supermapgis/mapboxgl/utils'

export type LegendMode = 'simple' | 'panel'

export interface LegendStyleGroupItem {
  /** 样式对象，图例项的默认值为空对象，渲染前由图层样式补齐 */
  style?: Record<string, any>
  fieldValue?: string
  start?: number
  end?: number
  integerType?: boolean
  [prop: string]: any
}

export interface LegendLayerStyle {
  layerId: string
  layerTitle: string
  themeField?: string
  styleField?: string
  styleGroup: LegendStyleGroupItem[]
  [prop: string]: any
}

export const legendProps = () => ({
  headerName: {
    type: String
  },
  iconClass: {
    type: String,
    default: 'sm-components-icon-list'
  },
  layerNames: {
    type: Array as PropType<string[]>,
    required: false
  },
  useMapLegend: {
    type: Boolean,
    default: false
  },
  isShowTitle: {
    type: Boolean,
    default: false
  },
  isShowField: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String as PropType<LegendMode>,
    default: 'simple',
    validator(mode: LegendMode) {
      return ['simple', 'panel'].includes(mode)
    }
  },
  position: {
    type: String as PropType<ControlPosition>,
    default: 'bottom-left'
  }
})

// export type LegendProps = Partial<ExtractPropTypes<ReturnType<typeof legendProps>>>
export interface LegendProps extends CardProps, ControlProps, ThemeProps, MapGetterProps {
  headerName?: string
  iconClass?: string
  layerNames?: string[]
  useMapLegend?: boolean
  isShowTitle?: boolean
  isShowField?: boolean
  mode?: LegendMode
  position?: ControlPosition
}

export const legendPropsDefault = getPropsDefaults<LegendProps>(
  Object.assign(cardProps(), controlProps(), themeProps(), mapGetterProps(), legendProps())
)

export type LegendEvents = MapGetterEvents

export type LegendEmits = ShortEmits<LegendEvents>

export default legendProps
