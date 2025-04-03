import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'
import { withInstall } from '@supermapgis/common/utils/index.common'
import Scale from './scale.vue'

export const SmScale: SFCWithInstall<typeof Scale> = withInstall(Scale)
export default SmScale

export * from './types'
export type { ScaleInstance } from './instance'
