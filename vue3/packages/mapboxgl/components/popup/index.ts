import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'
import { withInstall } from '@supermapgis/common/utils/index.common'
import Popup from './popup.vue'

export const SmPopup: SFCWithInstall<typeof Popup> = withInstall(Popup)
export default SmPopup

export * from './types'
export type { PopupInstance } from './instance'
