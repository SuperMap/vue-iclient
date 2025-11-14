import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'
import { withInstall } from '@supermapgis/common/utils/index.common'
import AttributePopup from './attribute-popup.vue'

export const SmAttributePopup: SFCWithInstall<typeof AttributePopup> = withInstall(AttributePopup)
export default SmAttributePopup

export * from './types'
export type { AttributePopupInstance } from './instance'
