import type { SFCWithInstall } from '@supermapgis/common/utils/index.common'
import { withInstall } from '@supermapgis/common/utils/index.common'
import textList from './text-list.vue'

export const SmTextList: SFCWithInstall<typeof textList> = withInstall(textList)
export default SmTextList

export * from './types'
export type { TextListInstance } from './instance'
