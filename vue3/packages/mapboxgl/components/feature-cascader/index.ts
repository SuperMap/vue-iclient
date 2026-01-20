import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'
import { withInstall } from '@supermapgis/common/utils/index.common'
import featureCascader from './feature-cascader.vue'

export const SmFeatureCascader: SFCWithInstall<typeof featureCascader> = withInstall(featureCascader)
export default SmFeatureCascader

export * from './types'
export type { FeatureCascaderInstance } from './instance'
