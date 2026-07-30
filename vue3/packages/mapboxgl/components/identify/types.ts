import type { PropType } from 'vue'
import type { MapGetterProps, MapGetterEvents, ShortEmits, ThemeProps } from '@supermapgis/common/utils/index.common'
import type {
  HighlightStyle,
  MapSelectionChangedEmit
} from 'vue-iclient-controllers-mapboxgl/src/LayerHighlightViewModel'
import { getPropsDefaults, mapGetterProps, themeProps } from '@supermapgis/common/utils/index.common'
import { getDefaultLayerStyle } from 'vue-iclient-controllers-mapboxgl/src/types'

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
    default: () => getDefaultLayerStyle()
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

interface DataChangeEvent extends MapSelectionChangedEmit {
  fields: FieldInfo[]
}

export type IdentifyEvents = {
  datachange: [DataChangeEvent]
} & MapGetterEvents

export type IdentifyEmits = ShortEmits<IdentifyEvents>

export default identifyProps
