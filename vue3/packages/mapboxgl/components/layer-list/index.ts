import { withInstall } from '@supermapgis/common/utils/index.common'
import layerList from './layerList.vue'
import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'

export const LayerList: SFCWithInstall<typeof layerList> = withInstall(layerList)
export default LayerList

export * from './layerList'
export type { LayerListInstance } from './instance'
