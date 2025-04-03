import type {
  MapGetterProps,
  ThemeProps,
  MapGetterEvents,
  ShortEmits
} from '@supermapgis/common/utils/index.common'
import type { CardProps, ControlProps } from '@supermapgis/mapboxgl/utils'
import { getPropsDefaults, mapGetterProps, themeProps } from '@supermapgis/common/utils/index.common'
import { cardProps, controlProps } from '@supermapgis/mapboxgl/utils'

export const drawProps = () => ({
  iconClass: {
    type: String,
    default: 'sm-components-icon-edit'
  },
  headerName: {
    type: String
  },
  defaultLayerStyle: Object
})

// export type DrawProps = Partial<ExtractPropTypes<ReturnType<typeof drawProps>>>
export interface DrawProps extends CardProps, ControlProps, ThemeProps, MapGetterProps {
  defaultLayerStyle?: Record<string, Record<string, any>>
}

export const drawPropsDefault = getPropsDefaults<DrawProps>(
  Object.assign(cardProps(), controlProps(), themeProps(), mapGetterProps(), drawProps())
)

export type DrawEvents = {
  'draw-created': [any],
  'draw-removed': [any]
} & MapGetterEvents

export type DrawEmits = ShortEmits<DrawEvents>

export default drawProps
