import type {
  MapGetterProps,
  ThemeProps,
  MapGetterEvents,
  ShortEmits
} from '@supermapgis/common/utils/index.common'
import type { ControlProps } from '@supermapgis/mapboxgl/utils'
import { getPropsDefaults, mapGetterProps, themeProps } from '@supermapgis/common/utils/index.common'
import { controlProps } from '@supermapgis/mapboxgl/utils'

export const scaleProps = () => ({
  unit: {
    type: String,
    default: 'metric',
    validator(value) {
      return ['imperial', 'metric', 'nautical'].includes(value);
    }
  },
  maxWidth: {
    type: Number,
    default: 100
  }
})

// export type ScaleProps = Partial<ExtractPropTypes<ReturnType<typeof scaleProps>>>
export interface ScaleProps extends ControlProps, ThemeProps, MapGetterProps {
  unit?: string,
  maxWidth?: number
}

export const scalePropsDefault = getPropsDefaults<ScaleProps>(
  Object.assign(controlProps(), themeProps(), mapGetterProps(), scaleProps())
)

export type ScaleEvents = MapGetterEvents

export type ScaleEmits = ShortEmits<ScaleEvents>

export default scaleProps
