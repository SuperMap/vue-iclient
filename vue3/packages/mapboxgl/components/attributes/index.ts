import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'
import { withInstall } from '@supermapgis/common/utils/index.common'
import attributes from './attributes.vue'

export const SmAttributes: SFCWithInstall<typeof attributes> = withInstall(attributes)
export default SmAttributes

export * from './attributes'
export type { AttributesInstance } from './instance'
