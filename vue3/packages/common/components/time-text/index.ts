import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'
import { withInstall } from '@supermapgis/common/utils/index.common'
import TimeText from './time-text.vue'

export const SmTimeText: SFCWithInstall<typeof TimeText> = withInstall(TimeText)
export default SmTimeText

export * from './types'
export type { TimeTextInstance } from './instance'
