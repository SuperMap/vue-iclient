import { withInstall } from '@supermapgis/common/utils/index.common'
import indicator from './indicator.vue'
import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'

export const SmIndicator: SFCWithInstall<typeof indicator> = withInstall(indicator)
export default SmIndicator

export * from './types'
export type { IndicatorInstance } from './instance'
