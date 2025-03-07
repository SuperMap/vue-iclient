import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'
import { withInstall } from '@supermapgis/common/utils/index.common'
import Measure from './measure.vue'

export const SmMeasure: SFCWithInstall<typeof Measure> = withInstall(Measure)
export default SmMeasure

export * from './types'
export type { MeasureInstance } from './instance'
