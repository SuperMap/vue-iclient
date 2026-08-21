import { withInstall } from '@supermapgis/common/utils/index.common'
import SceneMapSwitch from './scene-map-switch.vue'
import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'

export const SmSceneMapSwitch: SFCWithInstall<typeof SceneMapSwitch> = withInstall(SceneMapSwitch)
export default SmSceneMapSwitch

export * from './types'
export type { SceneMapSwitchInstance } from './instance'
export {
  applySuperMap3DCredential,
  enableSuperMap3DProxyCookies,
  getSuperMap3DIportalKey,
  isIportalProxyUrl,
  prepareSuperMap3DServiceAuth,
  registerSuperMap3DIportalKey
} from 'vue-iclient-core/utils/scene/supermap3d-credential'
