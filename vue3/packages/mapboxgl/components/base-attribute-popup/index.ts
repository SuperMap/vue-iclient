import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'
import { withInstall } from '@supermapgis/common/utils/index.common'
import BaseAttributePopup from './base-attribute-popup.vue'

export const SmBaseAttributePopup: SFCWithInstall<typeof BaseAttributePopup> = withInstall(BaseAttributePopup)
export default SmBaseAttributePopup
export * from './types'
export * from './runtime-registry'
export { usePopupConfigHooks } from './hooks/use-popup-config'
export type { BaseAttributePopupInstance } from './instance'
