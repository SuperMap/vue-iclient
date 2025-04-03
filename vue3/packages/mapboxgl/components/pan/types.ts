import type {
  MapGetterProps,
  MapGetterEvents,
  ThemeProps,
  ShortEmits
} from '@supermapgis/common/utils/index.common'
import type { ControlProps } from '@supermapgis/mapboxgl/utils'
import { getPropsDefaults, mapGetterProps, themeProps } from '@supermapgis/common/utils/index.common'
import { controlProps } from '@supermapgis/mapboxgl/utils'

export const panProps = () => ({
  panLength: {
    type: Number,
    default: 200
  }
})

// export type PanProps = Partial<ExtractPropTypes<ReturnType<typeof panProps>>>
export interface PanProps extends ControlProps, ThemeProps, MapGetterProps {
  panLength?: number
}

export const panPropsDefault = getPropsDefaults<PanProps>(
  Object.assign(controlProps(), themeProps(), mapGetterProps(), panProps())
)

export type PanEvents = MapGetterEvents

export type PanEmits = ShortEmits<PanEvents>

export default panProps
