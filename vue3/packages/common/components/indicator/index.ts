import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'
import { withInstall } from '@supermapgis/common/utils/index.common'
import Indicator from './indicator.vue'

export const SmIndicator: SFCWithInstall<typeof Indicator> = withInstall(Indicator)
export default SmIndicator

export * from './types'
export type { IndicatorInstance } from './instance'
