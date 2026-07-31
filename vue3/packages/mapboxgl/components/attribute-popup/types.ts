import type { PropType } from 'vue'
import type { MapGetterProps, ThemeProps } from '@supermapgis/common/utils/index.common'
import type { HighlightStyle } from 'vue-iclient-controllers-mapboxgl/src/LayerHighlightViewModel'
import type { PopupConfig, PopupInfo } from '@supermapgis/mapboxgl/components/base-attribute-popup/types'
import {
  getPropsDefaults,
  mapGetterProps,
  themeProps
} from '@supermapgis/common/utils/index.common'
import { getDefaultLayerStyle } from 'vue-iclient-controllers-mapboxgl/src/types'

export type {
  videoOptions,
  imageOptions,
  ContentInfo,
  Attribute,
  TextInfo,
  MediaInfo,
  PopupInfo,
  PopupConfig
} from '@supermapgis/mapboxgl/components/base-attribute-popup/types'

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
    default: () => getDefaultLayerStyle()
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
