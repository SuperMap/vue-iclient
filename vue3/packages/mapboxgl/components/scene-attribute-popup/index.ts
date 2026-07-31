import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'
import { withInstall } from '@supermapgis/common/utils/index.common'
import SceneAttributePopup from './scene-attribute-popup.vue'

export const SmSceneAttributePopup: SFCWithInstall<typeof SceneAttributePopup> = withInstall(
  SceneAttributePopup
)
export default SmSceneAttributePopup

export * from './types'
export type { SceneAttributePopupInstance } from './instance'
