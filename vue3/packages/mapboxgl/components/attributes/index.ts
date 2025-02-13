import { withInstall } from '../_utils'
import attributes from './attributes.vue'
import type { SFCWithInstall } from '../_utils'

export const Attributes: SFCWithInstall<typeof attributes> = withInstall(attributes)
export default Attributes

export * from './attributes'
export type { AttributesInstance } from './instance'
