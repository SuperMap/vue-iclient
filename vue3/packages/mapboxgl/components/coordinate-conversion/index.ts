import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'
import { withInstall } from '@supermapgis/common/utils/index.common'
import CoordinateConversion from './coordinate-conversion.vue'

export const SmCoordinateConversion: SFCWithInstall<typeof CoordinateConversion> =
  withInstall(CoordinateConversion)
export default SmCoordinateConversion

export * from './types'
export type { CoordinateConversionInstance } from './instance'
