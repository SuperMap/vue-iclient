import { withInstall } from '@supermapgis/common/utils/index.common'
import text from './text.vue'
import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'

export const SmText: SFCWithInstall<typeof text> = withInstall(text)
export default SmText

export * from './types'
export type { TextInstance } from './instance'
