import { withInstall } from '@supermapgis/common/utils/index.common'
import iframe from './iframe.vue'
import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'

export const SmIframe: SFCWithInstall<typeof iframe> = withInstall(iframe)
export default SmIframe

export * from './types'
export type { IframeInstance } from './instance'
