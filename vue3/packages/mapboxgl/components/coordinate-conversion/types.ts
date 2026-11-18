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

export interface Coordinate {
  lng: number
  lat: number
}

export interface FormatOption {
  title: string
  i18n?: string
  display?: string
  toWGS84(val: string, format?: string): Coordinate
  fromWGS84(coordinate: Coordinate, format?: string): string
}

export const coordinateConversionProps = () => ({
  iconClass: {
    type: String,
    default: 'sm-components-icon-coordinate-coversion'
  },
  collapsed: {
    type: Boolean,
    default: false
  },
  showLocation: {
    type: Boolean,
    default: true
  },
  formats: {
    type: Array as PropType<Array<string | FormatOption>>,
    default() {
      return ['BASEMAP', 'Mercator', 'XY', 'UTM', 'DD', 'DOM', 'DMS']
    }
  }
})

export interface CoordinateConversionProps
  extends CardProps,
    ControlProps,
    ThemeProps,
    MapGetterProps {
  showLocation?: boolean
  formats?: Array<string | FormatOption>
}

export const coordinateConversionPropsDefault = getPropsDefaults<CoordinateConversionProps>(
  Object.assign(cardProps(), controlProps(), themeProps(), mapGetterProps(), coordinateConversionProps())
)

export type CoordinateConversionEvents = MapGetterEvents

export type CoordinateConversionEmits = ShortEmits<CoordinateConversionEvents>

export default coordinateConversionProps
