import { withInstall } from '@supermapgis/common/utils/index.common'
import SceneSunlightAnalysis from './scene-sunlight-analysis.vue'
import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'

export const SmSceneSunlightAnalysis: SFCWithInstall<typeof SceneSunlightAnalysis> =
  withInstall(SceneSunlightAnalysis)
export default SmSceneSunlightAnalysis

export * from './types'
export type { SceneSunlightAnalysisInstance } from './instance'
