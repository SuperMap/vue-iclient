import { withInstall } from '@supermapgis/common/utils/index.common'
import LayerList from './layer-list.vue'
import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'

export const SmLayerList: SFCWithInstall<typeof LayerList> = withInstall(LayerList)
export default SmLayerList

export * from './types'
export type { LayerListInstance } from './instance'
