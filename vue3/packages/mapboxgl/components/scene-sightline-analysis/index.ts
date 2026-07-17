import { withInstall } from '@supermapgis/common/utils/index.common'
import SceneSightlineAnalysis from './scene-sightline-analysis.vue'
import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'
export const SmSceneSightlineAnalysis: SFCWithInstall<typeof SceneSightlineAnalysis> = withInstall(SceneSightlineAnalysis)
export default SmSceneSightlineAnalysis
export * from './types'
