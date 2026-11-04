import { withInstall } from '@supermapgis/common/utils/index.common'
import SceneFlyRoute from './scene-fly-route.vue'
import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'

export const SmSceneFlyRoute: SFCWithInstall<typeof SceneFlyRoute> = withInstall(SceneFlyRoute)
export default SmSceneFlyRoute

export * from './types'
export type { SceneFlyRouteInstance } from './instance'
