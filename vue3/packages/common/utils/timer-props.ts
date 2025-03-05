import { getPropsDefaults } from '@supermapgis/common/utils/vue-types'

export const timerProps = () => ({
  startTiming: {
    type: Boolean,
    default: false
  },
  frequency: {
    type: [Number, String],
    default: 3
  }
})

export type TimerProps = {
  startTiming?: boolean,
  frequency?: number | string
}

export const timerPropsDefault = getPropsDefaults<TimerProps>(timerProps())

export default timerProps