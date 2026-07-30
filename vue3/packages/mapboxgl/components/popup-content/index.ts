import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'
import { withInstall } from '@supermapgis/common/utils/index.common'
import PopupContent from './popup-content.vue'

export const SmPopupContent: SFCWithInstall<typeof PopupContent> = withInstall(PopupContent)
export default SmPopupContent

export * from './types'
export * from './runtime-registry'
export { usePopupConfigHooks } from './hooks/use-popup-config'
export type { PopupContentInstance } from './instance'
