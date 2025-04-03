import type {
  MapGetterProps,
  ThemeProps,
  MapGetterEvents,
  ShortEmits
} from '@supermapgis/common/utils/index.common'
import type { ControlProps } from '@supermapgis/mapboxgl/utils'
import { getPropsDefaults, mapGetterProps, themeProps } from '@supermapgis/common/utils/index.common'
import { controlProps } from '@supermapgis/mapboxgl/utils'

export const zoomProps = () => ({
  showZoom: {
    type: Boolean,
    default: false
  },
  showZoomSlider: {
    type: Boolean,
    default: false
  }
})

// export type ZoomProps = Partial<ExtractPropTypes<ReturnType<typeof zoomProps>>>
export interface ZoomProps extends ControlProps, ThemeProps, MapGetterProps {
  showZoom?: boolean,
  showZoomSlider?: boolean
}

export const zoomPropsDefault = getPropsDefaults<ZoomProps>(
  Object.assign(controlProps(), themeProps(), mapGetterProps(), zoomProps())
)

export type ZoomEvents = MapGetterEvents

export type ZoomEmits = ShortEmits<ZoomEvents>

export default zoomProps
