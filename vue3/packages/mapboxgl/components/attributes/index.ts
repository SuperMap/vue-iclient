import type { SFCWithInstall } from '@supermapgis/common/utils'
import { withInstall } from '@supermapgis/common/utils'
import attributes from './attributes.vue'

export const Attributes: SFCWithInstall<typeof attributes> = withInstall(attributes)
export default Attributes

export * from './attributes'
export type { AttributesInstance } from './instance'
