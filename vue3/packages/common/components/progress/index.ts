import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'
import { withInstall } from '@supermapgis/common/utils/index.common'
import Progress from './progress.vue'

export const SmProgress: SFCWithInstall<typeof Progress> = withInstall(Progress)
export default SmProgress

export * from './types'
export type { ProgressInstance } from './instance'
