import { withInstall } from '@supermapgis/common/utils/index.common'
import Chart from './chart.vue'
import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'

export const SmChart: SFCWithInstall<typeof Chart> = withInstall(Chart)
export default SmChart

export * from './types'
export type { ChartInstance } from './instance'
