import type { PropType } from 'vue'
import type {
  MapGetterProps,
  MapGetterEvents,
  ShortEmits,
  ThemeProps
} from '@supermapgis/common/utils/index.common'
import type { CardProps, ControlProps } from '@supermapgis/mapboxgl/utils'
import { getPropsDefaults, mapGetterProps, themeProps } from '@supermapgis/common/utils/index.common'
import { cardProps, controlProps } from '@supermapgis/mapboxgl/utils'

export interface BaseLayerItem {
  id: string
  title: string
  layers: Array<{ id: string; type: string; [key: string]: unknown }>
  sources: Record<string, Record<string, unknown>>
  thumbnail?: string
  [key: string]: unknown
}

export interface BaseLayerInfo {
  show: boolean
  title: string
  thumbnail: string
}

export interface BaseLayerSwitcherProps extends CardProps, ControlProps, ThemeProps, MapGetterProps {
  layers?: BaseLayerItem[]
  baseLayerInfo?: BaseLayerInfo
  defaultLayer?: string
}

export const baseLayerSwitcherProps = () => ({
  iconClass: {
    type: String,
    default: 'sm-components-icon-dituqiehuan'
  },
  layers: {
    type: Array as PropType<BaseLayerItem[]>,
    default: () => []
  },
  baseLayerInfo: {
    type: Object as PropType<BaseLayerInfo>,
    default: () => ({
      show: true,
      title: '',
      thumbnail: ''
    })
  },
  defaultLayer: String
})

export const baseLayerSwitcherPropsDefault = getPropsDefaults<BaseLayerSwitcherProps>(
  Object.assign(cardProps(), controlProps(), themeProps(), mapGetterProps(), baseLayerSwitcherProps())
)

export type BaseLayerSwitcherEvents = MapGetterEvents
export type BaseLayerSwitcherEmits = ShortEmits<BaseLayerSwitcherEvents>

export default baseLayerSwitcherProps
