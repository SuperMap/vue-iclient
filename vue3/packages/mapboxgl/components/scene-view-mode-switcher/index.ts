import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'
import { withInstall } from '@supermapgis/common/utils/index.common'
import SceneViewModeSwitcher from './scene-view-mode-switcher.vue'

export const SmSceneViewModeSwitcher: SFCWithInstall<typeof SceneViewModeSwitcher> = withInstall(SceneViewModeSwitcher)
export default SmSceneViewModeSwitcher

export * from './types'
export type { SceneViewModeSwitcherInstance } from './instance'
