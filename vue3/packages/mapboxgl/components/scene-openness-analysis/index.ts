import { withInstall } from '@supermapgis/common/utils/index.common'
import SceneOpennessAnalysis from './scene-openness-analysis.vue'
import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'

export const SmSceneOpennessAnalysis: SFCWithInstall<typeof SceneOpennessAnalysis> = withInstall(SceneOpennessAnalysis)
export default SmSceneOpennessAnalysis
export * from './types'
