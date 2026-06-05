import { withInstall } from '@supermapgis/common/utils/index.common'
import SceneFullscreen from './scene-fullscreen.vue'
import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'

export const SmSceneFullscreen: SFCWithInstall<typeof SceneFullscreen> = withInstall(SceneFullscreen)
export default SmSceneFullscreen

export * from './types'
export type { SceneFullscreenInstance } from './instance'
