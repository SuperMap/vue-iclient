import { withInstall } from '@supermapgis/common/utils/index.common'
import Legend from './legend.vue'
import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'

export const SmLegend: SFCWithInstall<typeof Legend> = withInstall(Legend)
export default SmLegend

export * from './types'
export type { LegendInstance } from './instance'
