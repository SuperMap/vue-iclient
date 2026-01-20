import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'
import { withInstall } from '@supermapgis/common/utils/index.common'
import featureTree from './feature-tree.vue'

export const SmFeatureTree: SFCWithInstall<typeof featureTree> = withInstall(featureTree)
export default SmFeatureTree

export * from './types'
export type { FeatureTreeInstance } from './instance'
