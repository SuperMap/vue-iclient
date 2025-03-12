import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'
import { withInstall } from '@supermapgis/common/utils/index.common'
import Compare from './compare.vue'

export const SmCompare: SFCWithInstall<typeof Compare> = withInstall(Compare)
export default SmCompare

export * from './types'
export type { CompareInstance } from './instance'
