import type { ThemeProps } from '@supermapgis/common/components/theme/theme'
import type { ShortEmits } from '@supermapgis/common/utils/vue-types'
import { themeProps } from '@supermapgis/common/components/theme/theme'
import { getPropsDefaults } from '@supermapgis/common/utils/vue-types'

type Label = {
  formatter?: Function;
  show?: boolean;
};

type lineStyle = {
  height: string;
};
export const timeSliderProps = () => ({
  autoPlay: {
    type: Boolean,
    default: false
  },
  loop: {
    type: Boolean,
    default: true
  },
  playInterval: {
    type: Number,
    default: 1000
  },
  duration: {
    type: Number
  },
  data: {
    type: Array<any>,
    default: () => []
  },
  label: {
    type:  Object as () => Label,
    default: () => ({})
  },
  lineStyle: {
    type: Object as () => lineStyle,
    default: () => ({})
  },
  checkpointStyle: {
    type: Object,
    default: () => ({})
  },
  themeStyle: {
    type: Object,
    default: () => ({})
  }
})

export interface TimeSliderProps extends ThemeProps {
  autoPlay?: boolean,
  loop?: boolean,
  playInterval?: number,
  duration?: number,
  data?: Array<any>,
  label?: Label,
  lineStyle?: lineStyle,
  checkpointStyle?: Object,
  themeStyle?: Object
}

export const timeSliderPropsDefault = getPropsDefaults<TimeSliderProps>(Object.assign(themeProps(), timeSliderProps()))

export interface TimeSliderEmitsMap {
  timeplayerchanged: [object],
  playing: [],
  pause: [],
  end: [],
  timeplayerplaychanged: []
}

export type TimeSliderEmits = ShortEmits<TimeSliderEmitsMap>

export default timeSliderProps
