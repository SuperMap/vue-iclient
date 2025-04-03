import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'
import { withInstall } from '@supermapgis/common/utils/index.common'
import Pan from './pan.vue'

export const SmPan: SFCWithInstall<typeof Pan> = withInstall(Pan)
export default SmPan

export * from './types'
export type { PanInstance } from './instance'
