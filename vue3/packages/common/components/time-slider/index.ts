import { withInstall } from '@supermapgis/common/utils/index.common'
import TimeSlider from './time-slider.vue'
import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'

export const SmTimeSlider: SFCWithInstall<typeof TimeSlider> = withInstall(TimeSlider)
export default SmTimeSlider

export * from './types'
export type { TimeSliderInstance } from './instance'
