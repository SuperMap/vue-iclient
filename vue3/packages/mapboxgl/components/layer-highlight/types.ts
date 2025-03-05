import type { PropType, CSSProperties } from 'vue'
import type { MapGetterProps, MapGetterEvents, ShortEmits } from '@supermapgis/common/utils/index.common'
import type { HighlightStyle, LayerEventCursorMap, FieldsDisplayInfo, MapSelectionChangedEmit } from 'vue-iclient-core/controllers/mapboxgl/LayerHighlightViewModel'
import type { ThemeProps } from '@supermapgis/common/components/theme/theme'
import { getPropsDefaults, mapGetterProps } from '@supermapgis/common/utils/index.common'
import { themeProps } from '@supermapgis/common/components/theme/theme'

export interface PopupStyle {
  autoResize: boolean
  keyWidth: number
  valueWidth: number
  keyMaxWidth: number
  valueMaxWidth: number
  keyWordStyle: string
  valueWordStyle: string
  background?: string
  textColor?: string
}

export interface ColumnStyle {
  keyStyle: CSSProperties,
  valueStyle: CSSProperties
}

export type ColumnCustomRender = (params: { value: any; style: CSSProperties }) => any

export type ColumnCustomRenderParams = {
  text: string
  record: {
    title: string
    [K: string]: any
  }
}

export const layerHighlightProps = () => ({
  uniqueName: {
    type: String
  },
  title: {
    type: String
  },
  layers: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  highlightStyle: {
    type: Object as PropType<HighlightStyle>
  },
  featureFieldsMap: {
    type: Object as PropType<Record<string, string[]>>
  },
  displayFieldsMap: {
    type: Object as PropType<Record<string, FieldsDisplayInfo[]>>
  },
  multiSelection: {
    type: Boolean,
    default: false
  },
  clickTolerance: {
    type: Number,
    default: 5
  },
  filter: {
    type: Array as PropType<any[]>
  },
  eventsCursor: {
    type: Object as PropType<LayerEventCursorMap>
  },
  popupStyle: {
    type: Object as PropType<PopupStyle>,
    default: () => {
      return {
        autoResize: true,
        keyWidth: 80,
        valueWidth: 150,
        keyMaxWidth: 160,
        valueMaxWidth: 300,
        keyWordStyle: 'ellipsis',
        valueWordStyle: 'ellipsis'
      }
    }
  },
  customColumnRenders: {
    type: Object as PropType<Record<string, ColumnCustomRender>>
  },
  showPopup: {
    type: Boolean,
    default: true
  }
})

// export type LayerHighlightProps = Partial<ExtractPropTypes<ReturnType<typeof layerHighlightProps>>>
export interface LayerHighlightProps extends ThemeProps, MapGetterProps {
  uniqueName?: string
  title?: string
  layers?: string[]
  highlightStyle?: HighlightStyle
  featureFieldsMap?: Record<string, string[]>
  displayFieldsMap?: Record<string, FieldsDisplayInfo[]>
  multiSelection?: boolean
  clickTolerance?: number
  filter?: any[]
  eventsCursor?: LayerEventCursorMap
  popupStyle?: PopupStyle
  customColumnRenders?: Record<string, any>
  showPopup?: boolean
}

export const layerHighlightPropsDefault = getPropsDefaults<LayerHighlightProps>(
  Object.assign(themeProps(), mapGetterProps(), layerHighlightProps())
)

export interface MapSelectionChangedEvent extends MapSelectionChangedEmit {
  dataSeletionIndex: number
  layerName: string
}

export type LayerHighlightEvents = {
  mapselectionchanged: [MapSelectionChangedEvent]
} & MapGetterEvents

export type LayerHighlightEmits = ShortEmits<LayerHighlightEvents>

export default layerHighlightProps
