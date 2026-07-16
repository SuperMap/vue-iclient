import { withInstall } from '@supermapgis/common/utils/index.common'
import SceneSkylineAnalysis from './scene-skyline-analysis.vue'
import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'

export const SmSceneSkylineAnalysis: SFCWithInstall<typeof SceneSkylineAnalysis> =
  withInstall(SceneSkylineAnalysis)
export default SmSceneSkylineAnalysis

export * from './types'
export type { SceneSkylineAnalysisInstance } from './instance'
