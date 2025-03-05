import type { PropType } from 'vue'
import type { MapGetterProps, MapGetterEvents, ShortEmits } from '@supermapgis/common/utils/index.common'
import type { ThemeProps } from '@supermapgis/common/components/theme/theme'
import type {
  HighlightStyle,
  MapSelectionChangedEmit
} from 'vue-iclient-core/controllers/mapboxgl/LayerHighlightViewModel'
import { getPropsDefaults, mapGetterProps } from '@supermapgis/common/utils/index.common'
import { themeProps } from '@supermapgis/common/components/theme/theme'
import LineStyle from 'vue-iclient-core/controllers/mapboxgl/types/LineStyle'
import FillStyle from 'vue-iclient-core/controllers/mapboxgl/types/FillStyle'
import CircleStyle from 'vue-iclient-core/controllers/mapboxgl/types/CircleStyle'

export type { MapSelectionChangedEmit }

export interface FieldInfo {
  field: string
  title: string
}

export type Fields = FieldInfo | string[] | FieldInfo[]

export const identifyProps = () => ({
  title: {
    type: String
  },
  showPopup: {
    type: Boolean,
    default: true
  },
  multiSelect: {
    type: Boolean,
    default: false
  },
  layers: {
    type: Array as PropType<Fields>,
    default() {
      return []
    }
  },
  fields: {
    type: Array,
    default() {
      return []
    }
  },
  clickTolerance: {
    type: Number,
    default: 5
  },
  layerStyle: {
    type: Object as PropType<HighlightStyle>,
    default() {
      return {
        line: new LineStyle({
          'line-width': 3,
          'line-color': '#409eff',
          'line-opacity': 1
        }),
        circle: new CircleStyle({
          'circle-color': '#409eff',
          'circle-opacity': 0.6,
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#409eff',
          'circle-stroke-opacity': 1
        }),
        fill: new FillStyle({
          'fill-color': '#409eff',
          'fill-opacity': 0.6,
          'fill-outline-color': '#409eff'
        }),
        strokeLine: new LineStyle({
          'line-width': 3,
          'line-color': '#409eff',
          'line-opacity': 1
        })
      }
    }
  },
  autoResize: {
    type: Boolean,
    default: true
  },
  keyMaxWidth: {
    type: [Number, String],
    default: 100
  },
  valueMaxWidth: {
    type: [Number, String],
    default: 160
  },
  keyWidth: {
    type: [Number, String],
    default: 100
  },
  valueWidth: {
    type: [Number, String],
    default: 160
  },
  keyWordStyle: {
    type: String,
    default: 'ellipsis'
  },
  valueWordStyle: {
    type: String,
    default: 'ellipsis'
  }
})

// export type IdentifyProps = Partial<ExtractPropTypes<ReturnType<typeof identifyProps>>>
export interface IdentifyProps extends ThemeProps, MapGetterProps {
  title?: string
  showPopup?: boolean
  multiSelect?: boolean
  layers?: string[]
  fields?: Fields
  clickTolerance?: number
  layerStyle?: HighlightStyle
  autoResize?: boolean
  keyMaxWidth?: string | number
  valueMaxWidth?: string | number
  keyWidth?: string | number
  valueWidth?: string | number
  keyWordStyle?: string
  valueWordStyle?: string
}

export const identifyPropsDefault = getPropsDefaults<IdentifyProps>(
  Object.assign(themeProps(), mapGetterProps(), identifyProps())
)

export interface DataChangeEvent extends MapSelectionChangedEmit {
  fields: FieldInfo[]
}

export type IdentifyEvents = {
  datachange: [DataChangeEvent]
} & MapGetterEvents

export type IdentifyEmits = ShortEmits<IdentifyEvents>

export default identifyProps
