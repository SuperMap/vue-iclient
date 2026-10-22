import type {
  MapGetterProps,
  ThemeProps,
  MapGetterEvents,
  ShortEmits
} from '@supermapgis/common/utils/index.common'
import type { ControlProps } from '@supermapgis/mapboxgl/utils'
import { getPropsDefaults, mapGetterProps, themeProps } from '@supermapgis/common/utils/index.common'
import { controlProps } from '@supermapgis/mapboxgl/utils'

export const resetViewProps = () => ({
  duration: {
    type: Number,
    default: 1000
  }
})

export interface ResetViewProps extends ControlProps, ThemeProps, MapGetterProps {
  duration?: number
}

export const resetViewPropsDefault = getPropsDefaults<ResetViewProps>(
  Object.assign(controlProps(), themeProps(), mapGetterProps(), resetViewProps())
)

export type ResetViewEvents = MapGetterEvents
export type ResetViewEmits = ShortEmits<ResetViewEvents>

export default resetViewProps
