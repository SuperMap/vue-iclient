import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'
import { withInstall } from '@supermapgis/common/utils/index.common'
import Zoom from './zoom.vue'

export const SmZoom: SFCWithInstall<typeof Zoom> = withInstall(Zoom)
export default SmZoom

export * from './types'
export type { ZoomInstance } from './instance'
