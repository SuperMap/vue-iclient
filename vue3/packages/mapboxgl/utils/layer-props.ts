import type { PropType } from 'vue'
import type mapboxglTypes from 'mapbox-gl'
import type { ShortEmits }  from '@supermapgis/common/utils/index.common'
import type { LayerEventName, MapEventHandler } from 'vue-iclient-core/controllers/mapboxgl/utils/MapEvents'
import { getPropsDefaults } from '@supermapgis/common/utils/index.common'

export type LayerLayout =
  | mapboxglTypes.BackgroundLayout
  | mapboxglTypes.FillLayout
  | mapboxglTypes.FillExtrusionLayout
  | mapboxglTypes.LineLayout
  | mapboxglTypes.SymbolLayout
  | mapboxglTypes.RasterLayout
  | mapboxglTypes.CircleLayout
  | mapboxglTypes.HeatmapLayout
  | mapboxglTypes.HillshadeLayout

  export type LayerPaint =
  | mapboxglTypes.BackgroundPaint
  | mapboxglTypes.FillPaint
  | mapboxglTypes.FillExtrusionPaint
  | mapboxglTypes.LinePaint
  | mapboxglTypes.SymbolPaint
  | mapboxglTypes.RasterPaint
  | mapboxglTypes.CirclePaint
  | mapboxglTypes.HeatmapPaint
  | mapboxglTypes.HillshadePaint

export const layerProps = () => ({
  layerId: {
    type: String
  },
  sourceId: {
    type: String
  },
  sourceLayer: {
    type: String
  },
  minzoom: {
    type: Number,
    default: 0
  },
  maxzoom: {
    type: Number,
    default: 22
  },
  filter: {
    type: Array as PropType<any[]>
  },
  layout: {
    type: Object as PropType<LayerLayout>
  },
  paint: {
    type: Object as PropType<LayerPaint>
  },
  before: {
    type: String
  }
})

// export type LayerProps = Partial<ExtractPropTypes<ReturnType<typeof layerProps>>>
export interface LayerProps {
  minzoom?: number
  maxzoom?: number
  layerId?: string
  sourceId?: string
  sourceLayer?: string
  filter?: any[]
  layout?: LayerLayout
  paint?: LayerPaint
  before?: string
}

export const layerPropsDefault = getPropsDefaults<LayerProps>(layerProps())

export type LayerEventHandlers = {
  [K in LayerEventName]: [MapEventHandler]
}

export interface LayerEventParams {
  map: mapboxglTypes.Map
  layerId: string
  beforeId?: string
  [k: string]: any
}

export type LayerEvents = {
  'layer-moved': [LayerEventParams]
  'layer-removed': [LayerEventParams]
} & LayerEventHandlers

export type LayerEmits = ShortEmits<LayerEvents>

export default layerProps
