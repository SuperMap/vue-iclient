import type { ThemeProps } from '@supermapgis/common/components/theme/theme'
import type { TimerProps, ShortEmits } from '@supermapgis/common/utils/index.common'
import { getPropsDefaults } from '@supermapgis/common/utils/vue-types'
import { themeProps } from '@supermapgis/common/components/theme/theme'
import { timerProps } from '@supermapgis/common/utils/index.common'

export const indicatorProps = () => ({
  title: {
    type: String,
    default: () => 'indicator.title'
  },
  unit: {
    type: String,
    default: () => 'indicator.unit'
  },
  indicatorColor: String,
  textFontSize: {
    type: [String, Number]
  },
  fontSize: {
    type: [String, Number]
  },
  fontWeight: {
    type: [String, Number],
    default: 'border'
  },
  num: {
    type: [Number, String],
    default: 0
  },
  url: String,
  proxy: String,
  animated: {
    type: Boolean,
    default: false
  },
  duration: {
    type: [Number, String],
    default: 1000
  },
  decimals: {
    type: Number,
    default: -1
  },
  mode: {
    type: String,
    default: 'vertical',
    validator: () => ['vertical', 'horizontal']
  },
  separator: {
    type: String,
    default: ','
  },
  numSpacing: {
    type: Number,
    default: 0
  },
  numBackground: {
    type: Object,
    default: () => ({ color: 'rgba(0, 0, 0, 0)', image: '', padding: 0 })
  },
  separatorBackground: {
    type: Boolean,
    default: false
  },
  showTitleUnit: {
    type: Boolean,
    default: true
  },
  titleField: String,
  numField: String,
  unitField: String,
  thresholdsStyle: Array
})

export interface IndicatorProps extends ThemeProps, TimerProps {
  title?: string,
  unit?: string,
  indicatorColor?: string,
  textFontSize?: string | number,
  fontSize?: string | number,
  fontWeight?: string | number,
  num?: string | number,
  url?: string,
  proxy?: string,
  animated?: boolean,
  duration?: string | number,
  decimals?: number,
  mode?: string,
  separator?: string,
  numSpacing?: number,
  numBackground?: Object,
  separatorBackground?: boolean,
  showTitleUnit?: boolean,
  titleField?: string,
  numField?: string,
  unitField?: string,
  thresholdsStyle?: Array<any>
}

export const indicatorPropsDefault = getPropsDefaults<IndicatorProps>(
  Object.assign(themeProps(), timerProps(), indicatorProps())
)

export type IndicatorEvents = {
  click: [number | string],
  indicatorNumChange: [number | string]
}

export type IndicatorEmits = ShortEmits<IndicatorEvents>

export default indicatorProps
