import { withInstall } from '@supermapgis/common/utils/index.common'
import SceneLayerList from './scene-layer-list.vue'
import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'

export const SmSceneLayerList: SFCWithInstall<typeof SceneLayerList> = withInstall(SceneLayerList)
export default SmSceneLayerList

export * from './types'
export type { SceneLayerListInstance } from './instance'
