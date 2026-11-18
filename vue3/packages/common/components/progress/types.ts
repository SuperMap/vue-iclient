import type { PropType } from 'vue'
import type { ProgressGradient } from 'ant-design-vue/es/progress/props'
import type { ThemeProps, TimerProps, ThirdServiceProps } from '@supermapgis/common/utils/index.common'
import { getPropsDefaults } from '@supermapgis/common/utils/vue-types'
import { themeProps, timerProps, thirdServiceProps } from '@supermapgis/common/utils/index.common'

export type ProgressType = 'line' | 'circle'
export type ProgressStatus = 'normal' | 'success' | 'exception' | 'active'
export type ProgressPercentType = 'percentage' | 'percent'
export type ProgressStrokeColor = string | ProgressGradient

export const progressProps = () => ({
  percent: {
    type: [String, Number],
    default: 0
  },
  // 宿主可传入小数（0.8）或百分数（80）。默认按百分数解释，保持独立组件的既有契约。
  percentType: {
    type: String,
    default: 'percent'
  },
  type: {
    type: String,
    default: 'line'
  },
  status: {
    type: String,
    default: 'normal'
  },
  strokeWidth: Number,
  // 进度环未传 size 时按容器宽高最小值自适应，line 形态原样透传给 antd。
  size: {
    type: [String, Number, Array]
  },
  decimals: {
    type: Number,
    default: -1
  },
  strokeColor: {
    type: [String, Object] as PropType<ProgressStrokeColor>
  },
  trailColor: String,
  showInfo: {
    type: Boolean,
    default: true
  }
})

export interface ProgressProps extends ThemeProps, TimerProps, ThirdServiceProps {
  percent?: string | number,
  percentType?: ProgressPercentType,
  type?: ProgressType,
  status?: ProgressStatus,
  strokeWidth?: number,
  size?: string | number | number[],
  decimals?: number,
  strokeColor?: ProgressStrokeColor,
  trailColor?: string,
  showInfo?: boolean
}

export const progressPropsDefault = getPropsDefaults<ProgressProps>(
  Object.assign(themeProps(), timerProps(), thirdServiceProps(), progressProps())
)

export default progressProps
