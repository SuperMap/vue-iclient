import { withInstall } from '@supermapgis/common/utils/index.common'
import webmap from './webmap.vue'
import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'

export const SmWebMap: SFCWithInstall<typeof webmap> = withInstall(webmap)
export default SmWebMap

export * from './types'
export type { WebMapInstance } from './instance'
