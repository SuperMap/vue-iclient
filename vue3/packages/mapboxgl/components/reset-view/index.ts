import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'
import { withInstall } from '@supermapgis/common/utils/index.common'
import ResetView from './reset-view.vue'

export const SmResetView: SFCWithInstall<typeof ResetView> = withInstall(ResetView)
export default SmResetView

export * from './types'
export type { ResetViewInstance } from './instance'
