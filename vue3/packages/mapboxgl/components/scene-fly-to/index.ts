import { withInstall } from '@supermapgis/common/utils/index.common'
import SceneFlyTo from './scene-fly-to.vue'
import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'

export const SmSceneFlyTo: SFCWithInstall<typeof SceneFlyTo> = withInstall(SceneFlyTo)
export default SmSceneFlyTo

export * from './types'
export type { SceneFlyToInstance } from './instance'
