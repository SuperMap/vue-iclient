import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'
import { withInstall } from '@supermapgis/common/utils/index.common'
import SceneZoom from './scene-zoom.vue'

export const SmSceneZoom: SFCWithInstall<typeof SceneZoom> = withInstall(SceneZoom)
export default SmSceneZoom

export * from './types'
export type { SceneZoomInstance } from './instance'
