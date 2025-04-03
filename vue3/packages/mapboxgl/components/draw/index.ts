import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'
import { withInstall } from '@supermapgis/common/utils/index.common'
import Draw from './draw.vue'

export const SmDraw: SFCWithInstall<typeof Draw> = withInstall(Draw)
export default SmDraw

export * from './types'
export type { DrawInstance } from './instance'
