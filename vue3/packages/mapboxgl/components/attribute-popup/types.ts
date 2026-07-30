import type { PropType } from 'vue'
import type { MapGetterProps, ThemeProps } from '@supermapgis/common/utils/index.common'
import type { HighlightStyle } from 'vue-iclient-controllers-mapboxgl/src/LayerHighlightViewModel'
import type { PopupConfig, PopupInfo } from '@supermapgis/mapboxgl/components/popup-content/types'
import {
  getPropsDefaults,
  mapGetterProps,
  themeProps
} from '@supermapgis/common/utils/index.common'
import LineStyle from 'vue-iclient-controllers-mapboxgl/src/types/LineStyle'
import FillStyle from 'vue-iclient-controllers-mapboxgl/src/types/FillStyle'
import CircleStyle from 'vue-iclient-controllers-mapboxgl/src/types/CircleStyle'

export type {
  videoOptions,
  imageOptions,
  ContentInfo,
  Attribute,
  TextInfo,
  MediaInfo,
  PopupInfo,
  PopupConfig
} from '@supermapgis/mapboxgl/components/popup-content/types'

export interface DefaultPopupProps {
  clickTolerance?: Number
  layerStyle?: Object
  useMapPopup: Boolean
  multiSelect?: Boolean
  layerIds?: string[]
  popupInfos?: PopupInfo[]
  popupConfig?: PopupConfig
}
export interface PopupProps extends DefaultPopupProps, ThemeProps, MapGetterProps {}

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
