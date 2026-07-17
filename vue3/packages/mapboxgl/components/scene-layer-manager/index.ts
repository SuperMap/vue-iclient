import { withInstall } from '@supermapgis/common/utils/index.common'
import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'
import SceneLayerManager from './scene-layer-manager.vue'

export const SmSceneLayerManager: SFCWithInstall<typeof SceneLayerManager> = withInstall(SceneLayerManager)
export default SmSceneLayerManager

export * from './types'
export type { SceneLayerManagerInstance } from './instance'
