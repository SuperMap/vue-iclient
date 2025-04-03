import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'
import { withInstall } from '@supermapgis/common/utils/index.common'
import MiniMap from './mini-map.vue'

export const SmMiniMap: SFCWithInstall<typeof MiniMap> = withInstall(MiniMap)
export default SmMiniMap

export * from './types'
export type { MiniMapInstance } from './instance'
