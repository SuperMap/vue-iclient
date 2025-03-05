import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'
import { withInstall } from '@supermapgis/common/utils/index.common'
import AnimateMarkerLayers from './animate-marker-layer.vue'

export const SmAnimateMarkerLayers: SFCWithInstall<typeof AnimateMarkerLayers> = withInstall(AnimateMarkerLayers)
export default SmAnimateMarkerLayers

export * from './types'
export type { AnimateMarkerLayersInstance } from './instance'
