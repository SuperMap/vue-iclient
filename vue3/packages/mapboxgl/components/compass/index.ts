import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'
import { withInstall } from '@supermapgis/common/utils/index.common'
import Compass from './compass.vue'

export const SmCompass: SFCWithInstall<typeof Compass> = withInstall(Compass)
export default SmCompass

export * from './types'
export type { CompassInstance } from './instance'
