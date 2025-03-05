import { orientationTypes } from 'vue-iclient-core/controllers/mapboxgl/CompareViewModel'
import { getPropsDefaults } from '@supermapgis/common/utils/index.common'
import type { ThemeProps } from '@supermapgis/common/components/theme/theme'

export const compareProps = {
  target: {
    type: String,
    default: 'comparison-container'
  },
  orientation: {
    type: String as () => orientationTypes,
    default: 'vertical'
  },
  mousemove: {
    type: Boolean,
    default: false
  },
  beforeMapOptions: {
    type: Object,
    default: () => ({})
  },
  afterMapOptions: {
    type: Object,
    default: () => ({})
  },
  lineSize: {
    type: Number,
    default: 2
  },
  slideSize: {
    type: Number,
    default: 60
  },
  slideBackground: {
    type: String,
    default: ''
  },
  autoresize: {
    type: Boolean,
    default: true
  }
} as const

export interface CompareProps extends ThemeProps{
  target?: string
  orientation?: orientationTypes
  mousemove?: boolean
  beforeMapOptions?: object
  afterMapOptions?: object
  lineSize?: number
  slideSize?: number
  slideBackground?: string
  autoresize?: boolean
}

export const ComparePropsDefault = getPropsDefaults<CompareProps>(compareProps)
