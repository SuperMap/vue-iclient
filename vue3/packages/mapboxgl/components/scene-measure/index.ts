import { withInstall } from '@supermapgis/common/utils/index.common'
import SceneMeasure from './scene-measure.vue'
import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'

export const SmSceneMeasure: SFCWithInstall<typeof SceneMeasure> = withInstall(SceneMeasure)
export default SmSceneMeasure

export * from './types'
export type { SceneMeasureInstance } from './instance'
