import type {
  MapGetterProps,
  MapGetterEvents,
  ShortEmits
} from '@supermapgis/common/utils/index.common'
import type { ThemeProps } from '@supermapgis/common/components/theme/theme'
import type { CardProps, ControlProps } from '@supermapgis/mapboxgl/utils'
import { getPropsDefaults, mapGetterProps } from '@supermapgis/common/utils/index.common'
import { themeProps } from '@supermapgis/common/components/theme/theme'
import { cardProps, controlProps } from '@supermapgis/mapboxgl/utils'

export const measureProps = () => ({
  iconClass: {
    type: String,
    default: 'sm-components-icon-measure'
  },
  headerName: {
    type: String
  },
  showUnitSelect: {
    // 配置单位选择框是否显示，若不显示，则显示对应的默认单位
    type: Boolean,
    default: true
  },
  distanceDefaultUnit: {
    // 距离默认单位
    type: String,
    default: 'kilometers'
  },
  areaDefaultUnit: {
    // 面积默认单位
    type: String,
    default: 'kilometers'
  },
  continueDraw: {
    // 是否开启多绘制
    type: Boolean,
    default: true
  }
})

// export type MeasureProps = Partial<ExtractPropTypes<ReturnType<typeof measureProps>>>
export interface MeasureProps extends CardProps, ControlProps, ThemeProps, MapGetterProps {
  showUnitSelect?: boolean
  distanceDefaultUnit?: string
  areaDefaultUnit?: string
  continueDraw?: boolean
}

export const measurePropsDefault = getPropsDefaults<MeasureProps>(
  Object.assign(cardProps(), controlProps(), themeProps(), mapGetterProps(), measureProps())
)

export type MeasureEvents = MapGetterEvents

export type MeasureEmits = ShortEmits<MeasureEvents>

export default measureProps
