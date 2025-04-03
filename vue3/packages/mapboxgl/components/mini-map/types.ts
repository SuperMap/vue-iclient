import type {
  MapGetterProps,
  ThemeProps,
  MapGetterEvents,
  ShortEmits
} from '@supermapgis/common/utils/index.common'
import type { CardProps, ControlProps } from '@supermapgis/mapboxgl/utils'
import { getPropsDefaults, mapGetterProps, themeProps } from '@supermapgis/common/utils/index.common'
import { cardProps, controlProps } from '@supermapgis/mapboxgl/utils'

export const miniMapProps = () => ({
  iconClass: {
    type: String,
    default: 'sm-components-icon-arrow-left'
  },
  autoRotate: {
    type: Boolean,
    default: true
  }
})

// export type MiniMapProps = Partial<ExtractPropTypes<ReturnType<typeof miniMapProps>>>
export interface MiniMapProps extends CardProps, ControlProps, ThemeProps, MapGetterProps {
  iconClass?: string,
  autoRotate?: boolean
}

export const miniMapPropsDefault = getPropsDefaults<MiniMapProps>(
  Object.assign(cardProps(), controlProps(), themeProps(), mapGetterProps(), miniMapProps())
)

export type MiniMapEvents = MapGetterEvents

export type MiniMapEmits = ShortEmits<MiniMapEvents>

export default miniMapProps
