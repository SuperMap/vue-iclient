import { withInstall } from '@supermapgis/common/utils/index.common'
import border from './border.vue'
import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'

export const SmBorder: SFCWithInstall<typeof border> = withInstall(border)
export default SmBorder

export * from './types'
export type { BorderInstance } from './instance'
