import type { PropType } from 'vue'
import type { MapGetterProps, ThemeProps } from '@supermapgis/common/utils/index.common'
import type { HighlightStyle } from 'vue-iclient-core/controllers/mapboxgl/LayerHighlightViewModel'
import {
  getPropsDefaults,
  mapGetterProps,
  themeProps
} from '@supermapgis/common/utils/index.common'
import LineStyle from 'vue-iclient-core/controllers/mapboxgl/types/LineStyle'
import FillStyle from 'vue-iclient-core/controllers/mapboxgl/types/FillStyle'
import CircleStyle from 'vue-iclient-core/controllers/mapboxgl/types/CircleStyle'
import { TextInfosTypes } from './util/ExpressionConverter'
import { ExperssionTypes } from './util/CalcExpression'

export interface Attribute {
  type: 'FIELD'
  fieldName: string
  contentType: 'text' | 'href' | 'image'
  target: '_parent' | '_self' | '_blank' | '_top'
  imgWidth?: number
  imgHeight?: number
}

export type TextInfo = {
  type: 'TEXT'
  infos: TextInfosTypes
}

export interface MediaInfo {
  type: 'IMAGE' | 'VIDEO'
  title?: string
  value: string | ExperssionTypes
}

interface DividerInfo {
  type: 'DIVIDER'
}

export interface PopupInfo {
  title?: string
  id?: string
  fieldCaptions?: Record<string, string>
  identifyField?: string
  elements: (Attribute | TextInfo | MediaInfo | DividerInfo)[]
}
export interface PopupConfig {
  color?: string
  autoResize?: boolean
  maxWidth?: string
  maxHeight?: string
  width?: string
  height?: string
  keyWordWrap?: 'ellipsis' | 'wrap'
  valueWordWrap?: 'ellipsis' | 'wrap'
}

export interface PopupProps extends ThemeProps, MapGetterProps {
  clickTolerance?: Number
  layerStyle?: Object
  useMapPopup: Boolean
  multiSelect?: Boolean
  layerIds?: string[]
  popupInfos?: PopupInfo[]
  popupConfig?: PopupConfig
}

const popupProps = () => ({
  clickTolerance: {
    type: Number,
    default: 5,
    required: false
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
  useMapPopup: {
    type: Boolean,
    default: true
  },
  multiSelect: {
    type: Boolean,
    default: false,
    required: false
  },
  popupInfos: {
    type: Object as PropType<PopupInfo[]>,
    default: () => []
  },
  popupConfig: {
    type: Object as PropType<PopupConfig>,
    default: () => {}
  }
})

export const PropsDefault = getPropsDefaults<PopupProps>(
  Object.assign(themeProps(), mapGetterProps(), popupProps())
)
