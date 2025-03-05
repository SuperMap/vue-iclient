import { withInstall } from '@supermapgis/common/utils/index.common'
import timeSlider from './time-slider.vue'
import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'

export const SmTimeSlider: SFCWithInstall<typeof timeSlider> = withInstall(timeSlider)
export default SmTimeSlider

export * from './types'
export type { TimeSliderInstance } from './instance'
