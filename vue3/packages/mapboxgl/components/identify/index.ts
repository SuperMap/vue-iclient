import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'
import { withInstall } from '@supermapgis/common/utils/index.common'
import Identify from './identify.vue'

export const SmIdentify: SFCWithInstall<typeof Identify> = withInstall(Identify)
export default SmIdentify

export * from './types'
export type { IdentifyInstance } from './instance'
