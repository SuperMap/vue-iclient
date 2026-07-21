import { withInstall } from '@supermapgis/common/utils/index.common'
import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'
import SceneRollerShutter from './scene-roller-shutter.vue'

export const SmSceneRollerShutter: SFCWithInstall<typeof SceneRollerShutter> =
  withInstall(SceneRollerShutter)
export default SmSceneRollerShutter

export * from './types'
export type { SceneRollerShutterInstance } from './instance'
