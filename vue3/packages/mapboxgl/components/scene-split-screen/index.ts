import { withInstall } from '@supermapgis/common/utils/index.common'
import SceneSplitScreen from './scene-split-screen.vue'
import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'

export const SmSceneSplitScreen: SFCWithInstall<typeof SceneSplitScreen> =
  withInstall(SceneSplitScreen)
export default SmSceneSplitScreen

export * from './types'
export type { SceneSplitScreenInstance } from './instance'
