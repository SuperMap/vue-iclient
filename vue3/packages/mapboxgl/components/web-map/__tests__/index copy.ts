import { withInstall } from '../_utils'
import webmap from './webmap.vue'
import type { SFCWithInstall } from '../_utils'

export const WebMap: SFCWithInstall<typeof webmap> = withInstall(webmap)
export default WebMap

export * from './webmap'
export type { WebMapInstance } from './instance'
