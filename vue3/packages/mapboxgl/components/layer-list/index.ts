import { withInstall } from '@supermapgis/common/utils/index.common'
import layerList from './layer-list.vue'
import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'

export const LayerList: SFCWithInstall<typeof layerList> = withInstall(layerList)
export default LayerList

export * from './types'
export type { LayerListInstance } from './instance'
