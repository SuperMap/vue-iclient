import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'
import { withInstall } from '@supermapgis/common/utils/index.common'
import GraphMap from './graph-map.vue'

export const SmGraphMap: SFCWithInstall<typeof GraphMap> = withInstall(GraphMap)
export default SmGraphMap

export * from './types'
export type { GraphMapInstance } from './instance'
