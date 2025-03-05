import { withInstall } from '@supermapgis/common/utils/index.common'
import timeText from './timeText.vue'
import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'

export const SmTimeText: SFCWithInstall<typeof timeText> = withInstall(timeText)
export default SmTimeText

export * from './types'
export type { TimeTextInstance } from './instance'
