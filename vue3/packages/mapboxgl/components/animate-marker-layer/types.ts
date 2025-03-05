import type { PropType } from 'vue'
import type { MapGetterProps, MapGetterEvents, ShortEmits } from '@supermapgis/common/utils/index.common'
import type { LayerProps, LayerEvents } from '@supermapgis/mapboxgl/utils'
import { getPropsDefaults, mapGetterProps } from '@supermapgis/common/utils/index.common'
import { layerProps } from '@supermapgis/mapboxgl/utils'

export const animateMarkerLayerProps = () => ({
  features: {
    type: Object as PropType<GeoJSON.FeatureCollection>
  },
  type: {
    type: String,
    default: 'breathingAperture'
  },
  width: {
    type: Number
  },
  height: {
    type: Number
  },
  colors: {
    type: Array as PropType<string[]>
  },
  textFontSize: {
    type: Number,
    default: 14
  },
  textColor: {
    type: String
  },
  textField: {
    type: String
  },
  fitBounds: {
    type: Boolean
  }
})

// export type AnimateMarkerLayerProps = Partial<ExtractPropTypes<ReturnType<typeof animateMarkerLayerProps>>>
export interface AnimateMarkerLayerProps extends LayerProps, MapGetterProps {
  type?: string
  textFontSize?: number
  fitBounds?: boolean
  features?: GeoJSON.FeatureCollection<
    GeoJSON.Geometry,
    {
      [name: string]: any
    }
  >
  width?: number
  height?: number
  colors?: string[]
  textField?: string
  textColor?: string
}

export const animateMarkerLayerPropsDefault = getPropsDefaults<AnimateMarkerLayerProps>(
  Object.assign(layerProps(), mapGetterProps(), animateMarkerLayerProps())
)

export type AnimateMarkerLayerEvents = LayerEvents & MapGetterEvents

export type AnimateMarkerLayerEmits = ShortEmits<AnimateMarkerLayerEvents>

export default animateMarkerLayerProps
