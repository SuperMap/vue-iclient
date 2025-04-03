import type {
  MapGetterProps,
  ThemeProps,
  MapGetterEvents,
  ShortEmits
} from '@supermapgis/common/utils/index.common'
import type {  ControlProps } from '@supermapgis/mapboxgl/utils'
import { getPropsDefaults, mapGetterProps, themeProps } from '@supermapgis/common/utils/index.common'
import { controlProps } from '@supermapgis/mapboxgl/utils'

export interface needleStyleParams {
  transform?: string;
}

export const compassProps = () => ({
  iconClass: {
    type: String,
    default: 'sm-components-icon-compass'
  },
  visualizePitch: {
    type: Boolean,
    default: false
  }
})

// export type CompassProps = Partial<ExtractPropTypes<ReturnType<typeof compassProps>>>
export interface CompassProps extends ControlProps, ThemeProps, MapGetterProps {
  iconClass?: string;
  visualizePitch?: boolean;
}

export const compassPropsDefault = getPropsDefaults<CompassProps>(
  Object.assign(controlProps(), themeProps(), mapGetterProps(), compassProps())
)

export type CompassEvents = MapGetterEvents

export type CompassEmits = ShortEmits<CompassEvents>

export default compassProps
