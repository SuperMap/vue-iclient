import { withInstall } from '@supermapgis/common/utils/index.common'
import BaseLayerSwitcher from './base-layer-switcher.vue'
import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'

export const SmBaseLayerSwitcher: SFCWithInstall<typeof BaseLayerSwitcher> = withInstall(BaseLayerSwitcher)
export default SmBaseLayerSwitcher

export * from './types'
export type { BaseLayerSwitcherInstance } from './instance'
